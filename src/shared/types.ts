import type { ConnectionDraft, ManagedConnection, PreparedConnection, SetupReport } from './setup'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error'
export type Theme = 'system' | 'light' | 'dark'
export type WindowMode = 'compact' | 'expanded'
export type BackupStatus = 'idle' | 'running' | 'error'

export type BackupSchedule =
  | { mode: 'manual' }
  | { mode: 'interval'; minutes: number }
  | { mode: 'daily'; time: string }
  | { mode: 'weekly'; weekdays: number[]; time: string }

export interface BackupProgress {
  phase: 'checking' | 'copying' | 'finishing' | 'complete'
  percent: number | null
  bytes: number
  totalBytes: number
  speed: number
  checks: number
  transfers: number
}

export interface BackupConfig {
  enabled: boolean
  intervalMinutes: number // legacy compatibility; calendar schedules use 0
  schedule?: BackupSchedule
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
  directoryRefreshSeconds?: number | null // null/undefined = use general setting
  nextBackupAt?: string
  backupTimeZone?: string
  lastBackupAt?: string
  lastBackupAttemptAt?: string
}

export interface AppSettings {
  rcloneExecutable: string
  cacheMaxSize: string
  startAtLogin: boolean
  closeToTray: boolean
  theme: Theme
  defaultRemote: string
  directoryRefreshSeconds: number
}

export interface StoredConfig {
  schemaVersion: 1
  settings: AppSettings
  mounts: MountConfig[]
}

export interface MountView extends MountConfig {
  hasRuntime?: boolean
  status: ConnectionStatus
  statusDetail: string
  backupStatus: BackupStatus
  backupDetail: string
  backupProgress?: BackupProgress
  refreshNeedsReconnect?: boolean
}

export interface Snapshot {
  setupBusy?: boolean
  appVersion: string
  platform: string
  windowMode: WindowMode
  dark: boolean
  settings: AppSettings
  mounts: MountView[]
  operation?: OperationView | null
  log: string[]
}

export interface Dependencies {
  rclone: { ok: boolean; detail: string }
  remotes: string[]
  remoteLabels?: Record<string, string>
  note: string
  connectionError?: string
}

export interface RemoteListing {
  remote: string
  path: string
  parent: string | null
  entries: { name: string; path: string }[]
}

export interface DriveAPI {
  setupReport(): Promise<SetupReport>
  installComponents(): Promise<SetupReport>
  chooseSshKey(): Promise<string | null>
  prepareConnection(draft: ConnectionDraft): Promise<PreparedConnection>
  saveConnection(token: string, confirmed: boolean): Promise<ManagedConnection>
  cancelConnection(token: string): Promise<void>
  cloudflareLogin(host: string): Promise<void>
  snapshot(): Promise<Snapshot>
  diagnostics(): Promise<Dependencies>
  chooseDirectory(name?: string): Promise<string | null>
  chooseExecutable(): Promise<string | null>
  browseRemote(remote: string, path: string, requestId: string): Promise<RemoteListing>
  cancelBrowse(requestId: string): Promise<void>
  checkConnection(remote: string, path?: string): Promise<string>
  setWindowMode(mode: WindowMode): Promise<void>
  hideWindow(): Promise<void>
  minimizeWindow(): Promise<void>
  quit(): Promise<void>
  saveMount(mount: MountConfig): Promise<boolean>
  respondToOperation(id: string, reply: OperationReply): Promise<void>
  deleteMount(id: string): Promise<void>
  connect(id: string): Promise<void>
  disconnect(id: string): Promise<void>
  openMount(id: string): Promise<void>
  createShortcut(id: string): Promise<string | null>
  checkRemote(id: string): Promise<string>
  backupNow(id: string): Promise<void>
  openBackup(id: string): Promise<void>
  saveSettings(settings: AppSettings): Promise<void>
  onChanged(callback: () => void): () => void
}

export type OperationReply = 'confirm' | 'cancel' | 'retry' | 'background'
export interface OperationView {
  id: string
  kind: 'quit' | 'disconnect' | 'remove' | 'move'
  name?: string
  from?: string
  to?: string
  phase: 'checking' | 'confirm' | 'blocked' | 'working'
  message: string
}
