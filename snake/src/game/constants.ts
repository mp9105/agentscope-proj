import type { Direction, Point } from './types'

export const GRID_COLS = 24
export const GRID_ROWS = 24
export const CELL_SIZE = 20

export const INITIAL_TICK_MS = 150
export const MIN_TICK_MS = 80
export const TICK_STEP_MS = 2

export const START_DIRECTION: Direction = 'right'

export const SCORE_PER_FOOD = 1
export const HIGH_SCORE_KEY = 'snake.high-score'

export function startBody(): Point[] {
  return [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
    { x: 5, y: 12 },
  ]
}
