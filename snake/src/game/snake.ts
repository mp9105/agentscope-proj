import type { Direction, Point } from './types'

const DELTA: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const MAX_PENDING_TURNS = 2

export class Snake {
  readonly body: Point[]
  private dir: Direction
  private readonly pending: Direction[] = []

  constructor(body: Point[], direction: Direction) {
    this.body = body.map((p) => ({ x: p.x, y: p.y }))
    this.dir = direction
  }

  get head(): Point {
    return this.body[0]
  }

  get direction(): Direction {
    return this.dir
  }

  get length(): number {
    return this.body.length
  }

  peekNextDirection(): Direction {
    return this.pending.length > 0 ? this.pending[0] : this.dir
  }

  queueDirection(direction: Direction): void {
    const last = this.pending.length > 0 ? this.pending[this.pending.length - 1] : this.dir
    if (direction === last || OPPOSITE[direction] === last) return
    if (this.pending.length >= MAX_PENDING_TURNS) return
    this.pending.push(direction)
  }

  nextHead(): Point {
    const delta = DELTA[this.peekNextDirection()]
    return { x: this.head.x + delta.x, y: this.head.y + delta.y }
  }

  advance(grow: boolean): Point | null {
    if (this.pending.length > 0) this.dir = this.pending.shift()!
    const delta = DELTA[this.dir]
    this.body.unshift({ x: this.head.x + delta.x, y: this.head.y + delta.y })
    if (grow) return null
    return this.body.pop() ?? null
  }
}
