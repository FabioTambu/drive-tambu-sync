const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const Module = require('node:module')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-store-'))
let dataRoot = root
const load = Module._load
// Only the platform boundary is replaced: ConfigStore reads/writes real temporary files.
Module._load = function(id, ...args) {
  if (id === 'electron') return { app: { getPath: () => dataRoot } }
  return load.call(this, id, ...args)
}
const { ConfigStore } = require('../src/main/store.ts')
Module._load = load
after(() => fs.rmSync(root, { recursive: true, force: true }))
let n = 0
function fresh() { dataRoot = path.join(root, String(++n)); return new ConfigStore() }
function mount(id = 'mount-123') {
  return { id, name: 'Documenti', remote: 'casa', remotePath: '/documenti', localPath: path.join(root, 'links', id), autoConnect: true,
    backup: { enabled: false, intervalMinutes: 60, destination: '', retentionDays: 30 } }
}
test('new settings follow the system theme and do not invent a server', () => {
  const store = fresh()
  assert.equal(store.settings.theme, 'system')
  assert.equal(store.settings.defaultRemote, '')
})
test('theme persists after restarting the app', () => {
  const store = fresh()
  store.saveSettings({ ...store.settings, theme: 'dark' })
  assert.equal(new ConfigStore().settings.theme, 'dark')
})
test('existing schema 1 settings and folders survive migration', () => {
  dataRoot = path.join(root, String(++n)); fs.mkdirSync(dataRoot)
  fs.writeFileSync(path.join(dataRoot, 'config.json'), JSON.stringify({schemaVersion: 1,
    settings: {rcloneExecutable: 'rclone', cacheMaxSize: '5G', startAtLogin: true, closeToTray: true}, mounts: [mount()]}))
  const store = new ConfigStore()
  assert.equal(store.mounts[0].remote, 'casa')
  assert.equal(store.settings.startAtLogin, true)
  assert.equal(store.settings.theme, 'system')
})
test('save canonicalizes a fully qualified pasted path', () => {
  const store = fresh(), m = mount()
  m.remotePath = 'casa:/documenti'
  store.saveMount(m)
  assert.equal(store.find(m.id).remotePath, '/documenti')
})
test('a backup may not contain a connected folder', () => {
  const store = fresh(), m = mount()
  m.backup.enabled = true; m.backup.destination = path.join(root, 'links')
  assert.throws(() => store.saveMount(m), /backup/i)
})
test('two backup destinations cannot overlap', () => {
  const store = fresh(), a = mount('mount-aaa'), b = mount('mount-bbb')
  a.backup.enabled = true; a.backup.destination = path.join(root, 'backups', 'a')
  b.backup.enabled = true; b.backup.destination = path.join(root, 'backups', 'a', 'nested')
  store.saveMount(a)
  assert.throws(() => store.saveMount(b), /backup/i)
})
test('system root is never accepted as the local linked folder', () => {
  const store = fresh(), m = mount()
  m.localPath = path.parse(root).root
  assert.throws(() => store.saveMount(m), /radice|principale|sistema/i)
})
test('a malformed folder name is rejected with a helpful validation message', () => {
  const store = fresh(), m = mount()
  m.name = 17
  assert.throws(() => store.saveMount(m), /Inserisci un nome/)
})
test('an incomplete settings file is rejected without overwriting the file', () => {
  dataRoot = path.join(root, String(++n)); fs.mkdirSync(dataRoot)
  const text = JSON.stringify({schemaVersion: 1, settings: null, mounts: []})
  const file = path.join(dataRoot, 'config.json'); fs.writeFileSync(file, text)
  assert.throws(() => new ConfigStore(), /config.json non riconosciuto/)
  assert.equal(fs.readFileSync(file, 'utf8'), text)
})
