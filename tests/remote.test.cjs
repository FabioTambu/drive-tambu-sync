const { test } = require('node:test')
const assert = require('node:assert/strict')
const { remoteSpec, runRclone } = require('../src/main/diagnostics.ts')

test('a pasted full server path contains exactly one connection prefix', () => {
  assert.equal(remoteSpec('casa', 'casa:/home/server/services/filebrowser/data/fabio'), 'casa:/home/server/services/filebrowser/data/fabio')
})
test('reject a pasted path belonging to another server, rather than silently switching', () => {
  assert.throws(() => remoteSpec('casa', 'ufficio:/documenti'), /server|connessione/i)
})
test('never interpret a Windows drive as a server path', () => {
  assert.throws(() => remoteSpec('casa', 'C:\\Users\\Fabio'), /computer|Windows/i)
})
test('preserve absolute, home-relative and colon-containing SFTP paths', () => {
  assert.equal(remoteSpec('casa', '/documenti/anno:2026'), 'casa:/documenti/anno:2026')
  assert.equal(remoteSpec('casa', 'documenti'), 'casa:documenti')
  assert.equal(remoteSpec('casa', ''), 'casa:')
})
test('reject control characters and command-like connection names', () => {
  assert.throws(() => remoteSpec('--config', '/tmp'), /server|connessione/i)
  assert.throws(() => remoteSpec('casa', '/tmp\nother'), /percorso/i)
})
test('run a process without a shell and retain a normal successful result', async () => {
  const out = await runRclone(process.execPath, ['-e', 'process.stdout.write("ok")'], 3000)
  assert.equal(out, 'ok')
})
test('a missing executable has an actionable message, not a raw ENOENT', async () => {
  await assert.rejects(runRclone('drive-tambu-no-such-binary-test', ['version'], 1000), /componente|rclone.*trovat|motore/i)
})
test('an unresponsive connection is reported as a timeout, without claiming a particular cause', async () => {
  await assert.rejects(runRclone(process.execPath, ['-e', 'setTimeout(() => {}, 10000)'], 150), /tempo|rispost/i)
})
