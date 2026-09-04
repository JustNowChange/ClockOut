<template>
  <canvas
    ref="canvasRef"
    class="danmaku-canvas"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

interface Bullet {
  id: number
  text: string
  x: number
  y: number
  speed: number
  color: string
  fontSize: number
  opacity: number
  glow: boolean
}

const props = defineProps<{
  density?: number
  enabled?: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0
let bullets: Bullet[] = []
let rafId = 0
let bulletId = 0
let spawnTimer = 0

// 弹幕内容池 - 配合 ClockOut 打卡系统主题
const bulletPool = [
  { text: '百合nb！', color: '#a78bfa' },
  { text: '今天又是元气满满的一天！', color: '#a78bfa' },
  { text: '进厂打工，永不为奴！', color: '#60a5fa' },
  { text: '大专巅峰，谁敢叼我！', color: '#f472b6' },
  { text: '流水线大神归位 ', color: '#fbbf24' },
  { text: '打卡第 5201314 天 ', color: '#34d399' },
  { text: '夜班人的快乐就是这么简单', color: '#22d3ee' },
  { text: '本科悔而我不悔！', color: '#f87171' },
  { text: '不过是些许夜班罢了 ', color: '#c084fc' },
  { text: '学习使我快乐（假的）', color: '#60a5fa' },
  { text: 'Ciallo～', color: '#34d399' },
  { text: '苦力蛊，启动！', color: '#fbbf24' },
  { text: '牛马蛊，进化！', color: '#f472b6' },
  { text: '吗喽蛊，终焉形态！', color: '#a78bfa' },
  { text: '电子厂中寒风吹 ', color: '#22d3ee' },
  { text: '简历已更新，投递走起', color: '#60a5fa' },
  { text: '普通人也能怀有梦想', color: '#fbbf24' },
  { text: '人生没有无用的经历', color: '#34d399' },
  { text: 'ClockOut 启动成功 ✓', color: '#a78bfa' },
  { text: '今天的我比昨天更强了', color: '#f472b6' },
  { text: '坚持就是胜利 ', color: '#f87171' },
  { text: '加班费真香', color: '#fbbf24' },
  { text: '倒班人，倒班魂', color: '#c084fc' },
  { text: '流水线上万人退', color: '#60a5fa' },
  { text: '大专巅峰修为，已成！', color: '#34d399' },
  { text: '打卡系统好评 ', color: '#22d3ee' },
  { text: '简历一键生成，太方便了', color: '#a78bfa' },
  { text: '今天真不错啊!', color: '#f472b6' },
  { text: '我的简历是最强的！', color: '#fbbf24' },
  { text: '进厂第一天，想回家', color: '#f87171' },
  { text: '三班倒也能学习的！', color: '#60a5fa' },
  { text: '普通人的逆袭之路', color: '#34d399' },
  { text: '努力不会被辜负的', color: '#c084fc' },
]

const colors = [
  '#a78bfa', '#60a5fa', '#f472b6', '#fbbf24',
  '#34d399', '#22d3ee', '#f87171', '#c084fc',
  '#93c5fd', '#fcd34d', '#6ee7b7', '#67e8f9'
]

// 弹幕轨道 (y 坐标)
let tracks: number[] = []
const trackHeight = 38
const topPadding = 80

function resize() {
  if (!canvasRef.value) return
  W = canvasRef.value.width = window.innerWidth
  H = canvasRef.value.height = window.innerHeight
  // 计算可用轨道
  const usableHeight = H - topPadding - 60
  const trackCount = Math.max(3, Math.floor(usableHeight / trackHeight))
  tracks = []
  for (let i = 0; i < trackCount; i++) {
    tracks.push(topPadding + i * trackHeight + Math.random() * 10)
  }
}

function spawnBullet() {
  if (tracks.length === 0) return
  const trackIdx = Math.floor(Math.random() * tracks.length)
  const item = bulletPool[Math.floor(Math.random() * bulletPool.length)]
  const fontSize = Math.random() > 0.7 ? 22 : 18
  const glow = Math.random() > 0.6

  bullets.push({
    id: bulletId++,
    text: item.text,
    x: W + 20,
    y: tracks[trackIdx],
    speed: 1.5 + Math.random() * 2.5,
    color: item.color || colors[Math.floor(Math.random() * colors.length)],
    fontSize,
    opacity: 0,
    glow
  })
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]
    b.x -= b.speed
    // 淡入
    if (b.opacity < 1) b.opacity = Math.min(b.opacity + 0.05, 1)
    // 移出屏幕则删除
    if (b.x < -300) {
      bullets.splice(i, 1)
    }
  }
}

function drawBullets() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  if (props.enabled === false) return

  bullets.forEach(b => {
    ctx!.save()
    ctx!.globalAlpha = b.opacity
    ctx!.font = `${b.fontSize}px 'PingFang SC', 'Microsoft YaHei', sans-serif`
    ctx!.textBaseline = 'middle'

    // 测量文字宽度
    const metrics = ctx!.measureText(b.text)
    const textWidth = metrics.width

    // 发光效果
    if (b.glow) {
      ctx!.shadowColor = b.color
      ctx!.shadowBlur = 12
      ctx!.fillStyle = b.color
      ctx!.fillText(b.text, b.x, b.y)
      // 再画一层增强发光
      ctx!.shadowBlur = 20
      ctx!.fillText(b.text, b.x, b.y)
    } else {
      // 普通文字带描边
      ctx!.lineWidth = 3
      ctx!.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx!.strokeText(b.text, b.x, b.y)
      ctx!.fillStyle = b.color
      ctx!.fillText(b.text, b.x, b.y)
    }

    ctx!.restore()
  })
}

function animate() {
  // 当 disabled 时，不生成新弹幕，并且清空已有弹幕
  if (props.enabled === false) {
    if (bullets.length > 0) bullets = []
    if (ctx) ctx.clearRect(0, 0, W, H)
  } else {
    updateBullets()

    // 定时生成新弹幕
    spawnTimer++
    const density = props.density ?? 1
    const spawnInterval = Math.max(15, 60 / density)  // 每 N 帧生成一个
    if (spawnTimer >= spawnInterval) {
      spawnBullet()
      spawnTimer = 0
      // 有时一次生成多个
      if (Math.random() > 0.7) {
        setTimeout(() => spawnBullet(), 200)
      }
      if (Math.random() > 0.9) {
        setTimeout(() => spawnBullet(), 400)
      }
    }
  }

  drawBullets()

  rafId = requestAnimationFrame(animate)
}

// 监听 enabled 变化：重新开启时预填一些弹幕
watch(() => props.enabled, (newVal) => {
  if (newVal && bullets.length === 0) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnBullet(), i * 400)
    }
  }
})

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  resize()

  // 初始预填一些弹幕
  for (let i = 0; i < 5; i++) {
    setTimeout(() => spawnBullet(), i * 600)
  }

  animate()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.danmaku-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}
</style>
