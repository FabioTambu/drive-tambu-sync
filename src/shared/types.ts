export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type BackupStatus = 'idle' | 'running' | 'error'

export interface BackupConfig {
  enabled: boolean
  intervalMinutes: number // 0 = manual only
  destination: string     // local, outside any mounted folder
  retentionDays: number   // 0 = keep forever
}

export interface MountConfig {
  id: string
  name: string
  remote: string          // existing rclone remote name
  remotePath: string      // absolute or home-relative path in that remote
  localPath: string       // local mount point
  autoConnect: boolean
  backup: BackupConfig
  lastBackupAt?: string
  lastBackupAttemptAt?: string
}

export interface AppSettings {
  rcloneExecutable: string
  cacheMaxSize: string
  startAtLogin: boolean
  closeToTray: boolean
}

export interface StoredConfig {
  schemaVersion: 1
  settings: AppSettings
  mounts: MountConfig[]
}

export interface MountView extends MountConfig {
  status: ConnectionStatus
  statusDetail: string
  backupStatus: BackupStatus
  backupDetail: string
}

export interface Snapshot {
  appVersion: string
  platform: string
  settings: AppSettings
  mounts: MountView[]
  log: string[]
}

export interface Dependencies {
  rclone: { ok: boolean; detail: string }
  remotes: string[]
  note: string
}

export interface DriveAPI {
  snapshot(): Promise<Snapshot>
  diagnostics(): Promise<Dependencies>
  chooseDirectory(): Promise<string | null>
  saveMount(mount: MountConfig): Promise<void>
  deleteMount(id: string): Promise<void>
  connect(id: string): Promise<void>
  disconnect(id: string): Promise<void>
  openMount(id: string): Promise<void>
  checkRemote(id: string): Promise<string>
  backupNow(id: string): Promise<void>
  openBackup(id: string): Promise<void>
  saveSettings(settings: AppSettings): Promise<void>
  onChanged(callback: () => void): () => void
}
