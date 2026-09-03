import './styles.css'
import { HIGH_SCORE_KEY } from './game/constants'
import { SnakeGame } from './game/game'
import type { GameState } from './game/types'
import { directionFromCode } from './input'
import { Renderer } from './renderer'

const game = new SnakeGame()

const canvas = document.getElementById('board') as HTMLCanvasElement
const renderer = new Renderer(canvas)

const scoreEl = document.getElementById('score') as HTMLSpanElement
const highScoreEl = document.getElementById('high-score') as HTMLSpanElement
const speedEl = document.getElementById('speed') as HTMLSpanElement
const overlay = document.getElementById('overlay') as HTMLDivElement
const overlayTitle = document.getElementById('overlay-title') as HTMLParagraphElement
const overlaySub = document.getElementById('overlay-sub') as HTMLParagraphElement
const startBtn = document.getElementById('btn-start') as HTMLButtonElement

let best = readBest()
let tickTimer: number | null = null

function readBest(): number {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

function persistBest(): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(best))
  } catch {
    // Storage unavailable (e.g. private mode) — high score just stays in memory.
  }
}

function scheduleTick(): void {
  stopTick()
  tickTimer = window.setTimeout(step, game.tickMs)
}

function stopTick(): void {
  if (tickTimer !== null) {
    window.clearTimeout(tickTimer)
    tickTimer = null
  }
}

function step(): void {
  game.tick()
  if (game.state === 'gameover' && game.score > best) {
    best = game.score
    persistBest()
  }
  syncUI()
  if (game.state === 'running') scheduleTick()
}

const OVERLAY_TEXT: Record<Exclude<GameState, 'running'>, [string, string]> = {
  ready: ['贪吃蛇', '方向键 / WASD / 空格 开始游戏'],
  paused: ['已暂停', '按 空格 / P 或点击按钮继续'],
  gameover: ['游戏结束', '得分 {score} · 最高 {best}'],
}

function syncUI(): void {
  scoreEl.textContent = String(game.score)
  highScoreEl.textContent = String(best)
  speedEl.textContent = `${game.tickMs} ms`

  const isRunning = game.state === 'running'
  overlay.classList.toggle('hidden', isRunning)
  startBtn.textContent = isRunning
    ? ''
    : game.state === 'ready'
      ? '开始游戏'
      : game.state === 'paused'
        ? '继续游戏'
        : '再来一局'
  if (!isRunning) {
    const [title, sub] = OVERLAY_TEXT[game.state]
    overlayTitle.textContent = title
    overlaySub.textContent =
      game.state === 'gameover'
        ? sub.replace('{score}', String(game.score)).replace('{best}', String(best))
        : sub
  }
  renderer.draw(game)
}

function onDirection(code: string): void {
  const dir = directionFromCode(code)
  if (dir === null) return
  if (game.state === 'ready') {
    game.start()
    game.queueDirection(dir)
    scheduleTick()
    syncUI()
  } else if (game.state === 'running') {
    game.queueDirection(dir)
  }
}

function onPrimaryAction(): void {
  if (game.state === 'ready') {
    game.start()
    scheduleTick()
  } else if (game.state === 'running') {
    game.pause()
    stopTick()
  } else if (game.state === 'paused') {
    game.resume()
    scheduleTick()
  } else if (game.state === 'gameover') {
    game.reset()
    game.start()
    scheduleTick()
  }
  syncUI()
}

window.addEventListener('keydown', (event) => {
  if (event.repeat) return
  if (directionFromCode(event.code) !== null) {
    event.preventDefault()
    onDirection(event.code)
    return
  }
  if (event.code === 'KeyP') {
    if (game.state === 'running' || game.state === 'paused') {
      event.preventDefault()
      onPrimaryAction()
    }
    return
  }
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault()
    onPrimaryAction()
  }
})

startBtn.addEventListener('click', onPrimaryAction)

syncUI()
