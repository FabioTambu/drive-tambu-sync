import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { ConnectionStatus, MountConfig } from '../shared/types'
import { ConfigStore, validateMount } from './store'
import { effectiveRefreshSeconds } from '../shared/refresh'
import { checkRemoteDirectory, connectionError, errorDetails, remoteSpec, resolveRcloneExecutable, SFTP_FLAGS, stopChild, ConnectionError } from './diagnostics'

type RuntimeMount = {
  status: ConnectionStatus
  detail: string
  child?: ChildProcess
  interval?: NodeJS.Timeout
  stopping?: boolean
  refreshSeconds?: number
  abort?: AbortController
}

function isLinuxMounted(mountPoint: string): boolean {
  try {
    const real = path.resolve(mountPoint)
    const lines = readFileSync('/proc/self/mountinfo', 'utf8').split('\n')
    return lines.some(line => {
      const fields = line.split(' ')
      const candidate = (fields[4] || '').replace(/\\([0-7]{3})/g, (_s, oct: string) => String.fromCharCode(parseInt(oct, 8)))
      return candidate === real
    })
  } catch { return false }
}

function isReady(mountPoint: string): boolean {
  if (process.platform === 'win32') return existsSync(mountPoint)
  if (process.platform === 'linux') return isLinuxMounted(mountPoint)
  return false
}

function prepareMountPath(localPath: string): void {
  const directory = path.resolve(localPath)
  if (process.platform === 'win32') {
    if (!existsSync(path.dirname(directory))) throw new Error('La cartella superiore non esiste.')
    if (existsSync(directory)) throw new Error('Su Windows la cartella finale non deve esistere. Scegli un nome o percorso nuovo.')
  } else if (process.platform === 'linux') {
    if (isLinuxMounted(directory)) throw new Error('La cartella risulta gia montata da un altro processo.')
    mkdirSync(directory, { recursive: true })
    if (readdirSync(directory).length) throw new Error('Su Linux la cartella di montaggio deve essere vuota.')
  } else throw new Error('Questa versione supporta solo Windows e Linux.')
}

export class MountManager {
  private readonly mounts = new Map<string, RuntimeMount>()
  constructor(private store: ConfigStore, private changed: () => void, private log: (line: string) => void) {}

  state(id: string): { status: ConnectionStatus; detail: string } {
    const state = this.mounts.get(id)
    return { status: state?.status ?? 'disconnected', detail: state?.detail ?? 'Non collegata' }
  }

  needsRefreshReconnect(id: string): boolean {
    const runtime = this.mounts.get(id)
    return !!runtime && ['connected', 'connecting'].includes(runtime.status) && runtime.refreshSeconds !== undefined
      && runtime.refreshSeconds !== effectiveRefreshSeconds(this.store.find(id), this.store.settings)
  }

  async connect(id: string): Promise<void> {
    const active = this.mounts.get(id)
    if (active && ['connecting', 'connected', 'disconnecting'].includes(active.status)) return
    if (active?.child) throw new Error('La cartella si sta ancora scollegando. Attendi prima di riprovare.')
    const m = validateMount(this.store.find(id), this.store.mounts)
    const s: RuntimeMount = { status: 'connecting', detail: 'Verifica della cartella sul server...', abort: new AbortController() }
    this.mounts.set(id, s)
    this.changed()
    try {
      await checkRemoteDirectory(this.store.settings.rcloneExecutable, m.remote, m.remotePath, s.abort?.signal)
      if (s.stopping || s.abort?.signal.aborted || this.mounts.get(id) !== s) return
      prepareMountPath(m.localPath)
      s.detail = 'Server raggiunto. Collegamento della cartella al computer...'
      this.changed()
      s.refreshSeconds = effectiveRefreshSeconds(m, this.store.settings)
      const args = [
        'mount', remoteSpec(m.remote, m.remotePath), m.localPath,
        '--vfs-cache-mode', 'full', '--vfs-cache-max-size', this.store.settings.cacheMaxSize,
        '--vfs-cache-max-age', '20m', '--vfs-cache-poll-interval', '1m',
        '--vfs-write-back', '10s', '--dir-cache-time', `${s.refreshSeconds}s`, '--poll-interval', '0',
        '--contimeout', '15s', '--log-level', 'NOTICE', ...SFTP_FLAGS
      ]
      const proc = spawn(resolveRcloneExecutable(this.store.settings.rcloneExecutable), args, {
        shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe']
      })
      s.child = proc
      let lastMessage = ''
      const output = (chunk: Buffer): void => {
        for (const line of chunk.toString('utf8').trim().split(/\r?\n/)) {
          if (/ERROR|failed|fatal/i.test(line)) lastMessage = line.slice(-1200)
          if (/ERROR|failed|fatal|NOTICE/i.test(line)) this.log(`${m.name}: ${errorDetails(new Error(line))}`)
        }
      }
      proc.stdout?.on('data', output)
      proc.stderr?.on('data', output)
      const end = (error?: unknown): void => {
        if (s.interval) clearInterval(s.interval)
        s.interval = undefined; s.child = undefined
        if (this.mounts.get(id) !== s) return
        const priorError = s.status === 'error' ? s.detail : ''
        s.status = s.stopping ? 'disconnected' : 'error'
        s.detail = s.stopping ? 'Non collegata' : (priorError || connectionError(error || new Error(lastMessage || 'Il processo di collegamento si e interrotto.')).message)
        if (!s.stopping) this.log(`${m.name}: ${s.detail} Dettagli: ${errorDetails(error || new Error(lastMessage))}`)
        this.changed()
      }
      proc.once('error', error => end(error))
      proc.once('close', code => { if (s.child === proc) end(new Error(lastMessage || `Il processo si e interrotto (codice ${code ?? '?'}).`)) })
      const start = Date.now()
      s.interval = setInterval(() => {
        if (!s.child || s.stopping) return
        if (isReady(m.localPath)) {
          clearInterval(s.interval); s.interval = undefined
          s.status = 'connected'; s.detail = 'Cartella pronta'
          this.changed(); this.log(`${m.name}: collegata`)
        } else if (Date.now() - start > 45000) {
          s.detail = 'Il server risponde, ma la cartella non e diventata disponibile sul computer. Controlla i componenti di collegamento nelle Impostazioni.'
          s.status = 'error'; this.changed(); stopChild(proc, true)
        }
      }, 700)
    } catch (error) {
      if (this.mounts.get(id) !== s) return
      const cancelled = s.stopping || (error instanceof ConnectionError && error.code === 'cancelled')
      s.status = cancelled ? 'disconnected' : 'error'
      s.detail = cancelled ? 'Non collegata' : (error instanceof Error ? error.message : String(error))
      this.changed()
      if (!cancelled) { this.log(`${m.name}: ${s.detail} Dettagli: ${errorDetails(error)}`); throw error }
    }
  }

  async disconnect(id: string): Promise<void> {
    const s = this.mounts.get(id)
    if (!s) return
    s.stopping = true
    s.abort?.abort()
    if (s.interval) { clearInterval(s.interval); s.interval = undefined }
    if (!s.child) {
      s.status = 'disconnected'; s.detail = 'Non collegata'; this.changed(); return
    }
    s.status = 'disconnecting'; s.detail = 'Disconnessione in corso...'; this.changed()
    const child = s.child
    const stopped = new Promise<void>(resolve => {
      if (!s.child) { resolve(); return }
      const timeout = setTimeout(resolve, 4500)
      child.once('close', () => { clearTimeout(timeout); resolve() })
    })
    stopChild(child)
    await stopped
    if (s.child) {
      s.status = 'error'; s.detail = 'La cartella non si e ancora scollegata. Attendi la fine dei trasferimenti e riprova.'
      this.changed(); throw new Error(s.detail)
    }
  }

  async disconnectAll(): Promise<void> {
    const results = await Promise.allSettled([...this.mounts.keys()].map(id => this.disconnect(id)))
    if (results.some(r => r.status === 'rejected')) throw new Error('Alcune cartelle sono ancora in uso. Chiudi i file aperti e riprova.')
  }
}
