<template>
  <canvas
    ref="canvasRef"
    class="ice-canvas"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0
let rafId = 0

let lastActivity = Date.now()
const IDLE_THRESHOLD = 3000
let iceProgress = 0
let isIdle = false

// 雪堆高度图（每列一个高度值，单位：像素）
let snowHeight: Float32Array = new Float32Array(0)
let snowCols = 0
const SNOW_COL_W = 3

// 空中雪花
interface Snowflake {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  wobble: number
  wobbleSpeed: number
}
let snowflakes: Snowflake[] = []

// 冰晶（装饰）
interface IceCrystal {
  x: number
  y: number
  size: number
  rotation: number
  rotSpeed: number
  alpha: number
}
let crystals: IceCrystal[] = []

// 边缘冰霜
interface FrostEdge {
  side: 'top' | 'bottom' | 'left' | 'right'
  offset: number
  height: number
  alpha: number
  phase: number
}
let frostEdges: FrostEdge[] = []

// 边缘冰晶
interface EdgeCrystal {
  x: number
  y: number
  size: number
  rotation: number
  rotSpeed: number
  side: 'top' | 'bottom' | 'left' | 'right'
  alpha: number
  phase: number
}
let edgeCrystals: EdgeCrystal[] = []

// 冷风小雪花（始终可见）
interface WindSnow {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  side: 'top' | 'left' | 'right'
}
let windSnow: WindSnow[] = []

// 雪粒子（堆积时的小碎屑）
interface SnowParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
}
let snowParticles: SnowParticle[] = []

function initSnowHeight() {
  snowCols = Math.ceil(W / SNOW_COL_W)
  snowHeight = new Float32Array(snowCols)
}

function initSnowflakes() {
  snowflakes = []
  const count = 300
  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake(
      Math.random() * W,
      Math.random() * H
    ))
  }
}

function createSnowflake(x: number, y: number, size?: number): Snowflake {
  const s = size ?? 2 + Math.random() * 5
  return {
    x,
    y,
    vx: 0,
    vy: 1 + Math.random() * 2.5,
    size: s,
    alpha: 0,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.04
  }
}

function initCrystals() {
  crystals = []
  for (let i = 0; i < 20; i++) {
    crystals.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 10 + Math.random() * 25,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.003,
      alpha: 0
    })
  }
}

function initFrostEdges() {
  frostEdges = [
    { side: 'top', offset: 0, height: 30, alpha: 0.8, phase: 0 },
    { side: 'bottom', offset: 0, height: 40, alpha: 0.9, phase: 0.5 },
    { side: 'left', offset: 0, height: 25, alpha: 0.7, phase: 1 },
    { side: 'right', offset: 0, height: 25, alpha: 0.7, phase: 1.5 },
  ]
}

function initEdgeCrystals() {
  edgeCrystals = []
  const count = 12
  for (let i = 0; i < count; i++) {
    const side = (['top', 'bottom', 'left', 'right'] as const)[Math.floor(Math.random() * 4)]
    let x = 0, y = 0
    if (side === 'top') {
      x = Math.random() * W
      y = Math.random() * 30
    } else if (side === 'bottom') {
      x = Math.random() * W
      y = H - Math.random() * 40
    } else if (side === 'left') {
      x = Math.random() * 40
      y = Math.random() * H
    } else {
      x = W - Math.random() * 40
      y = Math.random() * H
    }
    edgeCrystals.push({
      x, y,
      size: 8 + Math.random() * 15,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      side,
      alpha: 0.6 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2
    })
  }
}

function initWindSnow() {
  windSnow = []
  const count = 40
  for (let i = 0; i < count; i++) {
    const side = (['top', 'left', 'right'] as const)[Math.floor(Math.random() * 3)]
    let x = 0, y = 0, vx = 0, vy = 0
    if (side === 'top') {
      x = Math.random() * W
      y = Math.random() * H
      vx = (Math.random() - 0.3) * 1.5
      vy = 0.5 + Math.random() * 1
    } else if (side === 'left') {
      x = Math.random() * W
      y = Math.random() * H
      vx = 0.5 + Math.random() * 1
      vy = Math.random() * 0.5
    } else {
      x = Math.random() * W
      y = Math.random() * H
      vx = -(0.5 + Math.random() * 1)
      vy = Math.random() * 0.5
    }
    windSnow.push({
      x, y, vx, vy,
      size: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.4,
      side
    })
  }
}

function getSnowSurfaceY(x: number): number {
  const col = Math.floor(x / SNOW_COL_W)
  if (col < 0 || col >= snowCols) return H
  return H - snowHeight[col]
}

function addSnowAt(x: number, y: number, amount: number) {
  const col = Math.floor(x / SNOW_COL_W)
  if (col < 0 || col >= snowCols) return

  // 向周围几列扩散，形成柔和的堆
  const spread = 3
  for (let dx = -spread; dx <= spread; dx++) {
    const c = col + dx
    if (c < 0 || c >= snowCols) continue
    const dist = Math.abs(dx)
    const factor = Math.max(0.3, 1 - dist * 0.25)
    snowHeight[c] = Math.min(H, snowHeight[c] + amount * factor)
  }

  // 堆积时产生小碎屑粒子
  for (let i = 0; i < 2; i++) {
    snowParticles.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 0.5,
      size: 1 + Math.random() * 2,
      life: 1
    })
  }
}

function settleSnow() {
  // 雪的重力沉降 - 让雪堆更平滑
  for (let iter = 0; iter < 2; iter++) {
    for (let x = 1; x < snowCols - 1; x++) {
      const l = snowHeight[x - 1]
      const r = snowHeight[x + 1]
      const c = snowHeight[x]
      const diff = Math.abs(c - Math.max(l, r))
      if (diff > SNOW_COL_W * 2) {
        // 高处的雪向低处滑
        const settle = diff * 0.15
        if (c > l && c > r) {
          snowHeight[x] -= settle
          const dir = l > r ? -1 : 1
          const target = dir === -1 ? x - 1 : x + 1
          snowHeight[target] += settle * 0.6
        }
      }
    }
  }
}

function drawSnowflake(s: Snowflake) {
  if (!ctx || s.alpha <= 0) return
  ctx!.beginPath()
  ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
  ctx!.fillStyle = `rgba(245, 252, 255, ${s.alpha})`
  ctx!.shadowColor = `rgba(200, 230, 255, ${s.alpha * 0.8})`
  ctx!.shadowBlur = s.size * 1.5
  ctx!.fill()
  ctx!.shadowBlur = 0
}

function drawSnowParticles() {
  if (!ctx) return
  for (let i = snowParticles.length - 1; i >= 0; i--) {
    const p = snowParticles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15
    p.life -= 0.03

    if (p.life <= 0) {
      snowParticles.splice(i, 1)
      continue
    }

    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(240, 250, 255, ${p.life * 0.8})`
    ctx!.fill()
  }
}

function drawSnowPile() {
  if (!ctx) return

  // 检查是否有雪
  let maxH = 0
  for (let i = 0; i < snowCols; i++) {
    if (snowHeight[i] > maxH) maxH = snowHeight[i]
  }
  if (maxH < 1) return

  // 计算当前冰面覆盖百分比
  const coverage = maxH / H

  // 基础雪色
  const baseColor = `rgba(240, 248, 255, `
  const shadowColor = `rgba(180, 210, 240, `
  const highlightColor = `rgba(255, 255, 255, `

  // 绘制雪堆 - 填充多边形
  ctx.beginPath()
  ctx.moveTo(0, H)
  for (let x = 0; x < snowCols; x++) {
    const y = H - snowHeight[x]
    ctx.lineTo(x * SNOW_COL_W, y)
  }
  ctx.lineTo(W, H)
  ctx.closePath()

  // 雪的渐变填充
  const grad = ctx.createLinearGradient(0, H - maxH, 0, H)
  grad.addColorStop(0, `rgba(255, 255, 255, ${0.9})`)
  grad.addColorStop(0.3, `rgba(240, 248, 255, ${0.95})`)
  grad.addColorStop(1, `rgba(200, 225, 250, ${1})`)
  ctx.fillStyle = grad
  ctx.fill()

  // 雪面高光
  if (maxH > 20) {
    ctx.beginPath()
    ctx.moveTo(0, H)
    for (let x = 0; x < snowCols; x++) {
      const y = H - snowHeight[x]
      ctx.lineTo(x * SNOW_COL_W, y - 2)
    }
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.5, coverage * 0.8)})`
    ctx.fill()
  }

  // 雪面阴影线（层次感）
  if (maxH > 40) {
    ctx.beginPath()
    for (let x = 0; x < snowCols; x++) {
      const y = H - snowHeight[x]
      if (x === 0) ctx.moveTo(x * SNOW_COL_W, y + 3)
      else ctx.lineTo(x * SNOW_COL_W, y + 3)
    }
    ctx.strokeStyle = `rgba(170, 200, 230, ${Math.min(0.3, coverage * 0.5)})`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 当快覆盖全屏时，增加蓝色调
  if (coverage > 0.7) {
    const blueAlpha = (coverage - 0.7) * 1.5
    ctx.fillStyle = `rgba(180, 210, 240, ${blueAlpha * 0.3})`
    ctx.fillRect(0, 0, W, H)
  }

  // 完全覆盖时的冰面效果
  if (coverage > 0.95) {
    const iceAlpha = (coverage - 0.95) * 20
    ctx.fillStyle = `rgba(220, 240, 255, ${Math.min(0.3, iceAlpha)})`
    ctx.fillRect(0, 0, W, H)
  }
}

function drawCrystal(c: IceCrystal) {
  if (!ctx || c.alpha <= 0) return
  ctx.save()
  ctx.translate(c.x, c.y)
  ctx.rotate(c.rotation)
  ctx.globalAlpha = c.alpha * iceProgress

  ctx.strokeStyle = 'rgba(200, 230, 255, 1)'
  ctx.lineWidth = 1
  ctx.shadowColor = 'rgba(180, 220, 255, 0.8)'
  ctx.shadowBlur = 6

  const arms = 6
  for (let i = 0; i < arms; i++) {
    const angle = (Math.PI * 2 * i) / arms
    const ex = Math.cos(angle) * c.size
    const ey = Math.sin(angle) * c.size
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(ex, ey)
    ctx.stroke()

    const bx = Math.cos(angle) * c.size * 0.6
    const by = Math.sin(angle) * c.size * 0.6
    for (const dir of [-1, 1]) {
      const ba = angle + dir * 0.35
      const bl = c.size * 0.35
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl)
      ctx.stroke()
    }
  }

  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawFrostEdge(f: FrostEdge) {
  if (!ctx) return
  const pulse = Math.sin(f.phase) * 0.15 + 1

  ctx.save()
  ctx.globalAlpha = f.alpha * pulse

  const grad = ctx.createLinearGradient(0, 0, 0, f.height * pulse)
  grad.addColorStop(0, 'rgba(200, 230, 255, 0.9)')
  grad.addColorStop(0.3, 'rgba(180, 220, 255, 0.6)')
  grad.addColorStop(0.7, 'rgba(150, 200, 240, 0.3)')
  grad.addColorStop(1, 'rgba(150, 200, 240, 0)')

  ctx.fillStyle = grad

  if (f.side === 'top') {
    ctx.fillRect(0, 0, W, f.height * pulse)
  } else if (f.side === 'bottom') {
    const grad2 = ctx.createLinearGradient(0, H - f.height * pulse, 0, H)
    grad2.addColorStop(0, 'rgba(150, 200, 240, 0)')
    grad2.addColorStop(0.3, 'rgba(150, 200, 240, 0.3)')
    grad2.addColorStop(0.7, 'rgba(180, 220, 255, 0.6)')
    grad2.addColorStop(1, 'rgba(200, 230, 255, 0.9)')
    ctx.fillStyle = grad2
    ctx.fillRect(0, H - f.height * pulse, W, f.height * pulse)
  } else if (f.side === 'left') {
    const grad3 = ctx.createLinearGradient(0, 0, f.height * pulse, 0)
    grad3.addColorStop(0, 'rgba(200, 230, 255, 0.9)')
    grad3.addColorStop(0.3, 'rgba(180, 220, 255, 0.6)')
    grad3.addColorStop(0.7, 'rgba(150, 200, 240, 0.3)')
    grad3.addColorStop(1, 'rgba(150, 200, 240, 0)')
    ctx.fillStyle = grad3
    ctx.fillRect(0, 0, f.height * pulse, H)
  } else {
    const grad4 = ctx.createLinearGradient(W - f.height * pulse, 0, W, 0)
    grad4.addColorStop(0, 'rgba(150, 200, 240, 0)')
    grad4.addColorStop(0.3, 'rgba(150, 200, 240, 0.3)')
    grad4.addColorStop(0.7, 'rgba(180, 220, 255, 0.6)')
    grad4.addColorStop(1, 'rgba(200, 230, 255, 0.9)')
    ctx.fillStyle = grad4
    ctx.fillRect(W - f.height * pulse, 0, f.height * pulse, H)
  }

  ctx.restore()
}

function drawEdgeCrystal(c: EdgeCrystal) {
  if (!ctx || c.alpha <= 0) return
  ctx.save()
  ctx.translate(c.x, c.y)
  ctx.rotate(c.rotation)
  ctx.globalAlpha = c.alpha * (0.7 + Math.sin(c.phase) * 0.3)

  ctx.strokeStyle = 'rgba(180, 220, 255, 1)'
  ctx.lineWidth = 1
  ctx.shadowColor = 'rgba(150, 200, 240, 0.8)'
  ctx.shadowBlur = 8

  const arms = 6
  for (let i = 0; i < arms; i++) {
    const angle = (Math.PI * 2 * i) / arms
    const ex = Math.cos(angle) * c.size
    const ey = Math.sin(angle) * c.size
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(ex, ey)
    ctx.stroke()

    const bx = Math.cos(angle) * c.size * 0.5
    const by = Math.sin(angle) * c.size * 0.5
    for (const dir of [-1, 1]) {
      const ba = angle + dir * 0.4
      const bl = c.size * 0.3
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl)
      ctx.stroke()
    }
  }

  // 中心闪光点
  ctx.beginPath()
  ctx.arc(0, 0, 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.shadowBlur = 6
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawWindSnow(w: WindSnow) {
  if (!ctx || w.alpha <= 0) return
  ctx.beginPath()
  ctx.arc(w.x, w.y, w.size, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(220, 240, 255, ${w.alpha})`
  ctx.shadowColor = `rgba(180, 220, 255, ${w.alpha * 0.6})`
  ctx.shadowBlur = 3
  ctx.fill()
  ctx.shadowBlur = 0
}

function clearSnowAt(x: number, y: number) {
  // 清除附近的雪
  const radius = 100
  const col = Math.floor(x / SNOW_COL_W)
  for (let dx = -radius; dx <= radius; dx += SNOW_COL_W) {
    const c = col + Math.floor(dx / SNOW_COL_W)
    if (c < 0 || c >= snowCols) continue
    const dist = Math.abs(dx)
    if (dist < radius) {
      const decay = Math.max(0, 1 - dist / radius)
      snowHeight[c] = Math.max(0, snowHeight[c] - 120 * decay)
    }
  }

  // 让附近的雪花重新飘落
  snowflakes.forEach(s => {
    const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2)
    if (dist < 150) {
      s.y = y - 20 - Math.random() * 40
      s.vy = 0.5 + Math.random() * 1.5
      s.alpha = Math.min(1, s.alpha + 0.3)
    }
  })
}

function animate() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  const elapsed = Date.now() - lastActivity
  isIdle = elapsed > IDLE_THRESHOLD

  if (isIdle) {
    iceProgress = Math.min(1, iceProgress + 0.008)
  } else {
    iceProgress = Math.max(0, iceProgress - 0.04)
  }

  // 积雪沉降
  if (isIdle && iceProgress > 0.2) {
    settleSnow()
  }

  // 更新雪花
  const targetCount = isIdle ? 350 : 80
  const snowAlpha = isIdle ? Math.min(1, iceProgress * 2) : iceProgress

  for (let i = snowflakes.length - 1; i >= 0; i--) {
    const s = snowflakes[i]
    s.wobble += s.wobbleSpeed
    s.x += Math.sin(s.wobble) * 0.5 + s.vx
    s.y += s.vy

    // 检查是否落到雪面
    const surfaceY = getSnowSurfaceY(s.x)
    if (s.y >= surfaceY) {
      // 堆积
      addSnowAt(s.x, surfaceY, s.size * 1.2)
      snowflakes.splice(i, 1)
      continue
    }

    // 超出屏幕
    if (s.y > H + 50) {
      snowflakes.splice(i, 1)
      continue
    }

    s.alpha = snowAlpha * (0.5 + Math.random() * 0.5)
    drawSnowflake(s)
  }

  // 补充雪花
  while (snowflakes.length < targetCount) {
    snowflakes.push(createSnowflake(
      Math.random() * W,
      -10 - Math.random() * 50
    ))
  }

  // 绘制雪粒子
  drawSnowParticles()

  // 绘制边缘冰霜（始终可见）
  frostEdges.forEach(f => {
    f.phase += 0.02
    drawFrostEdge(f)
  })

  // 绘制边缘冰晶（始终可见）
  edgeCrystals.forEach(c => {
    c.rotation += c.rotSpeed
    c.phase += 0.03
    drawEdgeCrystal(c)
  })

  // 更新和绘制冷风小雪花（始终可见）
  windSnow.forEach(w => {
    w.x += w.vx
    w.y += w.vy

    // 重置超出的雪花
    if (w.side === 'top' && w.y > H + 10) {
      w.x = Math.random() * W
      w.y = -5
    } else if (w.side === 'left' && w.x > W + 10) {
      w.x = -5
      w.y = Math.random() * H
    } else if (w.side === 'right' && w.x < -10) {
      w.x = W + 5
      w.y = Math.random() * H
    }

    drawWindSnow(w)
  })

  // 绘制雪堆
  drawSnowPile()

  // 绘制冰晶
  crystals.forEach(c => {
    c.rotation += c.rotSpeed
    if (isIdle && iceProgress > 0.1) {
      c.alpha = Math.min(iceProgress, c.alpha + 0.015)
    } else if (!isIdle) {
      c.alpha = Math.max(0, c.alpha - 0.05)
    }
    if (c.alpha > 0) drawCrystal(c)
  })

  rafId = requestAnimationFrame(animate)
}

function onActivity() {
  lastActivity = Date.now()
}

const INTERACTIVE_SELECTORS = 'input, button, textarea, select, a, label, [role="button"], [contenteditable]'

function onGlobalClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target) return

  if (target.closest(INTERACTIVE_SELECTORS)) {
    onActivity()
    return
  }

  const x = e.clientX
  const y = e.clientY
  clearSnowAt(x, y)
  onActivity()
}

function init() {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  W = canvasRef.value.width = window.innerWidth
  H = canvasRef.value.height = window.innerHeight
  initSnowHeight()
  initSnowflakes()
  initCrystals()
  initFrostEdges()
  initEdgeCrystals()
  initWindSnow()
}

onMounted(() => {
  init()
  animate()

  window.addEventListener('resize', () => { init() })
  window.addEventListener('mousemove', onActivity)
  window.addEventListener('click', onGlobalClick)
  window.addEventListener('keydown', onActivity)
  window.addEventListener('touchstart', onActivity)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', onActivity)
  window.removeEventListener('click', onGlobalClick)
  window.removeEventListener('keydown', onActivity)
  window.removeEventListener('touchstart', onActivity)
})
</script>

<style scoped>
.ice-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
}
</style>
