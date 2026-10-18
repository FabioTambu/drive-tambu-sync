import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, lstatSync, rmdirSync } from 'node:fs'
import path from 'node:path'
import type { ConnectionStatus, MountConfig } from '../shared/types'
import { ConfigStore, validateMount } from './store'
import { effectiveRefreshSeconds } from '../shared/refresh'
import { checkRemoteDirectory, errorDetails, remoteSpec, resolveRcloneExecutable, SFTP_FLAGS } from './diagnostics'
import { createControl, type ControlClient } from './control'
import { assessTransfers, unknownActivity, type PreflightResult } from './preflight'

type RuntimeMount = {
  status: ConnectionStatus; detail: string; config: MountConfig
  child?: ChildProcess; client?: ControlClient; secret?: string
  abort: AbortController; stopping?: boolean; refreshSeconds?: number
  mounted: boolean; requested: boolean; uncertain: boolean
  closed?: Promise<void>; connecting?: Promise<void>
  ownedDirectory?: {dev:number; ino:number}
}
const sleep = (ms:number): Promise<void> => new Promise(resolve => setTimeout(resolve,ms))
function isLinuxMounted(mountPoint:string): boolean {
  const lines = readFileSync('/proc/self/mountinfo','utf8').split('\n')
  return lines.some(line => (line.split(' ')[4] || '').replace(/\\([0-7]{3})/g, (_s,oct:string) => String.fromCharCode(parseInt(oct,8))) === path.resolve(mountPoint))
}
function isReady(mountPoint:string): boolean {
  return process.platform === 'win32' ? existsSync(mountPoint) : isLinuxMounted(mountPoint)
}
/** Validate, but never overwrite an existing Windows folder or nonempty Linux folder. */
export function checkMountDestination(localPath:string): void {
  if (!path.isAbsolute(localPath)) throw new Error('Scegli una posizione assoluta sul computer.')
  if (!existsSync(path.dirname(localPath))) throw new Error('La cartella superiore non esiste.')
  const parent = lstatSync(path.dirname(localPath))
  if (parent.isSymbolicLink()) throw new Error('Scegli una cartella reale, non un collegamento simbolico.')
  if (process.platform === 'win32' && existsSync(localPath)) throw new Error('La cartella finale esiste gia. Scegli una posizione nuova.')
  if (process.platform === 'linux' && existsSync(localPath)) {
    const st = lstatSync(localPath)
    if (st.isSymbolicLink() || !st.isDirectory() || isLinuxMounted(localPath) || readdirSync(localPath).length) throw new Error('La destinazione deve essere una cartella vuota e non collegata.')
  }
}
export class MountManager {
  private readonly mounts = new Map<string,RuntimeMount>()
  constructor(private store:ConfigStore, private changed:()=>void, private log:(line:string)=>void) {}
  state(id:string): {status:ConnectionStatus; detail:string} {
    const s=this.mounts.get(id);return {status:s?.status ?? 'disconnected',detail:s?.detail ?? 'Non collegata'}
  }
  hasRuntime(id:string): boolean {const s=this.mounts.get(id);return !!s && (!!s.child || s.requested || s.uncertain)}
  needsRefreshReconnect(id:string):boolean {
    const s=this.mounts.get(id);return !!s && ['connected','connecting'].includes(s.status) && s.refreshSeconds!==undefined && s.refreshSeconds!==effectiveRefreshSeconds(this.store.find(id),this.store.settings)
  }
  async connect(id:string):Promise<void> {
    const old=this.mounts.get(id)
    if(old?.status==='connecting') return old.connecting
    if(old?.child || old?.status==='disconnecting') {
      if(old.status==='connected') return
      throw new Error('Il collegamento precedente non e ancora terminato. Riprova a scollegarlo prima.')
    }
    const m=validateMount(this.store.find(id),this.store.mounts)
    const s:RuntimeMount={status:'connecting',detail:'Verifica della cartella sul server...',config:m,abort:new AbortController(),mounted:false,requested:false,uncertain:false,ownedDirectory:old?.config.localPath===m.localPath?old.ownedDirectory:undefined}
    this.mounts.set(id,s);this.changed()
    s.connecting=this.start(s).catch(error=>{
      if(s.abort.signal.aborted && !s.child) {s.status='disconnected';s.detail='Non collegata';this.changed();return}
      s.status='error';s.detail=error instanceof Error ? error.message : 'Collegamento non riuscito.'
      this.log(`${m.name}: ${s.detail}`);this.changed();throw error
    })
    return s.connecting
  }
  private async start(s:RuntimeMount):Promise<void> {
    const m=s.config, executable=this.store.settings.rcloneExecutable
    await checkRemoteDirectory(executable,m.remote,m.remotePath,s.abort.signal)
    if(s.abort.signal.aborted)return
    checkMountDestination(m.localPath)
    const control=await createControl()
    if(s.abort.signal.aborted)return
    s.client=control.client;s.secret=control.secret
    const args=['rcd','--rc-addr',`127.0.0.1:${control.client.port}`,'--rc-no-auth=false','--rc-web-gui=false','--rc-serve=false',
      '--contimeout','15s','--log-level','NOTICE',...SFTP_FLAGS]
    const child=spawn(resolveRcloneExecutable(executable),args,{env:control.env,shell:false,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']})
    s.child=child
    s.closed=new Promise(resolve=>{
      child.once('close',()=>{
        s.child=undefined
        if(s.stopping && !s.mounted && !s.uncertain){s.status='disconnected';s.detail='Non collegata'}
        else {s.status='error';s.detail='Il collegamento si e interrotto. I file temporanei sono stati conservati.';s.uncertain=s.requested || s.mounted}
        this.changed();resolve()
      })
    })
    let processError:Error|undefined
    child.once('error',e=>{processError=e;s.detail='Il componente di collegamento non e stato avviato.'})
    const output=(chunk:Buffer):void=>{
      const text=chunk.toString('utf8').split(s.secret!).join('[nascosto]')
      if(/ERROR|failed|fatal/i.test(text))this.log(`${m.name}: ${errorDetails(new Error(text))}`)
    }
    child.stdout?.on('data',output);child.stderr?.on('data',output)
    const deadline=performance.now()+12000
    let ready=false
    while(performance.now()<deadline){
      if(processError)throw processError
      if(!s.child)throw new Error('Il componente di collegamento si e interrotto durante l\'avvio.')
      try {const info=await s.client.call('core/pid',{},1500);if(info.pid!==child.pid)throw new Error('Identita del processo non verificata.');ready=true;break}catch {await sleep(150)}
    }
    if(!ready)throw new Error('Non riesco a verificare il componente locale. Nessuna chiusura forzata e stata eseguita.')
    const types=await s.client.call('mount/types')
    const mountType=process.platform==='win32'?'cmount':'mount'
    if(!Array.isArray(types.mountTypes) || !types.mountTypes.includes(mountType))throw new Error('Questa versione di rclone non supporta il collegamento richiesto.')
    if(process.platform==='linux' && !existsSync(m.localPath)){
      mkdirSync(m.localPath);const st=lstatSync(m.localPath);s.ownedDirectory={dev:st.dev,ino:st.ino}
    }
    s.refreshSeconds=effectiveRefreshSeconds(m,this.store.settings)
    s.detail='Collegamento della cartella al computer...';this.changed()
    s.requested=true;s.uncertain=true
    await s.client.call('mount/mount',{fs:remoteSpec(m.remote,m.remotePath),mountPoint:m.localPath,mountType,
      vfsOpt:{CacheMode:3,CacheMaxSize:this.store.settings.cacheMaxSize,CacheMaxAge:1200e9,CachePollInterval:60e9,WriteBack:10e9,DirCacheTime:s.refreshSeconds*1e9,PollInterval:0}},45000)
    s.mounted=true;s.requested=false;s.uncertain=false
    const until=performance.now()+10000
    while(!isReady(m.localPath) && performance.now()<until)await sleep(150)
    if(!isReady(m.localPath)) {s.uncertain=true;throw new Error('La cartella non e ancora visibile sul computer. Il motore e rimasto attivo; riprova il controllo.')}
    s.status='connected';s.detail='Cartella pronta';this.log(`${m.name}: collegata`);this.changed()
  }
  private async listed(s:RuntimeMount):Promise<boolean> {
    const list=await s.client!.call('mount/listmounts')
    if(!Array.isArray(list.mountPoints) || list.mountPoints.some(x=>!x || typeof x.MountPoint!=='string'))throw new Error('Elenco dei collegamenti non verificabile.')
    if(list.mountPoints.some(x=>x.MountPoint!==s.config.localPath))throw new Error('Il componente contiene collegamenti non previsti.')
    return list.mountPoints.some(x=>x.MountPoint===s.config.localPath)
  }
  async preflight(id:string):Promise<PreflightResult> {
    const s=this.mounts.get(id)
    if(!s)return {kind:'confirm',message:'La cartella non e collegata.'}
    if(['connecting','disconnecting'].includes(s.status))return {kind:'blocked',message:'Il collegamento sta cambiando stato. Attendi qualche istante e riprova.'}
    if(!s.child)return s.uncertain?unknownActivity():{kind:'confirm',message:'La cartella non e collegata.'}
    try {
      if(!s.client)return unknownActivity()
      const info=await s.client.call('core/pid')
      if(info.pid!==s.child.pid)return unknownActivity()
      if(!s.mounted && !s.requested && !s.uncertain && !(await this.listed(s)))return {kind:'confirm',message:'Nessuna cartella attiva nel componente.'}
      if(s.requested || s.uncertain)return unknownActivity()
      const [vfs,core,queue]=await Promise.all([s.client.call('vfs/stats'),s.client.call('core/stats'),s.client.call('vfs/queue')])
      return assessTransfers(vfs,core,queue)
    } catch{return unknownActivity()}
  }
  async disconnect(id:string):Promise<void> {
    const s=this.mounts.get(id)
    if(!s)return
    // A cancelled read-only connectivity check has never exposed a writable mount.
    if(s.status==='connecting' && !s.child){s.abort.abort();await s.connecting;s.status='disconnected';s.detail='Non collegata';this.changed();return}
    const check=await this.preflight(id)
    if(check.kind!=='confirm')throw new Error(check.message)
    if(!s.child)return
    s.status='disconnecting';s.detail='Scollegamento in corso...';s.stopping=true;this.changed()
    try{
      if(s.mounted){
        await s.client!.call('mount/unmount',{mountPoint:s.config.localPath},12000)
        if(await this.listed(s))throw new Error('La cartella risulta ancora collegata.')
        const deadline=performance.now()+6000
        while(isReady(s.config.localPath) && performance.now()<deadline)await sleep(150)
        if(isReady(s.config.localPath)) {s.uncertain=true;throw new Error('La posizione risulta ancora collegata. Nessuna chiusura forzata e stata eseguita.')}
        s.mounted=false
      }else if(await this.listed(s))throw new Error('La cartella risulta ancora collegata.')
      await s.client!.call('core/quit',{},4000).catch(error=>{if(s.child)throw error})
      let timer:ReturnType<typeof setTimeout>|undefined
      try{await Promise.race([s.closed,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Il componente non si e ancora chiuso. Riprova: non verra terminato forzatamente.')),7000)})])}finally{clearTimeout(timer)}
      s.status='disconnected';s.detail='Non collegata';s.uncertain=false
      this.log(`${s.config.name}: scollegata`)
    }catch(error){s.stopping=false;s.status=s.mounted?'connected':'error';s.detail=error instanceof Error?error.message:'Scollegamento non completato.';throw error}
    finally{this.changed()}
  }
  cleanupOwnedDirectory(id:string):void {
    const s=this.mounts.get(id)
    if(process.platform!=='linux' || !s || s.child || !s.ownedDirectory || !existsSync(s.config.localPath))return
    const st=lstatSync(s.config.localPath)
    if(st.isDirectory() && !st.isSymbolicLink() && st.dev===s.ownedDirectory.dev && st.ino===s.ownedDirectory.ino && !isLinuxMounted(s.config.localPath) && readdirSync(s.config.localPath).length===0)rmdirSync(s.config.localPath)
  }
  async disconnectAll():Promise<void> {for(const id of this.mounts.keys())await this.disconnect(id)}
}
