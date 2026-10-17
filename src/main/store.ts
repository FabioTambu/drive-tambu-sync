import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, realpathSync, copyFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { AppSettings, MountConfig, StoredConfig } from '../shared/types'
import { normalizeRemotePath } from '../shared/paths'

const defaults = (): StoredConfig => ({
  schemaVersion: 1,
  settings: {
    rcloneExecutable: 'rclone',
    cacheMaxSize: '5G',
    startAtLogin: false,
    closeToTray: true,
    theme: 'system',
    defaultRemote: ''
  },
  mounts: []
})

function canonicalLocal(value: string): string {
  let ancestor = path.resolve(value)
  const suffix: string[] = []
  while (!existsSync(ancestor) && path.dirname(ancestor) !== ancestor) { suffix.unshift(path.basename(ancestor)); ancestor = path.dirname(ancestor) }
  return path.join(realpathSync(ancestor), ...suffix)
}

const inside = (child: string, parent: string): boolean => {
  const a = canonicalLocal(child)
  const b = canonicalLocal(parent)
  const rel = path.relative(process.platform === 'win32' ? b.toLowerCase() : b,
    process.platform === 'win32' ? a.toLowerCase() : a)
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel))
}

export function validateMount(value: MountConfig, all: MountConfig[]): MountConfig {
  if (!value || typeof value !== 'object') throw new Error('Dati della cartella non validi.')
  const m = structuredClone(value)
  if (!m.id || !/^[a-zA-Z0-9-]{6,80}$/.test(m.id)) throw new Error('Identificativo della cartella non valido.')
  if (typeof m.name !== 'string' || !m.name.trim() || m.name.length > 80) throw new Error('Inserisci un nome breve per la cartella.')
  m.remotePath = normalizeRemotePath(m.remote, m.remotePath)
  if (!path.isAbsolute(m.localPath ?? '')) throw new Error('La cartella locale deve avere un percorso assoluto.')
  m.name = m.name.trim()
  m.localPath = path.resolve(m.localPath)
  if (m.localPath === path.parse(m.localPath).root) throw new Error('Non puoi usare la radice del sistema come cartella collegata.')
  m.autoConnect = Boolean(m.autoConnect)
  const b = m.backup
  if (!b || typeof b !== 'object') throw new Error('Configurazione backup mancante.')
  if (!Number.isInteger(b.intervalMinutes) || b.intervalMinutes < 0 || b.intervalMinutes > 525600 || (b.intervalMinutes > 0 && b.intervalMinutes < 5)) throw new Error('Intervallo backup non valido.')
  if (!Number.isInteger(b.retentionDays) || b.retentionDays < 0 || b.retentionDays > 36500) throw new Error('Giorni di conservazione non validi.')
  if (b.enabled) {
    if (!path.isAbsolute(b.destination ?? '')) throw new Error('Scegli una destinazione assoluta per il backup.')
    b.destination = path.resolve(b.destination)
    if (inside(b.destination, m.localPath) || inside(m.localPath, b.destination)) throw new Error('Il backup deve stare in una cartella separata: non puo contenere la cartella collegata o trovarsi al suo interno.')
  }
  for (const other of all) {
    if (other.id === m.id) continue
    if (inside(m.localPath, other.localPath) || inside(other.localPath, m.localPath)) {
      throw new Error('Due cartelle montate non possono contenersi a vicenda.')
    }
    if (other.backup.enabled && (inside(other.backup.destination, m.localPath) || inside(m.localPath, other.backup.destination))) {
      throw new Error('Una destinazione backup finirebbe nella nuova cartella montata.')
    }
    if (b.enabled) {
      if (inside(b.destination, other.localPath) || inside(other.localPath, b.destination)) throw new Error('Il backup non puo stare dentro una cartella montata.')
      if (other.backup.enabled && (inside(b.destination, other.backup.destination) || inside(other.backup.destination, b.destination))) {
        throw new Error('Questa destinazione backup e gia usata da un altra cartella.')
      }
    }
  }
  return m
}

export class ConfigStore {
  private data: StoredConfig
  private readonly file: string
  constructor() {
    this.file = path.join(app.getPath('userData'), 'config.json')
    mkdirSync(path.dirname(this.file), { recursive: true })
    if (!existsSync(this.file)) {
      this.data = defaults()
      this.flush()
    } else {
      const parsed: unknown = JSON.parse(readFileSync(this.file, 'utf8'))
      if (!parsed || typeof parsed !== 'object' || (parsed as StoredConfig).schemaVersion !== 1 || !Array.isArray((parsed as StoredConfig).mounts) || !(parsed as StoredConfig).settings || typeof (parsed as StoredConfig).settings !== 'object') {
        throw new Error('config.json non riconosciuto: fai una copia di sicurezza prima di intervenire.')
      }
      this.data = parsed as StoredConfig
      if (!('theme' in this.data.settings)) {
        const copy = this.file + '.before-0.2.bak'
        if (!existsSync(copy)) copyFileSync(this.file, copy)
      }
      this.data.settings = { ...defaults().settings, ...this.data.settings }
      if (!['system', 'light', 'dark'].includes(this.data.settings.theme)) this.data.settings.theme = 'system'
      this.data.mounts = this.data.mounts.map(m => ({
        ...m, autoConnect: Boolean(m.autoConnect),
        backup: {
          enabled: m.backup?.enabled ?? false,
          intervalMinutes: m.backup?.intervalMinutes ?? 0,
          destination: m.backup?.destination ?? '',
          retentionDays: m.backup?.retentionDays ?? 30
        }
      }))
    }
  }
  get settings(): AppSettings { return structuredClone(this.data.settings) }
  get mounts(): MountConfig[] { return structuredClone(this.data.mounts) }
  find(id: string): MountConfig {
    const item = this.data.mounts.find(m => m.id === id)
    if (!item) throw new Error('Cartella non trovata.')
    return structuredClone(item)
  }
  saveMount(value: MountConfig): void {
    const item = validateMount(value, this.data.mounts)
    const index = this.data.mounts.findIndex(m => m.id === item.id)
    if (index >= 0) {
      // Preserve timestamps when editing an existing mount.
      item.lastBackupAt = this.data.mounts[index].lastBackupAt
      item.lastBackupAttemptAt = this.data.mounts[index].lastBackupAttemptAt
      this.data.mounts[index] = item
    } else this.data.mounts.push(item)
    this.flush()
  }
  markBackup(id: string, success: boolean): void {
    const index = this.data.mounts.findIndex(m => m.id === id)
    if (index < 0) return
    this.data.mounts[index].lastBackupAttemptAt = new Date().toISOString()
    if (success) this.data.mounts[index].lastBackupAt = new Date().toISOString()
    this.flush()
  }
  deleteMount(id: string): void {
    this.data.mounts = this.data.mounts.filter(m => m.id !== id)
    this.flush()
  }
  saveSettings(settings: AppSettings): void {
    if (!settings.rcloneExecutable?.trim()) throw new Error('Indica il percorso di rclone.')
    if (!/^\d+(?:\.\d+)?(?:K|M|G|T)?$/i.test(settings.cacheMaxSize.trim())) throw new Error('Cache massima non valida: usa per esempio 5G.')
    this.data.settings = {
      rcloneExecutable: settings.rcloneExecutable.trim(),
      cacheMaxSize: settings.cacheMaxSize.trim().toUpperCase(),
      startAtLogin: Boolean(settings.startAtLogin),
      closeToTray: Boolean(settings.closeToTray),
      theme: ['system', 'light', 'dark'].includes(settings.theme) ? settings.theme : 'system',
      defaultRemote: typeof settings.defaultRemote === 'string' ? settings.defaultRemote.trim() : ''
    }
    this.flush()
  }
  private flush(): void {
    const temp = `${this.file}.${process.pid}.tmp`
    writeFileSync(temp, JSON.stringify(this.data, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
    try { renameSync(temp, this.file) } finally { if (existsSync(temp)) rmSync(temp) }
  }
}
