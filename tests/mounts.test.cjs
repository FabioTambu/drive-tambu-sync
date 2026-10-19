const {test,after}=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module')
const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream')
const fs=require('node:fs'),os=require('node:os'),path=require('node:path')
const root=fs.mkdtempSync(path.join(os.tmpdir(),'drive-mounts-'));after(()=>fs.rmSync(root,{recursive:true,force:true}))
let commands=[],rcCalls=[],rejectRemote=false,killCount=0,processes=[],ready=new Set(),pending=0,rcFails=false,unmountFails=false,pidCounter=100
const original=Module._load
const disk=()=>({diskCache:{uploadsQueued:pending,uploadsInProgress:0,erroredFiles:0,outOfSpace:false}})
Module._load=function(id,...rest){
 if(id==='electron')return {app:{getPath:()=>root}}
 if(id==='node:fs')return {...fs,existsSync:p=>ready.has(p)||fs.existsSync(p),readFileSync:(p,...a)=>p==='/proc/self/mountinfo'?[...ready].map(p=>`1 2 0:1 / ${p} rw - fuse.rclone remote rw`).join('\n'):fs.readFileSync(p,...a)}
 if(id==='node:child_process')return {spawn:(_exe,args)=>{
  commands.push(args);const c=new EventEmitter();c.pid=++pidCounter;c.stdout=new PassThrough();c.stderr=new PassThrough();c.exitCode=null;c.signalCode=null
  c.kill=()=>{killCount++;c.exitCode=1;c.emit('close',1);return true};processes.push(c)
  if(args[0]==='lsjson')setTimeout(()=>{if(rejectRemote)c.stderr.write('directory not found');else c.stdout.write('{"IsDir":true}');c.exitCode=rejectRemote?1:0;c.emit('close',c.exitCode)},5)
  return c
 }}
 if(id==='./control')return {createControl:async()=>({secret:'test-session-secret',env:{RCLONE_RC_USER:'drive-tambu',RCLONE_RC_PASS:'test-session-secret'},client:{port:12345,call:async(method,params={})=>{
  rcCalls.push({method,params});if(rcFails)throw new Error('offline')
  const child=processes.findLast(c=>c.exitCode===null)
  if(method==='core/pid')return {pid:child.pid}
  if(method==='mount/types')return {mountTypes:['mount','cmount']}
  if(method==='mount/mount'){ready.add(params.mountPoint);return {mountPoint:params.mountPoint}}
  if(method==='mount/listmounts')return {mountPoints:[...ready].map(p=>({MountPoint:p}))}
  if(method==='mount/unmount'){if(unmountFails)throw new Error('busy');ready.delete(params.mountPoint);return {}}
  if(method==='vfs/stats')return disk()
  if(method==='vfs/queue')return {queue:pending?[{id:1}]:[]}
  if(method==='core/stats')return {bytes:0,checks:0,errors:0,transfers:0}
  if(method==='core/quit'){child.exitCode=0;child.emit('close',0);return {}}
  throw new Error(method)
 }}})}
 return original.call(this,id,...rest)
}
const {MountManager}=require('../src/main/mounts.ts');Module._load=original
function setup(){commands=[];rcCalls=[];ready.clear();rejectRemote=false;rcFails=false;unmountFails=false;pending=0;killCount=0;processes=[]
 const m={id:'folder-123',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(root,crypto.randomUUID()),autoConnect:false,backup:{enabled:false,destination:'',intervalMinutes:0,retentionDays:30}}
 const settings={rcloneExecutable:'fixture',cacheMaxSize:'5G',directoryRefreshSeconds:120}
 const manager=new MountManager({find:()=>m,mounts:[m],get settings(){return settings}},()=>{},()=>{})
 return {manager,m,settings}
}
test('remote access is checked before starting a mount daemon',async()=>{const {manager,m}=setup();rejectRemote=true;await assert.rejects(manager.connect(m.id));assert.equal(commands.some(a=>a[0]==='rcd'),false)})
test('concurrent connect starts one official daemon and one RC mount',async()=>{const {manager,m}=setup();await Promise.all([manager.connect(m.id),manager.connect(m.id)]);assert.equal(commands.filter(a=>a[0]==='rcd').length,1);assert.equal(rcCalls.filter(c=>c.method==='mount/mount').length,1);await manager.disconnect(m.id)})
test('cancelling a read-only precheck does not start a mount',async()=>{const {manager,m}=setup();const p=manager.connect(m.id);await manager.disconnect(m.id);await p;assert.equal(commands.some(a=>a[0]==='rcd'),false)})
test('stock mount preserves full cache, 20-minute expiry and refresh override',async()=>{const {manager,m,settings}=setup();m.directoryRefreshSeconds=17;await manager.connect(m.id);const p=rcCalls.find(c=>c.method==='mount/mount').params;assert.equal(p.vfsOpt.CacheMode,3);assert.equal(p.vfsOpt.CacheMaxAge,1200e9);assert.equal(p.vfsOpt.CachePollInterval,60e9);assert.equal(p.vfsOpt.DirCacheTime,17e9);settings.directoryRefreshSeconds=600;assert.equal(manager.needsRefreshReconnect(m.id),false);m.directoryRefreshSeconds=null;assert.equal(manager.needsRefreshReconnect(m.id),true);await manager.disconnect(m.id)})
test('pending uploads prevent unmount and never call a process killer',async()=>{const {manager,m}=setup();await manager.connect(m.id);pending=1;assert.equal((await manager.preflight(m.id)).kind,'blocked');await assert.rejects(manager.disconnect(m.id));assert.equal(rcCalls.some(c=>c.method==='mount/unmount'),false);assert.equal(killCount,0);pending=0;await manager.disconnect(m.id)})
test('unreachable control blocks disconnection without kill fallback',async()=>{const {manager,m}=setup();await manager.connect(m.id);rcFails=true;assert.equal((await manager.preflight(m.id)).kind,'unknown');await assert.rejects(manager.disconnect(m.id));assert.equal(killCount,0);rcFails=false;await manager.disconnect(m.id)})
test('busy unmount never calls core quit and remains retryable',async()=>{const {manager,m}=setup();await manager.connect(m.id);unmountFails=true;await assert.rejects(manager.disconnect(m.id));assert.equal(killCount,0);assert.equal(rcCalls.some(c=>c.method==='core/quit'),false);unmountFails=false;await manager.disconnect(m.id)})
test('normal disconnection requests unmount, verifies absence and quits owned daemon',async()=>{const {manager,m}=setup();await manager.connect(m.id);await manager.disconnect(m.id);assert.equal(manager.state(m.id).status,'disconnected');const methods=rcCalls.map(x=>x.method);assert.ok(methods.indexOf('core/quit')>methods.indexOf('mount/unmount'));assert.equal(killCount,0)})
test('an app-created empty Linux mount directory remains owned after reconnect',async t=>{
 if(process.platform!=='linux'){t.skip('Linux-only empty-container ownership');return}
 const {manager,m}=setup();await manager.connect(m.id);await manager.disconnect(m.id)
 assert.equal(fs.existsSync(m.localPath),true)
 await manager.connect(m.id);await manager.disconnect(m.id);manager.cleanupOwnedDirectory(m.id)
 assert.equal(fs.existsSync(m.localPath),false)
})
test('managed mount daemon uses the same private configuration as its preflight',async t=>{
 const p=require('./helpers/managed-profile.cjs')(t),{manager,m}=setup();m.remote=p.remote
 await manager.connect(m.id)
 try{for(const cmd of commands.filter(a=>['rcd','lsjson'].includes(a[0])))assert.equal(cmd[cmd.indexOf('--config')+1],p.config)}finally{await manager.disconnect(m.id)}
})
