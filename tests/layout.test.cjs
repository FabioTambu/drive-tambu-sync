const { test } = require('node:test')
const assert = require('node:assert/strict')
test('compact panel stays above the taskbar within a monitor work area', () => {
  const { layoutBounds } = require('../src/main/window-layout.ts')
  const b = layoutBounds('compact', { x: 0, y: 0, width: 1920, height: 1040 })
  assert.equal(b.width, 430)
  assert.equal(b.x + b.width, 1904)
  assert.equal(b.y + b.height, 1024)
})
test('layout supports small monitors and negative monitor coordinates', () => {
  const { layoutBounds } = require('../src/main/window-layout.ts')
  for (const mode of ['compact', 'expanded']) {
    const a = { x: -800, y: -100, width: 800, height: 500 }
    const b = layoutBounds(mode, a)
    assert.ok(b.x >= a.x && b.y >= a.y)
    assert.ok(b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height)
  }
})
