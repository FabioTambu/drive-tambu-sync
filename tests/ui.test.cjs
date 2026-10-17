// Shallow component contracts without a browser. Effects/native APIs are separate boundaries.
// These do not replace a packaged Electron/Windows smoke test.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), Module = require('node:module'), ts = require('typescript')
let hook = 0, overrides = {}, uid = 0
const react = {
  useState: initial => { const key = hook++; return [Object.hasOwn(overrides, key) ? overrides[key] : (typeof initial === 'function' ? initial() : initial), () => {}] },
  useEffect: () => {}, useLayoutEffect: () => {}, useMemo: fn => fn(), useCallback: fn => fn,
  useRef: value => ({current: value}), useId: () => `field-${++uid}`
}
const jsx = {jsx: (type, props) => ({type, props: props || {}}), jsxs: (type, props) => ({type, props: props || {}}), Fragment: 'fragment'}
const oldLoad = Module._load
Module._load = function(id, ...args) {
  if (id === 'react') return react
  if (id === 'react/jsx-runtime') return jsx
  if (id === 'lucide-react') return new Proxy({}, {get: (_t, key) => props => ({type: 'svg', props: {...props, 'data-icon': key}})})
  return oldLoad.call(this, id, ...args)
}
require.extensions['.tsx'] = (module, filename) => {
  let result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {fileName: filename, compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText
  if (filename.endsWith('/App.tsx') || filename.endsWith('\\App.tsx')) result += '\nexports.__components = { MountModal, SettingsPage, App };\n'
  module._compile(result, filename)
}
const components = require('../src/renderer/src/App.tsx').__components
Module._load = oldLoad
function tree(component, props, values = {}) {
  hook = 0; overrides = values
  function visit(node) {
    if (Array.isArray(node)) return node.flatMap(visit)
    if (node == null || typeof node === 'boolean') return []
    if (typeof node !== 'object') return [node]
    if (typeof node.type === 'function') return visit(node.type(node.props))
    return [{...node, children: visit(node.props?.children)}]
  }
  return visit(component(props))
}
function flatten(nodes) { return nodes.flatMap(n => typeof n === 'object' ? [n, ...flatten(n.children || [])] : [n]) }
function text(nodes) { return flatten(nodes).filter(n => typeof n === 'string' || typeof n === 'number').join(' ') }
const settings = {rcloneExecutable: 'rclone', cacheMaxSize: '5G', startAtLogin: false, closeToTray: true, theme: 'system', defaultRemote: ''}
const snap = {appVersion: '0.2.0', platform: 'win32', windowMode: 'compact', dark: false, settings, mounts: [], log: []}
const deps = {rclone: {ok: true, detail: 'rclone'}, remotes: ['casa'], note: ''}
const m = {id: 'folder-123', name: '', remote: 'casa', remotePath: '/', localPath: '', autoConnect: true, backup: {enabled: false, intervalMinutes: 60, destination: '', retentionDays: 30}}
const noop = () => {}

test('new folder has a server browser and does not ask for a technical rclone profile', () => {
  const nodes = tree(components.MountModal, {original: m, remotes: ['casa'], platform: 'win32', onClose: noop, onSave: noop, onDelete: noop, onSettings: noop, notify: noop, apiBusy: false})
  assert.ok(!text(nodes).includes('Remote rclone'))
  assert.ok(flatten(nodes).some(n => n.type === 'button' && n.props['aria-label'] === 'Sfoglia cartelle sul server'))
})
test('a user can select dark mode from settings', async () => {
  let saved
  const nodes = tree(components.SettingsPage, {snapshot: snap, deps, onSave: async s => {saved = s}, onCheck: noop, busy: false})
  const dark = flatten(nodes).find(n => n.type === 'button' && n.props['aria-label'] === 'Tema scuro')
  assert.ok(dark, 'Dark theme selector is visible')
  await dark.props.onClick()
  assert.equal(saved.theme, 'dark')
})
test('compact view exposes an Expand control that asks the main process to expand', async () => {
  let mode
  global.window = {drive: {setWindowMode: async m => {mode = m}}}
  const nodes = tree(components.App, {}, {0: snap, 1: deps})
  const button = flatten(nodes).find(n => n.type === 'button' && n.props['aria-label'] === 'Apri finestra completa')
  assert.ok(button, 'Expand control is visible')
  await button.props.onClick()
  assert.equal(mode, 'expanded')
})
test('the whole lower-left Settings control is a button, not a readiness claim', () => {
  const nodes = tree(components.App, {}, {0: {...snap, windowMode: 'expanded'}, 1: deps})
  const bottom = flatten(nodes).find(n => n.props?.className === 'sidebar-bottom')
  assert.ok(bottom)
  assert.ok(flatten(bottom.children).some(n => n.type === 'button' && text(n.children).includes('Impostazioni')))
  assert.ok(!text(nodes).includes('Sistema pronto'))
})
