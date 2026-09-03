import {
  GRID_COLS,
  GRID_ROWS,
  INITIAL_TICK_MS,
  MIN_TICK_MS,
  SCORE_PER_FOOD,
  START_DIRECTION,
  TICK_STEP_MS,
  startBody,
} from './constants'
import { Snake } from './snake'
import type { Direction, GameState, Point } from './types'

export interface SnakeGameOptions {
  cols?: number
  rows?: number
  rng?: () => number
  initialBody?: Point[]
  initialDirection?: Direction
}

export class SnakeGame {
  readonly cols: number
  readonly rows: number
  private readonly rng: () => number
  private readonly initialBody: Point[]
  private readonly initialDirection: Direction
  private snake!: Snake
  private foodCell: Point | null = null
  private currentScore = 0
  private currentState: GameState = 'ready'

  constructor(options: SnakeGameOptions = {}) {
    this.cols = options.cols ?? GRID_COLS
    this.rows = options.rows ?? GRID_ROWS
    this.rng = options.rng ?? Math.random
    this.initialBody = (options.initialBody ?? startBody()).map((p) => ({ x: p.x, y: p.y }))
    this.initialDirection = options.initialDirection ?? START_DIRECTION
    this.reset()
  }

  get snakeBody(): readonly Point[] {
    return this.snake.body
  }

  get length(): number {
    return this.snake.length
  }

  get food(): Point | null {
    return this.foodCell === null ? null : { ...this.foodCell }
  }

  get score(): number {
    return this.currentScore
  }

  get state(): GameState {
    return this.currentState
  }

  get tickMs(): number {
    return Math.max(MIN_TICK_MS, INITIAL_TICK_MS - this.currentScore * TICK_STEP_MS)
  }

  reset(): void {
    this.snake = new Snake(this.initialBody, this.initialDirection)
    this.currentScore = 0
    this.currentState = 'ready'
    this.placeFood()
  }

  start(): void {
    if (this.currentState === 'ready') this.currentState = 'running'
  }

  pause(): void {
    if (this.currentState === 'running') this.currentState = 'paused'
  }

  resume(): void {
    if (this.currentState === 'paused') this.currentState = 'running'
  }

  queueDirection(direction: Direction): void {
    this.snake.queueDirection(direction)
  }

  placeFood(point?: Point): void {
    if (point !== undefined) {
      this.foodCell = { x: point.x, y: point.y }
      return
    }
    const empty: Point[] = []
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.snake.body.some((cell) => cell.x === x && cell.y === y)) {
          empty.push({ x, y })
        }
      }
    }
    if (empty.length === 0) {
      this.foodCell = null
      return
    }
    const index = Math.min(empty.length - 1, Math.floor(this.rng() * empty.length))
    this.foodCell = empty[index]
  }

  tick(): void {
    if (this.currentState !== 'running') return
    const next = this.snake.nextHead()
    if (this.hitsWall(next) || this.hitsBody(next)) {
      this.currentState = 'gameover'
      return
    }
    const ate =
      this.foodCell !== null && next.x === this.foodCell.x && next.y === this.foodCell.y
    this.snake.advance(ate)
    if (ate) {
      this.currentScore += SCORE_PER_FOOD
      this.placeFood()
      if (this.foodCell === null) this.currentState = 'gameover'
    }
  }

  private hitsWall(point: Point): boolean {
    return point.x < 0 || point.y < 0 || point.x >= this.cols || point.y >= this.rows
  }

  private hitsBody(point: Point): boolean {
    return this.snake.body.slice(0, -1).some((cell) => cell.x === point.x && cell.y === point.y)
  }
}
