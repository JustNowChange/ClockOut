<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="minimal-loader">
        <!-- 像素网格背景 -->
        <div class="pixel-grid"></div>

        <!-- 故障扫描线 -->
        <div class="scanlines"></div>

        <!-- 像素粒子漂浮 -->
        <div class="pixel-particles">
          <div v-for="i in 12" :key="i" class="pixel-particle" :style="{
            '--x': (Math.random() * 100) + '%',
            '--y': (Math.random() * 100) + '%',
            '--delay': (Math.random() * 3) + 's',
            '--duration': (2 + Math.random() * 3) + 's',
            '--color': pixelColors[i % pixelColors.length]
          }"></div>
        </div>

        <div class="loader-content">
          <!-- Logo 揭示 -->
          <div class="logo-wrap" :class="{ 'logo-in': showLogo }">
            <span class="logo-mark">CO</span>
            <div class="logo-divider"></div>
            <span class="logo-full">CLOCK OUT</span>
          </div>

          <!-- 像素进度条 -->
          <div class="progress-wrap" :class="{ 'progress-in': showProgress }">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              <div class="progress-head" :style="{ left: progress + '%' }"></div>
            </div>
            <div class="progress-label">
              <span class="progress-percent">{{ Math.floor(progress) }}%</span>
              <span class="progress-status">{{ statusText }}</span>
            </div>
          </div>

          <!-- 加载文字 -->
          <div class="loading-text" :class="{ 'text-in': showText }">
            <span class="text-bracket">&gt;</span>
            <span class="text-main">LOADING</span>
            <span class="text-dots">{{ dots }}</span>
            <span class="text-cursor">█</span>
          </div>
        </div>

        <!-- 像素角落装饰 -->
        <div class="corner-pixel tl" :class="{ 'line-in': showLines }"></div>
        <div class="corner-pixel tr" :class="{ 'line-in': showLines }"></div>
        <div class="corner-pixel bl" :class="{ 'line-in': showLines }"></div>
        <div class="corner-pixel br" :class="{ 'line-in': showLines }"></div>

        <!-- 系统标签 -->
        <div class="sys-tag top-left" :class="{ 'tag-in': showLines }">SYS_v4.2.1</div>
        <div class="sys-tag top-right" :class="{ 'tag-in': showLines }">// SECURE</div>
        <div class="sys-tag bottom-left" :class="{ 'tag-in': showLines }">[ONLINE]</div>
        <div class="sys-tag bottom-right" :class="{ 'tag-in': showLines }">0x{{ hexCode }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  duration?: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const showLogo = ref(false)
const showProgress = ref(false)
const showText = ref(false)
const showLines = ref(false)
const progress = ref(0)
const dots = ref('')
const hexCode = ref('0000')
const statusText = ref('INITIALIZING')

const pixelColors = ['#6c3ff5', '#00ffd5', '#ff006e', '#ffbe0b']

let timers: number[] = []
let progressTimer: number | null = null
let dotsTimer: number | null = null
let hexTimer: number | null = null
let statusTimer: number | null = null

const statusList = ['INITIALIZING', 'DECRYPTING', 'VERIFYING', 'AUTHENTICATING', 'READY']

function addTimer(fn: () => void, delay: number) {
  const id = window.setTimeout(fn, delay)
  timers.push(id)
  return id
}

function randomHex(len: number) {
  const chars = '0123456789ABCDEF'
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function runAnimation() {
  const total = props.duration || 3000

  progress.value = 0
  dots.value = ''
  hexCode.value = randomHex(4)

  // 阶段1: 线条 + Logo 淡入 (0.3s)
  addTimer(() => {
    showLines.value = true
    showLogo.value = true
  }, 300)

  // 阶段2: 进度条 + 文字 (0.8s)
  addTimer(() => {
    showProgress.value = true
    showText.value = true

    // 进度条
    const step = 100 / ((total - 800) / 30)
    progressTimer = window.setInterval(() => {
      progress.value = Math.min(100, progress.value + step)
      if (progress.value >= 100 && progressTimer !== null) {
        clearInterval(progressTimer)
        progressTimer = null
      }
    }, 30)

    // 打字点
    let count = 0
    dotsTimer = window.setInterval(() => {
      count = (count + 1) % 4
      dots.value = '.'.repeat(count)
    }, 400) as unknown as number

    // 滚动 hex 码
    hexTimer = window.setInterval(() => {
      hexCode.value = randomHex(4)
    }, 120) as unknown as number

    // 状态切换
    let statusIdx = 0
    statusText.value = statusList[0]
    statusTimer = window.setInterval(() => {
      statusIdx = Math.min(statusIdx + 1, statusList.length - 1)
      statusText.value = statusList[statusIdx]
    }, Math.max(300, (total - 800) / statusList.length)) as unknown as number
  }, 800)

  // 完成
  addTimer(() => {
    emit('complete')
  }, total)
}

function cleanup() {
  timers.forEach(id => clearTimeout(id))
  timers = []
  if (progressTimer !== null) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (dotsTimer !== null) {
    clearInterval(dotsTimer)
    dotsTimer = null
  }
  if (hexTimer !== null) {
    clearInterval(hexTimer)
    hexTimer = null
  }
  if (statusTimer !== null) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

onMounted(() => {
  runAnimation()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

.minimal-loader {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  overflow: hidden;
}

/* Pixel grid background */
.pixel-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(108, 63, 245, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(108, 63, 245, 0.04) 1px, transparent 1px);
  background-size: 16px 16px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

/* Scanlines */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(108, 63, 245, 0.025) 2px,
    rgba(108, 63, 245, 0.025) 3px
  );
  pointer-events: none;
  animation: scanlineDrift 4s linear infinite;
}

@keyframes scanlineDrift {
  0% { background-position: 0 0; }
  100% { background-position: 0 100px; }
}

/* Floating pixel particles */
.pixel-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pixel-particle {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 3px;
  height: 3px;
  background: var(--color);
  box-shadow: 0 0 6px var(--color);
  animation: pixelFloat var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes pixelFloat {
  0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
  20% { opacity: 0.8; }
  50% { opacity: 1; transform: translateY(-20px) scale(1.5); }
  80% { opacity: 0.6; }
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  position: relative;
  z-index: 10;
}

/* Logo */
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.logo-wrap.logo-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-mark {
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 36px;
  font-weight: 400;
  color: #6c3ff5;
  letter-spacing: 2px;
  text-shadow:
    0 0 4px rgba(108, 63, 245, 0.8),
    0 0 12px rgba(108, 63, 245, 0.4),
    2px 0 0 rgba(255, 0, 110, 0.3),
    -2px 0 0 rgba(0, 255, 213, 0.3);
  animation: logoGlitch 4s steps(1) infinite;
}

@keyframes logoGlitch {
  0%, 90%, 100% {
    text-shadow:
      0 0 4px rgba(108, 63, 245, 0.8),
      0 0 12px rgba(108, 63, 245, 0.4),
      2px 0 0 rgba(255, 0, 110, 0.3),
      -2px 0 0 rgba(0, 255, 213, 0.3);
  }
  92% {
    text-shadow:
      0 0 4px rgba(108, 63, 245, 0.8),
      0 0 12px rgba(108, 63, 245, 0.4),
      4px 0 0 rgba(255, 0, 110, 0.6),
      -4px 0 0 rgba(0, 255, 213, 0.6);
    transform: translateX(1px);
  }
  94% {
    text-shadow:
      0 0 4px rgba(108, 63, 245, 0.8),
      0 0 12px rgba(108, 63, 245, 0.4),
      -3px 0 0 rgba(255, 0, 110, 0.5),
      3px 0 0 rgba(0, 255, 213, 0.5);
    transform: translateX(-1px);
  }
}

.logo-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6c3ff5, transparent);
  box-shadow: 0 0 6px rgba(108, 63, 245, 0.6);
}

.logo-full {
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 20px;
  font-weight: 400;
  color: #555;
  letter-spacing: 4px;
  text-shadow: 0 0 4px rgba(108, 63, 245, 0.3);
}

/* Pixel progress bar */
.progress-wrap {
  width: 260px;
  opacity: 0;
  transform: scaleX(0.8);
  transform-origin: center;
  transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
}

.progress-wrap.progress-in {
  opacity: 1;
  transform: scaleX(1);
}

.progress-track {
  position: relative;
  height: 6px;
  background: #f0f0f5;
  border: 1px solid rgba(108, 63, 245, 0.2);
  overflow: hidden;
  /* Pixelated track using steps */
  background-image: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 6px,
    rgba(108, 63, 245, 0.06) 6px,
    rgba(108, 63, 245, 0.06) 7px
  );
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c3ff5, #8b5cf6);
  transition: width 0.03s linear;
  box-shadow: 0 0 10px rgba(108, 63, 245, 0.6);
  /* Pixelated fill edge */
  clip-path: polygon(0 0, 100% 0, calc(100% - 3px) 50%, 100% 100%, 0 100%);
}

.progress-head {
  position: absolute;
  top: -1px;
  width: 3px;
  height: 8px;
  background: #00ffd5;
  box-shadow: 0 0 8px #00ffd5, 0 0 16px rgba(0, 255, 213, 0.6);
  transform: translateX(-1px);
  transition: left 0.03s linear;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: #888;
}

.progress-percent {
  color: #6c3ff5;
  font-weight: bold;
  text-shadow: 0 0 4px rgba(108, 63, 245, 0.4);
}

.progress-status {
  color: #00ffd5;
  text-shadow: 0 0 4px rgba(0, 255, 213, 0.4);
}

/* Text */
.loading-text {
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 4px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 2px;
}

.loading-text.text-in {
  opacity: 1;
  transform: translateY(0);
}

.text-bracket {
  color: #ff006e;
  text-shadow: 0 0 4px rgba(255, 0, 110, 0.5);
}

.text-main {
  color: #6c3ff5;
  text-shadow: 0 0 4px rgba(108, 63, 245, 0.4);
}

.text-dots {
  display: inline-block;
  width: 18px;
  text-align: left;
  color: #6c3ff5;
}

.text-cursor {
  color: #00ffd5;
  text-shadow: 0 0 6px #00ffd5;
  animation: cursorBlink 0.6s steps(1) infinite;
  margin-left: 2px;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Pixel corner decorations */
.corner-pixel {
  position: absolute;
  width: 24px;
  height: 24px;
  opacity: 0;
  transition: opacity 0.5s ease 0.1s;
}

.corner-pixel.line-in {
  opacity: 1;
}

.corner-pixel::before,
.corner-pixel::after {
  content: '';
  position: absolute;
  background: #6c3ff5;
  box-shadow: 0 0 4px rgba(108, 63, 245, 0.6);
}

.corner-pixel.tl {
  top: 32px;
  left: 32px;
}

.corner-pixel.tl::before {
  top: 0;
  left: 0;
  width: 16px;
  height: 2px;
}

.corner-pixel.tl::after {
  top: 0;
  left: 0;
  width: 2px;
  height: 16px;
}

.corner-pixel.tr {
  top: 32px;
  right: 32px;
}

.corner-pixel.tr::before {
  top: 0;
  right: 0;
  width: 16px;
  height: 2px;
}

.corner-pixel.tr::after {
  top: 0;
  right: 0;
  width: 2px;
  height: 16px;
}

.corner-pixel.bl {
  bottom: 32px;
  left: 32px;
}

.corner-pixel.bl::before {
  bottom: 0;
  left: 0;
  width: 16px;
  height: 2px;
}

.corner-pixel.bl::after {
  bottom: 0;
  left: 0;
  width: 2px;
  height: 16px;
}

.corner-pixel.br {
  bottom: 32px;
  right: 32px;
}

.corner-pixel.br::before {
  bottom: 0;
  right: 0;
  width: 16px;
  height: 2px;
}

.corner-pixel.br::after {
  bottom: 0;
  right: 0;
  width: 2px;
  height: 16px;
}

/* System tags */
.sys-tag {
  position: absolute;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  color: rgba(108, 63, 245, 0.6);
  opacity: 0;
  transition: opacity 0.5s ease 0.3s;
  text-shadow: 0 0 4px rgba(108, 63, 245, 0.3);
}

.sys-tag.tag-in {
  opacity: 1;
}

.sys-tag.top-left { top: 32px; left: 64px; }
.sys-tag.top-right { top: 32px; right: 64px; color: rgba(0, 255, 213, 0.7); text-shadow: 0 0 4px rgba(0, 255, 213, 0.4); }
.sys-tag.bottom-left { bottom: 32px; left: 64px; color: rgba(76, 175, 80, 0.7); text-shadow: 0 0 4px rgba(76, 175, 80, 0.4); }
.sys-tag.bottom-right { bottom: 32px; right: 64px; color: rgba(255, 0, 110, 0.7); text-shadow: 0 0 4px rgba(255, 0, 110, 0.4); }

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
