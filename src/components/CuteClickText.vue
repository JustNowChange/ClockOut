<template>
  <canvas ref="canvasRef" class="click-text-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0
let rafId = 0

interface CuteText {
  x: number
  y: number
  text: string
  alpha: number
  scale: number
  vy: number
  life: number
  maxLife: number
  rotation: number
  color: string
}
let cuteTexts: CuteText[] = []

const cuteMessages = [
  'Ciallo～(∠◠ڼ◠)⌒☆',
  'Ciallo(∠・ω<)⌒★'
]
const cuteColors = [
  '#ffb3d9', '#ff9ec7', '#ff8ab5', '#ffa6c9',
  '#ffc0cb', '#ffb6c1', '#ff91a4', '#f4a6c0',
  '#e8a0bf', '#d4a5c8', '#ffcce0', '#ff8fb3',
  '#f9a8d4', '#f0abfc', '#e879f9'
]

const INTERACTIVE_SELECTORS = 'input, button, textarea, select, a, label, [role="button"], [contenteditable], .no-cute, .characters-scene'

function spawnCuteText(x: number, y: number) {
  const text = cuteMessages[Math.floor(Math.random() * cuteMessages.length)]
  const color = cuteColors[Math.floor(Math.random() * cuteColors.length)]
  cuteTexts.push({
    x, y, text, color,
    alpha: 0,
    scale: 0.4,
    vy: -1.2 - Math.random() * 1.2,
    life: 1.5,
    maxLife: 1.5,
    rotation: (Math.random() - 0.5) * 0.3
  })
}

function drawCuteText(t: CuteText) {
  if (!ctx || t.alpha <= 0) return
  ctx.save()
  ctx.translate(t.x, t.y)
  ctx.rotate(t.rotation)
  ctx.scale(t.scale, t.scale)
  ctx.globalAlpha = t.alpha

  ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 描边
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 3
  ctx.strokeText(t.text, 0, 0)

  // 填充
  ctx.fillStyle = t.color
  ctx.shadowColor = t.color
  ctx.shadowBlur = 12
  ctx.fillText(t.text, 0, 0)

  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.restore()
}

function animate() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  for (let i = cuteTexts.length - 1; i >= 0; i--) {
    const t = cuteTexts[i]
    t.y += t.vy
    t.vy += 0.025
    t.life -= 0.018
    t.scale = Math.min(1, t.scale + 0.06)
    t.alpha = Math.min(1, t.life / t.maxLife * (t.scale < 1 ? t.scale : 1))
    t.rotation += 0.008

    if (t.life <= 0) {
      cuteTexts.splice(i, 1)
      continue
    }
    drawCuteText(t)
  }

  rafId = requestAnimationFrame(animate)
}

function onCanvasClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target) return
  if (target.closest(INTERACTIVE_SELECTORS)) return

  const x = e.clientX
  const y = e.clientY
  spawnCuteText(x, y)
}

function init() {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  W = canvasRef.value.width = window.innerWidth
  H = canvasRef.value.height = window.innerHeight
}

onMounted(() => {
  init()
  animate()

  window.addEventListener('resize', init)
  window.addEventListener('click', onCanvasClick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', init)
  window.removeEventListener('click', onCanvasClick)
})
</script>

<style scoped>
.click-text-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
  pointer-events: none;
}
</style>
