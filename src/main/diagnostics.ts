import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Dependencies } from '../shared/types'
import { ConfigStore } from './store'

const exec = promisify(execFile)
export function remoteSpec(remote: string, remotePath: string): string {
  return `${remote}:${remotePath}`
}

export async function runRclone(executable: string, args: string[], timeout = 30000): Promise<string> {
  try {
    const { stdout } = await exec(executable, args, { windowsHide: true, timeout, maxBuffer: 2 * 1024 * 1024 })
    return stdout.trim()
  } catch (error) {
    const e = error as Error & { stderr?: string }
    throw new Error((e.stderr || e.message || 'Errore rclone').trim().slice(0, 650))
  }
}

export async function diagnostics(store: ConfigStore): Promise<Dependencies> {
  const binary = store.settings.rcloneExecutable
  const note = process.platform === 'win32'
    ? 'Windows: serve WinFsp installato. La cartella di montaggio non deve esistere prima del collegamento.'
    : 'Linux: serve FUSE (fusermount3). La cartella di montaggio deve essere vuota.'
  try {
    const version = (await runRclone(binary, ['version'], 9000)).split('\n')[0]
    let remotes: string[] = []
    try { remotes = (await runRclone(binary, ['listremotes'], 9000)).split('\n').map(v => v.replace(/:$/, '').trim()).filter(Boolean) } catch { /* version still useful */ }
    return { rclone: { ok: true, detail: version }, remotes, note }
  } catch (error) {
    return { rclone: { ok: false, detail: error instanceof Error ? error.message : String(error) }, remotes: [], note }
  }
}
