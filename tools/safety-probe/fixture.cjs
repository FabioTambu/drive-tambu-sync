// Sacrificial storage fixture. It never uses the user's saved remotes, server or keys.
const fs=require('node:fs/promises')
const fss=require('node:fs')
const path=require('node:path')
const crypto=require('node:crypto')
const {spawn}=require('node:child_process')
const {isolatedEnv,mountRequest,rpc,freePort,waitFor,sleep,sha256,WriterClient}=require('./support.cjs')

function sshString(b){const prefix=Buffer.alloc(4);prefix.writeUInt32BE(b.length);return Buffer.concat([prefix,b])}
function sshPositive(b){return sshString(b[0]&0x80?Buffer.concat([Buffer.from([0]),b]):b)}
function hostKey(){
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048})
  const jwk=publicKey.export({format:'jwk'})
  const wire=Buffer.concat([sshString(Buffer.from('ssh-rsa')),sshPositive(Buffer.from(jwk.e,'base64url')),sshPositive(Buffer.from(jwk.n,'base64url'))])
  return {pem:privateKey.export({format:'pem',type:'pkcs1'}),publicLine:'ssh-rsa '+wire.toString('base64')}
}
class TestProcess {
  constructor(executable,args,options) {
    this.out='';this.error='';this.startError=null
    this.child=spawn(executable,args,{...options,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']})
    this.child.stdout.on('data',d=>{this.out=(this.out+d.toString('utf8')).slice(-32768)})
    this.child.stderr.on('data',d=>{this.error=(this.error+d.toString('utf8')).slice(-32768)})
    this.child.on('error',e=>{this.startError=e})
    this.done=new Promise(resolve=>this.child.once('close',(code,signal)=>resolve({code,signal})))
  }
  async wait(timeout=10000) {
    let timer
    try {return await Promise.race([this.done,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Disposable test process did not exit')),timeout)})])}
    finally{clearTimeout(timer)}
  }
  assertAlive(){if(this.startError)throw this.startError;if(this.child.exitCode!==null||this.child.signalCode!==null)throw new Error('Disposable rclone process exited: '+this.error)}
  async stopForCleanup() {
    if(this.child.exitCode!==null||this.child.signalCode!==null)return
    // Test cleanup is intentionally different from the production safety policy.
    // PIDs are handles of children created by this fixture, never searched by name.
    this.child.kill('SIGTERM')
    try{await this.wait(2500)}catch{this.child.kill('SIGKILL');try{await this.wait(2500)}catch{}}
  }
}
async function runTool(executable,args,options={}) {
  const p=new TestProcess(executable,args,options)
  try{const ended=await p.wait(15000);if(p.startError)throw p.startError;if(ended.code!==0)throw new Error(p.error||'Test command failed');return p.out.trim()}
  finally{await p.stopForCleanup()}
}
function makeConfig(port,obscured,knownHosts){
  if(!Number.isInteger(port)||port<1||port>65535||/[\r\n]/.test(obscured+knownHosts))throw new Error('Invalid fixture configuration')
  return `[probe]\ntype = sftp\nhost = 127.0.0.1\nport = ${port}\nuser = probe\npass = ${obscured}\nknown_hosts_file = ${knownHosts.replace(/\\/g,'/')}\nkey_use_agent = false\ndisable_hashcheck = true\nshell_type = none\n`
}
class StorageFixture {
  constructor(executable,root){
    this.executable=executable;this.root=root;this.home=path.join(root,'home');this.cache=path.join(root,'cache')
    this.remote=path.join(root,'remote');this.mountPoint=path.join(root,'mount');this.config=path.join(root,'rclone.conf')
    this.hostKeyPath=path.join(root,'ssh-host-key');this.password=crypto.randomBytes(32).toString('hex');this.rcSecret=crypto.randomBytes(32).toString('hex')
    this.children=[];this.writer=null;this.mounted=false;this.daemon=null;this.server=null;this.obscured=''
  }
  static async create(executable,tempRoot){
    const root=await fs.mkdtemp(path.join(tempRoot,'drive-tambu-sacrificial-'))
    const f=new StorageFixture(executable,root)
    try{await f.initialize();return f}catch(e){const message=f.sanitize(e.message);await f.dispose();throw new Error(message)}
  }
  sanitize(text){return String(text).split(this.password).join('[temporary-secret]').split(this.rcSecret).join('[temporary-secret]').split(this.obscured||'NEVER_MATCH_EMPTY').join('[temporary-secret]').slice(-8000)}
  async initialize(){
    await fs.writeFile(path.join(this.root,'.fixture-owner'),'DriveTambu disposable CI fixture only\n',{mode:0o600})
    for(const dir of [this.home,this.cache,this.remote,'appdata','localappdata','config','state'].map(d=>path.isAbsolute(d)?d:path.join(this.home,d)))await fs.mkdir(dir,{recursive:true,mode:0o700})
    // Prepare before the first SFTP request: the server has its own VFS
    // directory cache. Creating this later can leave the marker invisible.
    await fs.writeFile(path.join(this.remote,'fixture-ready.txt'),'probe-ready',{flag:'wx',mode:0o600})
    this.env=isolatedEnv(process.env,this.home)
    await fs.writeFile(this.config,'',{mode:0o600})
    this.obscured=await runTool(this.executable,['obscure',this.password,'--config',this.config],{env:this.env,cwd:this.root})
    this.sftpPort=await freePort();this.rcPort=await freePort()
    while(this.rcPort===this.sftpPort)this.rcPort=await freePort()
    const key=hostKey();await fs.writeFile(this.hostKeyPath,key.pem,{mode:0o600})
    const kh=path.join(this.root,'known_hosts')
    await fs.writeFile(kh,`[127.0.0.1]:${this.sftpPort} ${key.publicLine}\n`,{mode:0o600})
    await fs.writeFile(path.join(this.root,'authorized_keys'),'')
    await fs.writeFile(this.config,makeConfig(this.sftpPort,this.obscured,kh),{mode:0o600})
    await this.startServer()
  }
  launch(args,extra={}){
    const p=new TestProcess(this.executable,[...args,'--config',this.config],{env:{...this.env,...extra},cwd:this.root})
    this.children.push(p);return p
  }
  async startServer(){
    this.server=this.launch(['serve','sftp',this.remote,'--addr',`127.0.0.1:${this.sftpPort}`,'--key',this.hostKeyPath,'--authorized-keys',path.join(this.root,'authorized_keys'),
      '--cache-dir',path.join(this.root,'server-cache'),'--log-level','NOTICE'],{RCLONE_USER:'probe',RCLONE_PASS:this.password})
    await waitFor(async()=>{
      this.server.assertAlive()
      const result=await runTool(this.executable,['cat','probe:/fixture-ready.txt','--count','64','--sftp-disable-hashcheck','--sftp-shell-type','none','--contimeout','1s','--timeout','2s','--retries','1','--low-level-retries','1','--config',this.config],{env:this.env,cwd:this.root})
      if(result!=='probe-ready')throw new Error('Local SFTP marker has unexpected contents')
      return true
    },20000,'Local SFTP marker readiness')
  }
  async stopServer(){if(this.server)await this.server.stopForCleanup();this.server=null}
  async startDaemon(){
    this.daemon=this.launch(['rcd','--rc-addr',`127.0.0.1:${this.rcPort}`,'--cache-dir',this.cache,'--log-level','NOTICE',
      '--sftp-disable-hashcheck','--sftp-shell-type','none','--contimeout','2s','--timeout','5s','--retries','1','--low-level-retries','1'],{RCLONE_RC_USER:'probe',RCLONE_RC_PASS:this.rcSecret})
    await waitFor(async()=>{this.daemon.assertAlive();return this.call('core/version',{},1000)},20000,'Local rclone RC readiness')
  }
  call(method,params={},timeout=15000){return rpc(this.rcPort,this.rcSecret,method,params,timeout)}
  async mount(writeBackSeconds){
    if(process.platform==='linux')await fs.mkdir(this.mountPoint,{recursive:true})
    const types=await this.call('mount/types')
    const type=process.platform==='win32'?'cmount':'mount'
    if(!Array.isArray(types.mountTypes)||!types.mountTypes.includes(type))throw new Error(`Required mount implementation ${type} unavailable`)
    // initialize() prepared the marker before starting the SFTP server, and
    // startServer() verified its contents through SFTP. Do not rewrite it here.
    await this.call('mount/mount',mountRequest(this.mountPoint,writeBackSeconds,type),45000)
    this.mounted=true
    // The marker must be readable through the remote, not only an existing host directory.
    await waitFor(async()=>{this.daemon.assertAlive();return await fs.readFile(path.join(this.mountPoint,'fixture-ready.txt'),'utf8')==='probe-ready'},15000,'Mount marker')
    this.writer=new WriterClient(this.mountPoint)
  }
  async stats(){return this.call('vfs/stats')}
  async remoteHash(name){try{return sha256(await fs.readFile(path.join(this.remote,name)))}catch(e){if(e.code==='ENOENT')return null;throw e}}
  async waitHash(name,expected){return waitFor(async()=>await this.remoteHash(name)===expected,60000,'SFTP content hash')}
  async unmount(){await this.call('mount/unmount',{mountPoint:this.mountPoint},15000);this.mounted=false}
  async quitDaemon(){
    if(!this.daemon)return
    try{await this.call('core/quit',{},3000)}catch(e){if(!/ECONNRESET|socket hang up/.test(e.message))throw e}
    const exit=await this.daemon.wait(10000)
    if(exit.code!==0)throw new Error('rclone test daemon did not quit cleanly')
    this.daemon=null
  }
  async dispose(){
    if(this.writer){await this.writer.dispose();this.writer=null}
    if(this.daemon){try{await this.unmount()}catch{};try{await this.quitDaemon()}catch{}}
    for(const child of this.children.reverse())await child.stopForCleanup()
    // Do not recursively delete a mount tree, even in tests. The ephemeral VM disposes
    // of this scratch directory. Only sanitized JSON reports are uploaded.
  }
}
module.exports={StorageFixture,TestProcess,runTool,hostKey,makeConfig}
