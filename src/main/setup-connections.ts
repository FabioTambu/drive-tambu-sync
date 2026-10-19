import { mkdirSync, lstatSync, existsSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { randomBytes, createHash } from 'node:crypto'
import { isIP } from 'node:net'
import type { ConnectionDraft, ManagedConnection, PreparedConnection } from '../shared/setup'
import { managedConnections, plainFile } from './connection-profiles'
import { resolveTool } from './runtime-tools'
import { runSetupTool, type ToolRunner, type ToolResult } from './setup-process'

const MAX_AGE = 10 * 60 * 1000
const READ_FLAGS = ['--stat','--no-modtime','--no-mimetype','--sftp-disable-hashcheck','--sftp-shell-type','none','--contimeout','15s','--timeout','30s','--retries','1','--low-level-retries','1']
const SSH_OPTIONS = ['BatchMode=yes','StrictHostKeyChecking=yes','ConnectTimeout=15','ServerAliveInterval=15','ServerAliveCountMax=3','ForwardAgent=no','ClearAllForwardings=yes','PermitLocalCommand=no','UpdateHostKeys=no']
function optionArgs(options: string[]): string[] { return options.flatMap(option => ['-o', option]) }
function validHost(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Inserisci l\'indirizzo del server.')
  const host = value.trim()
  if (!host || host.length > 253 || (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(host) && !isIP(host))) throw new Error('Inserisci solo il nome host o l\'indirizzo IP, senza ssh, URL, spazi o comandi.')
  return host
}
function safePath(value: string): string {
  // SSH config and rclone's space-separated argument list each parse double quotes.
  // Reject control characters and SSH %-expansions rather than interpret user input.
  if (/[\x00-\x1f\x7f"%$]/.test(value)) throw new Error('Il percorso contiene caratteri non supportati (controlli, virgolette, percentuale o dollaro).')
  return process.platform === 'win32' ? value.replace(/\\/g, '/') : value
}
export function validateConnectionDraft(input: unknown): ConnectionDraft {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Dati della connessione non validi.')
  const d = input as ConnectionDraft
  if (typeof d.name !== 'string' || !d.name.trim() || d.name.trim().length > 80 || /[\x00-\x1f\x7f]/.test(d.name)) throw new Error('Scegli un nome valido per la connessione (massimo 80 caratteri).')
  if (!['existing','direct','cloudflare'].includes(d.mode)) throw new Error('Modalita di connessione non valida.')
  if (typeof d.user !== 'string' || (d.user && !/^[a-zA-Z0-9_.][a-zA-Z0-9_.-]{0,63}$/.test(d.user)) || (d.mode !== 'existing' && !d.user)) throw new Error('Inserisci un nome utente SSH valido.')
  if (!Number.isInteger(d.port) || d.port < 1 || d.port > 65535) throw new Error('La porta deve essere un numero da 1 a 65535.')
  if (typeof d.keyPath !== 'string' || (d.keyPath && !path.isAbsolute(d.keyPath))) throw new Error('Seleziona una chiave SSH con Sfoglia oppure usa l\'agente SSH.')
  safePath(d.keyPath)
  const host = validHost(d.host)
  if (d.mode === 'cloudflare' && isIP(host)) throw new Error('Per Cloudflare serve il nome DNS pubblicato del tunnel, non un indirizzo IP.')
  return {name:d.name.trim().normalize('NFC'), mode:d.mode, host, user:d.user, port:d.mode === 'cloudflare' ? 22 : d.port, keyPath:d.keyPath}
}
function quote(value: string): string { return '"' + safePath(value) + '"' }
function fingerprintList(known: string): string[] {
  if (Buffer.byteLength(known) > 65536) throw new Error('Risposta della chiave del server troppo grande.')
  const lines = known.split(/\r?\n/).filter(line => line && !line.startsWith('#'))
  if (!lines.length || lines.length > 16) throw new Error('Non ho ricevuto una chiave del server valida.')
  return [...new Set(lines.map(line => {
    const parts = line.trim().split(/\s+/), type = parts[1], encoded = parts[2]
    if (!type || !/^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(256|384|521))$/.test(type) || !encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('La chiave del server non e riconosciuta.')
    const bytes = Buffer.from(encoded,'base64')
    if (bytes.length < 8 || bytes.readUInt32BE(0) > bytes.length-4 || bytes.subarray(4,4+bytes.readUInt32BE(0)).toString() !== type) throw new Error('La chiave del server non e valida.')
    return type + ' SHA256:' + createHash('sha256').update(bytes).digest('base64').replace(/=+$/,'')
  }))]
}
function connectionFailure(r: ToolResult): Error {
  const detail = r.stderr + r.stdout
  if (/host key|IDENTIFICATION HAS CHANGED|known.host/i.test(detail)) return new Error('Identita del server non verificata o cambiata. Non ignorare l\'avviso: controlla la chiave del server.')
  if (/permission denied|publickey|authenticate|authentication/i.test(detail)) return new Error('Accesso non autorizzato. Controlla utente, chiave SSH e agente sbloccato. Non vengono richieste password nell\'app.')
  if (/refused|resolve|unreachable|timeout|timed out/i.test(detail)) return new Error('Il server non e raggiungibile. Controlla indirizzo, porta, rete e accesso Cloudflare.')
  return new Error('Verifica SFTP non riuscita. Controlla la configurazione SSH e l\'accesso Cloudflare; il server deve offrire SFTP e consentire l\'accesso senza richieste di password.')
}
export interface ConnectionServices {
  rclone: () => string
  run?: ToolRunner
  ssh?: () => string
  cloudflared?: () => string
  existingNames?: () => Promise<string[]>
}
interface Pending {
  token: string; remote: string; base: string; draft: ConnectionDraft; expiresAt: number
  knownHash: string; fingerprints: string[]; tested: boolean
}
export class ConnectionSetup {
  private pending: Pending | undefined
  private working = false
  private run: ToolRunner
  constructor(private root: string, private services: ConnectionServices) { this.run = services.run ?? runSetupTool }
  private ensureRoot(): void {
    mkdirSync(this.root,{recursive:true,mode:0o700})
    const s = lstatSync(this.root)
    if (!s.isDirectory() || s.isSymbolicLink()) throw new Error('La directory di configurazione non e una cartella reale.')
  }
  private async unique(name: string): Promise<void> {
    const names = [...managedConnections(this.root).map(c=>c.name), ...await (this.services.existingNames?.() ?? Promise.resolve([]))]
    if (names.some(n=>n.normalize('NFC').toLocaleLowerCase('it') === name.toLocaleLowerCase('it'))) throw new Error('Esiste gia una connessione con questo nome. Scegli un nome diverso; quella esistente non verra modificata.')
  }
  private sshArgs(p: Pending): string[] {
    const d=p.draft
    const args=[...optionArgs(SSH_OPTIONS),'-T','-x']
    if(d.mode!=='existing')args.push('-F',path.join(p.base,'ssh.conf'))
    else {
      if(d.user)args.push('-l',d.user)
      if(d.port!==22)args.push('-p',String(d.port))
      if(d.keyPath)args.push('-i',d.keyPath,'-o','IdentitiesOnly=yes')
    }
    args.push(d.host)
    return args
  }
  private writeConfigs(p: Pending): void {
    const d=p.draft
    if(d.mode!=='existing') {
      const lines=['Host *',`  HostName ${d.host}`,`  User ${d.user}`,`  Port ${d.port}`,`  UserKnownHostsFile ${quote(path.join(p.base,'known_hosts'))}`,
        `  GlobalKnownHostsFile ${quote(process.platform === 'win32' ? 'NUL' : '/dev/null')}`, '  StrictHostKeyChecking yes', '  BatchMode yes']
      if(d.keyPath)lines.push(`  IdentityFile ${quote(d.keyPath)}`,'  IdentitiesOnly yes')
      if(d.mode==='cloudflare')lines.push(`  ProxyCommand cloudflared access ssh --hostname ${d.host}`)
      writeFileSync(path.join(p.base,'ssh.conf'),lines.join('\n')+'\n',{flag:'wx',mode:0o600})
    }
    const command=[this.services.ssh?.() ?? resolveTool('ssh'),...this.sshArgs(p)].map(quote).join(' ')
    writeFileSync(path.join(p.base,'rclone.conf'),`[${p.remote}]\ntype = sftp\nssh = ${command}\nshell_type = none\ndisable_hashcheck = true\n`,{flag:'wx',mode:0o600})
  }
  private async test(p: Pending): Promise<void> {
    const r=await this.run(this.services.rclone(),['lsjson',p.remote+':','--config',path.join(p.base,'rclone.conf'),...READ_FLAGS],{timeoutMs:45000})
    if(r.code!==0)throw connectionFailure(r)
    let info: unknown
    try { info=JSON.parse(r.stdout) } catch { throw new Error('Il server non ha restituito una risposta SFTP valida.') }
    if(!info || typeof info!=='object' || (info as {IsDir?:boolean}).IsDir!==true)throw new Error('La home del server non e una directory SFTP accessibile.')
    p.tested=true
  }
  async prepare(input: unknown): Promise<PreparedConnection> {
    if(this.working)throw new Error('Una verifica della connessione e gia in corso.')
    this.working=true
    let created:Pending|undefined
    try {
      const draft=validateConnectionDraft(input)
      if(draft.keyPath && (!existsSync(draft.keyPath) || !lstatSync(draft.keyPath).isFile())) throw new Error('La chiave selezionata non e un file disponibile. Usa Sfoglia.')
      this.ensureRoot();await this.unique(draft.name)
      this.discard()
      const remote='dt_'+randomBytes(16).toString('hex'),base=path.join(this.root,remote)
      safePath(base);mkdirSync(base,{mode:0o700})
      const p:Pending={token:randomBytes(24).toString('hex'),remote,base,draft,expiresAt:Date.now()+MAX_AGE,knownHash:'',fingerprints:[],tested:false}
      created=p;this.writeConfigs(p)
      if(draft.mode==='existing')await this.test(p)
      else {
        const known=path.join(base,'known_hosts');writeFileSync(known,'',{flag:'wx',mode:0o600})
        // Discover a PUBLIC key only. No key, password, agent signature, host-based or GSSAPI credential is offered.
        const probe=optionArgs(['StrictHostKeyChecking=accept-new',`UserKnownHostsFile=${quote(known)}`,
          `GlobalKnownHostsFile=${process.platform==='win32'?'NUL':'/dev/null'}`,'PubkeyAuthentication=no','PasswordAuthentication=no',
          'KbdInteractiveAuthentication=no','GSSAPIAuthentication=no','HostbasedAuthentication=no','PreferredAuthentications=none','NumberOfPasswordPrompts=0'])
        let result:ToolResult|undefined
        try { result=await this.run(this.services.ssh?.() ?? resolveTool('ssh'),[...probe,...this.sshArgs(p),'-s','sftp'],{timeoutMs:30000}) }
        catch(error) { if(!plainFile(known) || !readFileSync(known,'utf8').trim())throw error }
        if(!plainFile(known))throw new Error('Chiave del server non disponibile.')
        const text=readFileSync(known,'utf8')
        if(!text.trim())throw connectionFailure(result ?? {code:1,stdout:'',stderr:''})
        p.fingerprints=fingerprintList(text);p.knownHash=createHash('sha256').update(text).digest('hex')
      }
      this.pending=p
      return {token:p.token,name:draft.name,host:draft.host,fingerprints:[...p.fingerprints],expiresAt:p.expiresAt}
    } catch(error) { if(created)rmSync(created.base,{recursive:true,force:true});throw error }
    finally { this.working=false }
  }
  async finish(token: string, confirmed: boolean): Promise<ManagedConnection> {
    if(this.working)throw new Error('Una verifica della connessione e gia in corso.')
    const p=this.pending
    if(typeof token!=='string' || !p || token!==p.token || Date.now()>p.expiresAt)throw new Error('Richiesta scaduta o non valida. Verifica nuovamente il server.')
    if(confirmed!==true)throw new Error('Serve la conferma esplicita dell\'identita del server.')
    this.working=true
    try {
      await this.unique(p.draft.name)
      if(p.fingerprints.length) {
        const known=path.join(p.base,'known_hosts')
        if(!plainFile(known) || createHash('sha256').update(readFileSync(known)).digest('hex')!==p.knownHash)throw new Error('L\'identita del server e stata modificata dopo la verifica. Ricomincia la configurazione.')
      }
      // Recheck SFTP immediately before publishing, including existing SSH aliases.
      await this.test(p)
      const result:ManagedConnection={remote:p.remote,name:p.draft.name,host:p.draft.host,mode:p.draft.mode}
      writeFileSync(path.join(p.base,'profile.json'),JSON.stringify({version:1,...result},null,2)+'\n',{flag:'wx',mode:0o600})
      this.pending=undefined
      return result
    } finally { this.working=false }
  }
  cancel(token: string): void {
    if(this.working)throw new Error('Attendi la fine della verifica prima di annullare.')
    if(this.pending && token===this.pending.token)this.discard()
  }
  dispose(): void { if(!this.working)this.discard() }
  private discard(): void { if(this.pending){rmSync(this.pending.base,{recursive:true,force:true});this.pending=undefined} }
  async login(host: string): Promise<void> {
    const domain=validHost(host)
    if(isIP(domain))throw new Error('Inserisci il nome DNS del tunnel Cloudflare.')
    const r=await this.run(this.services.cloudflared?.() ?? resolveTool('cloudflared'),['access','login','https://'+domain],{timeoutMs:180000,discardOutput:true})
    if(r.code!==0)throw new Error('Accesso Cloudflare annullato o non riuscito. Riprova e completa la finestra del browser.')
  }
}
