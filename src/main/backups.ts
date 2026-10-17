import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, lstatSync, rmSync, readFileSync, writeFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { ConfigStore, validateMount } from './store'
import { remoteSpec, runRclone, resolveRcloneExecutable, READ_FLAGS, SFTP_FLAGS, stopChild, errorDetails } from './diagnostics'
import type { BackupStatus, MountConfig, BackupProgress } from '../shared/types'
import { isBackupDue } from '../shared/schedule'
import { JsonLogReader, progressFromStats } from './backup-progress'

interface Job { state: BackupStatus; detail: string; progress?: BackupProgress; process?: ChildProcess; abort?: AbortController }

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
  private startupTimer: NodeJS.Timeout | undefined
  private stopped = false
  constructor(private store: ConfigStore, private changed: () => void, private log: (line: string) => void) {}

  state(id: string): { status: BackupStatus; detail: string; progress?: BackupProgress } {
    const entry = this.jobs.get(id)
    return { status: entry?.state ?? 'idle', detail: entry?.detail ?? 'In attesa', progress: entry?.progress ? { ...entry.progress } : undefined }
  }

  startScheduler(): void {
    if (this.timer && !this.stopped) return
    this.stopped = false
    const tick = (): void => { void this.checkSchedule().catch(error => this.log(`Programmazione backup: ${String(error)}`)) }
    this.timer = setInterval(tick, 15000)
    this.startupTimer = setTimeout(tick, 12000)
  }

  private async checkSchedule(): Promise<void> {
    if (this.stopped) return
    if ([...this.jobs.values()].some(j => j.state === 'running')) return
    this.store.reconcileScheduleTimeZone()
    const now = new Date()
    const due = this.store.mounts.filter(m => isBackupDue(m, now))
      .sort((a, b) => Date.parse(a.nextBackupAt!) - Date.parse(b.nextBackupAt!))
    const m = due[0]
    if (m) {
      try { await this.run(m.id) } catch (error) { this.log(`Backup ${m.name}: ${String(error)}`) }
    }
  }

  async run(id: string): Promise<void> {
    if (this.stopped) throw new Error('Il programma si sta chiudendo. Riaprilo prima di eseguire il backup.')
    const m = validateMount(this.store.find(id), this.store.mounts)
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
    const job: Job = { state: 'running', detail: 'Controllo dei file...', progress: progressFromStats({}), abort: new AbortController() }
    this.jobs.set(id, job)
    this.changed()
    try {
      this.store.markBackupStarted(id)
      const firstLevel = await runRclone(this.store.settings.rcloneExecutable, ['lsf', source, '--max-depth', '1', ...READ_FLAGS], 45000, job.abort?.signal)
      // Never mirror an unexpectedly empty source over an existing local backup.
      if (!firstLevel.trim() && existsSync(current) && readdirSync(current).length > 0) {
        throw new Error('La sorgente remota risulta vuota. Backup bloccato per proteggere i file locali.')
      }
      if (job.abort?.signal.aborted) throw new Error('Backup interrotto.')
      ensureManagedDestination(root, m.id)
      mkdirSync(current, { recursive: true })
      mkdirSync(archiveBase, { recursive: true })
      const args = [
        'sync', source, current,
        '--backup-dir', archive,
        '--delete-after',
        '--log-level', 'NOTICE',
        '--stats', '1s', '--stats-log-level', 'NOTICE', '--use-json-log', ...SFTP_FLAGS
      ]
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(resolveRcloneExecutable(this.store.settings.rcloneExecutable), args, { shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] })
        job.process = proc
        job.detail = 'Copia e archiviazione in corso...'
        this.changed()
        let lastError = ''
        const receive = (record: Record<string, unknown>): void => {
          if (record.stats && typeof record.stats === 'object' && !Array.isArray(record.stats)) {
            job.progress = progressFromStats(record.stats as Record<string, unknown>)
            job.detail = job.progress.phase === 'checking' ? 'Controllo dei file...' : job.progress.phase === 'finishing' ? 'Finalizzazione del backup...' : 'Copia in corso...'
            this.changed()
          }
          if (record.level === 'error' || record.level === 'fatal') lastError = errorDetails(new Error(String(record.msg ?? 'Backup non riuscito')))
        }
        const stdout = new JsonLogReader(receive), stderr = new JsonLogReader(receive)
        proc.stdout?.on('data', (chunk: Buffer) => stdout.push(chunk))
        proc.stderr?.on('data', (chunk: Buffer) => stderr.push(chunk))
        let settled = false
        const finish = (err?: Error): void => {
          if (settled) return
          settled = true
          job.process = undefined
          err ? reject(err) : resolve()
        }
        proc.once('error', e => finish(e))
        proc.once('close', code => {
          stdout.end(); stderr.end()
          finish(code === 0 && !job.abort?.signal.aborted ? undefined : new Error(lastError || `Backup interrotto o non riuscito (codice ${code ?? '?'}).`))
        })
      })
      try { cleanupArchive(root, m.backup.retentionDays) }
      catch (error) { this.log(`${m.name}: pulizia archivio non riuscita - ${String(error)}`) }
      this.store.markBackup(id, true)
      job.state = 'idle'
      job.progress = { ...(job.progress ?? progressFromStats({})), phase: 'complete', percent: 100 }
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
    this.stopped = true
    if (this.timer) clearInterval(this.timer)
    if (this.startupTimer) clearTimeout(this.startupTimer)
    this.timer = undefined
    for (const job of this.jobs.values()) { job.abort?.abort(); if (job.process) stopChild(job.process) }
  }
}
