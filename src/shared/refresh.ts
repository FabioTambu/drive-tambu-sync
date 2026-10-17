import type { AppSettings, MountConfig } from './types'

export const DEFAULT_REFRESH_SECONDS = 120
export function validateRefreshSeconds(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 5 || (value as number) > 86400) {
    throw new Error('Intervallo di aggiornamento non valido: scegli da 5 secondi a 24 ore.')
  }
  return value as number
}
export function effectiveRefreshSeconds(mount: Pick<MountConfig, 'directoryRefreshSeconds'>, settings: Pick<AppSettings, 'directoryRefreshSeconds'>): number {
  return validateRefreshSeconds(mount.directoryRefreshSeconds ?? settings.directoryRefreshSeconds ?? DEFAULT_REFRESH_SECONDS)
}
