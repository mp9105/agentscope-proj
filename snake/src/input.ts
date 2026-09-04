import type { Direction } from './game/types'

const CODE_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
}

export function directionFromCode(code: string): Direction | null {
  return CODE_DIRECTION[code] ?? null
}
