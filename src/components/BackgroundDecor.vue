<template>
  <Teleport to="body">
    <canvas ref="canvasRef" class="bg-decor-canvas" aria-hidden="true"></canvas>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0, dpr = 1
let rafId = 0
let running = false

type ThemeKey = 'pink' | 'white' | 'black'
let theme: ThemeKey = 'white'

function getTheme(): ThemeKey {
  const k = document.documentElement.dataset.theme
  if (k === 'pink' || k === 'white' || k === 'black') return k
  return 'white'
}

// ============== 粉色：樱花飘落 ==============
interface Petal {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  rotSpeed: number
  sway: number
  swaySpeed: number
  swayBase: number
  alpha: number
}
let petals: Petal[] = []

function spawnPetal(fromSide = false): Petal {
  return {
    x: fromSide ? (Math.random() < 0.5 ? -20 : W + 20) : Math.random() * W,
    y: -20 - Math.random() * H * 0.3,
    vx: (Math.random() - 0.3) * 0.8,
    vy: 0.8 + Math.random() * 1.4,
    size: 8 + Math.random() * 10,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.015,
    swayBase: 0.5 + Math.random() * 1.2,
    alpha: 0.7 + Math.random() * 0.3,
  }
}

function drawPetal(p: Petal) {
  if (!ctx) return
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.globalAlpha = p.alpha
  // 五瓣樱花
  const s = p.size
  ctx.fillStyle = '#ffb8d0'
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.ellipse(0, -s * 0.55, s * 0.28, s * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  // 花蕊
  ctx.fillStyle = '#ff85a6'
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function stepPetal(p: Petal): boolean {
  p.sway += p.swaySpeed
  p.x += p.vx + Math.sin(p.sway) * p.swayBase
  p.y += p.vy
  p.rot += p.rotSpeed
  p.vy += 0.005
  return p.y < H + 40 && p.x > -50 && p.x < W + 50
}

// ============== 白色：柔和浮动光点 ==============
interface Dust {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
  alpha: number
}
let dusts: Dust[] = []

function spawnDust(): Dust {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.2,
    vy: -0.1 - Math.random() * 0.2,
    size: 1.5 + Math.random() * 3.5,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.1 + Math.random() * 0.4,
  }
}

function stepDust(d: Dust): boolean {
  d.phase += 0.01
  d.x += d.vx + Math.sin(d.phase) * 0.15
  d.y += d.vy
  if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W }
  return true
}

function drawDust(d: Dust) {
  if (!ctx) return
  const a = d.alpha * (0.6 + 0.4 * Math.sin(d.phase * 2))
  ctx.save()
  ctx.globalAlpha = a
  const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 2.5)
  grad.addColorStop(0, 'rgba(180,195,230,1)')
  grad.addColorStop(1, 'rgba(180,195,230,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(d.x, d.y, d.size * 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(240,245,255,1)'
  ctx.beginPath()
  ctx.arc(d.x, d.y, d.size * 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// ============== 黑色：星空闪烁 + 流星 ==============
interface Star {
  x: number
  y: number
  size: number
  phase: number
  speed: number
}
let stars: Star[] = []

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
}
let meteors: Meteor[] = []
let meteorTimer = 0

function spawnStars() {
  stars = []
  const count = Math.floor((W * H) / 12000)
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.6 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
    })
  }
}

function spawnMeteor() {
  const fromLeft = Math.random() < 0.5
  const y = Math.random() * H * 0.4
  meteors.push({
    x: fromLeft ? -20 : W + 20,
    y,
    vx: fromLeft ? (6 + Math.random() * 3) : -(6 + Math.random() * 3),
    vy: 2 + Math.random() * 1.5,
    life: 0,
    max: 80 + Math.random() * 40,
  })
}

function drawStars() {
  if (!ctx) return
  for (const s of stars) {
    s.phase += s.speed
    const twinkle = 0.5 + 0.5 * Math.sin(s.phase)
    ctx.save()
    ctx.globalAlpha = 0.5 + 0.5 * twinkle
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawMeteors() {
  if (!ctx) return
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]
    m.x += m.vx
    m.y += m.vy
    m.life++
    const prog = m.life / m.max
    const alpha = prog < 0.1 ? prog / 0.1 : prog > 0.9 ? (1 - prog) / 0.1 : 1
    // 拖尾
    const tailLen = 60
    const tailX = m.x - m.vx * (tailLen / 7)
    const tailY = m.y - m.vy * (tailLen / 7)
    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
    grad.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`)
    grad.addColorStop(0.5, `rgba(180,200,255,${0.5 * alpha})`)
    grad.addColorStop(1, 'rgba(180,200,255,0)')
    ctx.strokeStyle = grad
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
    // 头部
    ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`
    ctx.beginPath()
    ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2)
    ctx.fill()

    if (m.life >= m.max) meteors.splice(i, 1)
  }
  meteorTimer++
  if (meteorTimer > 160 + Math.random() * 260) {
    spawnMeteor()
    meteorTimer = 0
  }
}

// ============== 主循环 ==============
function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth
  H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  // 重新生成粒子
  if (theme === 'black') spawnStars()
}

function ensureCount() {
  if (theme === 'pink') {
    const target = Math.min(70, Math.floor(W * H / 18000))
    while (petals.length < target) petals.push(spawnPetal(Math.random() < 0.4))
  } else if (theme === 'white') {
    const target = Math.min(60, Math.floor(W * H / 22000))
    while (dusts.length < target) dusts.push(spawnDust())
  }
}

function switchTheme(t: ThemeKey) {
  if (t === theme) return
  theme = t
  petals = []
  dusts = []
  stars = []
  meteors = []
  if (theme === 'black') spawnStars()
  ensureCount()
}

function frame() {
  if (!ctx || !running) return
  ctx.clearRect(0, 0, W, H)
  switchTheme(getTheme())
  ensureCount()

  if (theme === 'pink') {
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i]
      drawPetal(p)
      if (!stepPetal(p)) { petals.splice(i, 1); petals.push(spawnPetal(true)) }
    }
  } else if (theme === 'white') {
    for (const d of dusts) {
      stepDust(d)
      drawDust(d)
    }
  } else if (theme === 'black') {
    drawStars()
    drawMeteors()
  }

  rafId = requestAnimationFrame(frame)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  if (!ctx) return
  theme = getTheme()
  resize()
  window.addEventListener('resize', resize)
  running = true
  frame()
})

onBeforeUnmount(() => {
  running = false
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.bg-decor-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 3;
}
</style>
