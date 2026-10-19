import { existsSync, lstatSync } from 'node:fs'
import path from 'node:path'

let vendorDirectory: string | undefined
export function configureRuntimeTools(directory: string | undefined): void { vendorDirectory = directory }
export function runtimeVendorDirectory(): string | undefined { return vendorDirectory }
export function bundledTool(name: 'rclone' | 'cloudflared'): string | undefined {
  if (!vendorDirectory) return undefined
  const target = path.join(vendorDirectory, name + (process.platform === 'win32' ? '.exe' : ''))
  try { if (lstatSync(target).isFile()) return target } catch { /* not packaged in development */ }
  return undefined
}
export function selectRclone(configured: string): string {
  if (configured !== 'rclone' && configured !== 'rclone.exe') return configured
  return bundledTool('rclone') ?? configured
}
export function resolveTool(name: 'ssh' | 'cloudflared'): string {
  if (name === 'cloudflared') return bundledTool(name) ?? (process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared')
  if (process.platform === 'win32') {
    const target = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'OpenSSH', 'ssh.exe')
    if (existsSync(target)) return target
    return 'ssh.exe'
  }
  return existsSync('/usr/bin/ssh') ? '/usr/bin/ssh' : 'ssh'
}
export function runtimeEnvironment(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  if (!vendorDirectory) return { ...base }
  const env = { ...base }
  const key = Object.keys(env).find(k => k.toLowerCase() === 'path') || 'PATH'
  env[key] = vendorDirectory + path.delimiter + (env[key] || '')
  return env
}
export function compatibleRclone(version: string): boolean {
  const m = /^rclone v(\d+)\.(\d+)\.(\d+)(?:[-\s]|$)/.exec(version.trim())
  return !!m && (Number(m[1]) > 1 || (Number(m[1]) === 1 && Number(m[2]) >= 64))
}
