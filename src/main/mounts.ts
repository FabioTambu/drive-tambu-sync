import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { ConnectionStatus, MountConfig } from '../shared/types'
import { ConfigStore } from './store'
import { remoteSpec } from './diagnostics'

type RuntimeMount = {
  status: ConnectionStatus
  detail: string
  child?: ChildProcess
  interval?: NodeJS.Timeout
  stopping?: boolean
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

  async connect(id: string): Promise<void> {
    const active = this.mounts.get(id)
    if (active?.child && active.status !== 'error') return
    if (active?.child) throw new Error('Un processo rclone e ancora attivo per questa cartella.')
    const m: MountConfig = this.store.find(id)
    prepareMountPath(m.localPath)
    const s: RuntimeMount = { status: 'connecting', detail: 'Connessione al server...' }
    this.mounts.set(id, s)
    this.changed()
    const args = [
      'mount', remoteSpec(m.remote, m.remotePath), m.localPath,
      '--vfs-cache-mode', 'full',
      '--vfs-cache-max-size', this.store.settings.cacheMaxSize,
      '--vfs-cache-max-age', '24h',
      '--vfs-write-back', '10s',
      '--dir-cache-time', '2m',
      '--log-level', 'NOTICE'
    ]
    try {
      const proc = spawn(this.store.settings.rcloneExecutable, args, { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      s.child = proc
      let lastMessage = ''
      const output = (chunk: Buffer): void => {
        const lines = chunk.toString('utf8').trim().split(/\r?\n/)
        for (const line of lines) {
          if (!line) continue
          lastMessage = line.slice(-260)
          if (/ERROR|failed|fatal|NOTICE/i.test(line)) this.log(`${m.name}: ${line.slice(0, 400)}`)
        }
      }
      proc.stdout?.on('data', output)
      proc.stderr?.on('data', output)
      const end = (err?: string): void => {
        if (s.interval) clearInterval(s.interval)
        s.interval = undefined
        s.child = undefined
        const priorError = s.status === 'error' ? s.detail : ''
        s.status = s.stopping ? 'disconnected' : 'error'
        s.detail = s.stopping ? 'Non collegata' : (priorError || err || lastMessage || 'rclone si e interrotto')
        if (!s.stopping) this.log(`${m.name}: ${s.detail}`)
        this.changed()
      }
      proc.once('error', error => end(error.message))
      proc.once('close', code => { if (s.child === proc) end(`rclone terminato (${code ?? '?'})`) })
      const start = Date.now()
      s.interval = setInterval(() => {
        if (!s.child || s.stopping) return
        if (isReady(m.localPath)) {
          clearInterval(s.interval)
          s.interval = undefined
          s.status = 'connected'
          s.detail = 'Cartella pronta'
          this.changed()
          this.log(`${m.name}: collegata`)
        } else if (Date.now() - start > 90000) {
          s.detail = 'Timeout: controlla rclone e la connessione SSH'
          s.status = 'error'
          this.changed()
          proc.kill()
        }
      }, 700)
    } catch (error) {
      s.status = 'error'
      s.detail = error instanceof Error ? error.message : String(error)
      s.child = undefined
      this.changed()
      throw error
    }
  }

  async disconnect(id: string): Promise<void> {
    const s = this.mounts.get(id)
    if (!s?.child) {
      this.mounts.set(id, { status: 'disconnected', detail: 'Non collegata' })
      this.changed()
      return
    }
    s.stopping = true
    s.detail = 'Disconnessione in corso...'
    this.changed()
    const child = s.child
    try { child.kill('SIGTERM') } catch { /* process might already be closed */ }
    await new Promise<void>(resolve => {
      if (!s.child) { resolve(); return }
      const timeout = setTimeout(resolve, 4500)
      child.once('close', () => { clearTimeout(timeout); resolve() })
    })
    if (s.child) throw new Error('rclone non si e fermato. Controlla se il montaggio e ancora attivo.')
  }

  async disconnectAll(): Promise<void> {
    await Promise.allSettled([...this.mounts.keys()].map(id => this.disconnect(id)))
  }
}
