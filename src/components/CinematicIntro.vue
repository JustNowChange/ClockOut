<template>
  <Teleport to="body">
    <div v-if="visible" class="fireworks-intro" :class="{ 'fade-out': phase === 'exiting' }" @click="skipIntro">
      <canvas ref="canvasRef" class="fw-canvas"></canvas>

      <!-- Logo -->
      <div class="logo-container" :class="{ 'logo-appear': logoVisible }">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15 9H9L12 2Z" fill="currentColor" />
            <path d="M12 22L9 15H15L12 22Z" fill="currentColor" />
            <path d="M2 12L9 9V15L2 12Z" fill="currentColor" />
            <path d="M22 12L15 15V9L22 12Z" fill="currentColor" />
          </svg>
          <span class="logo-text">ClockOut</span>
        </div>
        <div class="logo-sub">Time · Study · Future</div>
      </div>

      <!-- 跳过提示 -->
      <div class="skip-hint" :class="{ 'skip-hint-show': hintVisible }">点击任意处跳过</div>

      <!-- Flash overlay on explosion -->
      <div class="flash-overlay" :class="{ 'flash-on': flashActive }"></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'complete'): void }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const logoVisible = ref(false)
const flashActive = ref(false)
const phase = ref<'idle' | 'rising' | 'exploding' | 'holding' | 'exiting'>('idle')

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0
let rafId = 0

// 烟花粒子
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  decay: number
  color: string
  size: number
  life: number
}
let particles: Particle[] = []

// 上升的烟花弹
interface Rocket {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  trail: Array<{ x: number; y: number; alpha: number }>
  exploded: boolean
}
let rockets: Rocket[] = []

// 纯色烟花 - 每个烟花只用一种颜色
const fwColors = [
  '#ffd93d',  // 黄
  '#ff3b3b',  // 红
  '#3b8bff',  // 蓝
  '#3bff7a',  // 绿
  '#ff6bcc',  // 粉
  '#ff9f3b',  // 橙
]

function resize() {
  if (!canvasRef.value) return
  W = canvasRef.value.width = window.innerWidth
  H = canvasRef.value.height = window.innerHeight
}

function launchRocket(targetX?: number, targetY?: number, color?: string) {
  const sx = W / 2 + (Math.random() - 0.5) * W * 0.4
  const tx = targetX ?? W * 0.2 + Math.random() * W * 0.6
  const ty = targetY ?? H * 0.15 + Math.random() * H * 0.35
  const c = color ?? fwColors[Math.floor(Math.random() * fwColors.length)]

  rockets.push({
    x: sx,
    y: H + 10,
    vx: (tx - sx) / 60,
    vy: -Math.sqrt(2 * 0.15 * (H - ty)),
    color: c,
    trail: [],
    exploded: false
  })
}

function explode(x: number, y: number, color: string, count = 80) {
  const type = Math.random() > 0.5 ? 'circle' : 'ring'
  for (let i = 0; i < count; i++) {
    let angle: number
    let speed: number
    if (type === 'ring') {
      angle = (Math.PI * 2 * i) / count
      speed = 3 + Math.random() * 0.5
    } else {
      angle = Math.random() * Math.PI * 2
      speed = Math.random() * 5 + 1
    }
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.008 + Math.random() * 0.015,
      color,
      size: Math.random() * 2.5 + 1,
      life: 1
    })
  }
}

function draw() {
  if (!ctx) return
  // 拖尾效果 - 不清除画布
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.fillRect(0, 0, W, H)

  // 更新和绘制火箭
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i]
    r.trail.push({ x: r.x, y: r.y, alpha: 1 })
    if (r.trail.length > 12) r.trail.shift()

    if (phase.value === 'rising' || phase.value === 'holding') {
      r.x += r.vx
      r.y += r.vy
      r.vy += 0.15  // 重力
    }

    // 绘制拖尾
    r.trail.forEach((t, idx) => {
      t.alpha = (idx / r.trail.length) * 0.8
    })
    r.trail.forEach(t => {
      ctx!.beginPath()
      ctx!.arc(t.x, t.y, 2, 0, Math.PI * 2)
      ctx!.fillStyle = r.color.replace(')', `, ${t.alpha})`).replace('rgb', 'rgba')
      // 简单处理：用颜色+透明度
      const c = hexToRgba(r.color, t.alpha)
      ctx!.fillStyle = c
      ctx!.fill()
    })

    // 绘制火箭头
    ctx.beginPath()
    ctx.arc(r.x, r.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.shadowColor = r.color
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0

    // 爆炸条件
    if (r.vy >= 0 && !r.exploded && phase.value !== 'idle') {
      r.exploded = true
      explode(r.x, r.y, r.color, 60 + Math.floor(Math.random() * 40))
      rockets.splice(i, 1)
    }

    // 飞出屏幕
    if (r.y > H + 50) {
      rockets.splice(i, 1)
    }
  }

  // 更新和绘制粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.vy += 0.03  // 重力
    p.vx *= 0.99  // 空气阻力
    p.vy *= 0.99
    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay
    p.alpha = Math.max(0, p.life)

    if (p.alpha <= 0) {
      particles.splice(i, 1)
      continue
    }

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(p.color, p.alpha)
    ctx.shadowColor = p.color
    ctx.shadowBlur = 6
    ctx.fill()
    ctx.shadowBlur = 0
  }

  rafId = requestAnimationFrame(draw)
}

function hexToRgba(hex: string, alpha: number): string {
  if (hex.startsWith('rgb')) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 时序控制
// 所有定时器统一登记: 点击跳过时全部清除, 防止跳过后仍在后台升空/连发/触发complete
let introTimers: number[] = []
let skipped = false
const hintVisible = ref(false)

function addTimeout(fn: () => void, ms: number): number {
  const id = window.setTimeout(fn, ms)
  introTimers.push(id)
  return id
}

/**
 * 鼠标点击跳过: 停止后续所有阶段 → 复用原有0.8s淡出 → 通知父组件卸载
 */
function skipIntro() {
  if (skipped) return
  skipped = true
  introTimers.forEach(t => clearTimeout(t))
  introTimers = []
  hintVisible.value = false
  phase.value = 'exiting'   // 触发 fade-out 过渡; 飞行中的烟花随淡出自然消散
  introTimers.push(window.setTimeout(() => emit('complete'), 800))
}

function scheduleShow() {
  // 0-0.5s: 纯黑屏
  addTimeout(() => {
    phase.value = 'rising'
    // 第一枚烟花从下方升空 - 白色
    launchRocket(W * 0.5, H * 0.25, '#ffffff')
  }, 500)

  // 1.2s: 显示跳过提示
  addTimeout(() => {
    hintVisible.value = true
  }, 1200)

  // 1.8s: 烟花爆炸 → Logo 出现
  addTimeout(() => {
    logoVisible.value = true
  }, 1988)

  // 2.5s后进入持续模式
  addTimeout(() => {
    phase.value = 'holding'
    const continuousFire = () => {
      if (phase.value === 'exiting') return
      launchRocket()
      if (Math.random() > 0.6) {
        addTimeout(() => launchRocket(), 150 + Math.random() * 200)
      }
      const next = 400 + Math.random() * 500
      addTimeout(continuousFire, next)
    }
    continuousFire()
  }, 2500)

  // 4s: 庆祝连发
  addTimeout(() => {
    for (let i = 0; i < 5; i++) {
      addTimeout(() => {
        launchRocket(
          W * (0.2 + Math.random() * 0.6),
          H * (0.1 + Math.random() * 0.3),
          fwColors[Math.floor(Math.random() * fwColors.length)]
        )
      }, i * 120)
    }
  }, 4000)

  // 6s: 更多烟花
  addTimeout(() => {
    for (let i = 0; i < 4; i++) {
      addTimeout(() => launchRocket(), i * 180)
    }
  }, 6000)

  // 7.5s: 开始淡出
  addTimeout(() => {
    phase.value = 'exiting'
  }, 7500)

  // 8.5s: 完成
  addTimeout(() => {
    emit('complete')
  }, 8500)
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  resize()

  draw()
  scheduleShow()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
  introTimers.forEach(t => clearTimeout(t))
  introTimers = []
})
</script>

<style scoped>
.fireworks-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.8s ease;
}
.fireworks-intro.fade-out {
  opacity: 0;
  pointer-events: none;
}

.fw-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Logo */
.logo-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40px);
  text-align: center;
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
  pointer-events: none;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
}
.logo-container.logo-appear {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
}

.logo-mark svg {
  width: 48px;
  height: 48px;
  color: #ffffff;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
}

.logo-text {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
  filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.6));
}

.logo-sub {
  margin-top: 12px;
  font-size: 14px;
  letter-spacing: 0.5em;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
}

/* 跳过提示 */
.skip-hint {
  position: fixed;
  right: 24px;
  bottom: 20px;
  z-index: 20;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.skip-hint.skip-hint-show {
  opacity: 1;
}

/* 爆炸闪光 */
.flash-overlay {
  position: fixed;
  inset: 0;
  background: #fff;
  opacity: 0;
  z-index: 5;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.flash-overlay.flash-on {
  opacity: 0.6;
}
</style>
