import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ID = /^[a-zA-Z0-9-]{6,80}$/
type Entry = {path:string; id:string; target:string; args:string}

/** Recording never follows a shortcut or inspects/copies a private SSH key. */
export function recordShortcut(dataDir: string, destination: string, id: string, target: string, args: string): void {
  if (!ID.test(id) || !path.isAbsolute(destination) || path.extname(destination).toLowerCase() !== '.lnk') throw new Error('Collegamento non valido.')
  if (!path.win32.isAbsolute(target) || /[\r\n\0]/.test(target) || !['Drive Tambu.exe','DriveTambuShortcut.exe'].includes(path.win32.basename(target))) throw new Error('Destinazione collegamento non valida.')
  if (args !== `-- --open-folder ${id}` && args !== `--open-folder ${id}`) throw new Error('Argomenti del collegamento non validi.')
  if (!lstatSync(destination).isFile() || lstatSync(destination).isSymbolicLink()) throw new Error('Collegamento non regolare.')
  const file = path.join(dataDir, 'shortcuts-v1.json')
  let shortcuts: Entry[] = []
  if (existsSync(file)) {
    const stat = lstatSync(file)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Inventario collegamenti non sicuro.')
    const previous: unknown = JSON.parse(readFileSync(file,'utf8'))
    if (!previous || typeof previous !== 'object' || (previous as {version?:number}).version !== 1 || !Array.isArray((previous as {shortcuts?:Entry[]}).shortcuts)) throw new Error('Inventario collegamenti non riconosciuto.')
    shortcuts = (previous as {shortcuts:Entry[]}).shortcuts.filter(item => item.path !== destination)
  }
  if (shortcuts.length >= 1000) throw new Error('Inventario dei collegamenti troppo grande.')
  shortcuts.push({path: destination, id, target, args})
  mkdirSync(dataDir, {recursive:true})
  const temporary = file + '.' + process.pid + '.tmp'
  try {
    writeFileSync(temporary, JSON.stringify({version:1,shortcuts}, null, 2)+'\n', {encoding:'utf8',mode:0o600,flag:'wx'})
    renameSync(temporary,file)
  } finally {if (existsSync(temporary)) rmSync(temporary)}
}
