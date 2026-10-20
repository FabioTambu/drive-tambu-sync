const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const id = '8a1cf954-9641-4848-8a07-3568cf90fad4'

test('read-only fast path returns the latest folder position only for an unambiguously healthy mount', () => {
  const {fastPathReply} = require('../src/main/shortcut-fastpath.ts')
  let state = 'connected', running = true, blocked = false, location = 'C:\\Users\\fabio\\Documents\\updated'
  const services = {find: value => value === id ? {localPath:location} : (() => {throw new Error('missing')})(), ready: () => state === 'connected' && running, blocked: () => blocked}
  assert.deepEqual(fastPathReply(id, services), {ready: true, path: location})
  location = 'D:\\moved'; assert.deepEqual(fastPathReply(id, services), {ready:true,path:'D:\\moved'})
  for (const disallowed of ['disconnected','connecting','disconnecting','error']) {state = disallowed;assert.deepEqual(fastPathReply(id, services), {ready:false})}
  state = 'connected';running = false;assert.deepEqual(fastPathReply(id, services), {ready:false})
  running = true;blocked = true;assert.deepEqual(fastPathReply(id, services), {ready:false})
  assert.deepEqual(fastPathReply('unknown-123', services), {ready:false})
  assert.deepEqual(fastPathReply('../bad', services), {ready:false})
})
test('launcher request parser never accepts commands, long payloads or invalid folder identifiers', () => {
  const {fastPathReply} = require('../src/main/shortcut-fastpath.ts')
  const services = {find: () => ({localPath:'C:\\test'}),ready: () => true,blocked: () => false}
  for (const payload of ['../../data', 'abc\tfoo', 'abc\nfoo', 'a'.repeat(81), '', 'invalid;id']) assert.deepEqual(fastPathReply(payload, services),{ready:false})
})
test('only generated and explicitly recorded shortcuts enter the inventory', () => {
  const {recordShortcut} = require('../src/main/shortcut-inventory.ts')
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dt-short-inventory-'))
  try {
    const dest=path.join(temp,'Desktop','Files.lnk');fs.mkdirSync(path.dirname(dest));fs.writeFileSync(dest,'fake-lnktest')
    recordShortcut(temp,dest,id,'C:\\Program Files\\Drive Tambu\\DriveTambuShortcut.exe',`--open-folder ${id}`)
    const list = JSON.parse(fs.readFileSync(path.join(temp,'shortcuts-v1.json'),'utf8'))
    assert.equal(list.version,1);assert.equal(list.shortcuts.length,1)
    assert.equal(list.shortcuts[0].id,id);assert.equal(list.shortcuts[0].path,dest)
    assert.throws(() => recordShortcut(temp, path.join(temp,'bad.txt'),id,'C:\\foo.exe','--open-folder '+id),/collegamento|lnk/i)
    assert.equal(JSON.parse(fs.readFileSync(path.join(temp,'shortcuts-v1.json'),'utf8')).shortcuts.length,1)
  } finally {fs.rmSync(temp,{recursive:true,force:true})}
})
test('packaging builds a Windows native launcher and keeps Linux launchers unchanged', () => {
 const pkg=require('../package.json')
 assert.match(pkg.scripts['dist:win'],/build:native:win/)
 assert.ok(pkg.build.win.extraFiles.some(x=>x.to==='DriveTambuShortcut.exe'))
 assert.ok(fs.existsSync(path.join(__dirname,'../native/windows/DriveTambuShortcut.cpp')))
 assert.ok(fs.existsSync(path.join(__dirname,'../scripts/build-native-win.cjs')))
 const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/build.yml'),'utf8')
 assert.match(workflow,/dist:\$\{\{ matrix.target \}\}/)
})

test('native Windows launcher refuses generic junctions and checks logon DACL and local-only pipes',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../native/windows/DriveTambuShortcut.cpp'),'utf8')
 for(const token of ['FSCTL_GET_REPARSE_POINT','PIPE_REJECT_REMOTE_CLIENTS','FILE_FLAG_FIRST_PIPE_INSTANCE','ConvertStringSecurityDescriptorToSecurityDescriptorW','TokenGroups','GetNamedPipeServerProcessId','ShellExecuteExW','legacyOpen'])assert.ok(source.includes(token),token)
 assert.ok(!source.includes('Directory.GetFiles('))
})

test('the build-generated native EXE is ignored and never shipped as source in the repository',()=>{
 const ignore=fs.readFileSync(path.join(__dirname,'../.gitignore'),'utf8')
 assert.match(ignore,/^resources\/native\/$/m)
})
