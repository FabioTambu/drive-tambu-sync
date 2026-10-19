import { statSync } from 'node:fs'
import path from 'node:path'
import type { SshKeySuggestions } from '../shared/setup'

// Never read key contents, inspect ~/.ssh/config or scan arbitrary user files.
const COMMON_PRIVATE_KEYS = ['id_ed25519', 'id_rsa', 'id_ecdsa', 'id_ed25519_sk', 'id_ecdsa_sk'] as const

export function sshKeyDirectory(home: string, platform: string = process.platform): string {
  return (platform === 'win32' ? path.win32 : path.posix).join(home, '.ssh')
}

export function discoverSshKeys(home: string, platform: string = process.platform): SshKeySuggestions {
  const directory = sshKeyDirectory(home, platform)
  const lib = platform === 'win32' ? path.win32 : path.posix
  const keys = COMMON_PRIVATE_KEYS.flatMap(name => {
    const filename = lib.join(directory, name)
    try { return statSync(filename).isFile() ? [{name, path: filename}] : [] }
    catch { return [] }
  })
  return {directory, keys}
}

export function sshKeyBrowserStart(home: string, platform: string = process.platform): string {
  const directory = sshKeyDirectory(home, platform)
  try { if (statSync(directory).isDirectory()) return directory }
  catch { /* New user: there is no ~/.ssh yet. */ }
  return home
}
