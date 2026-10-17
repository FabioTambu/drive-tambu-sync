// Regression coverage for the actual RemoteBrowser component.
// React hooks/JSX and the Electron IPC boundary are simulated; handlers and
// path conversion are production code. No server or mount is contacted.
const { test, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const { normalizeRemotePath, childRemotePath, parentRemotePath } = require('../src/shared/paths.ts')

let active
const react = {
  useState(initial) {
    const state = active, index = state.cursor++
    if (!(index in state.slots)) state.slots[index] = typeof initial === 'function' ? initial() : initial
    return [state.slots[index], value => {
      state.slots[index] = typeof value === 'function' ? value(state.slots[index]) : value
    }]
  },
  useRef(value) {
    const index = active.cursor++
    if (!(index in active.slots)) active.slots[index] = { current: value }
    return active.slots[index]
  },
  useEffect() { active.cursor++ }, // Effects need a real DOM; navigation is driven by real handlers below.
  useCallback(fn) { active.cursor++; return fn },
  useMemo(fn) { active.cursor++; return fn() }
}
const jsx = {
  jsx: (type, props) => ({ type, props: props || {} }),
  jsxs: (type, props) => ({ type, props: props || {} }),
  Fragment: 'fragment'
}
const filename = path.resolve(__dirname, '../src/renderer/src/App.tsx')
const appModule = new Module(filename, module)
appModule.filename = filename
appModule.paths = Module._nodeModulePaths(path.dirname(filename))
const originalLoad = Module._load
try {
  Module._load = function (id, ...args) {
    if (id === 'react') return react
    if (id === 'react/jsx-runtime') return jsx
    if (id === 'lucide-react') return new Proxy({}, { get: (_target, name) => props => ({ type: 'svg', props: { ...props, 'data-icon': name } }) })
    return originalLoad.call(this, id, ...args)
  }
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
  })
  // Test-only export: the public production API is unchanged.
  appModule._compile(result.outputText + '\nexports.RemoteBrowserForTest = RemoteBrowser;\n', filename)
} finally { Module._load = originalLoad }
const RemoteBrowser = appModule.exports.RemoteBrowserForTest
const previousWindow = global.window
function restoreWindow() {
  if (previousWindow === undefined) delete global.window
  else global.window = previousWindow
}
afterEach(restoreWindow)

function expand(node) {
  if (node == null || typeof node === 'boolean') return []
  if (Array.isArray(node)) return node.flatMap(expand)
  if (typeof node !== 'object') return [node]
  if (typeof node.type === 'function') return expand(node.type(node.props))
  return [{ ...node, children: expand(node.props.children) }]
}
function flatten(nodes) { return nodes.flatMap(node => typeof node === 'object' ? [node, ...flatten(node.children)] : [node]) }
function text(nodes) { return flatten(nodes).filter(node => typeof node === 'string' || typeof node === 'number').join(' ').trim() }
function listing(remote, value) {
  const canonical = normalizeRemotePath(remote, value)
  return {
    remote, path: canonical, parent: parentRemotePath(canonical),
    entries: canonical === '' ? ['Documenti', '~'].map(name => ({ name, path: childRemotePath(canonical, name) })) : []
  }
}
function browser(initialPath = '') {
  const state = { slots: [], cursor: 0 }
  const calls = [], chosen = []
  let failNext = false
  global.window = { drive: {
    cancelBrowse: async () => {},
    browseRemote: async (remote, value) => {
      calls.push(value)
      if (failNext) { failNext = false; throw new Error('Server non raggiungibile') }
      return listing(remote, value)
    }
  } }
  const props = { remote: 'casa', initialPath, onChoose: value => chosen.push(value), onClose: () => {} }
  const render = () => { active = state; state.cursor = 0; return expand(RemoteBrowser(props)) }
  const find = predicate => {
    const node = flatten(render()).find(predicate)
    assert.ok(node, 'Expected UI control is present')
    return node
  }
  const input = () => find(node => node.type === 'input' && node.props['aria-label'] === 'Percorso da esplorare')
  const button = title => find(node => node.type === 'button' && node.props.title === title)
  const buttonText = value => find(node => node.type === 'button' && text(node.children) === value)
  return {
    calls, chosen, input, button, buttonText, render,
    failOnce() { failNext = true },
    type(value) { input().props.onChange({ target: { value } }) },
    async submit() {
      find(node => node.type === 'form').props.onSubmit({ preventDefault() {} })
      // The form intentionally starts an async handler with void.
      await new Promise(resolve => setImmediate(resolve))
    }
  }
}

test('server-root shortcut is labelled Root, not Server', () => {
  const ui = browser()
  assert.equal(text(ui.button('Cartella principale del server').children), 'Root')
})
test('Home is visible as ~/ on the first render, not an empty input', () => {
  assert.equal(browser().input().props.value, '~/')
})
test('Home navigation shows ~/ but sends the empty canonical path to IPC', async () => {
  const ui = browser('/tmp')
  await ui.button('Cartella personale sul server').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  assert.deepEqual(ui.calls, [''])
})
test('Root navigation still shows and requests the absolute /', async () => {
  const ui = browser('Documenti')
  await ui.button('Cartella principale del server').props.onClick()
  assert.equal(ui.input().props.value, '/')
  assert.deepEqual(ui.calls, ['/'])
})
test('Home subfolders display ~/Documenti and remain relative internally', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  await ui.buttonText('Documenti').props.onClick()
  assert.equal(ui.input().props.value, '~/Documenti')
  assert.deepEqual(ui.calls, ['', 'Documenti'])
  await ui.buttonText('Scegli questa cartella').props.onClick()
  assert.deepEqual(ui.chosen, ['Documenti'])
})
test('Up from a Home subfolder returns to visible ~/ and can select Home', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  await ui.buttonText('Documenti').props.onClick()
  await ui.button('Cartella superiore').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  assert.equal(ui.calls.at(-1), '')
  await ui.buttonText('Scegli questa cartella').props.onClick()
  assert.deepEqual(ui.chosen, [''])
})
test('Vai understands a typed ~/Documenti without requesting a literal tilde folder', async () => {
  const ui = browser()
  ui.type('~/Documenti')
  await ui.submit()
  assert.deepEqual(ui.calls, ['Documenti'])
  assert.equal(ui.input().props.value, '~/Documenti')
})
test('Vai round-trips the displayed Home without changing the requested directory', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  await ui.submit()
  assert.deepEqual(ui.calls, ['', ''])
})
test('retrying a failed Home request does not send the display-only prefix to IPC', async () => {
  const ui = browser('/tmp')
  ui.failOnce()
  await ui.button('Cartella personale sul server').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  await ui.buttonText('Riprova').props.onClick()
  assert.deepEqual(ui.calls, ['', ''])
  assert.equal(ui.input().props.value, '~/')
})
test('absolute paths are displayed and submitted without a Home prefix', async () => {
  const ui = browser('/home/server/Documenti')
  assert.equal(ui.input().props.value, '/home/server/Documenti')
  await ui.submit()
  assert.deepEqual(ui.calls, ['/home/server/Documenti'])
})
test('a real directory named ~ remains reachable rather than being confused with Home', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  await ui.buttonText('~').props.onClick()
  assert.equal(ui.input().props.value, '~/~')
  await ui.submit()
  assert.deepEqual(ui.calls, ['', '~', '~'])
  await ui.buttonText('Scegli questa cartella').props.onClick()
  assert.deepEqual(ui.chosen, ['~'])
})
test('pasted qualified Home paths retain exactly one selected-server prefix', async () => {
  const ui = browser()
  ui.type('casa:~/Documenti')
  await ui.submit()
  assert.deepEqual(ui.calls, ['Documenti'])
  assert.equal(ui.input().props.value, '~/Documenti')
})
