import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, lstatSync, rmSync, readFileSync, writeFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { ConfigStore } from './store'
import { remoteSpec, runRclone } from './diagnostics'
import type { BackupStatus, MountConfig } from '../shared/types'

interface Job { state: BackupStatus; detail: string; process?: ChildProcess }

function inside(child: string, parent: string): boolean {
  const c = path.resolve(child)
  const p = path.resolve(parent)
  const relative = path.relative(process.platform === 'win32' ? p.toLowerCase() : p, process.platform === 'win32' ? c.toLowerCase() : c)
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative))
}

function verifyDestination(m: MountConfig, others: MountConfig[]): void {
  const root = m.backup.destination
  if (!root || !path.isAbsolute(root)) throw new Error('Imposta una destinazione locale per il backup.')
  for (const item of others) {
    if (inside(root, item.localPath)) throw new Error('Destinazione backup all interno di una cartella montata: operazione bloccata.')
  }
}


// Safety marker: never run a destructive sync inside an arbitrary existing directory.
function ensureManagedDestination(root: string, mountId: string): void {
  const marker = path.join(root, '.drive-tambu-backup.json')
  if (existsSync(root)) {
    if (existsSync(marker)) {
      const data: unknown = JSON.parse(readFileSync(marker, 'utf8'))
      if (!data || typeof data !== 'object' || (data as { mountId?: string }).mountId !== mountId) {
        throw new Error('La cartella backup e associata a un altro collegamento.')
      }
      return
    }
    if (readdirSync(root).length > 0) {
      throw new Error('La destinazione contiene file non gestiti da Drive Tambu. Crea una cartella dedicata e vuota.')
    }
  } else mkdirSync(root, { recursive: true })
  writeFileSync(marker, JSON.stringify({ format: 'drive-tambu-backup-v1', mountId }, null, 2), { flag: 'wx', mode: 0o600 })
}

function cleanupArchive(root: string, retentionDays: number): void {
  if (!retentionDays) return
  const archive = path.join(root, 'archivio')
  if (!existsSync(archive)) return
  const cutoff = Date.now() - retentionDays * 86400 * 1000
  for (const name of readdirSync(archive)) {
    if (!/^\d{4}-\d{2}-\d{2}_\d{6}$/.test(name)) continue
    const absolute = path.join(archive, name)
    const stats = lstatSync(absolute)
    if (!stats.isDirectory() || stats.isSymbolicLink()) continue
    const iso = `${name.slice(0, 10)}T${name.slice(11, 13)}:${name.slice(13, 15)}:${name.slice(15, 17)}`
    if (new Date(iso).getTime() < cutoff) rmSync(absolute, { recursive: true, force: true })
  }
}

export class BackupManager {
  private jobs = new Map<string, Job>()
  private timer: NodeJS.Timeout | undefined
  constructor(private store: ConfigStore, private changed: () => void, private log: (line: string) => void) {}

  state(id: string): { status: BackupStatus; detail: string } {
    const entry = this.jobs.get(id)
    return { status: entry?.state ?? 'idle', detail: entry?.detail ?? 'In attesa' }
  }

  startScheduler(): void {
    if (this.timer) return
    this.timer = setInterval(() => void this.checkSchedule(), 60000)
    setTimeout(() => void this.checkSchedule(), 12000)
  }

  private async checkSchedule(): Promise<void> {
    if ([...this.jobs.values()].some(j => j.state === 'running')) return
    for (const m of this.store.mounts) {
      if (!m.backup.enabled || m.backup.intervalMinutes <= 0) continue
      const previous = Date.parse(m.lastBackupAt ?? '') || 0
      const attempted = Date.parse(m.lastBackupAttemptAt ?? '') || 0
      const elapsed = Date.now() - Math.max(previous, attempted)
      const wait = previous === 0 ? 0 : m.backup.intervalMinutes * 60000
      if (elapsed >= wait && Date.now() - attempted > 10 * 60000) {
        try { await this.run(m.id) } catch (error) { this.log(`Backup ${m.name}: ${String(error)}`) }
        break
      }
    }
  }

  async run(id: string): Promise<void> {
    const m = this.store.find(id)
    if (!m.backup.enabled) throw new Error('Attiva prima il backup nelle impostazioni della cartella.')
    if ([...this.jobs.values()].some(j => j.state === 'running')) throw new Error('Un backup e gia in corso. Riprova dopo.')
    verifyDestination(m, this.store.mounts)
    const source = remoteSpec(m.remote, m.remotePath)
    const root = m.backup.destination
    const current = path.join(root, 'corrente')
    const archiveBase = path.join(root, 'archivio')
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15)
    // ISO timestamp above: YYYYMMDD_HHMMSS, format the archive name consistently.
    const stamp = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}_${timestamp.slice(9)}`
    const archive = path.join(archiveBase, stamp)
    const job: Job = { state: 'running', detail: 'Verifica della sorgente...' }
    this.jobs.set(id, job)
    this.changed()
    try {
      const firstLevel = await runRclone(this.store.settings.rcloneExecutable, ['lsf', source, '--max-depth', '1'], 45000)
      // Never mirror an unexpectedly empty source over an existing local backup.
      if (!firstLevel.trim() && existsSync(current) && readdirSync(current).length > 0) {
        throw new Error('La sorgente remota risulta vuota. Backup bloccato per proteggere i file locali.')
      }
      ensureManagedDestination(root, m.id)
      mkdirSync(current, { recursive: true })
      mkdirSync(archiveBase, { recursive: true })
      const args = [
        'sync', source, current,
        '--backup-dir', archive,
        '--delete-after',
        '--log-level', 'NOTICE',
        '--stats', '10s',
        '--stats-one-line'
      ]
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(this.store.settings.rcloneExecutable, args, { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
        job.process = proc
        job.detail = 'Copia e archiviazione in corso...'
        this.changed()
        let lastError = ''
        const onData = (chunk: Buffer): void => {
          for (const line of chunk.toString('utf8').split(/\r?\n/)) {
            if (/ERROR|failed|fatal/i.test(line)) lastError = line.slice(0, 350)
          }
        }
        proc.stdout?.on('data', onData)
        proc.stderr?.on('data', onData)
        let settled = false
        const finish = (err?: Error): void => {
          if (settled) return
          settled = true
          job.process = undefined
          err ? reject(err) : resolve()
        }
        proc.once('error', e => finish(e))
        proc.once('close', code => finish(code === 0 ? undefined : new Error(lastError || `rclone sync fallito (codice ${code ?? '?'})`)))
      })
      try { cleanupArchive(root, m.backup.retentionDays) }
      catch (error) { this.log(`${m.name}: pulizia archivio non riuscita - ${String(error)}`) }
      this.store.markBackup(id, true)
      job.state = 'idle'
      job.detail = 'Backup completato'
      this.log(`${m.name}: backup completato`)
    } catch (error) {
      this.store.markBackup(id, false)
      job.state = 'error'
      job.detail = error instanceof Error ? error.message : String(error)
      this.log(`${m.name}: backup non riuscito - ${job.detail}`)
      throw error
    } finally {
      this.changed()
    }
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    for (const job of this.jobs.values()) if (job.process) job.process.kill('SIGTERM')
  }
}
