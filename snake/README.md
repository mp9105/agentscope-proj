# 贪吃蛇 · Snake

一个基于 **TypeScript + Vite + Canvas** 的经典贪吃蛇 Web 小游戏，采用深色简洁 UI。

## 功能

- 方向键 / WASD 双套操作，支持快速连按的方向缓冲（防止反向自杀）
- 空格 / P 暂停与继续；游戏结束后按 空格 / 回车 或点击按钮重开
- 动态难度：每吃一个食物速度提升，节奏从 150ms/格 加快至 80ms/格 下限
- 最高分通过 localStorage 持久化
- UI 状态机：`READY → RUNNING → PAUSED → GAMEOVER`

## 开发

```bash
npm install
npm run dev      # 启动开发服务器
npm run test     # 运行单元测试（vitest）
npm run build    # 类型检查 + 产物构建到 dist/
```

## 目录结构

```
snake/
├── index.html
├── src/
│   ├── main.ts          # 入口：状态机驱动、键盘事件、循环调度
│   ├── input.ts         # 按键 → 方向映射
│   ├── renderer.ts      # Canvas 渲染
│   ├── styles.css       # 深色 UI
│   └── game/
│       ├── types.ts     # Point / Direction / GameState
│       ├── constants.ts # 网格、速度等配置
│       ├── snake.ts     # 蛇（头插尾删 + 方向缓冲队列）
│       ├── game.ts      # 游戏规则（吃食、碰撞、得分、食物生成）
│       └── game.test.ts # 单元测试
```

> 纯逻辑层（`src/game/`）不依赖 DOM，可独立单元测试。
