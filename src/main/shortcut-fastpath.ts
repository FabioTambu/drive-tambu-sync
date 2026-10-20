import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'

const ID = /^[a-zA-Z0-9-]{6,80}$/

type FastPathServices = {
  find(id: string): { localPath: string }
  ready(id: string): boolean
  blocked(): boolean
}

/** Pure read-only answer: never connect, probe an SFTP directory or open Explorer here. */
export function fastPathReply(id: unknown, services: FastPathServices): { ready: false } | { ready: true; path: string } {
  if (typeof id !== 'string' || !ID.test(id)) return { ready: false }
  try {
    if (services.blocked() || !services.ready(id)) return { ready: false }
    const localPath = services.find(id).localPath
    if (typeof localPath !== 'string' || !/^[a-zA-Z]:\\/.test(localPath) ||
        !path.win32.isAbsolute(localPath) || /[\r\n\t\0]/.test(localPath) || localPath.length > 2048) return {ready:false}
    return { ready: true, path: localPath }
  } catch { return { ready: false } }
}

export function startShortcutHost(binary: string, services: FastPathServices, report: (message: string) => void): () => void {
  let child: ChildProcess
  try {
    child = spawn(binary, ['--serve', '--parent', String(process.pid)], {
      windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'ignore']
    })
  } catch { report('Launcher locale non disponibile; i collegamenti useranno Drive Tambu.'); return () => {} }
  child.on('error', () => report('Launcher locale non avviabile; resta disponibile il percorso standard.'))
  let lineBuffer = ''
  child.stdout?.on('data', (chunk: Buffer) => {
    lineBuffer += chunk.toString('utf8')
    if (lineBuffer.length > 512) { lineBuffer = ''; child.kill(); return }
    for (;;) {
      const end = lineBuffer.indexOf('\n')
      if (end < 0) break
      const line = lineBuffer.slice(0, end).replace(/\r$/, '')
      lineBuffer = lineBuffer.slice(end + 1)
      const id = line.startsWith('CHECK\t') ? line.slice(6) : ''
      const answer = fastPathReply(id, services)
      if (child.stdin?.writable) child.stdin.write(answer.ready ? `READY\t${answer.path}\n` : 'FALLBACK\n')
    }
  })
  return () => {
    if (child.stdin && !child.stdin.destroyed) child.stdin.end()
    if (child.exitCode === null && !child.killed) child.kill()
  }
}
