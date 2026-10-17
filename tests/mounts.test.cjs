const { test } = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const { EventEmitter } = require('node:events')
const { PassThrough } = require('node:stream')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-mount-'))
const { after } = require('node:test')
after(() => fs.rmSync(tmp, { recursive: true, force: true }))
let calls = [], rejectRemote = false
const children = new Set()
const original = Module._load
Module._load = function(id, ...rest) {
  if (id === 'electron') return { app: { getPath: () => tmp } }
  if (id === 'node:child_process') return {
    spawn: (_exe, args) => {
      calls.push(args)
      const c = new EventEmitter(); c.stdout = new PassThrough(); c.stderr = new PassThrough(); c.exitCode = null
      // A fake OS process with real streams: no actual SFTP or filesystem mounts.
      c.kill = () => { if (c.exitCode === null) { c.exitCode = 1; children.delete(c); c.emit('close', 1) }; return true }
      children.add(c)
      if (args[0] === 'lsjson') setTimeout(() => {
        if (c.exitCode !== null) return
        if (rejectRemote) c.stderr.write('directory not found')
        else c.stdout.write('{"IsDir":true}')
        c.exitCode = rejectRemote ? 1 : 0; children.delete(c); c.emit('close', c.exitCode)
      }, 30)
      return c
    }
  }
  return original.call(this, id, ...rest)
}
const diagnostics = require('../src/main/diagnostics.ts')
diagnostics.stopChild = child => child.kill()
const { MountManager } = require('../src/main/mounts.ts')
Module._load = original
function setup() {
  calls = []; rejectRemote = false
  const m = { id: 'folder-123', name: 'Documenti', remote: 'casa', remotePath: '/file', localPath: path.join(tmp, String(Date.now()) + Math.random()), autoConnect: false,
    backup: { enabled: false, destination: '', intervalMinutes: 60, retentionDays: 30 } }
  return new MountManager({ find: () => m, mounts: [m], settings: { rcloneExecutable: 'fixture', cacheMaxSize: '5G' } }, () => {}, () => {})
}
function cleanup() { for (const c of [...children]) c.kill() }
test('remote access is checked before creating a local mount', async () => {
  const manager = setup(); rejectRemote = true
  try {
    await assert.rejects(manager.connect('folder-123'), /cartella.*server|cartella.*esiste/i)
    assert.equal(calls.some(a => a[0] === 'mount'), false)
    assert.equal(manager.state('folder-123').status, 'error')
  } finally { cleanup() }
})
test('two concurrent connect requests create only one mount', async () => {
  const manager = setup()
  try {
    await Promise.all([manager.connect('folder-123'), manager.connect('folder-123')])
    assert.equal(calls.filter(a => a[0] === 'lsjson').length, 1)
    assert.equal(calls.filter(a => a[0] === 'mount').length, 1)
  } finally { cleanup() }
})
test('cancelling while checking the server never starts the mount', async () => {
  const manager = setup()
  try {
    const pending = manager.connect('folder-123')
    await manager.disconnect('folder-123')
    await pending
    assert.equal(calls.some(a => a[0] === 'mount'), false)
    assert.equal(manager.state('folder-123').status, 'disconnected')
  } finally { cleanup() }
})
