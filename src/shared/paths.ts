/** Normalize pasted rclone paths without changing which server is selected. */
export function normalizeRemotePath(remote: string, input: string): string {
  if (typeof remote !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._ -]*$/.test(remote)) {
    throw new Error('Scegli un server salvato nelle Impostazioni.')
  }
  if (typeof input !== 'string' || /[\r\n\0]/.test(input)) throw new Error('Il percorso sul server non e valido.')
  let value = input.trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
  if (/^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\')) {
    throw new Error('Questo e un percorso del computer Windows. Scegli invece una cartella sul server.')
  }
  const qualified = /^([^/:\\]+):(.*)$/.exec(value)
  if (qualified) {
    if (qualified[1] !== remote) throw new Error(`Il percorso appartiene al server "${qualified[1]}". Seleziona quel server oppure scegli un'altra cartella.`)
    value = qualified[2]
    if (/^[^/:\\]+:/.test(value)) throw new Error('Il percorso contiene il nome del server piu volte. Usa Sfoglia per scegliere la cartella.')
  }
  return value
}

export function selectedRemote(remotes: string[], preferred = ''): string {
  if (preferred && remotes.includes(preferred)) return preferred
  return remotes.length === 1 ? remotes[0] : ''
}

export function childRemotePath(parent: string, name: string): string {
  if (!name || name === '.' || name === '..' || /[\/\r\n\0]/.test(name)) throw new Error('Il server ha restituito un nome di cartella non valido.')
  return parent === '' || parent === '.' ? name : `${parent.replace(/\/$/, '')}/${name}`
}

export function parentRemotePath(value: string): string | null {
  if (value === '' || value === '.' || value === '/') return null
  const clean = value.replace(/\/+$/, '')
  const i = clean.lastIndexOf('/')
  return i < 0 ? '' : (i === 0 ? '/' : clean.slice(0, i))
}
