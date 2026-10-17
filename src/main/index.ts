import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, nativeTheme, screen, shell, Tray } from 'electron'
import { existsSync, mkdirSync, rmSync, writeFileSync, lstatSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { ConfigStore, validateMount, validateShortcutLocation } from './store'
import { MountManager } from './mounts'
import { BackupManager } from './backups'
import { checkRemoteDirectory, diagnostics, errorDetails, listRemoteDirectories } from './diagnostics'
import { normalizeRemotePath } from '../shared/paths'
import { layoutBounds } from './window-layout'
import { requestedFolder, SavedFolderOpener, shortcutName, writeLinuxShortcut } from './shortcuts'
import type { AppSettings, MountConfig, Snapshot, WindowMode } from '../shared/types'

let window: BrowserWindow | null = null
let tray: Tray | null = null
let store: ConfigStore
let mounts: MountManager
let backups: BackupManager
let folderOpener: SavedFolderOpener
let exiting = false
let cleanupStarted = false
let nativeDialogDepth = 0
let mode: WindowMode = 'compact'
const logLines: string[] = []
const browsing = new Map<string, AbortController>()
const wayland = process.platform === 'linux' && (!!process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland')

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
    appVersion: app.getVersion(), platform: process.platform, windowMode: mode,
    dark: nativeTheme.shouldUseDarkColors, settings: store.settings,
    mounts: store.mounts.map(m => ({ ...m, status: mounts.state(m.id).status, statusDetail: mounts.state(m.id).detail,
      backupStatus: backups.state(m.id).status, backupDetail: backups.state(m.id).detail,
      backupProgress: backups.state(m.id).progress, refreshNeedsReconnect: mounts.needsRefreshReconnect(m.id) })), log: [...logLines]
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
function applyTheme(): void {
  nativeTheme.themeSource = store.settings.theme
  window?.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#151821' : '#f6f8fc')
  changed()
}
function positionWindow(): void {
  if (!window || window.isDestroyed()) return
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const bounds = layoutBounds(mode, display.workArea)
  if (window.isMaximized()) window.unmaximize()
  window.setMinimumSize(Math.min(mode === 'compact' ? 320 : 780, bounds.width), Math.min(440, bounds.height))
  window.setResizable(true)
  window.setBounds(bounds)
  window.setResizable(mode === 'expanded' || wayland)
  // Keep a taskbar entry on Linux: not every desktop exposes tray icons.
  window.setSkipTaskbar(mode === 'compact' && process.platform === 'win32' && !!tray)
  window.setAlwaysOnTop(mode === 'compact' && process.platform === 'win32')
}
function showWindow(): void {
  if (!window || window.isDestroyed()) { createWindow(); return }
  if (mode === 'compact') positionWindow()
  window.show()
  if (window.isMinimized()) window.restore()
  window.focus()
}
function setMode(next: WindowMode): void {
  if (next !== 'compact' && next !== 'expanded') throw new Error('Modalita della finestra non valida.')
  mode = next
  positionWindow(); showWindow(); changed()
}
function hideWindow(): void {
  if (process.platform === 'linux' || !tray) window?.minimize()
  else window?.hide()
}
async function withDialog<T>(fn: () => Promise<T>): Promise<T> {
  nativeDialogDepth++
  try { return await fn() }
  finally { nativeDialogDepth--; window?.focus() }
}
function createTray(): void {
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath()).resize({ width: 22, height: 22 }))
    tray.setToolTip('Drive Tambu')
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Apri pannello', click: () => setMode('compact') },
      { label: 'Apri finestra', click: () => setMode('expanded') },
      { type: 'separator' },
      { label: 'Esci da Drive Tambu', click: () => app.quit() }
    ]))
    tray.on('click', () => {
      if (mode === 'compact' && window?.isVisible() && window.isFocused()) hideWindow()
      else showWindow()
    })
  } catch (error) {
    tray = null
    log(`Icona di notifica non disponibile: la finestra resta nella barra delle applicazioni. ${String(error)}`)
  }
}
function createWindow(): void {
  const bounds = layoutBounds(mode, screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea)
  window = new BrowserWindow({
    ...bounds, minWidth: Math.min(320, bounds.width), minHeight: Math.min(440, bounds.height),
    title: 'Drive Tambu', show: false, frame: wayland,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#151821' : '#f6f8fc', icon: iconPath(),
    webPreferences: { preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true }
  })
  Menu.setApplicationMenu(null)
  positionWindow()
  window.once('ready-to-show', () => window?.show())
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.on('blur', () => {
    if (mode === 'compact' && process.platform === 'win32' && tray && nativeDialogDepth === 0) window?.hide()
  })
  window.on('close', event => {
    if (exiting) return
    event.preventDefault()
    if (store.settings.closeToTray) hideWindow()
    else app.quit()
  })
  if (process.env.ELECTRON_RENDERER_URL) void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void window.loadFile(path.join(__dirname, '../renderer/index.html'))
}

async function ensureServer(remote: string): Promise<void> {
  normalizeRemotePath(remote, '')
  const d = await diagnostics(store)
  if (!d.rclone.ok) throw new Error(d.rclone.detail)
  if (d.connectionError) throw new Error(d.connectionError)
  if (!d.remotes.includes(remote)) throw new Error('Questo server non e tra le connessioni salvate. Apri Impostazioni e scegli un server disponibile.')
}
function validateRequestId(value: string): void {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{12,80}$/.test(value)) throw new Error('Richiesta non valida.')
}
async function confirmDisconnect(name: string): Promise<boolean> {
  const result = await withDialog(() => dialog.showMessageBox(window!, {
    type: 'warning', title: 'Scollega cartella', message: `Scollegare ${name}?`,
    detail: 'Prima di continuare, attendi che copie e salvataggi siano terminati. Le modifiche non ancora inviate potrebbero non essere disponibili sul server.',
    buttons: ['Mantieni collegata', 'Scollega'], defaultId: 0, cancelId: 0, noLink: true
  }))
  return result.response === 1
}
function handleShortcut(argv: string[]): void {
  void (async () => {
    const id = requestedFolder(argv)
    if (!id) return
    showWindow()
    log('Apertura della cartella dal collegamento...')
    await folderOpener.open(id)
  })().catch(error => {
    showWindow()
    const message = error instanceof Error ? error.message : String(error)
    log(`Collegamento: ${message}`)
    dialog.showErrorBox('Apri cartella', message)
  })
}

function registerHandlers(): void {
  const guard = (event: Electron.IpcMainInvokeEvent): void => {
    if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) throw new Error('Richiesta non autorizzata.')
  }
  ipcMain.handle('drive:snapshot', e => { guard(e); return snapshot() })
  ipcMain.handle('drive:diagnostics', e => { guard(e); return diagnostics(store) })
  ipcMain.handle('drive:setWindowMode', (e, next: WindowMode) => { guard(e); setMode(next) })
  ipcMain.handle('drive:hideWindow', e => { guard(e); if (store.settings.closeToTray) hideWindow(); else app.quit() })
  ipcMain.handle('drive:minimizeWindow', e => { guard(e); window?.minimize() })
  ipcMain.handle('drive:quit', e => { guard(e); app.quit() })
  ipcMain.handle('drive:chooseExecutable', async e => {
    guard(e)
    const result = await withDialog(() => dialog.showOpenDialog(window!, { title: 'Scegli il componente di collegamento', properties: ['openFile'] }))
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })
  ipcMain.handle('drive:chooseDirectory', async (e, name?: string) => {
    guard(e)
    if (name !== undefined && (typeof name !== 'string' || name.length > 80)) throw new Error('Il nome della cartella non e valido.')
    const result = await withDialog(() => dialog.showOpenDialog(window!, {
      title: name !== undefined ? 'Dove vuoi far apparire la cartella?' : 'Scegli una cartella dedicata al backup', properties: ['openDirectory', 'createDirectory']
    }))
    const parent = result.filePaths[0]
    if (result.canceled || !parent) return null
    if (name === undefined) return parent
    let leaf = name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/, '') || 'Drive Tambu'
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(leaf)) leaf = `Cartella-${leaf}`
    let candidate = path.join(parent, leaf), i = 2
    while (existsSync(candidate) || store.mounts.some(m => m.localPath.toLowerCase() === candidate.toLowerCase())) {
      if (i > 10000) throw new Error('Scegli un nome diverso per la cartella.')
      candidate = path.join(parent, `${leaf} (${i++})`)
    }
    return candidate
  })
  ipcMain.handle('drive:browseRemote', async (e, remote: string, remotePath: string, requestId: string) => {
    guard(e); validateRequestId(requestId)
    if (browsing.size >= 8) throw new Error('Attendi che termini la ricerca precedente e riprova.')
    browsing.get(requestId)?.abort()
    const controller = new AbortController(); browsing.set(requestId, controller)
    try {
      await ensureServer(remote)
      return await listRemoteDirectories(store.settings.rcloneExecutable, remote, remotePath, controller.signal)
    } catch (error) {
      if (!controller.signal.aborted) log(`Esplorazione cartelle: ${errorDetails(error)}`)
      throw error
    } finally { if (browsing.get(requestId) === controller) browsing.delete(requestId) }
  })
  ipcMain.handle('drive:cancelBrowse', (e, requestId: string) => {
    guard(e); validateRequestId(requestId); browsing.get(requestId)?.abort()
  })
  const checkConnection = async (remote: string, remotePath = ''): Promise<string> => {
    await ensureServer(remote)
    try {
      await checkRemoteDirectory(store.settings.rcloneExecutable, remote, remotePath)
      log(`Server ${remote}: cartella raggiungibile`)
      return 'Connessione riuscita. La cartella sul server e accessibile.'
    } catch (error) { log(`Verifica server: ${errorDetails(error)}`); throw error }
  }
  ipcMain.handle('drive:checkConnection', async (e, remote: string, remotePath?: string) => { guard(e); return checkConnection(remote, remotePath) })
  ipcMain.handle('drive:checkRemote', async (e, id: string) => {
    guard(e); const m = store.find(id); return checkConnection(m.remote, m.remotePath)
  })
  ipcMain.handle('drive:saveMount', async (e, input: MountConfig) => {
    guard(e)
    const m = validateMount(input, store.mounts)
    if (backups.state(m.id).status === 'running') throw new Error('Attendi che termini il backup prima di modificare questa cartella.')
    const previous = store.mounts.find(x => x.id === m.id)
    const pathsChanged = !previous || previous.remote !== m.remote || normalizeRemotePath(previous.remote, previous.remotePath) !== m.remotePath || previous.localPath !== m.localPath
    if (pathsChanged && !['disconnected', 'error'].includes(mounts.state(m.id).status)) throw new Error('Scollega la cartella prima di cambiarne la posizione.')
    if (pathsChanged) await checkConnection(m.remote, m.remotePath)
    store.saveMount(m)
    log(`${m.name}: impostazioni salvate`)
    if (!previous && m.autoConnect) void mounts.connect(m.id).catch(error => log(`${m.name}: ${errorDetails(error)}`))
  })
  ipcMain.handle('drive:deleteMount', async (e, id: string) => {
    guard(e)
    if (backups.state(id).status === 'running') throw new Error('Attendi la fine del backup prima di rimuovere la cartella.')
    const m = store.find(id)
    if (mounts.state(id).status === 'connected' && !(await confirmDisconnect(m.name))) return
    await mounts.disconnect(id); store.deleteMount(id)
    log(`${m.name}: collegamento rimosso. I file non sono stati cancellati.`)
  })
  ipcMain.handle('drive:connect', async (e, id: string) => { guard(e); await mounts.connect(id) })
  ipcMain.handle('drive:disconnect', async (e, id: string) => {
    guard(e)
    if (mounts.state(id).status === 'connected' && !(await confirmDisconnect(store.find(id).name))) return
    await mounts.disconnect(id)
  })
  ipcMain.handle('drive:openMount', async (e, id: string) => {
    guard(e)
    if (mounts.state(id).status !== 'connected') throw new Error('Collega la cartella prima di aprirla.')
    const error = await shell.openPath(store.find(id).localPath); if (error) throw new Error(error)
  })
  ipcMain.handle('drive:createShortcut', async (e, id: string) => {
    guard(e)
    const m = store.find(id)
    if (!app.isPackaged) throw new Error("Crea il collegamento dalla versione installata di Drive Tambu, non dall'ambiente di sviluppo.")
    const extension = process.platform === 'win32' ? 'lnk' : 'desktop'
    const result = await withDialog(() => dialog.showSaveDialog(window!, {
      title: 'Crea collegamento alla cartella',
      defaultPath: path.join(app.getPath('desktop'), `${shortcutName(m.name)}.${extension}`),
      filters: [{name:'Collegamento',extensions:[extension]}],
      properties: ['showOverwriteConfirmation', 'createDirectory']
    }))
    if (result.canceled || !result.filePath) return null
    const destination = result.filePath
    if (path.extname(destination).toLowerCase() !== `.${extension}`) throw new Error(`Il collegamento deve avere estensione .${extension}.`)
    validateShortcutLocation(destination, store.mounts)
    try {
      const stat = lstatSync(destination)
      if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Scegli un nuovo file: la destinazione non e un file regolare.')
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    if (process.platform === 'win32') {
      const ok = shell.writeShortcutLink(destination, 'create', {
        target: process.execPath, args: `--open-folder ${m.id}`, cwd: path.dirname(process.execPath),
        description: `Apri ${m.name} con Drive Tambu`, icon: process.execPath, iconIndex: 0
      })
      if (!ok) throw new Error('Non riesco a creare il collegamento. Scegli una posizione in cui puoi scrivere.')
    } else if (process.platform === 'linux') {
      writeLinuxShortcut(destination, process.env.APPIMAGE || process.execPath, m.id, m.name)
    } else throw new Error('Questo sistema non e supportato per i collegamenti.')
    log(`${m.name}: collegamento creato`)
    return destination
  })
  ipcMain.handle('drive:backupNow', async (e, id: string) => { guard(e); await backups.run(id) })
  ipcMain.handle('drive:openBackup', async (e, id: string) => {
    guard(e); const root = store.find(id).backup.destination
    if (!root || !existsSync(root)) throw new Error('Non esiste ancora un backup. Avviane uno prima.')
    const error = await shell.openPath(root); if (error) throw new Error(error)
  })
  ipcMain.handle('drive:saveSettings', (e, settings: AppSettings) => {
    guard(e); store.saveSettings(settings); autostart(settings.startAtLogin); applyTheme(); changed()
  })
}

app.on('before-quit', event => {
  if (exiting) return
  event.preventDefault()
  if (cleanupStarted) return
  cleanupStarted = true
  void (async () => {
    if (store && window && store.mounts.some(m => ['connected', 'connecting'].includes(mounts.state(m.id).status) || backups.state(m.id).status === 'running')) {
      const answer = await withDialog(() => dialog.showMessageBox(window!, {
        type: 'warning', title: 'Esci da Drive Tambu', message: 'Ci sono collegamenti o backup attivi.',
        detail: 'Attendi la fine di copie e salvataggi. Uscendo, i collegamenti e gli eventuali backup in corso saranno interrotti.',
        buttons: ['Resta aperto', 'Esci comunque'], defaultId: 0, cancelId: 0, noLink: true
      }))
      if (answer.response !== 1) return
    }
    for (const controller of browsing.values()) controller.abort()
    backups?.stop()
    await mounts?.disconnectAll()
    exiting = true; app.quit()
  })().catch(error => {
    backups?.startScheduler()
    dialog.showErrorBox('Drive Tambu', error instanceof Error ? error.message : String(error))
  }).finally(() => { cleanupStarted = false })
})
app.on('window-all-closed', () => { if (!tray) app.quit() })

app.whenReady().then(() => {
  try {
    if (!app.requestSingleInstanceLock()) { exiting = true; app.quit(); return }
    app.on('second-instance', (_event, argv) => {showWindow();handleShortcut(argv)})
    store = new ConfigStore()
    mounts = new MountManager(store, changed, log)
    backups = new BackupManager(store, changed, log)
    folderOpener = new SavedFolderOpener({
      find: id => store.find(id), state: id => mounts.state(id), connect: id => mounts.connect(id),
      open: target => shell.openPath(target), stopping: () => exiting || cleanupStarted
    })
    applyTheme()
    nativeTheme.on('updated', () => {
      window?.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#151821' : '#f6f8fc'); changed()
    })
    registerHandlers(); createTray(); createWindow(); backups.startScheduler()
    screen.on('display-metrics-changed', () => { if (mode === 'compact') positionWindow() })
    screen.on('display-removed', positionWindow)
    for (const m of store.mounts.filter(x => x.autoConnect)) setTimeout(() => {
      if (!exiting && !cleanupStarted) void mounts.connect(m.id).catch(error => log(`${m.name}: ${errorDetails(error)}`))
    }, 1800)
    log('Drive Tambu avviato')
    handleShortcut(process.argv)
  } catch (error) {
    dialog.showErrorBox('Drive Tambu', error instanceof Error ? error.message : String(error)); exiting = true; app.quit()
  }
}).catch(error => { dialog.showErrorBox('Drive Tambu', String(error)); exiting = true; app.quit() })
