const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), Module = require('node:module')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-guard-'))
after(() => fs.rmSync(tmp, { recursive: true, force: true }))
const handlers = new Map(), windows = [], opened = []; let status='connected', checkKind='confirm', disconnected=0, connected=0, runningBackup=false, paused=false, failConnect=false, exits=0
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
Object.assign(app, {whenReady: () => Promise.resolve(), requestSingleInstanceLock: () => true, getVersion: () => '0.2.0', getPath: () => tmp, getAppPath: () => path.resolve(__dirname, '..'), quit: () => { let blocked=false; app.emit('before-quit',{preventDefault(){blocked=true}}); if(!blocked)exits++ }, isPackaged: false})
const screen = new EventEmitter(); Object.assign(screen, {getDisplayNearestPoint: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getDisplayMatching: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getCursorScreenPoint: () => ({x: 500, y: 500}), getPrimaryDisplay: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}})})
class Tray extends EventEmitter { setToolTip() {} setContextMenu() {} getBounds() { return {x: 1850, y: 1040, width: 20, height: 20} } }
const electron = { app, BrowserWindow: Window, screen, nativeTheme: theme, Tray,
  dialog: { showErrorBox: (_title, msg) => { throw new Error(msg) }, showMessageBox: async () => ({response: 0}), showSaveDialog: async () => ({canceled:false,filePath:shortcutFile}) },
  ipcMain: {handle: (name, fn) => handlers.set(name, fn)},
  nativeImage: {createFromPath: () => ({resize: () => ({})})}, Menu: {buildFromTemplate: v => v, setApplicationMenu: () => {}}, shell: {openPath: async p => {opened.push(p);return ''},writeShortcutLink:(dest,_operation,options)=>{fs.writeFileSync(dest,JSON.stringify(options));return true}} }
const original = Module._load
Module._load = function(id, ...args) {
  if (id === 'electron') return electron
  if (id === './backups') return {BackupManager: class {startScheduler(){} pauseScheduling(){paused=true} resumeScheduling(){paused=false} state(){return {status:runningBackup?'running':'idle',detail:''}} stop(){assert.equal(runningBackup,false)} }}
  if (id === './mounts') return {checkMountDestination: p=>{if(fs.existsSync(p))throw new Error('occupata')}, MountManager: class {
    state(){return {status,detail:''}} hasRuntime(){return status==='connected'} needsRefreshReconnect(){return false}
    async preflight(){return {kind:checkKind,message:checkKind==='confirm'?'Nessun trasferimento.':'Operazione bloccata.'}}
    async disconnect(){if(checkKind!=='confirm')throw new Error('blocked');disconnected++;status='disconnected'}
    async connect(){connected++;if(failConnect){failConnect=false;throw new Error('prova collegamento fallito')}status='connected'}
    cleanupOwnedDirectory(){} async disconnectAll(){disconnected++;status='disconnected'}
  }}
  return original.call(this, id, ...args)
}
require('../src/main/index.ts')
Module._load = original
const ready = () => new Promise(resolve => setImmediate(resolve))
function event() { return {sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame} }
const snapshot=()=>handlers.get('drive:snapshot')(event())
async function reply(value){const op=snapshot().operation;assert.ok(op);await handlers.get('drive:respondToOperation')(event(),op.id,value);await ready()}
test('disconnection is shown in-app and does not happen before confirmation',async()=>{
 await ready();const start=disconnected;const p=handlers.get('drive:disconnect')(event(),'shortcut-123');await ready()
 assert.equal(snapshot().operation.phase,'confirm');assert.equal(disconnected,start);assert.equal(paused,true)
 await reply('confirm');await p;assert.equal(disconnected,start+1);assert.equal(paused,false);status='connected'
})
test('unknown telemetry blocks removal without changing saved folder',async()=>{
 checkKind='unknown';const p=handlers.get('drive:deleteMount')(event(),'shortcut-123');await ready()
 assert.equal(snapshot().operation.phase,'blocked');await reply('confirm');assert.equal(snapshot().mounts.length,1)
 await reply('cancel');await p;checkKind='confirm'
})
test('active backup prevents exit and all incompatible new app operations',async()=>{
 runningBackup=true;app.quit();await ready();assert.equal(snapshot().operation.phase,'blocked');assert.equal(exits,0)
 await assert.rejects(handlers.get('drive:connect')(event(),'shortcut-123'),/operazione/i)
 await reply('background');runningBackup=false;assert.equal(paused,false)
})
test('local path may change with confirmation and same identity, reconnecting if active',async()=>{
 status='connected';const before=snapshot().mounts[0];const target=path.join(tmp,'new-place')
 const p=handlers.get('drive:saveMount')(event(),{...before,localPath:target});await ready()
 assert.equal(snapshot().operation.kind,'move');assert.equal(snapshot().mounts[0].localPath,before.localPath)
 await reply('confirm');assert.equal(await p,true);assert.equal(snapshot().mounts[0].localPath,target);assert.equal(snapshot().mounts[0].id,before.id);assert.equal(status,'connected')
})
test('cancelling relocation keeps the previous path and never disconnects',async()=>{
 const before=snapshot().mounts[0],n=disconnected;const p=handlers.get('drive:saveMount')(event(),{...before,localPath:path.join(tmp,'cancelled')});await ready();await reply('cancel');assert.equal(await p,false);assert.equal(snapshot().mounts[0].localPath,before.localPath);assert.equal(disconnected,n)
})
test('failed new connection restores old config and attempts old connection',async()=>{
 const before=snapshot().mounts[0];failConnect=true;const p=handlers.get('drive:saveMount')(event(),{...before,localPath:path.join(tmp,'failure')});await ready();await reply('confirm');assert.equal(snapshot().mounts[0].localPath,before.localPath);assert.equal(status,'connected');assert.equal(snapshot().operation.phase,'blocked');await reply('cancel');await p
})
test('local path change leaves an initially disconnected folder disconnected',async()=>{
 status='disconnected';const before=snapshot().mounts[0],n=connected;const p=handlers.get('drive:saveMount')(event(),{...before,localPath:path.join(tmp,'offline-place')});await ready();await reply('confirm');await p;assert.equal(status,'disconnected');assert.equal(connected,n)
})
test('no connected folders or jobs allows immediate quit without a warning',async()=>{
 status='disconnected';const before=exits;app.quit();await ready();assert.equal(exits,before+1);assert.equal(snapshot().operation,null)
})
