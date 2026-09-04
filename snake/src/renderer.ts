import { CELL_SIZE, GRID_COLS, GRID_ROWS } from './game/constants'
import type { SnakeGame } from './game/game'

const BG = '#0b0e14'
const GRID_LINE = 'rgba(255, 255, 255, 0.045)'
const BORDER = 'rgba(255, 255, 255, 0.1)'
const FOOD = '#fb7185'
const HEAD = '#4ade80'
const TAIL_LIGHTNESS = 26

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = GRID_COLS * CELL_SIZE
    const height = GRID_ROWS * CELL_SIZE
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = '100%'
    canvas.style.maxWidth = `${width}px`
    canvas.style.height = 'auto'
    const ctx = canvas.getContext('2d')
    if (ctx === null) throw new Error('Canvas 2D context is unavailable')
    ctx.scale(dpr, dpr)
    this.ctx = ctx
  }

  draw(game: SnakeGame): void {
    this.drawBackground()
    const food = game.food
    if (food !== null) this.drawFood(food.x, food.y)
    this.drawSnake(game)
  }

  private drawBackground(): void {
    const { ctx } = this
    const width = GRID_COLS * CELL_SIZE
    const height = GRID_ROWS * CELL_SIZE
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = GRID_LINE
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 1; x < GRID_COLS; x++) {
      ctx.moveTo(x * CELL_SIZE + 0.5, 0)
      ctx.lineTo(x * CELL_SIZE + 0.5, height)
    }
    for (let y = 1; y < GRID_ROWS; y++) {
      ctx.moveTo(0, y * CELL_SIZE + 0.5)
      ctx.lineTo(width, y * CELL_SIZE + 0.5)
    }
    ctx.stroke()
    ctx.strokeStyle = BORDER
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
  }

  private drawFood(x: number, y: number): void {
    const { ctx } = this
    const centerX = x * CELL_SIZE + CELL_SIZE / 2
    const centerY = y * CELL_SIZE + CELL_SIZE / 2
    ctx.fillStyle = FOOD
    ctx.beginPath()
    ctx.arc(centerX, centerY, CELL_SIZE * 0.34, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.beginPath()
    ctx.arc(centerX - CELL_SIZE * 0.12, centerY - CELL_SIZE * 0.12, CELL_SIZE * 0.09, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawSnake(game: SnakeGame): void {
    const { ctx } = this
    const body = game.snakeBody
    for (let i = body.length - 1; i >= 0; i--) {
      const cell = body[i]
      const inset = i === 0 ? 1 : 2.5
      const x = cell.x * CELL_SIZE + inset
      const y = cell.y * CELL_SIZE + inset
      const size = CELL_SIZE - inset * 2
      ctx.fillStyle =
        i === 0
          ? HEAD
          : `hsl(143, 62%, ${Math.max(TAIL_LIGHTNESS, Math.round(44 - (i / Math.max(1, body.length - 1)) * 18))}%)`
      this.roundRectPath(x, y, size, size, Math.min(6, size / 3))
      ctx.fill()
    }
  }

  private roundRectPath(x: number, y: number, width: number, height: number, radius: number): void {
    const { ctx } = this
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + width - r, y)
    ctx.arcTo(x + width, y, x + width, y + r, r)
    ctx.lineTo(x + width, y + height - r)
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
    ctx.lineTo(x + r, y + height)
    ctx.arcTo(x, y + height, x, y + height - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
}
