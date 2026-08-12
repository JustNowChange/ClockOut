<template>
  <Teleport to="body">
    <Transition name="cm-fade">
      <div
        v-if="visible"
        class="cute-context-menu"
        :style="menuStyle"
        @click.stop
      >
        <div class="cm-header">
          <span class="cm-header-emoji">˘◡˘</span>
          <span class="cm-header-text">Ciallo～</span>
          <span class="cm-header-sparkle">✨</span>
        </div>

        <div class="cm-divider"></div>

        <div class="cm-item" @click="handleRefresh">
          <span class="cm-icon">🔄</span>
          <span class="cm-label">刷新一下</span>
          <span class="cm-shortcut">F5</span>
        </div>

        <div class="cm-divider"></div>

        <!-- 弹幕开关 -->
        <div class="cm-item" @click="handleToggleDanmaku">
          <span class="cm-icon">{{ danmakuOn ? '💬' : '🔇' }}</span>
          <span class="cm-label">{{ danmakuOn ? '关闭弹幕' : '开启弹幕' }}</span>
          <span class="cm-shortcut">{{ danmakuOn ? 'ON' : 'OFF' }}</span>
        </div>

        <!-- 更换背景色子菜单 -->
        <div
          class="cm-item cm-has-sub"
          @mouseenter="showBgSub = true"
          @mouseleave="showBgSub = false"
        >
          <span class="cm-icon">🎨</span>
          <span class="cm-label">更换背景色</span>
          <span class="cm-arrow">›</span>

          <Transition name="cm-sub">
            <div v-if="showBgSub" class="cm-submenu">
              <div
                v-for="t in bgThemes"
                :key="t.name"
                class="cm-sub-item"
                @click="handleSetBg(t)"
              >
                <span class="cm-swatch" :style="{ background: t.value }"></span>
                <span class="cm-sub-label">{{ t.name }}</span>
              </div>
            </div>
          </Transition>
        </div>

        <div class="cm-item" @click="handleClearCache">
          <span class="cm-icon">🧹</span>
          <span class="cm-label">清除图片缓存</span>
        </div>

        <div class="cm-divider"></div>

        <div class="cm-item cm-cute" @click="handleCiallo">
          <span class="cm-icon">⭐</span>
          <span class="cm-label">Ciallo!</span>
        </div>

        <div class="cm-footer">
          (∠・ω<)⌒★ click outside to close ~
        </div>
      </div>
    </Transition>

    <!-- 更换背景色全屏过渡 -->
    <div v-if="bgFlash" class="bg-flash-layer" :style="{ background: bgFlash }"></div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { clearImageCache } from '../utils/imageCache'

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const showBgSub = ref(false)
const bgFlash = ref<string>('')

const BG_COLOR_KEY = 'clockout-bg-color'
const BG_KEY_KEY = 'clockout-bg-key'
const DANMAKU_KEY = 'clockout-danmaku-enabled'

const danmakuOn = ref(true)

interface BgTheme {
  name: string
  value: string
  emoji: string
  key: 'pink' | 'white' | 'black'
}
const bgThemes: BgTheme[] = [
  { name: '棉花糖粉', value: '#fff0f5', emoji: '🌸', key: 'pink' },
  { name: '经典白',   value: '#ffffff', emoji: '🤍', key: 'white' },
  { name: '夜空黑',   value: '#1a1a2e', emoji: '🌙', key: 'black' },
]

const menuStyle = computed(() => ({
  left: `${posX.value}px`,
  top: `${posY.value}px`,
}))

function showMenu(x: number, y: number) {
  // 防止菜单超出屏幕
  const menuW = 220
  const menuH = 360
  const vw = window.innerWidth
  const vh = window.innerHeight
  posX.value = Math.min(x, vw - menuW - 8)
  posY.value = Math.min(y, vh - menuH - 8)
  visible.value = true
  showBgSub.value = false
  // 打开时刷新弹幕开关状态
  const saved = localStorage.getItem(DANMAKU_KEY)
  danmakuOn.value = saved !== '0'
}

function hideMenu() {
  visible.value = false
  showBgSub.value = false
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  showMenu(e.clientX, e.clientY)
}

function onDocClick() {
  hideMenu()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') hideMenu()
}

// ===== 菜单项动作 =====
function handleRefresh() {
  hideMenu()
  window.location.reload()
}

function handleToggleDanmaku() {
  const saved = localStorage.getItem(DANMAKU_KEY)
  const currentlyOn = saved !== '0'
  const newState = !currentlyOn
  danmakuOn.value = newState
  localStorage.setItem(DANMAKU_KEY, newState ? '1' : '0')
  // 广播事件通知 Login 等页面
  window.dispatchEvent(new CustomEvent('clockout-danmaku-toggle'))
}

function handleClearCache() {
  hideMenu()
  clearImageCache()
  // 发个 toast 提示
  flashBg('#ffe7ee')
}

function applyTheme(t: BgTheme) {
  const color = t.value
  document.documentElement.style.setProperty('--page-bg', color)
  document.body.style.background = color
  const app = document.getElementById('app') ?? document.querySelector('#app') as HTMLElement | null
  if (app) app.style.background = color
  // 设置主题 key → 供 CSS 按主题绘制装饰
  document.documentElement.dataset.theme = t.key
}

function handleSetBg(t: BgTheme) {
  hideMenu()
  applyTheme(t)
  localStorage.setItem(BG_COLOR_KEY, t.value)
  localStorage.setItem(BG_KEY_KEY, t.key)
  flashBg(t.value)
}

function handleCiallo() {
  hideMenu()
  flashBg('#fff7fc')
  // 让 CuteClickText 组件在屏幕中央来一发
  const evt = new MouseEvent('click', {
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2,
    bubbles: true,
  })
  window.dispatchEvent(evt)
}

function flashBg(color: string) {
  bgFlash.value = color
  setTimeout(() => { bgFlash.value = '' }, 400)
}

// 启动时加载已保存的背景色
function loadSavedBg() {
  const savedColor = localStorage.getItem(BG_COLOR_KEY)
  const savedKey = localStorage.getItem(BG_KEY_KEY) as BgTheme['key'] | null
  if (savedColor && savedKey) {
    const theme = bgThemes.find(b => b.key === savedKey) ?? { key: savedKey, name: '', value: savedColor, emoji: '🤍' }
    applyTheme(theme as BgTheme)
  } else if (savedColor) {
    // 兼容旧版本：仅存了颜色，没存 key
    const fallback: BgTheme = { key: 'white', name: '经典白', value: savedColor, emoji: '🤍' }
    applyTheme(fallback)
  } else {
    // 默认为白色
    document.documentElement.dataset.theme = 'white'
  }
}

onMounted(() => {
  window.addEventListener('contextmenu', onContextMenu)
  window.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKeyDown)
  loadSavedBg()
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', onContextMenu)
  window.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style>
.cute-context-menu {
  position: fixed;
  z-index: 99999;
  min-width: 220px;
  padding: 6px;
  background: var(--card-bg, #ffffff);
  border: 2px solid #ffd6e7;
  border-radius: 18px;
  box-shadow:
    0 10px 30px rgba(255, 150, 200, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
  animation: cm-pop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: background 0.3s ease;
}

html[data-theme="black"] .cute-context-menu {
  border: 2px solid #5b4a8e;
  box-shadow:
    0 10px 30px rgba(80, 60, 140, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

@keyframes cm-pop {
  0%   { opacity: 0; transform: scale(0.92); }
  100% { opacity: 1; transform: scale(1); }
}

.cm-fade-enter-active, .cm-fade-leave-active { transition: opacity 0.15s ease; }
.cm-fade-enter-from, .cm-fade-leave-to { opacity: 0; }

.cm-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 6px 10px;
  background: linear-gradient(135deg, #fff0f7, #ffe7f3);
  border-radius: 12px;
  margin-bottom: 4px;
  transition: background 0.3s ease;
}
html[data-theme="black"] .cm-header {
  background: linear-gradient(135deg, #2a2448, #332a5a);
}
.cm-header-emoji { font-size: 14px; }
.cm-header-text {
  font-size: 13px;
  font-weight: 700;
  color: #e74c9a;
  letter-spacing: 0.5px;
}
html[data-theme="black"] .cm-header-text {
  color: #b894ff;
}
.cm-header-sparkle { font-size: 13px; animation: sparkle 1.2s infinite; }
@keyframes sparkle {
  0%,100% { transform: scale(1) rotate(0deg);   opacity: 1; }
  50%     { transform: scale(1.3) rotate(15deg); opacity: 0.7; }
}

.cm-divider {
  height: 1px;
  margin: 4px 6px;
  background: linear-gradient(90deg, transparent, #ffd6e7, transparent);
  transition: background 0.3s ease;
}
html[data-theme="black"] .cm-divider {
  background: linear-gradient(90deg, transparent, #4a3d72, transparent);
}

.cm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.12s ease;
  position: relative;
}
.cm-item:hover {
  background: linear-gradient(135deg, #fff0f7, #ffe7f0);
  transform: translateX(2px);
}
html[data-theme="black"] .cm-item:hover {
  background: linear-gradient(135deg, #332a5a, #3a2f6a);
}
.cm-icon { width: 18px; text-align: center; font-size: 15px; }
.cm-label {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary, #333);
  font-weight: 500;
  transition: color 0.3s ease;
}
.cm-shortcut {
  font-size: 11px;
  color: var(--text-quaternary, #bbb);
  font-family: monospace;
  transition: color 0.3s ease;
}
.cm-arrow {
  font-size: 16px;
  color: #e74c9a;
  font-weight: 700;
}
html[data-theme="black"] .cm-arrow {
  color: #b894ff;
}
.cm-cute:hover { background: linear-gradient(135deg, #fff4ff, #ffedfa); }
html[data-theme="black"] .cm-cute:hover { background: linear-gradient(135deg, #3a2f66, #43327a); }

.cm-has-sub:hover .cm-submenu { display: block; }

.cm-submenu {
  position: absolute;
  top: -8px;
  left: calc(100% + 4px);
  min-width: 150px;
  padding: 6px;
  background: var(--card-bg, #fff);
  border: 2px solid #d6e8ff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(150, 180, 255, 0.25), 0 3px 10px rgba(0, 0, 0, 0.06);
  transition: background 0.3s ease;
}
html[data-theme="black"] .cm-submenu {
  border: 2px solid #5b6fa0;
  box-shadow: 0 8px 24px rgba(90, 110, 160, 0.35), 0 3px 10px rgba(0, 0, 0, 0.3);
}
.cm-sub-enter-active, .cm-sub-leave-active { transition: all 0.15s ease; }
.cm-sub-enter-from, .cm-sub-leave-to { opacity: 0; transform: translateX(-6px); }

.cm-sub-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.cm-sub-item:hover { background: #f0f6ff; }
html[data-theme="black"] .cm-sub-item:hover { background: #2e3a5e; }
.cm-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 0 0 2px #fff;
}
html[data-theme="black"] .cm-swatch {
  border: 2px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 2px var(--card-bg, #23233a);
}
.cm-sub-label {
  font-size: 12.5px;
  color: var(--text-secondary, #444);
  font-weight: 500;
  transition: color 0.3s ease;
}

.cm-footer {
  margin-top: 6px;
  padding: 6px 4px 2px;
  text-align: center;
  font-size: 10.5px;
  color: #c99;
  letter-spacing: 0.5px;
}
html[data-theme="black"] .cm-footer {
  color: #8a7ab8;
}

/* 背景色切换闪光 */
.bg-flash-layer {
  position: fixed;
  inset: 0;
  z-index: 99998;
  pointer-events: none;
  animation: bg-flash-anim 0.4s ease-out forwards;
}
@keyframes bg-flash-anim {
  0%   { opacity: 0.6; }
  100% { opacity: 0;   }
}
</style>
