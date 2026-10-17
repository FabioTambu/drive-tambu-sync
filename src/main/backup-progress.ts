import { StringDecoder } from 'node:string_decoder'
import type { BackupProgress } from '../shared/types'

const count = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
export function progressFromStats(stats: Record<string, unknown>): BackupProgress {
  const bytes = count(stats.bytes), totalBytes = count(stats.totalBytes)
  return {
    phase: totalBytes > 0 ? (bytes >= totalBytes ? 'finishing' : 'copying') : 'checking',
    percent: totalBytes > 0 ? Math.min(99, Math.floor(bytes / totalBytes * 100)) : null,
    bytes, totalBytes, speed: count(stats.speed), checks: count(stats.checks), transfers: count(stats.transfers)
  }
}

/** rclone --use-json-log emits one JSON object per line, not per stream chunk. */
export class JsonLogReader {
  private decoder = new StringDecoder('utf8')
  private pending = ''
  private dropping = false
  constructor(private receive: (value: Record<string, unknown>) => void) {}
  push(chunk: Buffer): void { this.consume(this.decoder.write(chunk)) }
  end(): void { this.consume(this.decoder.end()); if (!this.dropping && this.pending) this.line(this.pending); this.pending = '' }
  private consume(text: string): void {
    for (const part of text.split(/(?<=\n)/)) {
      const complete = part.endsWith('\n')
      if (!this.dropping) {
        this.pending += part
        if (this.pending.length > 256 * 1024) { this.pending = ''; this.dropping = true }
      }
      if (complete) {
        if (!this.dropping) this.line(this.pending)
        this.pending = ''; this.dropping = false
      }
    }
  }
  private line(text: string): void {
    try {
      const value: unknown = JSON.parse(text)
      if (value && typeof value === 'object' && !Array.isArray(value)) this.receive(value as Record<string, unknown>)
    } catch { /* Ignore non-JSON lines; a nonzero process exit still fails the backup. */ }
  }
}
