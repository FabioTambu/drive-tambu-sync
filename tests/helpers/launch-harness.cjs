// Execute the real main/shortcut/store/operation modules; replace only native boundaries.
// Does not load Electron, run rclone, use a personal profile, or open real windows.
const {EventEmitter} = require('node:events')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path')
const ts = require('typescript')

async function launchHarness(t, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dt-launch-'))
  const appRoot = path.resolve(__dirname, '../..')
  const id = '8a1cf954-9641-4848-8a07-3568cf90fad4'
  const localPath = path.join(root, 'mounted-folder')
  const calls = {opened: [], connected: [], shown: 0, focused: 0, quits: 0, errors: [], lockData: undefined}
  const windows = [], trays = [], handlers = new Map()
  let status = options.status || 'connected'
  let preflightKind = options.preflightKind || 'confirm'
  const platform = options.platform || 'win32'
  const executable = path.join(root, 'Programs', 'Drive Tambu', 'Drive Tambu.exe')
  const processView = {platform, argv: options.argv || [executable], execPath: executable, resourcesPath: path.join(root, 'resources'), env: {}}
  const mount = {id, name: 'Files', remote: 'probe', remotePath: '/files', localPath, autoConnect: false, backup: {enabled: false, intervalMinutes: 0, destination: '', retentionDays: 30}}
  fs.writeFileSync(path.join(root, 'config.json'), JSON.stringify({schemaVersion: 1, settings: {rcloneExecutable: 'unused', cacheMaxSize: '5G', theme: 'system', defaultRemote: 'probe', startAtLogin: false, closeToTray: true, directoryRefreshSeconds: 120}, mounts: [mount]}))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  class Window extends EventEmitter {
    constructor(opts) {
      super(); this.options = opts; this.visible = !!opts.show; this.minimized = false; this.destroyed = false
      this.webContents = new EventEmitter(); this.webContents.mainFrame = {}
      this.webContents.send = () => {}; this.webContents.setWindowOpenHandler = () => {}
      windows.push(this)
    }
    show() { this.visible = true; calls.shown++ }
    hide() { this.visible = false }
    focus() { calls.focused++ }
    isDestroyed() { return this.destroyed }
    isVisible() { return this.visible }
    isFocused() { return false }
    isMinimized() { return this.minimized }
    isMaximized() { return false }
    restore() { this.minimized = false }
    minimize() { this.minimized = true }
    unmaximize() {}
    setMinimumSize() {} setResizable() {} setBounds() {} setSkipTaskbar() {} setAlwaysOnTop() {} setBackgroundColor() {}
    async loadFile() { if (!options.deferReady) this.emit('ready-to-show') }
    async loadURL() { if (!options.deferReady) this.emit('ready-to-show') }
  }
  class Tray extends EventEmitter {
    constructor() { super(); if (options.noTray) throw new Error('Tray unavailable in this test'); trays.push(this) }
    setToolTip() {} setContextMenu(menu) { this.menu = menu }
  }
  const app = new EventEmitter()
  Object.assign(app, {
    whenReady: () => Promise.resolve(), isPackaged: true,
    requestSingleInstanceLock: data => { calls.lockData = data; return !options.secondaryProcess },
    getPath: () => root, getAppPath: () => appRoot, getVersion: () => 'test-version', setLoginItemSettings() {},
    quit: () => { let prevented = false; app.emit('before-quit', {preventDefault() { prevented = true }}); if (!prevented) calls.quits++ }
  })
  const screen = new EventEmitter()
  Object.assign(screen, {getCursorScreenPoint: () => ({x: 0, y: 0}), getDisplayNearestPoint: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}})})
  const nativeTheme = new EventEmitter(); nativeTheme.shouldUseDarkColors = false
  const destination = path.join(root, platform === 'win32' ? 'Files.lnk' : 'Files.desktop')
  const electron = {app, BrowserWindow: Window, Tray, screen, nativeTheme, Menu: {setApplicationMenu() {}, buildFromTemplate: v => v}, nativeImage: {createFromPath: () => ({resize: () => ({})})},
    ipcMain: {handle: (name, fn) => handlers.set(name, fn)},
    dialog: {showErrorBox: (title, message) => calls.errors.push({title, message}), showSaveDialog: async () => ({canceled: false, filePath: destination})},
    shell: {openPath: async target => {calls.opened.push(target); return options.openError || ''}, writeShortcutLink: (dest, operation, shortcut) => {fs.writeFileSync(dest, JSON.stringify({operation, ...shortcut})); return true}}
  }
  const nativeMounts = {checkMountDestination() {}, MountManager: class {
    state() { return {status, detail: ''} }
    hasRuntime() { return status !== 'disconnected' }
    needsRefreshReconnect() { return false }
    async connect(folderId) { calls.connected.push(folderId); if (options.connect) await options.connect(); status = 'connected' }
    async preflight() { return {kind: preflightKind, message: 'Test transfer status'} }
    async disconnect() { if (preflightKind !== 'confirm') throw new Error('Blocked'); status = 'disconnected' }
    cleanupOwnedDirectory() {}
  }}
  const cache = new Map()
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports
    const module = {exports: {}}; cache.set(file, module)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {fileName: file, compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true}}).outputText
    function localRequire(name) {
      if (name === 'electron') return electron
      if (file.endsWith(path.join('main', 'index.ts')) && name === './mounts') return nativeMounts
      if (file.endsWith(path.join('main', 'index.ts')) && name === './backups') return {BackupManager: class {startScheduler() {} pauseScheduling() {} resumeScheduling() {} stop() {} state() { return {status: 'idle', detail: ''} }}}
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'))
      return require(name)
    }
    new Function('require', 'module', 'exports', '__filename', '__dirname', 'process', code)(localRequire, module, module.exports, file, path.dirname(file), processView)
    return module.exports
  }
  load(path.join(appRoot, 'src/main/index.ts'))
  const settle = () => new Promise(resolve => setImmediate(resolve))
  await settle()
  const event = () => ({sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame})
  return {id, localPath, calls, windows, trays, app, destination, settle,
    invoke: (channel, ...args) => handlers.get(channel)(event(), ...args),
    snapshot: () => handlers.get('drive:snapshot')(event()),
    setPreflight: value => {preflightKind = value},
    secondary: async (argv, data) => {app.emit('second-instance', {}, argv, root, data); await settle()},
    resetWindowCounts: () => {calls.shown = 0; calls.focused = 0}
  }
}
module.exports = {launchHarness}
