// Disposable native integration of the PRODUCTION classes; not a losslessness certificate.
const fs=require('node:fs/promises'),path=require('node:path'),Module=require('node:module')
const assert=require('node:assert/strict'),crypto=require('node:crypto'),os=require('node:os')
const {assertHostedRunner,WriterClient,waitFor,sha256,confirmAndWait}=require('./helpers/support.cjs')
const {StorageFixture}=require('./helpers/fixture.cjs')
const output=path.resolve('.safety-probe-results',process.platform+'.json')
async function main(){
 assertHostedRunner()
 const report={purpose:'production-guarded-disconnection',productionSafetyCertified:false,platform:process.platform,status:'running',checks:[]}
 let fixture,manager;const children=[]
 const originalLoad=Module._load
 const childProcess=require('node:child_process')
 try{
  const executable=process.env.SAFETY_RCLONE;assert.ok(executable&&path.isAbsolute(executable))
  fixture=await StorageFixture.create(executable,process.env.RUNNER_TEMP)
  process.env.RCLONE_CONFIG=fixture.config
  // Use the real OS children and production code. Only Electron app paths are supplied by the test.
  Module._load=function(id,...args){
   if(id==='electron')return {app:{getPath:()=>fixture.home}}
   if(id==='node:child_process')return {...childProcess,spawn:(...params)=>{const c=childProcess.spawn(...params);children.push(c);return c}}
   return originalLoad.call(this,id,...args)
  }
  const {MountManager}=require('../../src/main/mounts.ts')
  const {OperationCoordinator}=require('../../src/main/operations.ts')
  Module._load=originalLoad
  const m={id:'native-folder',name:'Native test',remote:'probe',remotePath:'/',localPath:fixture.mountPoint,autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}
  const store={find:()=>m,mounts:[m],settings:{rcloneExecutable:executable,cacheMaxSize:'1G',directoryRefreshSeconds:120}}
  manager=new MountManager(store,()=>{},line=>{report.lastMessage=fixture.sanitize(line)})
  await manager.connect(m.id)
  assert.equal(manager.state(m.id).status,'connected')
  assert.equal(await fs.readFile(path.join(m.localPath,'fixture-ready.txt'),'utf8'),'probe-ready')
  report.checks.push('stock rclone mount visible through production manager')
  fixture.writer=new WriterClient(m.localPath)
  const bytes=crypto.randomBytes(65536),hash=sha256(bytes)
  await fixture.writer.call('open',{name:'guarded.bin',hex:bytes.toString('hex')})
  await fixture.writer.call('close')
  const busy=await manager.preflight(m.id)
  assert.equal(busy.kind,'blocked','Delayed upload must be blocked by production preflight')
  await assert.rejects(manager.disconnect(m.id))
  assert.equal(manager.state(m.id).status,'connected')
  report.checks.push('pending upload rejects real disconnection without stopping the engine')
  await fixture.waitHash('guarded.bin',hash)
  await waitFor(async()=> (await manager.preflight(m.id)).kind==='confirm',15000,'Idle observation after upload')
  let done=false
  const c=new OperationCoordinator({changed:()=>{},pause:()=>{},resume:()=>{},hide:()=>{}})
  const pending=c.run({kind:'disconnect',name:m.name,requiresConfirmation:true},()=>manager.preflight(m.id),async()=>{await manager.disconnect(m.id);done=true})
  await waitFor(async()=>c.view?.phase==='confirm',10000,'Mandatory warning')
  assert.equal(done,false);assert.equal(manager.state(m.id).status,'connected')
  assert.equal(await confirmAndWait(c,pending),true)
  assert.equal(manager.state(m.id).status,'disconnected');assert.equal(manager.hasRuntime(m.id),false)
  assert.equal(await fixture.remoteHash('guarded.bin'),hash)
  report.checks.push('explicit confirmation rechecks and closes the owned daemon; server hash unchanged')
  report.sha256=hash;report.status='completed'
 }catch(error){report.status='failed';report.error=fixture?fixture.sanitize(error.message):String(error.message);process.exitCode=1}
 finally{
  Module._load=originalLoad
  // Fixture files are artificial. Test-only cleanup may stop its own children on a failed assertion.
  if(fixture?.writer){await fixture.writer.dispose();fixture.writer=null}
  if(manager&&fixture){try{await manager.disconnect('native-folder')}catch{}}
  for(const child of children){if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM')}
  if(fixture)await fixture.dispose()
  await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2)+'\n')
  console.log(JSON.stringify(report,null,2))
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1})
