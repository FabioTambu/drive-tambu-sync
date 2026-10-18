// Retained regression tests for the disposable native fixture, not a certification of app safety.
const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
let helpers = {}
try { helpers = require('./native/helpers/support.cjs') } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e }
const {assertHostedRunner, isolatedEnv, sha256, WriterClient} = helpers

test('refuses local or self-hosted execution', () => {
  assert.equal(typeof assertHostedRunner,'function')
  assert.throws(() => assertHostedRunner({}), /hosted/)
  assert.throws(() => assertHostedRunner({GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'self-hosted',RUNNER_TEMP:os.tmpdir()}), /hosted/)
  assert.doesNotThrow(() => assertHostedRunner({GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'github-hosted',RUNNER_TEMP:os.tmpdir()}))
})
test('isolates rclone overrides and SSH agent without removing executable PATH', () => {
  assert.equal(typeof isolatedEnv,'function')
  const root = path.join(os.tmpdir(),'fake-fixture')
  const env = isolatedEnv({PATH:'keep',RCLONE_CONFIG:'private',rclone_rc_pass:'secret',SSH_AUTH_SOCK:'agent'},root)
  assert.equal(env.PATH,'keep'); assert.equal(env.RCLONE_CONFIG,undefined)
  assert.equal(env.rclone_rc_pass,undefined); assert.equal(env.SSH_AUTH_SOCK,undefined)
  assert.equal(env.HOME,root); assert.equal(env.USERPROFILE,root)
})
test('hash function checks bytes, not size', () => {
  assert.equal(typeof sha256,'function')
  assert.notEqual(sha256(Buffer.from('abc')),sha256(Buffer.from('abd')))
  assert.equal(sha256(Buffer.from('abc')),crypto.createHash('sha256').update('abc').digest('hex'))
})
test('external writer acknowledges actual bytes and closes its handle', async t => {
  assert.equal(typeof WriterClient,'function')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-writer-test-'))
  const w=new WriterClient(root)
  t.after(async()=>{await w.dispose();await fs.rm(root,{recursive:true,force:true})})
  await w.call('open',{name:'test.bin',hex:Buffer.from('first').toString('hex')})
  await w.call('append',{hex:Buffer.from('-second').toString('hex')})
  await w.call('close')
  assert.equal(await fs.readFile(path.join(root,'test.bin'),'utf8'),'first-second')
})
test('external writer refuses paths outside its assigned mount and unknown commands', async t => {
  assert.equal(typeof WriterClient,'function')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-writer-test-'))
  const w=new WriterClient(root)
  t.after(async()=>{await w.dispose();await fs.rm(root,{recursive:true,force:true})})
  await assert.rejects(w.call('open',{name:'../outside',hex:'61'}),/name/)
  await assert.rejects(w.call('deleteAll',{}),/command/)
})
test('external writer does not overwrite an existing file', async t => {
  assert.equal(typeof WriterClient,'function')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-writer-test-'))
  await fs.writeFile(path.join(root,'test.bin'),'keep')
  const w=new WriterClient(root)
  t.after(async()=>{await w.dispose();await fs.rm(root,{recursive:true,force:true})})
  await assert.rejects(w.call('open',{name:'test.bin',hex:'61'}),/EEXIST/)
  assert.equal(await fs.readFile(path.join(root,'test.bin'),'utf8'),'keep')
})

test('fixture initialization failures redact temporary credentials before leaving the fixture', async t => {
  const {StorageFixture}=require('./native/helpers/fixture.cjs')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-fixture-failure-'))
  const originalInitialize=StorageFixture.prototype.initialize
  const originalDispose=StorageFixture.prototype.dispose
  StorageFixture.prototype.initialize=async function(){
    this.password='unique-test-password';this.rcSecret='unique-test-rc-secret';this.obscured='unique-test-obscured'
    throw new Error(`${this.password} ${this.rcSecret} ${this.obscured} cannot initialize`)
  }
  StorageFixture.prototype.dispose=async()=>{}
  try {
    await assert.rejects(StorageFixture.create('not-executed',root),error=>{
      assert.doesNotMatch(error.message,/unique-test-/)
      assert.match(error.message,/cannot initialize/)
      return true
    })
  } finally {
    StorageFixture.prototype.initialize=originalInitialize
    StorageFixture.prototype.dispose=originalDispose
    await fs.rm(root,{recursive:true,force:true})
  }
})

// Regression for the hosted run 39116390251: fixture-ready.txt must be
// visible before the SFTP server can cache an empty directory. These tests
// execute the actual fixture lifecycle, with only rclone's process boundary
// simulated. They are not evidence of a native mount or shutdown guarantee.
function markerFixtureModule() {
  const vm = require('node:vm')
  const syncFs = require('node:fs')
  const {EventEmitter} = require('node:events')
  const {PassThrough} = require('node:stream')
  const module = {exports:{}}
  const observed = {serverMarker:undefined, clientReads:[]}
  const spawn = (_executable,args) => {
    const child = new EventEmitter()
    child.stdout = new PassThrough(); child.stderr = new PassThrough()
    child.exitCode = null; child.signalCode = null
    queueMicrotask(() => {
      let code = 0
      if (args[0] === 'obscure') child.stdout.write('fixture-obscured-password\n')
      else if (args[0] === 'lsjson') child.stdout.write('{"IsDir":true}')
      else if (args[0] === 'cat') {
        observed.clientReads.push(args[1])
        if (observed.serverMarker === undefined) {
          child.stderr.write('object not found'); code = 1
        } else child.stdout.write(observed.serverMarker)
      } else {child.stderr.write('Unexpected fixture command'); code = 1}
      child.exitCode = code
      child.stdout.end(); child.stderr.end(); child.emit('close',code,null)
    })
    return child
  }
  const realSupport = require('./native/helpers/support.cjs')
  const testSupport = {...realSupport,
    // One readiness attempt removes the real-time delay, not its success test.
    waitFor:async (fn,_timeout,label) => {
      const value = await fn()
      if (!value) throw new Error(`${label}: condition not met`)
      return value
    },
    WriterClient:class {async dispose(){}}
  }
  const source = syncFs.readFileSync(path.join(__dirname,'./native/helpers/fixture.cjs'),'utf8')
  const sandbox = {module,exports:module.exports,Buffer,process,console,setTimeout,clearTimeout,
    require:id => id === 'node:child_process' ? {spawn} : id === './support.cjs' ? testSupport : require(id)}
  vm.runInNewContext(source,sandbox,{filename:'fixture.cjs'})
  return {StorageFixture:module.exports.StorageFixture,observed}
}
async function markerFixture(t) {
  const {StorageFixture,observed} = markerFixtureModule()
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'drive-marker-regression-'))
  const fixture = new StorageFixture('simulated-rclone',root)
  fixture.launch = () => {
    const marker = path.join(fixture.remote,'fixture-ready.txt')
    try { observed.serverMarker = require('node:fs').readFileSync(marker,'utf8') }
    catch (error) { if (error.code !== 'ENOENT') throw error; observed.serverMarker = undefined }
    return {assertAlive(){}}
  }
  t.after(async () => {await fixture.dispose();await fs.rm(root,{recursive:true,force:true})})
  return {fixture,observed}
}

test('marker is created before the first SFTP server starts', async t => {
  const {fixture,observed} = await markerFixture(t)
  await fixture.initialize()
  assert.equal(observed.serverMarker,'probe-ready','the first server view must already contain the marker')
  assert.equal(await fs.readFile(path.join(fixture.remote,'fixture-ready.txt'),'utf8'),'probe-ready')
  assert.ok(observed.clientReads.includes('probe:/fixture-ready.txt'),'readiness must read through SFTP')
})

test('SFTP readiness rejects a missing marker even when the root directory exists', async t => {
  const {fixture} = await markerFixture(t)
  await fs.mkdir(fixture.remote,{recursive:true})
  await assert.rejects(fixture.startServer(),/not found|marker|Marker/)
})

test('SFTP readiness rejects incorrect marker contents', async t => {
  const {fixture} = await markerFixture(t)
  await fs.mkdir(fixture.remote,{recursive:true})
  await fs.writeFile(path.join(fixture.remote,'fixture-ready.txt'),'wrong-content')
  await assert.rejects(fixture.startServer(),/marker|Marker/)
})
test('native test confirmation reports a blocked execution instead of hanging forever',async()=>{
 const {confirmAndWait}=require('./native/helpers/support.cjs')
 assert.equal(typeof confirmAndWait,'function')
 const {OperationCoordinator}=require('../src/main/operations.ts')
 const c=new OperationCoordinator({changed(){},pause(){},resume(){},hide(){}})
 const pending=c.run({kind:'disconnect',requiresConfirmation:true},async()=>({kind:'confirm',message:''}),async()=>{throw new Error('unmount failed in test')})
 await new Promise(r=>setImmediate(r))
 await assert.rejects(confirmAndWait(c,pending),/unmount failed/)
 assert.equal(await pending,false)
})
test('native test confirmation awaits the successful production operation',async()=>{
 const {confirmAndWait}=require('./native/helpers/support.cjs')
 assert.equal(typeof confirmAndWait,'function')
 const {OperationCoordinator}=require('../src/main/operations.ts')
 const c=new OperationCoordinator({changed(){},pause(){},resume(){},hide(){}})
 const pending=c.run({kind:'disconnect',requiresConfirmation:true},async()=>({kind:'confirm',message:''}),async()=>{})
 await new Promise(r=>setImmediate(r));assert.equal(await confirmAndWait(c,pending),true)
})
