import type { DriveAPI } from '../../shared/types'
declare global {
  interface Window { drive: DriveAPI }
}
export {}
