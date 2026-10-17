import { normalizeRemotePath } from '../../shared/paths'

/** UI notation only: rclone keeps using '' for Home and '/' for Root. */
export function displayRemotePath(value: string): string {
  if (value === '' || value === '.') return '~/'
  return value.startsWith('/') ? value : `~/${value}`
}

/** Parse user-edited display text, never canonical paths returned by the server. */
export function parseDisplayedRemotePath(remote: string, input: string): string {
  // Retain the existing validation for control characters and mismatched servers.
  const value = normalizeRemotePath(remote, input)
  // Strip one display prefix, not every tilde: ~/~/file may be a real directory.
  // An extra slash after ~/ must not turn a home-relative path into an absolute one.
  return value.startsWith('~/') ? value.slice(2).replace(/^\/+/, '') : value
}
