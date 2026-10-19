const test=require('node:test'),assert=require('node:assert/strict')
const {inspectComponents,installComponents}=require('../src/main/setup-dependencies.ts')
function environment(){
 let installed=false,denied=false,fuseDevice=true,keepMissing=false;const calls=[]
 const env={platform:'linux',exists:()=>true,osRelease:()=> 'ID=linuxmint\n',fuseAccessible:()=>fuseDevice,run:async(exe,args,opts)=>{
  calls.push({exe,args,opts})
  if(exe==='/usr/bin/pkexec'){if(denied)return {code:126,stdout:'',stderr:''};if(!keepMissing)installed=true;return {code:0,stdout:'',stderr:''}}
  if(exe.endsWith('fusermount3')||args[0]==='-V'){if(!installed)throw new Error('ENOENT');return {code:0,stdout:'',stderr:'OpenSSH installed'}}
  return {code:0,stdout:args[0]==='version'?'rclone v1.74.2':'cloudflared version 2026.10.1',stderr:''}
 }}
 return {env,calls,setInstalled:v=>installed=v,setDenied:v=>denied=v,setDevice:v=>fuseDevice=v,setKeepMissing:v=>keepMissing=v}
}
test('installer reinspects dependencies and never terminates a privileged package manager on timeout',async()=>{
 const f=environment(),before=await inspectComponents('rclone',f.env);assert.equal(before.canInstall,true)
 const after=await installComponents('rclone',f.env);assert.equal(after.canInstall,false);assert.ok(after.components.every(c=>c.state==='ready'))
 const call=f.calls.find(c=>c.exe==='/usr/bin/pkexec');assert.equal(call.opts.timeoutMs,0);assert.equal(call.opts.discardOutput,true);assert.deepEqual(call.args.slice(-2),['fuse3','openssh-client'])
})
test('denied authorization fails without claiming an installation succeeded',async()=>{
 const f=environment();f.setDenied(true);await assert.rejects(installComponents('rclone',f.env),/annullata|riuscita/)
 const after=await inspectComponents('rclone',f.env);assert.equal(after.canInstall,true)
})
test('zero installer exit code does not turn missing dependencies into ready states',async()=>{
 const f=environment();f.setKeepMissing(true);const after=await installComponents('rclone',f.env);assert.equal(after.canInstall,true);assert.ok(after.components.some(c=>c.state==='missing'))
})
test('FUSE installed without access to its device is an error, not another install or a ready state',async()=>{
 const f=environment();f.setInstalled(true);f.setDevice(false);const report=await inspectComponents('rclone',f.env)
 const fuse=report.components.find(c=>c.id==='filesystem');assert.equal(fuse.state,'error');assert.equal(fuse.installable,false);assert.match(fuse.detail,/dev\/fuse/)
})
