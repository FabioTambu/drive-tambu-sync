// Test-only utilities. Never imported by the desktop application.
const path = require('node:path')
const crypto = require('node:crypto')
const {fork} = require('node:child_process')
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
module.exports={assertHostedRunner,isolatedEnv,sha256,WriterClient,waitFor,sleep,freePort}

// The coordinator intentionally leaves a blocked action pending for its UI.
// The headless regression must cancel/report that state, not wait for human input.
async function confirmAndWait(coordinator,pending) {
  const view=coordinator.view
  if(!view || view.phase!=='confirm')throw new Error('Expected a confirmation before the native operation')
  await coordinator.respond(view.id,'confirm')
  const remaining=coordinator.view
  if(remaining) {
    await coordinator.respond(remaining.id,'cancel')
    throw new Error(remaining.message || 'Native operation remained blocked')
  }
  return pending
}
module.exports.confirmAndWait=confirmAndWait
