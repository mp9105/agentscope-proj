import { describe, expect, it } from 'vitest'
import { INITIAL_TICK_MS, TICK_STEP_MS } from './constants'
import { SnakeGame } from './game'
import { Snake } from './snake'
import type { Point } from './types'

function cells(list: Array<[number, number]>): Point[] {
  return list.map(([x, y]) => ({ x, y }))
}

function findCell(body: readonly Point[], x: number, y: number): boolean {
  return body.some((cell) => cell.x === x && cell.y === y)
}

describe('Snake', () => {
  it('ignores a direction that would reverse into the body', () => {
    const snake = new Snake(cells([[5, 5], [4, 5], [3, 5]]), 'right')
    snake.queueDirection('left')
    expect(snake.peekNextDirection()).toBe('right')
    expect(snake.nextHead()).toEqual({ x: 6, y: 5 })
  })

  it('buffers two consecutive turns in the order they were pressed', () => {
    const snake = new Snake(cells([[5, 5], [4, 5], [3, 5]]), 'right')
    snake.queueDirection('up')
    snake.queueDirection('left')
    expect(snake.peekNextDirection()).toBe('up')
    expect(snake.nextHead()).toEqual({ x: 5, y: 4 })
    snake.advance(false)
    expect(snake.direction).toBe('up')
    expect(snake.peekNextDirection()).toBe('left')
    expect(snake.nextHead()).toEqual({ x: 4, y: 4 })
  })

  it('drops directions after the pending queue is full', () => {
    const snake = new Snake(cells([[5, 5], [4, 5], [3, 5]]), 'right')
    snake.queueDirection('up')
    snake.queueDirection('left')
    snake.queueDirection('down')
    expect(snake.peekNextDirection()).toBe('up')
    snake.advance(false)
    expect(snake.peekNextDirection()).toBe('left')
    snake.advance(false)
    expect(snake.peekNextDirection()).toBe('left')
  })

  it('grows instead of dropping the tail when told to', () => {
    const snake = new Snake(cells([[5, 5], [4, 5], [3, 5]]), 'right')
    expect(snake.advance(true)).toBeNull()
    expect(snake.length).toBe(4)
    expect(snake.advance(false)).toEqual({ x: 3, y: 5 })
    expect(snake.length).toBe(4)
  })
})

describe('SnakeGame', () => {
  it('starts in ready state with a score of zero and food off the snake', () => {
    const game = new SnakeGame({ rng: () => 0 })
    expect(game.state).toBe('ready')
    expect(game.score).toBe(0)
    expect(game.length).toBe(4)
    const food = game.food
    expect(food).not.toBeNull()
    expect(food!.x).toBeGreaterThanOrEqual(0)
    expect(food!.x).toBeLessThan(game.cols)
    expect(food!.y).toBeGreaterThanOrEqual(0)
    expect(food!.y).toBeLessThan(game.rows)
    expect(findCell(game.snakeBody, food!.x, food!.y)).toBe(false)
  })

  it('does not move while ready or paused', () => {
    const game = new SnakeGame()
    game.tick()
    expect(game.snakeBody[0]).toEqual({ x: 8, y: 12 })
    game.start()
    game.tick()
    expect(game.snakeBody[0]).toEqual({ x: 9, y: 12 })
    game.pause()
    expect(game.state).toBe('paused')
    game.tick()
    expect(game.snakeBody[0]).toEqual({ x: 9, y: 12 })
    game.resume()
    game.tick()
    expect(game.snakeBody[0]).toEqual({ x: 10, y: 12 })
  })

  it('eats food: grows, scores, and speeds up', () => {
    const game = new SnakeGame()
    game.placeFood({ x: 9, y: 12 })
    game.start()
    game.tick()
    expect(game.score).toBe(1)
    expect(game.length).toBe(5)
    expect(game.snakeBody[0]).toEqual({ x: 9, y: 12 })
    expect(game.tickMs).toBe(INITIAL_TICK_MS - TICK_STEP_MS)

    game.placeFood({ x: 10, y: 12 })
    game.tick()
    expect(game.score).toBe(2)
    expect(game.length).toBe(6)
    expect(game.tickMs).toBe(INITIAL_TICK_MS - 2 * TICK_STEP_MS)
  })

  it('dies when hitting the wall', () => {
    const game = new SnakeGame({ rng: () => 0 })
    game.start()
    let guard = 0
    while (game.state === 'running' && guard < 40) {
      game.tick()
      guard++
    }
    expect(game.state).toBe('gameover')
    expect(game.score).toBe(0)
  })

  it('dies when running into its own body', () => {
    const body = cells([
      [5, 5], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5],
    ])
    const game = new SnakeGame({ initialBody: body, initialDirection: 'left' })
    game.start()
    game.tick()
    expect(game.state).toBe('gameover')
    expect(game.length).toBe(8)
  })

  it('may move into the cell the tail is about to vacate', () => {
    const body = cells([
      [5, 5], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5],
    ])
    const game = new SnakeGame({ initialBody: body, initialDirection: 'right' })
    game.start()
    game.tick()
    expect(game.state).toBe('running')
    expect(game.snakeBody[0]).toEqual({ x: 6, y: 5 })
    expect(game.length).toBe(8)
  })

  it('restarts into a fresh round after game over', () => {
    const game = new SnakeGame({ rng: () => 0 })
    game.start()
    let guard = 0
    while (game.state === 'running' && guard < 40) {
      game.tick()
      guard++
    }
    expect(game.state).toBe('gameover')
    game.reset()
    expect(game.state).toBe('ready')
    expect(game.score).toBe(0)
    expect(game.length).toBe(4)
  })
})
