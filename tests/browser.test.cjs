const {test, after} = require('node:test')
const assert = require('node:assert/strict')
const cp = require('node:child_process')
const {EventEmitter} = require('node:events')
const {PassThrough} = require('node:stream')
const original = cp.spawn
let response = '[]', args, spawns = 0
// The OS process boundary is simulated; directory parsing, validation and navigation are real.
cp.spawn = (_exe, argv) => {
  spawns++; args = argv
  const child = new EventEmitter()
  child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.exitCode = null
  queueMicrotask(() => {child.stdout.write(response); child.exitCode = 0; child.emit('close', 0)})
  return child
}
after(() => {cp.spawn = original})
const {listRemoteDirectories, checkRemoteDirectory} = require('../src/main/diagnostics.ts')
const {selectedRemote} = require('../src/shared/paths.ts')
test('directory browser strips a pasted prefix once and only lists directories', async () => {
  response = JSON.stringify([{Name:'anno10',IsDir:true},{Name:'file.txt',IsDir:false},{Name:'anno2',IsDir:true}])
  const result = await listRemoteDirectories('rclone','casa','casa:/documenti')
  assert.equal(args[0], 'lsjson'); assert.equal(args[1], 'casa:/documenti')
  assert.ok(args.includes('--dirs-only')); assert.ok(!args.includes('--recursive'))
  assert.deepEqual(result.entries, [{name:'anno2',path:'/documenti/anno2'},{name:'anno10',path:'/documenti/anno10'}])
  assert.equal(result.parent, '/')
})
test('browsing home stays home-relative instead of switching to the server root', async () => {
  response = '[{"Name":"Documenti","IsDir":true}]'
  const result = await listRemoteDirectories('rclone','casa','')
  assert.equal(args[1], 'casa:'); assert.equal(result.parent,null)
  assert.equal(result.entries[0].path,'Documenti')
})
test('an empty directory is selectable and is not treated as a connection failure', async () => {
  response = '[]'
  const result = await listRemoteDirectories('rclone','casa','/vuota')
  assert.equal(result.path,'/vuota'); assert.deepEqual(result.entries,[])
})
test('invalid server output produces a clear error', async () => {
  response = 'not json'
  await assert.rejects(listRemoteDirectories('rclone','casa','/'), /elenco non valido/)
})
test('a browse cancelled before starting never launches a process', async () => {
  const controller = new AbortController(); controller.abort()
  const before = spawns
  await assert.rejects(listRemoteDirectories('rclone','casa','/',controller.signal), /annullata/)
  assert.equal(spawns,before)
})
test('preflight rejects files without pretending they are directories', async () => {
  response = '{"IsDir":false}'
  await assert.rejects(checkRemoteDirectory('rclone','casa','/file.txt'), /non e una cartella/)
  assert.ok(args.includes('--stat'))
})
test('only an existing sole or preferred server is selected automatically', () => {
  assert.equal(selectedRemote(['casa']), 'casa')
  assert.equal(selectedRemote([]), '')
  assert.equal(selectedRemote(['casa','ufficio']), '')
  assert.equal(selectedRemote(['casa','ufficio'],'ufficio'), 'ufficio')
  assert.equal(selectedRemote(['casa','ufficio'],'inesistente'), '')
})
test('managed remote directory reads use the private rclone config',async t=>{
 const p=require('./helpers/managed-profile.cjs')(t);response='[]';await listRemoteDirectories('rclone',p.remote,'')
 assert.equal(args[args.indexOf('--config')+1],p.config)
})
