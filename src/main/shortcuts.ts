import { constants, openSync, closeSync, writeFileSync, fchmodSync, lstatSync } from 'node:fs'
import type { ConnectionStatus } from '../shared/types'

function validId(id: string): void {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{6,80}$/.test(id)) throw new Error('Identificativo del collegamento non valido.')
}
export function requestedFolder(argv: string[]): string | null {
  const positions = argv.flatMap((arg, index) => arg === '--open-folder' ? [index] : [])
  if (!positions.length) return null
  if (positions.length !== 1) throw new Error('Richiesta di collegamento non valida.')
  const id = argv[positions[0] + 1]
  validId(id)
  return id
}
export function shortcutName(name: string): string {
  let leaf = name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/, '').slice(0, 100) || 'Cartella'
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(leaf)) leaf = `Cartella-${leaf}`
  return leaf
}
const desktopString = (s: string): string => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
export function desktopEntry(executable: string, id: string, name: string): string {
  validId(id)
  if (!executable.startsWith('/') || /[\r\n\0]/.test(executable)) throw new Error('Percorso eseguibile non valido.')
  // Exec has its own quoting rules, followed by Desktop Entry string escaping.
  const quoted = '"' + desktopString(executable.replace(/[%\\`"$]/g, c => c === '%' ? '%%' : '\\' + c)) + '"'
  return `[Desktop Entry]\nType=Application\nVersion=1.0\nName=${desktopString(name)}\nComment=Apri la cartella con Drive Tambu\nExec=${quoted} --open-folder ${id}\nIcon=folder\nTerminal=false\nStartupNotify=true\n`
}
export function writeLinuxShortcut(destination: string, executable: string, id: string, name: string): void {
  if (!destination.endsWith('.desktop')) throw new Error('Il collegamento Linux deve avere estensione .desktop.')
  try {
    const stat = lstatSync(destination)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('La destinazione e un collegamento simbolico o non e un file regolare.')
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  const text = desktopEntry(executable, id, name)
  const fd = openSync(destination, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW, 0o755)
  try { writeFileSync(fd, text, 'utf8'); fchmodSync(fd, 0o755) } finally { closeSync(fd) }
}

type OpenerServices = {
  find(id: string): { localPath: string }
  state(id: string): { status: ConnectionStatus; detail: string }
  connect(id: string): Promise<void>
  open(path: string): Promise<string>
  stopping(): boolean
}
export class SavedFolderOpener {
  private pending = new Map<string, Promise<void>>()
  constructor(private services: OpenerServices, private timeoutMs = 120000, private pollMs = 250) {}
  open(id: string): Promise<void> {
    validId(id)
    const existing = this.pending.get(id)
    if (existing) return existing
    const promise = this.perform(id).finally(() => this.pending.delete(id))
    this.pending.set(id, promise)
    return promise
  }
  private async perform(id: string): Promise<void> {
    this.services.find(id) // Never create an unknown mount from command-line arguments.
    if (this.services.stopping()) throw new Error('Drive Tambu si sta chiudendo.')
    const initial = this.services.state(id).status
    if (initial === 'disconnecting') throw new Error('La cartella si sta scollegando. Riprova tra poco.')
    const start = Date.now()
    if (initial !== 'connected') await this.services.connect(id)
    while (Date.now() - start < this.timeoutMs) {
      if (this.services.stopping()) throw new Error('Apertura interrotta: Drive Tambu si sta chiudendo.')
      const state = this.services.state(id)
      if (state.status === 'connected') {
        const error = await this.services.open(this.services.find(id).localPath)
        if (error) throw new Error(error)
        return
      }
      if (state.status === 'error') throw new Error(state.detail || 'Non riesco a collegare la cartella.')
      if (state.status === 'disconnected' || state.status === 'disconnecting') throw new Error('Il collegamento e stato annullato. Riprova dall\'app.')
      await new Promise<void>(resolve => setTimeout(resolve, this.pollMs))
    }
    throw new Error('La cartella non e ancora disponibile. Controlla il collegamento nell\'app e riprova.')
  }
}
