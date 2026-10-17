import type { BackupConfig, BackupSchedule, MountConfig } from './types'

export function validateSchedule(value: unknown): BackupSchedule {
  if (!value || typeof value !== 'object') throw new Error('Programmazione backup non valida.')
  const v = value as Record<string, unknown>
  if (v.mode === 'manual') return { mode: 'manual' }
  if (v.mode === 'interval') {
    if (!Number.isInteger(v.minutes) || (v.minutes as number) < 1 || (v.minutes as number) > 525600) {
      throw new Error('Intervallo backup non valido: scegli da un minuto a 365 giorni.')
    }
    return { mode: 'interval', minutes: v.minutes as number }
  }
  if (v.mode !== 'daily' && v.mode !== 'weekly') throw new Error('Programmazione backup non riconosciuta.')
  if (typeof v.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)) throw new Error('Orario backup non valido. Usa ore e minuti (00:00 - 23:59).')
  if (v.mode === 'daily') return { mode: 'daily', time: v.time }
  if (!Array.isArray(v.weekdays) || !v.weekdays.length || v.weekdays.some(d => !Number.isInteger(d) || d < 0 || d > 6)) {
    throw new Error('Scegli almeno un giorno della settimana per il backup.')
  }
  return { mode: 'weekly', weekdays: [...new Set(v.weekdays as number[])].sort(), time: v.time }
}

/** Legacy settings are read without losing an arbitrary interval chosen before 0.3. */
export function scheduleOf(backup: Pick<BackupConfig, 'schedule' | 'intervalMinutes'>): BackupSchedule {
  return validateSchedule(backup.schedule ?? (backup.intervalMinutes === 0 ? { mode: 'manual' } : { mode: 'interval', minutes: backup.intervalMinutes }))
}

/** Wall-clock calendar rules, NOT a fixed seven-day duration. Date chooses the first
 * repeated local hour in autumn and advances a missing spring hour by the DST gap. */
export function nextScheduledAt(schedule: BackupSchedule, after: Date): string | undefined {
  const s = validateSchedule(schedule)
  if (!Number.isFinite(+after)) throw new Error('Data della programmazione backup non valida.')
  if (s.mode === 'manual') return undefined
  if (s.mode === 'interval') return new Date(+after + s.minutes * 60000).toISOString()
  const [hour, minute] = s.time.split(':').map(Number)
  for (let offset = 0; offset <= 8; offset++) {
    const candidate = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset, hour, minute, 0, 0)
    if (candidate > after && (s.mode === 'daily' || s.weekdays.includes(candidate.getDay()))) return candidate.toISOString()
  }
  throw new Error('Non riesco a calcolare il prossimo backup.')
}

export function isBackupDue(m: Pick<MountConfig, 'backup' | 'nextBackupAt' | 'lastBackupAt' | 'lastBackupAttemptAt'>, now: Date): boolean {
  if (!m.backup.enabled || scheduleOf(m.backup).mode === 'manual' || !m.nextBackupAt) return false
  const due = Date.parse(m.nextBackupAt)
  if (!Number.isFinite(due) || due > +now) return false
  const attempt = Date.parse(m.lastBackupAttemptAt ?? '')
  const success = Date.parse(m.lastBackupAt ?? '')
  // A failed/interrupted attempt is persisted at startup and throttled on restart.
  if (Number.isFinite(attempt) && (!Number.isFinite(success) || attempt > success) && +now - attempt < 10 * 60000) return false
  return true
}

export const localTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

export function describeSchedule(s: BackupSchedule): string {
  if (s.mode === 'manual') return 'Solo manualmente'
  if (s.mode === 'interval') return `Ogni ${s.minutes} ${s.minutes === 1 ? 'minuto' : 'minuti'}`
  if (s.mode === 'daily') return `Ogni giorno alle ${s.time}`
  const days = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato']
  return `${s.weekdays.map(d => days[d]).join(', ')} alle ${s.time}`
}
