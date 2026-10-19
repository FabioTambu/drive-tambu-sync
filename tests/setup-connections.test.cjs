const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto')
function source(){const f=path.join(__dirname,'../src/main/setup-connections.ts');assert.ok(fs.existsSync(f),'private connection setup is implemented');return require(f)}
const draft={name:'Casa',mode:'direct',host:'server.example',user:'fabio',port:22,keyPath:''}
function key(){const algo=Buffer.from('ssh-ed25519'),bytes=Buffer.alloc(4+algo.length+4+32);bytes.writeUInt32BE(algo.length);algo.copy(bytes,4);bytes.writeUInt32BE(32,4+algo.length);Buffer.alloc(32,7).copy(bytes,8+algo.length);return 'server.example ssh-ed25519 '+bytes.toString('base64')+'\n'}
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dt setup '));t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
 const calls=[];let fail=false
 const run=async(exe,args,opts)=>{calls.push({exe,args,opts});if(exe==='ssh'){
  const kh=args.find(x=>x.startsWith('UserKnownHostsFile='))?.slice('UserKnownHostsFile='.length).replace(/^"|"$/g,'');if(kh)fs.writeFileSync(kh,key());return {code:255,stdout:'',stderr:'Permission denied'}
 }return {code:fail?1:0,stdout:fail?'':'{"IsDir":true}',stderr:fail?'Permission denied (publickey)':''}}
 const {ConnectionSetup}=source();const manager=new ConnectionSetup(root,{run,rclone:()=> 'rclone',ssh:()=> 'ssh',cloudflared:()=> 'cloudflared',existingNames:async()=>['legacy']})
 return {root,manager,calls,setFail:v=>fail=v}
}
test('structured connection input rejects shell injection and path-control characters',()=>{
 const {validateConnectionDraft}=source();assert.deepEqual(validateConnectionDraft(draft),draft)
 for(const host of ['-oProxyCommand=bad','server\nHost *','ssh server.example','x;id','x$(id)','https://example.com'])assert.throws(()=>validateConnectionDraft({...draft,host}))
 assert.throws(()=>validateConnectionDraft({...draft,port:0}));assert.throws(()=>validateConnectionDraft({...draft,user:'-root'}));assert.throws(()=>validateConnectionDraft({...draft,keyPath:'/tmp/a\nHost *'}))
 assert.throws(()=>validateConnectionDraft({...draft,mode:'execute'}))
})
test('new host is probed without authentication, then its exact fingerprint requires confirmation',async t=>{
 const f=fixture(t),p=await f.manager.prepare(draft);assert.equal(p.fingerprints.length,1);assert.match(p.fingerprints[0],/ssh-ed25519 SHA256:/)
 const scan=f.calls.find(c=>c.exe==='ssh');for(const option of ['PubkeyAuthentication=no','PasswordAuthentication=no','KbdInteractiveAuthentication=no','GSSAPIAuthentication=no','HostbasedAuthentication=no','PreferredAuthentications=none'])assert.ok(scan.args.includes(option),option)
 assert.equal(f.calls.some(c=>c.exe==='rclone'),false,'no authenticated request before consent')
 await assert.rejects(f.manager.finish(p.token,false),/conferma/i)
 const saved=await f.manager.finish(p.token,true);assert.match(saved.remote,/^dt_[a-f0-9]{32}$/);assert.equal(saved.name,'Casa')
 assert.ok(f.calls.some(c=>c.exe==='rclone'&&c.args.includes('--config')))
 const config=fs.readFileSync(path.join(f.root,saved.remote,'rclone.conf'),'utf8');assert.match(config,/StrictHostKeyChecking=yes/);assert.doesNotMatch(config,/accept-new|StrictHostKeyChecking=no/)
})
test('existing SSH alias is verified strictly without overwriting SSH or rclone files',async t=>{
 const f=fixture(t);const p=await f.manager.prepare({...draft,mode:'existing',user:''});assert.deepEqual(p.fingerprints,[])
 assert.equal(f.calls.some(c=>c.exe==='ssh'),false);const saved=await f.manager.finish(p.token,true)
 const conf=fs.readFileSync(path.join(f.root,saved.remote,'rclone.conf'),'utf8');assert.match(conf,/server\.example/);assert.match(conf,/BatchMode=yes/);assert.ok(!conf.includes(' -F '))
 assert.equal(fs.readdirSync(f.root).length,1)
})
test('cancelled, stale and replaced-key confirmations never publish a connection',async t=>{
 const f=fixture(t),p=await f.manager.prepare(draft);const remote=fs.readdirSync(f.root)[0]
 fs.appendFileSync(path.join(f.root,remote,'known_hosts'),key());await assert.rejects(f.manager.finish(p.token,true),/cambiata|modificata|identita/i)
 f.manager.cancel(p.token);assert.equal(fs.readdirSync(f.root).length,0);await assert.rejects(f.manager.finish(p.token,true),/scaduta|valida/i)
})
test('failed SFTP does not publish a profile; duplicate labels preserve the original',async t=>{
 const f=fixture(t),p=await f.manager.prepare(draft);f.setFail(true);await assert.rejects(f.manager.finish(p.token,true),/chiave|autorizzato/i)
 const remote=fs.readdirSync(f.root)[0];assert.equal(fs.existsSync(path.join(f.root,remote,'profile.json')),false)
 f.setFail(false);await f.manager.finish(p.token,true);await assert.rejects(f.manager.prepare({...draft,name:'casa'}),/esiste/i)
 assert.equal(fs.readdirSync(f.root).length,1)
})
test('cloudflared paths remain portable across AppImage restarts and login output is discarded',async t=>{
 const f=fixture(t),p=await f.manager.prepare({...draft,mode:'cloudflare'});const remote=fs.readdirSync(f.root)[0]
 const conf=fs.readFileSync(path.join(f.root,remote,'ssh.conf'),'utf8');assert.match(conf,/ProxyCommand cloudflared access ssh --hostname server.example/);assert.doesNotMatch(conf,/\.mount_|\.exe/)
 await f.manager.login('server.example');const c=f.calls.at(-1);assert.deepEqual(c.args,['access','login','https://server.example']);assert.equal(c.opts.discardOutput,true)
 f.manager.cancel(p.token)
})
test('managed profile flags never redirect a legacy remote and fail closed for missing managed data',async t=>{
 const f=fixture(t),profiles=require('../src/main/connection-profiles.ts');profiles.configureConnectionProfiles(f.root);t.after(()=>profiles.configureConnectionProfiles(undefined))
 assert.deepEqual(profiles.managedRemoteFlags('casa'),[]);assert.throws(()=>profiles.managedRemoteFlags('dt_'+'0'.repeat(32)),/mancante|disponibile/i)
 const p=await f.manager.prepare(draft),s=await f.manager.finish(p.token,true)
 assert.deepEqual(profiles.managedRemoteFlags(s.remote),['--config',path.join(f.root,s.remote,'rclone.conf')]);assert.equal(profiles.managedConnections()[0].name,'Casa')
 assert.ok(!JSON.stringify(profiles.managedConnections()).includes('keyPath'))
 if(process.platform!=='win32')assert.equal(fs.statSync(path.join(f.root,s.remote,'rclone.conf')).mode&0o777,0o600)
})
test('host key discovery quotes paths with spaces and final trust excludes global known-host files',async t=>{
 const f=fixture(t),p=await f.manager.prepare(draft),scan=f.calls.find(c=>c.exe==='ssh')
 const option=scan.args.find(x=>x.startsWith('UserKnownHostsFile='))
 assert.match(option,/^UserKnownHostsFile=".+"$/,'OpenSSH must parse a single known-host path, including spaces')
 const remote=fs.readdirSync(f.root)[0],conf=fs.readFileSync(path.join(f.root,remote,'ssh.conf'),'utf8')
 assert.match(conf,/GlobalKnownHostsFile (?:"\/dev\/null"|"NUL")/,'the confirmed key is the sole trust source')
 await f.manager.finish(p.token,true)
})
test('key paths cannot inject SSH environment expansions',()=>{
 const {validateConnectionDraft}=source()
 assert.throws(()=>validateConnectionDraft({...draft,keyPath:path.resolve('key-${HOME}')}),/percorso|caratteri/i)
})
