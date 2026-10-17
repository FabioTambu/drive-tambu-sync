import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Dependencies, RemoteListing } from '../shared/types'
import type { ConfigStore } from './store'
import { childRemotePath, normalizeRemotePath, parentRemotePath } from '../shared/paths'

// Avoid remote shell/hash probes: the app only needs the SFTP subsystem.
// This also avoids additional SSH sessions through Cloudflare for every probe.
export const SFTP_FLAGS = ['--sftp-disable-hashcheck', '--sftp-shell-type', 'none']
export const READ_FLAGS = [...SFTP_FLAGS, '--contimeout', '15s', '--timeout', '30s', '--retries', '1', '--low-level-retries', '1']

export class ConnectionError extends Error {
  constructor(public readonly code: string, message: string, public readonly details = '') { super(message); this.name = 'ConnectionError' }
}
export function connectionError(error: unknown): ConnectionError {
  if (error instanceof ConnectionError) return error
  const e = error as { message?: string; stderr?: string; code?: string }
  const detail = (e?.stderr || e?.message || String(error)).trim().slice(-1800)
  if (e?.code === 'ENOENT') return new ConnectionError('missing-component', 'Il componente di collegamento non e stato trovato. Apri Impostazioni e premi Rileva di nuovo.', detail)
  if (/host key verification failed|REMOTE HOST IDENTIFICATION HAS CHANGED|knownhosts|host key.*mismatch/i.test(detail)) return new ConnectionError('host-key', 'Non e possibile verificare l\'identita del server. Non ignorare questo avviso: controlla la chiave del server.', detail)
  if (/permission denied.*publickey|unable to authenticate|authentication failed|no supported methods remain|sign_and_send_pubkey/i.test(detail)) return new ConnectionError('authentication', 'Il server non ha autorizzato l\'accesso. La chiave SSH deve essere disponibile e sbloccata sul computer.', detail)
  if (/WinFsp|cgofuse|fusermount|libfuse|fuse device not found/i.test(detail)) return new ConnectionError('filesystem', 'Manca il componente necessario per collegare le cartelle: WinFsp su Windows o FUSE su Linux. Controlla le Impostazioni.', detail)
  if (/didn.t find section|config.*section.*not found|couldn.t find.*remote/i.test(detail)) return new ConnectionError('missing-server', 'Questo server non e piu tra le connessioni salvate. Selezionalo nuovamente nelle Impostazioni.', detail)
  if (/config.*encrypt|configuration.*password|RCLONE_CONFIG_PASS|unable to decrypt/i.test(detail)) return new ConnectionError('locked-config', 'La configurazione della connessione e protetta da password e non e disponibile per l\'app.', detail)
  if (/directory not found|object not found|no such file|not a directory/i.test(detail)) return new ConnectionError('missing-folder', 'La cartella sul server non esiste o non e accessibile. Premi Sfoglia per sceglierne un\'altra.', detail)
  if (/permission denied|access denied/i.test(detail)) return new ConnectionError('permission', 'Non hai il permesso di accedere a questa cartella. Scegline un\'altra o controlla i permessi sul server.', detail)
  if (/timeout|timed out|deadline exceeded/i.test(detail)) return new ConnectionError('timeout', 'Il server non ha risposto in tempo. Riprova e verifica la connessione nelle Impostazioni.', detail)
  if (/connection refused|network is unreachable|no such host|could not resolve|name or service not known|connection reset/i.test(detail)) return new ConnectionError('network', 'Il server non e raggiungibile. Controlla la rete e che il server sia acceso, poi riprova.', detail)
  return new ConnectionError('unknown', 'Il collegamento non e riuscito. Apri i dettagli in Attivita per conoscere il messaggio del componente di connessione.', detail)
}
export function errorDetails(error: unknown): string {
  const e = connectionError(error)
  // Diagnostics never read or expose the rclone config or SSH private keys.
  return (e.details || e.message).replace(/(password|passphrase|token|secret)([=:]\s*)[^\s]+/gi, '$1$2[nascosto]')
}
export function remoteSpec(remote: string, remotePath: string): string {
  return `${remote}:${normalizeRemotePath(remote, remotePath)}`
}
export function resolveRcloneExecutable(configured: string): string {
  if (configured !== 'rclone' && configured !== 'rclone.exe') return configured
  if (process.platform !== 'win32') return configured
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Links', 'rclone.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'rclone', 'rclone.exe')
  ]
  return candidates.find((candidate): candidate is string => !!candidate && existsSync(candidate)) || configured
}

/** Stop only the process tree started by this app; never kill rclone by name. */
export function stopChild(child: ChildProcess, force = false): void {
  if (!child.pid || child.exitCode !== null) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    killer.on('error', () => { try { child.kill() } catch { /* already gone */ } })
  } else {
    try { process.kill(-child.pid, force ? 'SIGKILL' : 'SIGTERM') }
    catch { try { child.kill(force ? 'SIGKILL' : 'SIGTERM') } catch { /* already gone */ } }
  }
}

export function runRclone(executable: string, args: string[], timeout = 30000, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new ConnectionError('cancelled', 'Operazione annullata.')); return }
    let child: ChildProcess
    try { child = spawn(resolveRcloneExecutable(executable), args, { shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] }) }
    catch (error) { reject(connectionError(error)); return }
    let done = false, stdout = '', stderr = '', size = 0
    let timer: NodeJS.Timeout | undefined
    const finish = (error?: Error): void => {
      if (done) return
      done = true
      if (timer) clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      error ? reject(error) : resolve(stdout.trim())
    }
    const abort = (): void => { stopChild(child, true); finish(new ConnectionError('cancelled', 'Operazione annullata.')) }
    signal?.addEventListener('abort', abort, { once: true })
    timer = setTimeout(() => {
      stopChild(child, true)
      finish(new ConnectionError('timeout', 'Il server non ha risposto in tempo. Riprova e verifica la connessione nelle Impostazioni.', stderr))
    }, timeout)
    child.stdout?.setEncoding('utf8')
    child.stderr?.setEncoding('utf8')
    child.stdout?.on('data', (data: string) => {
      if (done) return
      size += Buffer.byteLength(data)
      if (size > 8 * 1024 * 1024) { stopChild(child, true); finish(new ConnectionError('large-list', 'Questa cartella contiene troppi elementi da mostrare. Apri direttamente una sottocartella.')); return }
      stdout += data
    })
    child.stderr?.on('data', (data: string) => { stderr = (stderr + data).slice(-8192) })
    child.once('error', error => finish(connectionError(error)))
    child.once('close', code => finish(code === 0 ? undefined : connectionError({ message: stderr || `Il processo e terminato con codice ${code ?? '?'}.` })))
    if (signal?.aborted) abort()
  })
}

export async function listRemoteDirectories(executable: string, remote: string, input: string, signal?: AbortSignal): Promise<RemoteListing> {
  const remotePath = normalizeRemotePath(remote, input)
  const output = await runRclone(executable, ['lsjson', remoteSpec(remote, remotePath), '--dirs-only', '--no-modtime', '--no-mimetype', ...READ_FLAGS], 40000, signal)
  let items: unknown
  try { items = JSON.parse(output) } catch { throw new ConnectionError('invalid-response', 'Il server ha restituito un elenco non valido. Riprova.') }
  if (!Array.isArray(items)) throw new ConnectionError('invalid-response', 'Il server ha restituito un elenco non valido. Riprova.')
  const entries = items.filter((v): v is { IsDir: true; Name: string } => !!v && typeof v === 'object' && v.IsDir === true && typeof v.Name === 'string')
    .map(v => ({ name: v.Name, path: childRemotePath(remotePath, v.Name) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'it', { numeric: true, sensitivity: 'base' }))
  return { remote, path: remotePath, parent: parentRemotePath(remotePath), entries }
}
export async function checkRemoteDirectory(executable: string, remote: string, remotePath: string, signal?: AbortSignal): Promise<void> {
  const output = await runRclone(executable, ['lsjson', remoteSpec(remote, remotePath), '--stat', '--no-modtime', '--no-mimetype', ...READ_FLAGS], 40000, signal)
  let item: { IsDir?: boolean }
  try { item = JSON.parse(output) } catch { throw new ConnectionError('invalid-response', 'Il server ha restituito una risposta non valida. Riprova.') }
  if (item?.IsDir !== true) throw new ConnectionError('not-directory', 'Il percorso scelto non e una cartella. Premi Sfoglia per scegliere una directory.')
}

export async function diagnostics(store: ConfigStore): Promise<Dependencies> {
  const binary = store.settings.rcloneExecutable
  const note = process.platform === 'win32' ? 'Per collegare le cartelle serve WinFsp installato.' : 'Per collegare le cartelle serve FUSE installato. Su Wayland il posizionamento del pannello dipende dal desktop.'
  try {
    const version = (await runRclone(binary, ['version'], 9000)).split('\n')[0]
    try {
      const remotes = (await runRclone(binary, ['listremotes'], 9000)).split(/\r?\n/).map(v => v.trim().replace(/:$/, '')).filter(Boolean)
      return { rclone: { ok: true, detail: version }, remotes, note }
    } catch (error) {
      return { rclone: { ok: true, detail: version }, remotes: [], note, connectionError: connectionError(error).message }
    }
  } catch (error) {
    return { rclone: { ok: false, detail: connectionError(error).message }, remotes: [], note }
  }
}
