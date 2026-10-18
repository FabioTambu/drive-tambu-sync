/** Best-effort observation of stock rclone. This is NOT a write barrier. */
export interface PreflightResult {
  kind: 'confirm' | 'blocked' | 'unknown'
  message: string
  queued?: number
  active?: number
}
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const count = (x: unknown): x is number => Number.isSafeInteger(x) && (x as number) >= 0
const optionalList = (x: unknown): boolean => x === undefined || x === null || Array.isArray(x)
export const unknownActivity = (): PreflightResult => ({kind: 'unknown', message: 'Non riesco a verificare i trasferimenti. La cartella resta collegata. Riprova tra poco.'})
export function assessTransfers(vfs: unknown, core: unknown, queue: unknown): PreflightResult {
  if (!object(vfs) || !object(vfs.diskCache) || !object(core) || !object(queue)) return unknownActivity()
  const d = vfs.diskCache
  if (!['uploadsQueued', 'uploadsInProgress', 'erroredFiles'].every(k => count(d[k])) || typeof d.outOfSpace !== 'boolean'
    || !['bytes', 'checks', 'transfers', 'errors'].every(k => count(core[k]))
    || !optionalList(core.transferring) || !optionalList(core.checking)
    || !Object.hasOwn(queue, 'queue') || (queue.queue !== null && !Array.isArray(queue.queue))) return unknownActivity()
  const queued = Math.max(d.uploadsQueued as number, Array.isArray(queue.queue) ? queue.queue.length : 0)
  const active = (d.uploadsInProgress as number) + (Array.isArray(core.transferring) ? core.transferring.length : 0)
    + (Array.isArray(core.checking) ? core.checking.length : 0)
  if (d.outOfSpace) return {kind:'blocked', message:'Lo spazio temporaneo sul computer non basta. Libera spazio senza cancellare i file temporanei di Drive Tambu, poi riprova.', queued, active}
  if ((d.erroredFiles as number) > 0) return {kind:'blocked', message:'Ci sono salvataggi locali da verificare. La cartella resta collegata; trovi i dettagli in Attivita.', queued, active}
  if (queued || active) return {kind:'blocked', message: queued ? `Ci sono ${queued} file ancora da inviare. Attendi il completamento oppure continua in background.` : 'Ci sono trasferimenti o controlli in corso. Attendi il completamento oppure continua in background.', queued, active}
  // core.errors/fatalError are historical counters, not evidence of a current problem.
  // inUse is NOT the number of files still open by other applications.
  return {kind:'confirm', message:'Non risultano trasferimenti in corso.', queued:0, active:0}
}
