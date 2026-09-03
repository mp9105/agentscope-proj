export interface Point {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameState = 'ready' | 'running' | 'paused' | 'gameover'
