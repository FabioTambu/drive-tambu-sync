import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { ManagedConnection } from '../shared/setup'

export const MANAGED_REMOTE = /^dt_[a-f0-9]{32}$/
let directory: string | undefined
export function configureConnectionProfiles(root: string | undefined): void { directory = root }
export function plainFile(file: string): boolean {
  try { const s = lstatSync(file); return s.isFile() && !s.isSymbolicLink() } catch { return false }
}
export function managedConnections(root: string | undefined = directory): ManagedConnection[] {
  if (!root || !existsSync(root)) return []
  const stat = lstatSync(root)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('La directory delle connessioni non e valida.')
  const names = readdirSync(root).filter(name => MANAGED_REMOTE.test(name))
  if (names.length > 512) throw new Error('Troppe connessioni locali. Verifica la configurazione dell\'app.')
  return names.flatMap(remote => {
    const base = path.join(root, remote), file = path.join(base, 'profile.json')
    if (!existsSync(file)) return [] // pending connections are intentionally invisible
    if (lstatSync(base).isSymbolicLink() || !plainFile(file) || lstatSync(file).size > 16384) throw new Error('Profilo di connessione non valido.')
    const data = JSON.parse(readFileSync(file, 'utf8')) as ManagedConnection & {version?: number}
    if (data.version !== 1 || data.remote !== remote || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 80 || /[\x00-\x1f\x7f]/.test(data.name) ||
      typeof data.host !== 'string' || !['existing','direct','cloudflare'].includes(data.mode)) throw new Error('Profilo di connessione non valido.')
    return [{remote, name:data.name, host:data.host, mode:data.mode}]
  })
}
export function managedRemoteFlags(remote: string): string[] {
  if (!MANAGED_REMOTE.test(remote)) return []
  if (!directory || !managedConnections().some(c => c.remote === remote)) throw new Error('Configurazione della connessione gestita mancante. Apri Impostazioni.')
  const config = path.join(directory, remote, 'rclone.conf')
  if (!plainFile(config)) throw new Error('Configurazione della connessione non disponibile.')
  return ['--config', config]
}
