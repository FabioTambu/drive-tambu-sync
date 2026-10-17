import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell, Tray } from 'electron'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { ConfigStore } from './store'
import { MountManager } from './mounts'
import { BackupManager } from './backups'
import { diagnostics, remoteSpec, runRclone } from './diagnostics'
import type { AppSettings, MountConfig, Snapshot } from '../shared/types'

let window: BrowserWindow | null = null
let tray: Tray | null = null
let store: ConfigStore
let mounts: MountManager
let backups: BackupManager
let exiting = false
let cleanupStarted = false
const logLines: string[] = []

function log(message: string): void {
  const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logLines.unshift(`${time}  ${message}`)
  if (logLines.length > 180) logLines.length = 180
  changed()
}
function changed(): void {
  if (window && !window.isDestroyed()) window.webContents.send('drive:changed')
}
function snapshot(): Snapshot {
  return {
    appVersion: app.getVersion(),
    platform: process.platform,
    settings: store.settings,
    mounts: store.mounts.map(m => ({
      ...m,
      status: mounts.state(m.id).status,
      statusDetail: mounts.state(m.id).detail,
      backupStatus: backups.state(m.id).status,
      backupDetail: backups.state(m.id).detail
    })),
    log: [...logLines]
  }
}

function autostart(enabled: boolean): void {
  if (!app.isPackaged) return // avoid registering a development executable
  if (process.platform === 'win32') {
    app.setLoginItemSettings({ openAtLogin: enabled, path: process.execPath })
  } else if (process.platform === 'linux') {
    const file = path.join(os.homedir(), '.config', 'autostart', 'drive-tambu.desktop')
    if (!enabled) { if (existsSync(file)) rmSync(file); return }
    mkdirSync(path.dirname(file), { recursive: true })
    const binary = process.env.APPIMAGE || process.execPath
    const sanitized = binary.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '')
    writeFileSync(file, `[Desktop Entry]\nType=Application\nName=Drive Tambu\nExec="${sanitized}"\nTerminal=false\nX-GNOME-Autostart-enabled=true\n`, 'utf8')
  }
}

function iconPath(): string {
  return app.isPackaged ? path.join(process.resourcesPath, 'icon.png') : path.join(app.getAppPath(), 'resources', 'icon.png')
}

function showWindow(): void {
  if (!window || window.isDestroyed()) { createWindow(); return }
  window.show()
  if (window.isMinimized()) window.restore()
  window.focus()
}

function createTray(): void {
  const image = nativeImage.createFromPath(iconPath()).resize({ width: 22, height: 22 })
  tray = new Tray(image)
  tray.setToolTip('Drive Tambu')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Apri Drive Tambu', click: showWindow },
    { type: 'separator' },
    { label: 'Esci e disconnetti', click: () => app.quit() }
  ]))
  tray.on('double-click', showWindow)
  tray.on('click', showWindow)
}

function createWindow(): void {
  window = new BrowserWindow({
    width: 1250, height: 820, minWidth: 920, minHeight: 620,
    title: 'Drive Tambu', show: false,
    backgroundColor: '#f6f8fc',
    icon: iconPath(),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    }
  })
  Menu.setApplicationMenu(null)
  window.once('ready-to-show', () => window?.show())
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.on('close', event => {
    if (!exiting && store.settings.closeToTray && tray) { event.preventDefault(); window?.hide() }
  })
  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function registerHandlers(): void {
  const guard = (event: Electron.IpcMainInvokeEvent): void => {
    if (!window || event.sender !== window.webContents) throw new Error('Richiesta non autorizzata.')
  }
  ipcMain.handle('drive:snapshot', e => { guard(e); return snapshot() })
  ipcMain.handle('drive:diagnostics', e => { guard(e); return diagnostics(store) })
  ipcMain.handle('drive:chooseDirectory', async e => {
    guard(e)
    const options: Electron.OpenDialogOptions = { title: 'Seleziona la cartella superiore', properties: ['openDirectory', 'createDirectory'] }
    const result = await dialog.showOpenDialog(window!, options)
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })
  ipcMain.handle('drive:saveMount', (e, m: MountConfig) => {
    guard(e)
    if (mounts.state(m.id).status !== 'disconnected' && mounts.state(m.id).status !== 'error') {
      const previous = store.find(m.id)
      if (previous.remote !== m.remote || previous.remotePath !== m.remotePath || previous.localPath !== m.localPath) {
        throw new Error('Disconnetti la cartella prima di modificare i percorsi.')
      }
    }
    store.saveMount(m)
    log(`${m.name}: impostazioni salvate`)
  })
  ipcMain.handle('drive:deleteMount', async (e, id: string) => {
    guard(e)
    if (backups.state(id).status === 'running') throw new Error('Impossibile eliminare una cartella durante il backup.')
    await mounts.disconnect(id)
    const name = store.find(id).name
    store.deleteMount(id)
    log(`${name}: eliminata dalla lista (i file non sono stati cancellati)`)
  })
  ipcMain.handle('drive:connect', async (e, id: string) => { guard(e); await mounts.connect(id) })
  ipcMain.handle('drive:disconnect', async (e, id: string) => { guard(e); await mounts.disconnect(id) })
  ipcMain.handle('drive:openMount', async (e, id: string) => {
    guard(e)
    if (mounts.state(id).status !== 'connected') throw new Error('Collega la cartella prima di aprirla.')
    const error = await shell.openPath(store.find(id).localPath)
    if (error) throw new Error(error)
  })
  ipcMain.handle('drive:checkRemote', async (e, id: string) => {
    guard(e)
    const m = store.find(id)
    await runRclone(store.settings.rcloneExecutable, ['lsf', remoteSpec(m.remote, m.remotePath), '--max-depth', '1'], 45000)
    return 'La sorgente remota risponde correttamente.'
  })
  ipcMain.handle('drive:backupNow', async (e, id: string) => { guard(e); await backups.run(id) })
  ipcMain.handle('drive:openBackup', async (e, id: string) => {
    guard(e)
    const root = store.find(id).backup.destination
    if (!existsSync(root)) throw new Error('Non esiste ancora un backup. Avviane uno prima.')
    const error = await shell.openPath(root)
    if (error) throw new Error(error)
  })
  ipcMain.handle('drive:saveSettings', (e, settings: AppSettings) => {
    guard(e)
    store.saveSettings(settings)
    autostart(settings.startAtLogin)
    changed()
  })
}

app.on('before-quit', event => {
  if (cleanupStarted) return
  event.preventDefault()
  cleanupStarted = true
  exiting = true
  backups?.stop()
  if (mounts) void mounts.disconnectAll().finally(() => app.quit())
  else app.quit()
})
app.on('window-all-closed', () => { if (!store?.settings.closeToTray) app.quit() })

app.whenReady().then(() => {
  try {
    if (!app.requestSingleInstanceLock()) { app.quit(); return }
    app.on('second-instance', showWindow)
    store = new ConfigStore()
    mounts = new MountManager(store, changed, log)
    backups = new BackupManager(store, changed, log)
    registerHandlers()
    createTray()
    createWindow()
    backups.startScheduler()
    for (const m of store.mounts.filter(x => x.autoConnect)) {
      setTimeout(() => void mounts.connect(m.id).catch(err => log(`${m.name}: ${String(err)}`)), 1800)
    }
    log('Drive Tambu avviato')
  } catch (error) {
    dialog.showErrorBox('Drive Tambu', error instanceof Error ? error.message : String(error))
    exiting = true
    app.quit()
  }
}).catch(error => {
  dialog.showErrorBox('Drive Tambu', String(error))
  app.quit()
})
