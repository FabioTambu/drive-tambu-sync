import type { WindowMode } from '../shared/types'
export type Bounds = { x: number; y: number; width: number; height: number }

export function layoutBounds(mode: WindowMode, area: Bounds): Bounds {
  const margin = Math.min(16, Math.floor(Math.min(area.width, area.height) / 10))
  const width = Math.min(mode === 'compact' ? 430 : 1180, area.width - margin * 2)
  const height = Math.min(mode === 'compact' ? 650 : 800, area.height - margin * 2)
  return {
    width, height,
    x: mode === 'compact' ? area.x + area.width - width - margin : area.x + Math.floor((area.width - width) / 2),
    y: mode === 'compact' ? area.y + area.height - height - margin : area.y + Math.floor((area.height - height) / 2)
  }
}
