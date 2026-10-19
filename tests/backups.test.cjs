const {test,after} = require('node:test')
const assert=require('node:assert/strict'),Module=require('node:module'),fs=require('node:fs'),os=require('node:os'),path=require('node:path')
const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream')
const root=fs.mkdtempSync(path.join(os.tmpdir(),'dt-backups-'));let currentRoot=root, syncs=[],preflightEmpty=false
const oldLoad=Module._load
Module._load=function(id,...args){
 if(id==='electron')return {app:{getPath:()=>currentRoot}}
 if(id==='node:child_process')return {spawn:(_exe,args)=>{
  const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.exitCode=null
  child.kill=()=>{if(child.exitCode===null){child.exitCode=1;child.emit('close',1)};return true}
  if(args[0]==='lsf')setImmediate(()=>{child.stdout.write(preflightEmpty?'':'file.txt\n');child.exitCode=0;child.emit('close',0)})
  else if(args[0]==='sync')syncs.push({child,args})
  return child
 }}
 return oldLoad.call(this,id,...args)
}
const diagnostics=require('../src/main/diagnostics.ts');diagnostics.stopChild=c=>c.kill()
const {ConfigStore}=require('../src/main/store.ts'),{BackupManager}=require('../src/main/backups.ts')
Module._load=oldLoad
let counter=0
function fixture(){
 syncs=[];preflightEmpty=false;currentRoot=path.join(root,String(++counter))
 const store=new ConfigStore();const m={id:'mount-backup',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(currentRoot,'mount'),autoConnect:false,backup:{enabled:true,intervalMinutes:17,destination:path.join(currentRoot,'backup'),retentionDays:30}}
 store.saveMount(m);const manager=new BackupManager(store,()=>{},()=>{})
 return {store,manager,m}
}
const flush=()=>new Promise(r=>setImmediate(r))
async function waitForSync(){const deadline=Date.now()+5000;while(!syncs.length&&Date.now()<deadline)await new Promise(r=>setTimeout(r,2));assert.equal(syncs.length,1,'Expected a sync process after source preflight')}
function finish(code=0){const c=syncs.at(-1).child;c.exitCode=code;c.emit('close',code)}
after(()=>fs.rmSync(root,{recursive:true,force:true}))

test('backup emits genuine progress from JSON stats and never completes before process success',async()=>{
 const {store,manager,m}=fixture();const pending=manager.run(m.id);await waitForSync()
 try{
  assert.equal(syncs.length,1)
  const {args,child}=syncs[0]
  assert.ok(args.includes('--use-json-log'))
  assert.equal(args[args.indexOf('--stats-log-level')+1],'NOTICE')
  assert.ok(store.find(m.id).lastBackupAttemptAt)
  const line=JSON.stringify({level:'notice',stats:{bytes:420,totalBytes:1000,speed:10,checks:12}})+'\n'
  child.stderr.write(line.slice(0,16));child.stderr.write(line.slice(16));await flush()
  assert.equal(manager.state(m.id).progress.percent,42)
  child.stderr.write(JSON.stringify({stats:{bytes:1000,totalBytes:1000}})+'\n');await flush()
  assert.equal(manager.state(m.id).status,'running');assert.equal(manager.state(m.id).progress.percent,99)
  finish();await pending
  assert.equal(manager.state(m.id).progress.percent,100);assert.equal(manager.state(m.id).status,'idle')
  assert.ok(Date.parse(store.find(m.id).nextBackupAt)>=Date.parse(store.find(m.id).lastBackupAt)+17*60000)
 }finally{if(syncs.at(-1)?.child.exitCode===null)finish();await pending.catch(()=>{});manager.stop()}
})
test('a failed sync after reporting 100 percent is an error, never a completed backup',async()=>{
 const {store,manager,m}=fixture();const pending=manager.run(m.id);const caught=pending.catch(e=>e);await waitForSync()
 const child=syncs[0].child;child.stderr.write(JSON.stringify({stats:{bytes:10,totalBytes:10}})+'\n'+JSON.stringify({level:'error',msg:'Permission denied'})+'\n');finish(1)
 const error=await caught;assert.ok(error instanceof Error);assert.equal(manager.state(m.id).status,'error');assert.ok(!store.find(m.id).lastBackupAt);manager.stop()
})
test('simultaneous requests run at most one backup process',async()=>{
 const {manager,m}=fixture();const first=manager.run(m.id)
 await assert.rejects(manager.run(m.id),/gia in corso/);await waitForSync();assert.equal(syncs.length,1);finish();await first;manager.stop()
})
test('empty source protection still blocks mirroring over an existing local backup',async()=>{
 const {manager,m}=fixture();preflightEmpty=true
 fs.mkdirSync(path.join(m.backup.destination,'corrente'),{recursive:true});fs.writeFileSync(path.join(m.backup.destination,'corrente','safe'),'original')
 await assert.rejects(manager.run(m.id),/vuota/)
 assert.equal(syncs.length,0);assert.equal(fs.readFileSync(path.join(m.backup.destination,'corrente','safe'),'utf8'),'original');manager.stop()
})
test('overdue calendar backup is recovered once and its next date survives restart',async()=>{
 const {m}=fixture();m.backup.schedule={mode:'weekly',weekdays:[0],time:'02:00'};m.backup.intervalMinutes=0
 const file=path.join(currentRoot,'config.json');const data=JSON.parse(fs.readFileSync(file));data.mounts=[{...m,nextBackupAt:'2001-01-01T00:00:00.000Z',backupTimeZone:Intl.DateTimeFormat().resolvedOptions().timeZone}];fs.writeFileSync(file,JSON.stringify(data))
 const store=new ConfigStore(),manager=new BackupManager(store,()=>{},()=>{})
 const tick=manager.checkSchedule();await waitForSync();assert.equal(syncs.length,1);finish();await tick
 const next=store.find(m.id).nextBackupAt;assert.ok(Date.parse(next)>Date.now())
 await manager.checkSchedule();assert.equal(syncs.length,1)
 assert.equal(new ConfigStore().find(m.id).nextBackupAt,next);manager.stop()
})
test('operation pause blocks new backups and scheduling, then resume allows a run',async()=>{
 const {manager,m}=fixture();manager.pauseScheduling()
 await assert.rejects(manager.run(m.id),/operazione/i)
 await manager.checkSchedule();assert.equal(syncs.length,0)
 manager.resumeScheduling();const p=manager.run(m.id);await waitForSync();finish();await p;manager.stop()
})
test('operation pause preserves a running backup and stop refuses to interrupt it',async()=>{
 const {manager,m}=fixture();const p=manager.run(m.id);await waitForSync()
 try{
  manager.pauseScheduling();assert.equal(manager.state(m.id).status,'running')
  assert.throws(()=>manager.stop(),/completamento/i)
  assert.equal(syncs[0].child.exitCode,null)
 }finally{finish();await p;manager.resumeScheduling();manager.stop()}
})
test('managed backup precheck and sync route to the private connection',async t=>{
 const p=require('./helpers/managed-profile.cjs')(t),{manager,store,m}=fixture();store.saveMount({...m,remote:p.remote})
 const pending=manager.run(m.id);await waitForSync();const args=syncs.at(-1).args;finish();await pending
 assert.equal(args[args.indexOf('--config')+1],p.config)
})
