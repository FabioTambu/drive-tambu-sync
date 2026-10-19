// Real SSH + SFTP setup, restricted to disposable GitHub-hosted machines.
// No personal servers, credentials, ~/.ssh/config or saved remotes are used.
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto')
const {assertHostedRunner}=require('./helpers/support.cjs')
const {StorageFixture,hostKey}=require('./helpers/fixture.cjs')
const {ConnectionSetup}=require('../../src/main/setup-connections.ts')
const {configureConnectionProfiles,managedConnections,managedRemoteFlags}=require('../../src/main/connection-profiles.ts')
const {configureRuntimeTools,resolveTool}=require('../../src/main/runtime-tools.ts')
const {runSetupTool}=require('../../src/main/setup-process.ts')
async function main(){
 assertHostedRunner()
 const report={purpose:'real-private-SSH-SFTP-setup',platform:process.platform,status:'running',nativeMountTested:false,cloudflareTested:false,checks:[]}
 let fixture,manager
 try{
  const vendor=path.resolve('resources','vendor',process.platform+'-x64')
  configureRuntimeTools(vendor)
  const executable=path.join(vendor,process.platform==='win32'?'rclone.exe':'rclone')
  fixture=await StorageFixture.create(executable,process.env.RUNNER_TEMP)
  const before=await fs.readFile(fixture.config),keys=hostKey(),keyFile=path.join(fixture.root,'client key.pem')
  await fs.writeFile(keyFile,keys.pem,{mode:0o600})
  const run=(exe,args,opts={})=>runSetupTool(exe,args,{...opts,env:fixture.env})
  if(process.platform==='win32'){
   const acl=await run('icacls.exe',[keyFile,'/inheritance:r','/grant:r',os.userInfo().username+':R'])
   assert.equal(acl.code,0,'Fixture key ACL must be accepted by OpenSSH')
  }
  await fixture.server.stopForCleanup()
  await fs.writeFile(path.join(fixture.root,'authorized_keys'),keys.publicLine+'\n',{mode:0o600})
  await fixture.startServer()
  assert.equal((await run(resolveTool('ssh'),['-V'])).code,0,'OpenSSH client must exist on the disposable runner')
  const root=path.join(fixture.root,'private connections with spaces')
  configureConnectionProfiles(root)
  manager=new ConnectionSetup(root,{rclone:()=>executable,run,existingNames:async()=>[]})
  const draft={name:'Native fixture',mode:'direct',host:'127.0.0.1',user:'probe',port:fixture.sftpPort,keyPath:keyFile}
  const pending=await manager.prepare(draft)
  assert.equal(managedConnections().length,0)
  const original=(await fs.readFile(path.join(fixture.root,'known_hosts'),'utf8')).trim().split(/\s+/)
  const expected=crypto.createHash('sha256').update(Buffer.from(original[2],'base64')).digest('base64').replace(/=+$/,'')
  assert.deepEqual(pending.fingerprints,['ssh-rsa SHA256:'+expected])
  await assert.rejects(manager.finish(pending.token,false))
  report.checks.push('Real SSH host key captured without SSH authentication; exact fingerprint matches isolated server')
  const saved=await manager.finish(pending.token,true)
  assert.equal(managedConnections()[0].remote,saved.remote)
  const marker=await run(executable,['cat',saved.remote+':/fixture-ready.txt',...managedRemoteFlags(saved.remote),'--sftp-disable-hashcheck','--sftp-shell-type','none'])
  assert.equal(marker.code,0);assert.equal(marker.stdout,'probe-ready')
  assert.deepEqual(await fs.readFile(fixture.config),before)
  report.checks.push('Real external OpenSSH authentication and SFTP read use the managed profile, including paths with spaces')
  report.checks.push('Existing rclone fixture config was not changed')
  // Verify changed keys cannot authenticate using an already-published profile.
  await fixture.server.stopForCleanup()
  await fs.writeFile(fixture.hostKeyPath,hostKey().pem,{mode:0o600})
  fixture.server=fixture.launch(['serve','sftp',fixture.remote,'--addr',`127.0.0.1:${fixture.sftpPort}`,'--key',fixture.hostKeyPath,'--authorized-keys',path.join(fixture.root,'authorized_keys'),'--log-level','NOTICE'],{RCLONE_USER:'probe',RCLONE_PASS:fixture.password})
  // A wrong key must never be accepted; a readiness or connectivity error also fails
  // the assertion below unless the native SSH error explicitly identifies host trust.
  let refused
  for(let attempt=0;attempt<20;attempt++){
   const check=await run(executable,['lsjson',saved.remote+':','--stat',...managedRemoteFlags(saved.remote),'--sftp-disable-hashcheck','--sftp-shell-type','none','--retries','1','--low-level-retries','1'],{timeoutMs:15000})
   assert.notEqual(check.code,0,'A replaced host key must not succeed')
   if(/HOST IDENTIFICATION HAS CHANGED|Host key verification failed|host key/i.test(check.stderr)){refused=check;break}
   await new Promise(resolve=>setTimeout(resolve,200))
  }
  assert.ok(refused,'OpenSSH must report changed host identity, not merely an unavailable fixture')
  report.checks.push('A replaced real server host key is rejected')
  report.status='completed'
 }catch(error){report.status='failed';report.error=fixture?fixture.sanitize(error.message):String(error.message);process.exitCode=1}
 finally{
  manager?.dispose();configureConnectionProfiles(undefined);configureRuntimeTools(undefined)
  if(fixture)await fixture.dispose()
  await fs.mkdir('.setup-probe-results',{recursive:true});await fs.writeFile(path.join('.setup-probe-results',process.platform+'.json'),JSON.stringify(report,null,2)+'\n')
  console.log(JSON.stringify(report,null,2))
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1})
