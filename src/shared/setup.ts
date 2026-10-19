export type ConnectionMode = 'existing' | 'direct' | 'cloudflare'
export interface ConnectionDraft {
  name: string
  mode: ConnectionMode
  host: string
  user: string
  port: number
  keyPath: string
}
export interface PreparedConnection {
  token: string
  name: string
  host: string
  fingerprints: string[]
  expiresAt: number
}
export interface ManagedConnection { remote: string; name: string; host: string; mode: ConnectionMode }
export type ComponentId = 'rclone' | 'ssh' | 'filesystem' | 'cloudflared'
export interface SetupComponent {
  id: ComponentId
  name: string
  state: 'ready' | 'missing' | 'incompatible' | 'error'
  detail: string
  installable: boolean
  optional?: boolean
}
export interface SshKeySuggestions {
  directory: string
  keys: {name: string; path: string}[]
}
export interface SetupReport {
  platform: string
  sshKeys?: SshKeySuggestions
  components: SetupComponent[]
  canInstall: boolean
  installationNote: string
  restartRequired?: boolean
}
