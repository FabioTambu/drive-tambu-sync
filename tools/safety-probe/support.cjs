// Test-only utilities. Never imported by the desktop application.
const path = require('node:path')
const crypto = require('node:crypto')
const {fork} = require('node:child_process')
const http = require('node:http')
const net = require('node:net')

function assertHostedRunner(env = process.env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.RUNNER_ENVIRONMENT !== 'github-hosted' || !path.isAbsolute(env.RUNNER_TEMP || '')) {
    throw new Error('This destructive characterization is restricted to disposable GitHub-hosted runners.')
  }
}
function isolatedEnv(base, home) {
  const env = Object.fromEntries(Object.entries(base).filter(([key]) => !/^RCLONE_/i.test(key) && !/^SSH_AUTH_SOCK$/i.test(key)))
  return {...env, HOME:home, USERPROFILE:home, APPDATA:path.join(home,'appdata'), LOCALAPPDATA:path.join(home,'localappdata'),
    XDG_CONFIG_HOME:path.join(home,'config'), XDG_CACHE_HOME:path.join(home,'cache'), XDG_STATE_HOME:path.join(home,'state')}
}
function mountRequest(mountPoint, writeBackSeconds, mountType) {
  if (!path.isAbsolute(mountPoint) || !Number.isSafeInteger(writeBackSeconds) || writeBackSeconds < 0 || writeBackSeconds > 3600 || !['mount','cmount','mount2'].includes(mountType)) {
    throw new Error('Invalid test mount parameters')
  }
  return {fs:'probe:/',mountPoint,mountType,vfsOpt:{CacheMode:3,WriteBack:writeBackSeconds * 1e9,PollInterval:0,CacheMaxAge:1200e9,CachePollInterval:1e9},mountOpt:{AttrTimeout:0}}
}
function summarizeStats(input) {
  const d=input?.diskCache
  if (!d || !['uploadsQueued','uploadsInProgress','erroredFiles'].every(k=>Number.isSafeInteger(d[k])&&d[k]>=0) || typeof d.outOfSpace!=='boolean') return {kind:'unknown'}
  return {kind:'known',queued:d.uploadsQueued,uploading:d.uploadsInProgress,errored:d.erroredFiles,outOfSpace:d.outOfSpace,openWriters:'not-observed'}
}
function reportFor(platform) {
  return {format:1,purpose:'stock-rclone-characterization',productionSafetyCertified:false,platform,node:process.version,
    startedAt:new Date().toISOString(),status:'not-started',scenarios:[],limits:[
      'Not an implementation of a write barrier or an approval to terminate production mounts.',
      'Only synthetic closed-file recovery and open-handle behavior; not sparse-file recovery, conflicting edits, crash durability or uninstall safety.'
    ]}
}
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const sleep = ms => new Promise(r=>setTimeout(r,ms))
async function waitFor(fn, timeoutMs, label) {
  const deadline=performance.now()+timeoutMs
  let lastError
  do {
    try { const value=await fn(); if (value) return value } catch(e) {lastError=e}
    await sleep(200)
  } while (performance.now()<deadline)
  throw new Error(`${label} timed out${lastError ? ': '+lastError.message : ''}`)
}
function freePort() {
  return new Promise((resolve,reject)=>{
    const server=net.createServer(); server.on('error',reject)
    server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(err=>err?reject(err):resolve(port))})
  })
}
function rpc(port, secret, method, parameters={}, timeoutMs=15000) {
  if (!Number.isInteger(port)||port<1||port>65535||!/^[a-z]+\/[a-z-]+$/.test(method)) return Promise.reject(new Error('Invalid local RC request'))
  const body=JSON.stringify(parameters)
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:'/'+method,method:'POST',agent:false,
      headers:{Authorization:'Basic '+Buffer.from('probe:'+secret).toString('base64'),'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}},res=>{
      let text='',size=0
      res.setEncoding('utf8')
      res.on('data',d=>{size+=Buffer.byteLength(d);if(size>1024*1024)req.destroy(new Error('RC response too large'));else text+=d})
      res.on('error',reject)
      res.on('end',()=>{
        if (res.statusCode!==200) {reject(new Error(`RC ${method}: HTTP ${res.statusCode}: ${text.slice(0,500)}`));return}
        try {resolve(JSON.parse(text))} catch {reject(new Error(`RC ${method}: invalid JSON`))}
      })
    })
    const timer=setTimeout(()=>req.destroy(new Error(`RC ${method}: timeout`)),timeoutMs)
    req.on('close',()=>clearTimeout(timer));req.on('error',reject);req.end(body)
  })
}
class WriterClient {
  constructor(root) {
    if (!path.isAbsolute(root)) throw new Error('Writer root must be absolute')
    this.pending=new Map(); this.nextId=0; this.disposed=false
    this.child=fork(path.join(__dirname,'writer.cjs'),[],{env:{...process.env,PROBE_WRITER_ROOT:root},stdio:['ignore','ignore','ignore','ipc'],windowsHide:true})
    this.child.on('message',message=>{
      const request=this.pending.get(message.id);if(!request)return
      clearTimeout(request.timer);this.pending.delete(message.id)
      message.ok?request.resolve(message.value):request.reject(new Error(message.error))
    })
    const fail=e=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(e)}this.pending.clear()}
    this.child.on('error',fail);this.child.on('exit',()=>fail(new Error('Test writer exited before acknowledgment')))
  }
  call(op, params={}) {
    if(this.disposed||!this.child.connected) return Promise.reject(new Error('Test writer is closed'))
    const id=++this.nextId
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`Writer ${op}: timeout`))},15000)
      this.pending.set(id,{resolve,reject,timer})
      this.child.send({id,op,...params},err=>{if(err){clearTimeout(timer);this.pending.delete(id);reject(err)}})
    })
  }
  async dispose() {
    if(this.disposed)return
    // This is a sacrificial test writer only, never a user process.
    try {await this.call('close')} catch {}
    this.disposed=true
    if(this.child.connected)this.child.disconnect()
    if(this.child.exitCode===null&&this.child.signalCode===null){this.child.kill();await sleep(100)}
  }
}
module.exports={assertHostedRunner,isolatedEnv,mountRequest,summarizeStats,reportFor,sha256,WriterClient,waitFor,sleep,freePort,rpc}
