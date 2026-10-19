const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {sshKeyDirectory, discoverSshKeys, sshKeyBrowserStart} = require('../src/main/ssh-key-discovery.ts')

test('detects only common existing private-key filenames without including public keys or unrelated files', t => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'dt-ssh-hints-'))
  t.after(() => fs.rmSync(home, {recursive:true, force:true}))
  const directory = path.join(home, '.ssh')
  fs.mkdirSync(directory)
  for (const name of ['id_ed25519', 'id_rsa', 'id_ed25519.pub', 'config', 'authorized_keys', 'my_custom_key']) fs.writeFileSync(path.join(directory, name), 'fixture')
  fs.mkdirSync(path.join(directory, 'id_ecdsa'))
  const result = discoverSshKeys(home)
  assert.equal(result.directory, directory)
  assert.deepEqual(result.keys, [
    {name:'id_ed25519', path:path.join(directory, 'id_ed25519')},
    {name:'id_rsa', path:path.join(directory, 'id_rsa')}
  ])
})

test('key suggestions are empty when SSH folder is absent, and picker starts from home', t => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'dt-ssh-empty-'))
  t.after(() => fs.rmSync(home, {recursive:true, force:true}))
  assert.deepEqual(discoverSshKeys(home), {directory:path.join(home,'.ssh'), keys:[]})
  assert.equal(sshKeyBrowserStart(home), home)
  fs.mkdirSync(path.join(home,'.ssh'))
  assert.equal(sshKeyBrowserStart(home), path.join(home,'.ssh'))
})

test('SSH home directory uses the appropriate Windows and Linux path syntax', () => {
  assert.equal(sshKeyDirectory('C:\\Users\\Mario', 'win32'), 'C:\\Users\\Mario\\.ssh')
  assert.equal(sshKeyDirectory('/home/mario', 'linux'), '/home/mario/.ssh')
})
