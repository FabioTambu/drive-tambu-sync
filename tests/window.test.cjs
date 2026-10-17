const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), Module = require('node:module')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-window-'))
after(() => fs.rmSync(tmp, { recursive: true, force: true }))
const handlers = new Map(), windows = []
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
  dialog: { showErrorBox: (_title, msg) => { throw new Error(msg) }, showMessageBox: async () => ({response: 0}) },
  ipcMain: {handle: (name, fn) => handlers.set(name, fn)},
  nativeImage: {createFromPath: () => ({resize: () => ({})})}, Menu: {buildFromTemplate: v => v, setApplicationMenu: () => {}}, shell: {openPath: async () => ''} }
const original = Module._load
Module._load = function(id, ...args) {
  if (id === 'electron') return electron
  if (id === './backups') return {BackupManager: class { startScheduler() {} state() { return {status: 'idle', detail: ''} } stop() {} }}
  if (id === './mounts') return {MountManager: class { state() { return {status: 'disconnected', detail: ''} } async disconnectAll() {} }}
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
