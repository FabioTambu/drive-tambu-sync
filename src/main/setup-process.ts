import { spawn } from 'node:child_process'
import { runtimeEnvironment } from './runtime-tools'

export interface ToolResult { code: number; stdout: string; stderr: string }
export interface ToolOptions { timeoutMs?: number; env?: NodeJS.ProcessEnv; discardOutput?: boolean }
export type ToolRunner = (executable: string, args: string[], options?: ToolOptions) => Promise<ToolResult>

/** For setup probes only. Never use to stop a mount, backup, or elevated installer. */
export const runSetupTool: ToolRunner = (executable, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(executable, args, { shell: false, windowsHide: true, detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'], env: runtimeEnvironment(options.env) })
  let stdout = '', stderr = '', settled = false
  const timeout = options.timeoutMs ?? 20000
  const timer = timeout > 0 ? setTimeout(() => {
    // These are disposable read-only probes, not active file-transfer engines.
    if (child.pid) {
      if (process.platform === 'win32') {
        const killer = spawn(pathToTaskkill(), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
        killer.on('error', () => { try { child.kill() } catch { /* already gone */ } })
      } else { try { process.kill(-child.pid, 'SIGTERM') } catch { try { child.kill() } catch { /* already gone */ } } }
    }
    finish(new Error('Il controllo non ha risposto in tempo. Verifica rete e autenticazione, poi riprova.'))
  }, timeout) : undefined
  function finish(error?: Error): void {
    if (settled) return
    settled = true
    if (timer) clearTimeout(timer)
    if (error) reject(error)
    else resolve({ code: child.exitCode ?? -1, stdout, stderr })
  }
  child.stdout.on('data', (data: Buffer) => { if (!options.discardOutput) stdout = (stdout + data.toString('utf8')).slice(-65536) })
  child.stderr.on('data', (data: Buffer) => { if (!options.discardOutput) stderr = (stderr + data.toString('utf8')).slice(-65536) })
  child.once('error', error => finish(error))
  child.once('close', () => finish())
})
function pathToTaskkill(): string { return (process.env.SystemRoot || 'C:\\Windows') + '\\System32\\taskkill.exe' }
