const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), Module = require('node:module')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-window-'))
after(() => fs.rmSync(tmp, { recursive: true, force: true }))
const handlers = new Map(), windows = [], opened = []
const shortcutFile = path.join(tmp, process.platform === 'win32' ? 'Files.lnk' : 'Files.desktop')
fs.writeFileSync(path.join(tmp, 'config.json'), JSON.stringify({schemaVersion:1,settings:{rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'system',defaultRemote:'casa',startAtLogin:false,closeToTray:true,directoryRefreshSeconds:120},mounts:[{id:'shortcut-123',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(tmp,'linked'),autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}]}))
class Window extends EventEmitter {
  constructor(options) { super(); this.options = options; this.bounds = { x: 0, y: 0, width: options.width, height: options.height }; this.visible = false;
    this.webContents = new EventEmitter(); this.webContents.mainFrame = {}; this.webContents.send = () => {}; this.webContents.setWindowOpenHandler = () => {}; windows.push(this) }
  isDestroyed() { return false } isVisible() { return this.visible } isFocused() { return false } isMinimized() { return false } isMaximized() { return false }
  show() { this.visible = true } hide() { this.visible = false } focus() {} restore() {} unmaximize() {} minimize() {} close() { this.emit('close', {preventDefault() {}}) }
  setBounds(b) { this.bounds = b } getBounds() { return this.bounds } setMinimumSize() {} setResizable(b) { this.resizable = b }
  setAlwaysOnTop() {} setSkipTaskbar(b) { this.skipTaskbar = b } setBackgroundColor(color) { this.background = color }
  async loadFile() { this.emit('ready-to-show') } async loadURL() { this.emit('ready-to-show') }
}
const theme = new EventEmitter(); let source = 'system'
Object.defineProperty(theme, 'themeSource', { get: () => source, set: v => { source = v; theme.shouldUseDarkColors = v === 'dark'; theme.emit('updated') } })
theme.shouldUseDarkColors = false
const app = new EventEmitter()
Object.assign(app, {whenReady: () => Promise.resolve(), requestSingleInstanceLock: () => true, getVersion: () => '0.2.0', getPath: () => tmp, getAppPath: () => path.resolve(__dirname, '..'), quit: () => {}, isPackaged: false})
const screen = new EventEmitter(); Object.assign(screen, {getDisplayNearestPoint: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getDisplayMatching: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getCursorScreenPoint: () => ({x: 500, y: 500}), getPrimaryDisplay: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}})})
class Tray extends EventEmitter { setToolTip() {} setContextMenu() {} getBounds() { return {x: 1850, y: 1040, width: 20, height: 20} } }
const electron = { app, BrowserWindow: Window, screen, nativeTheme: theme, Tray,
  dialog: { showErrorBox: (_title, msg) => { throw new Error(msg) }, showMessageBox: async () => ({response: 0}), showSaveDialog: async () => ({canceled:false,filePath:shortcutFile}) },
  ipcMain: {handle: (name, fn) => handlers.set(name, fn)},
  nativeImage: {createFromPath: () => ({resize: () => ({})})}, Menu: {buildFromTemplate: v => v, setApplicationMenu: () => {}}, shell: {openPath: async p => {opened.push(p);return ''},writeShortcutLink:(dest,_operation,options)=>{fs.writeFileSync(dest,JSON.stringify(options));return true}} }
const original = Module._load
Module._load = function(id, ...args) {
  if (id === 'electron') return electron
  if (id === './backups') return {BackupManager: class { startScheduler() {} state() { return {status: 'running', detail: 'Copia...', progress:{phase:'copying',percent:42,bytes:42,totalBytes:100,speed:1,checks:1,transfers:0}} } stop() {} }}
  if (id === './mounts') return {MountManager: class { hasRuntime(){return true} state() { return {status: 'connected', detail: ''} } needsRefreshReconnect(){return true} async connect(){} async disconnectAll() {} }}
  return original.call(this, id, ...args)
}
require('../src/main/index.ts')
Module._load = original
const ready = () => new Promise(resolve => setImmediate(resolve))
function event() { return {sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame} }
test('starts in a compact panel, not a full-size application window', async () => {
  await ready()
  assert.equal(windows.length, 1)
  assert.equal(windows[0].bounds.width, 430)
  assert.equal(handlers.get('drive:snapshot')(event()).windowMode, 'compact')
})
test('expanding and shrinking reuse the same window and do not restart mounts', async () => {
  await ready()
  assert.equal(typeof handlers.get('drive:setWindowMode'), 'function')
  await handlers.get('drive:setWindowMode')(event(), 'expanded')
  assert.equal(windows.length, 1)
  assert.equal(windows[0].skipTaskbar, false)
  assert.equal(handlers.get('drive:snapshot')(event()).windowMode, 'expanded')
  await handlers.get('drive:setWindowMode')(event(), 'compact')
  assert.equal(windows[0].bounds.width, 430)
})
test('persisting dark mode updates both native dialogs and the renderer snapshot', async () => {
  await ready()
  const snap = handlers.get('drive:snapshot')(event())
  await handlers.get('drive:saveSettings')(event(), {...snap.settings, theme: 'dark'})
  assert.equal(theme.themeSource, 'dark')
  assert.equal(handlers.get('drive:snapshot')(event()).dark, true)
})
test('renderer APIs reject another window and subframes', async () => {
  await ready()
  assert.throws(() => handlers.get('drive:snapshot')({sender: {}}), /autorizzata/)
  assert.throws(() => handlers.get('drive:snapshot')({...event(), senderFrame: {}}), /autorizzata/)
})

test('snapshot forwards backup statistics and the refresh-reconnect notice',async()=>{
  await ready();const m=handlers.get('drive:snapshot')(event()).mounts[0]
  assert.equal(m.backupProgress.percent,42);assert.equal(m.refreshNeedsReconnect,true)
})
test('Create shortcut is a guarded IPC operation and writes the chosen launcher',async()=>{
  await ready();const handler=handlers.get('drive:createShortcut');assert.equal(typeof handler,'function')
  await assert.rejects(handler({sender:{}} ,'shortcut-123'),/autorizzata/)
  app.isPackaged=true
  try {const result=await handler(event(),'shortcut-123');assert.equal(result,shortcutFile);assert.ok(fs.readFileSync(result,'utf8').includes('--open-folder shortcut-123'))}
  finally {app.isPackaged=false}
})
test('second-instance shortcut arguments open the saved folder in the existing app',async()=>{
  await ready();app.emit('second-instance',{},['drive-tambu','--open-folder','shortcut-123']);await ready()
  assert.ok(opened.includes(path.join(tmp,'linked')));assert.equal(windows.length,1)
})
