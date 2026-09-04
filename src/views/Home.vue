﻿﻿﻿﻿﻿﻿<template>
  <div class="login-page">
    <!-- Left Panel -->
    <div class="left-panel" :class="{ 'animate-in': animated }">
      <!-- 主题装饰层 (樱花树 / 云 / 星月) -->
      <div class="theme-decor-layer" aria-hidden="true">
        <div class="decor decor-pink">
          <svg class="sakura-tree" viewBox="0 0 320 600" preserveAspectRatio="xMinYMax meet" xmlns="http://www.w3.org/2000/svg">
            <path d="M70,600 C72,530 60,480 68,430 C74,390 84,365 92,330 C96,310 94,288 100,266 C104,248 110,232 112,210"
                  stroke="#7a4a3d" stroke-width="14" fill="none" stroke-linecap="round" />
            <path d="M68,520 C50,510 38,500 28,482" stroke="#7a4a3d" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M80,470 C64,462 50,456 40,446" stroke="#7a4a3d" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M86,430 C110,420 132,408 150,390" stroke="#7a4a3d" stroke-width="8" fill="none" stroke-linecap="round"/>
            <path d="M90,360 C118,350 140,340 162,322" stroke="#7a4a3d" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M94,300 C120,294 140,286 158,270" stroke="#7a4a3d" stroke-width="5" fill="none" stroke-linecap="round"/>
            <g>
              <circle cx="112" cy="180" r="90"  fill="#ffd3e4" opacity="0.95"/>
              <circle cx="58"  cy="190" r="70"  fill="#ffc0d6" opacity="0.95"/>
              <circle cx="170" cy="200" r="78"  fill="#ffd9e8" opacity="0.95"/>
              <circle cx="96"  cy="120" r="68"  fill="#ffb8d0" opacity="0.95"/>
              <circle cx="150" cy="130" r="60"  fill="#ffcce0" opacity="0.9"/>
              <circle cx="36"  cy="150" r="48"  fill="#ffd3e4" opacity="0.9"/>
              <circle cx="200" cy="160" r="44"  fill="#ffb8d0" opacity="0.9"/>
              <circle cx="120" cy="240" r="54"  fill="#ffcce0" opacity="0.88"/>
              <circle cx="58"  cy="250" r="42"  fill="#ffc0d6" opacity="0.88"/>
              <circle cx="180" cy="250" r="40"  fill="#ffd3e4" opacity="0.88"/>
            </g>
            <g fill="#fff6f9" opacity="0.9">
              <circle cx="86"  cy="168" r="4"/>
              <circle cx="128" cy="152" r="3.5"/>
              <circle cx="160" cy="180" r="4"/>
              <circle cx="68"  cy="140" r="3"/>
              <circle cx="100" cy="110" r="3.5"/>
              <circle cx="144" cy="124" r="3"/>
              <circle cx="192" cy="208" r="3.5"/>
              <circle cx="46"  cy="174" r="3"/>
              <circle cx="104" cy="224" r="3"/>
              <circle cx="158" cy="236" r="3"/>
              <circle cx="72"  cy="228" r="2.8"/>
            </g>
          </svg>
        </div>
        <div class="decor decor-white">
          <svg class="cloud-decor" viewBox="0 0 500 300" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg">
            <g fill="#eef2f8" opacity="0.75">
              <ellipse cx="130" cy="70"  rx="62" ry="22"/>
              <ellipse cx="180" cy="62"  rx="48" ry="20"/>
              <ellipse cx="100" cy="78"  rx="32" ry="18"/>
            </g>
            <g fill="#e8eef6" opacity="0.7">
              <ellipse cx="380" cy="100" rx="56" ry="20"/>
              <ellipse cx="420" cy="94"  rx="40" ry="18"/>
              <ellipse cx="348" cy="110" rx="28" ry="16"/>
            </g>
            <g fill="#f2f4fa" opacity="0.6">
              <ellipse cx="260" cy="210" rx="50" ry="18"/>
              <ellipse cx="220" cy="220" rx="32" ry="16"/>
            </g>
          </svg>
        </div>
        <div class="decor decor-black">
          <svg class="star-decor" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="moon-grad-home" cx="40%" cy="40%" r="60%">
                <stop offset="0%"   stop-color="#fff9e6"/>
                <stop offset="100%" stop-color="#f0e6b8"/>
              </radialGradient>
            </defs>
            <circle cx="420" cy="90" r="42" fill="url(#moon-grad-home)" opacity="0.95"/>
            <g fill="#fff" opacity="0.9">
              <polygon points="80,70 83,80 93,80 85,86 88,96 80,90 72,96 75,86 67,80 77,80"/>
              <polygon points="200,150 202,157 209,157 203,161 205,168 200,164 195,168 197,161 191,157 198,157" opacity="0.8"/>
              <polygon points="330,220 332,226 338,226 333,230 335,236 330,232 325,236 327,230 322,226 328,226" opacity="0.85"/>
              <polygon points="130,330 132,336 138,336 133,340 135,346 130,342 125,346 127,340 122,336 128,336" opacity="0.7"/>
              <polygon points="260,400 262,406 268,406 263,410 265,416 260,412 255,416 257,410 252,406 258,406" opacity="0.78"/>
              <circle cx="40"  cy="180" r="1.5"/>
              <circle cx="160" cy="240" r="1.8"/>
              <circle cx="300" cy="120" r="2"/>
              <circle cx="380" cy="300" r="1.6"/>
              <circle cx="70"  cy="430" r="1.7"/>
              <circle cx="220" cy="500" r="1.4"/>
              <circle cx="400" cy="450" r="1.8"/>
            </g>
          </svg>
        </div>
      </div>

      <!-- ============ 他人简历列表 ============ -->
      <div class="resume-list-section">
        <div class="section-header">
          <h2>他人简历</h2>
          <span class="list-count">{{ resumeList.length }} 份简历</span>
        </div>

        <div class="resume-list" :class="{ 'loading': listLoading }">
          <div
            class="resume-list-item"
            v-for="(item, idx) in resumeList"
            :key="item.id"
            :ref="el => setListItemRef(item.id, el as HTMLElement)"
            :class="{ 'list-item-press': pressedListId === item.id }"
            :style="animated ? { animation: 'fadeInUp 0.8s ease forwards', animationDelay: (1.2 + idx * 0.12) + 's' } : {}"
            @click="onListItemClick(item.id)">
            <div class="item-avatar">
              <span>{{ item.name.charAt(0) }}</span>
            </div>
            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-title">{{ item.title }}</p>
              <div class="item-meta">
                <span>{{ item.education }}</span>
                <span class="meta-dot">·</span>
                <span>{{ item.projectCount }}个项目</span>
              </div>
            </div>
            <div class="item-view-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div class="list-empty" v-if="!listLoading && resumeList.length === 0">
          <p>暂无他人简历</p>
        </div>
      </div>

      <!-- ============ 我的简历 ============ -->
      <div class="my-resume-section">
        <div
          ref="cardRef"
          class="resume-preview-card"
          :class="{ 'card-press': cardPressed }"
          @click="expandToResume"
        >
          <div class="preview-header">
            <div class="preview-avatar">
              <span>{{ resume.core.name.charAt(0) }}</span>
            </div>
            <div class="preview-info">
              <h3 class="preview-name">{{ resume.core.name }}</h3>
              <p class="preview-title">{{ resume.core.title }}</p>
            </div>
            <div class="preview-edit-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
          </div>

          <div class="preview-divider"></div>

          <div class="preview-sections">
            <div class="preview-section">
              <span class="section-label">教育</span>
              <span class="section-value">{{ educationSchool }}</span>
            </div>
            <div class="preview-section">
              <span class="section-label">工作</span>
              <span class="section-value">{{ experienceSummary }}</span>
            </div>
            <div class="preview-section">
              <span class="section-label">项目</span>
              <span class="section-value">{{ projectCount }} 个项目</span>
            </div>
          </div>

          <div class="preview-skills">
            <span class="skill-tag" v-for="(t, i) in visibleTags" :key="i">{{ t }}</span>
          </div>

          <div class="preview-footer">
            <span class="preview-readonly-tag">我的简历</span>
            <span class="preview-edit-hint">点击前往编辑</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel" :class="{ 'animate-in': animated }">
      <div class="form-container">
        <div class="sparkle-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.5 9H10.5L12 2Z" fill="#1a1a2e" />
            <path d="M12 22L10.5 15H13.5L12 22Z" fill="#1a1a2e" />
            <path d="M2 12L9 10.5V13.5L2 12Z" fill="#1a1a2e" />
            <path d="M22 12L15 13.5V10.5L22 12Z" fill="#1a1a2e" />
          </svg>
        </div>
        <div class="form-header">
          <h1>打卡系统</h1>
          <p>{{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- User Avatar at bottom center -->
    <div class="user-avatar-wrapper" @mouseenter="showAvatarPanel = true" @mouseleave="showAvatarPanel = false">
      <div class="user-avatar" @click="toggleAvatarPanel">
          <div class="avatar-circle">
            <span>{{ resume.core.name.charAt(0) }}</span>
          </div>
        </div>

        <!-- User Panel -->
        <div class="avatar-panel" :class="{ 'visible': showAvatarPanel }">
          <div class="panel-avatar">
            <div class="panel-avatar-circle">
              <span>{{ resume.core.name.charAt(0) }}</span>
            </div>
          </div>
          <div class="panel-info">
            <div class="panel-username">{{ resume.core.name }}</div>
            <div class="panel-title">{{ resume.core.title }}</div>
          </div>
          <div class="panel-divider"></div>
          <div class="panel-menu">
            <div class="menu-item logout" @click="handleLogout">
              <span>退出登录</span>
            </div>
          </div>
        </div>
    </div>

    <!-- Fullscreen expand overlay with hacker loading effect -->
    <Teleport to="body">
      <div
        v-if="expandOverlay.visible"
        class="expand-overlay"
        :style="expandOverlayStyle"
        @click="onOverlayClick"
      >
        <!-- Matrix rain canvas -->
        <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>

        <!-- Hacker content overlay -->
        <div class="hacker-content" :class="{ 'hacker-visible': hackerContentVisible }">
          <div class="hacker-terminal">
            <div class="terminal-line">
              <span class="prompt">$</span>
              <span class="cmd">access --profile {{ currentUser?.name || 'user' }}</span>
              <span class="cursor">_</span>
            </div>
            <div class="terminal-output" v-for="(line, i) in hackerOutputLines" :key="i">
              <span :class="{ 'glitch': line.glitch }">{{ line.text }}</span>
            </div>
          </div>

          <div class="hacker-status">
            <span class="status-dot"></span>
            <span class="status-text">{{ hackerStatus }}</span>
          </div>

          <div class="skip-hint">
            <span class="skip-key">Ctrl</span>
            <span class="skip-plus">+</span>
            <span class="skip-key">L</span>
            <span class="skip-label">跳过加载</span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- List item expand overlay with hacker intrusion animation -->
    <Teleport to="body">
      <div
        v-if="listExpand.visible"
        class="list-expand-overlay"
        :class="[
          { 'intrusion-mode': intrusionPhase },
          { 'attack-mode': intrusionPhase === 'intruding' },
          { 'alert-mode': intrusionPhase === 'detected' },
          { 'block-mode': intrusionPhase === 'blocking' },
          { 'secured-mode': intrusionPhase === 'secured' }
        ]"
        :style="listExpandStyle"
        @click="onListOverlayClick"
      >
        <!-- Matrix rain -->
        <canvas ref="listMatrixCanvas" class="matrix-canvas"></canvas>

        <!-- Territory occupation grid -->
        <div class="territory-grid" :class="{ 'reclaim-mode': intrusionPhase === 'blocking' || intrusionPhase === 'secured' }" v-if="intrusionPhase">
          <div
            v-for="i in blockCount"
            :key="i"
            class="territory-block"
            :class="{
              'block-occupied': occupiedBlocks.includes(i - 1),
              'block-reclaimed': reclaimedBlocks.includes(i - 1),
              'block-reclaiming': reclaimingBlocks.includes(i - 1),
              'block-empty': !occupiedBlocks.includes(i - 1) && !reclaimedBlocks.includes(i - 1) && !reclaimingBlocks.includes(i - 1)
            }"
            :style="{ '--delay': (i * 0.015) + 's' }"
          ></div>
          <!-- Reclaim wave effect -->
          <div class="reclaim-wave" v-if="intrusionPhase === 'blocking' || intrusionPhase === 'secured'"></div>
        </div>

        <!-- Red alert flash overlay -->
        <div class="red-flash" v-if="intrusionPhase === 'detected' || intrusionPhase === 'blocking'"></div>

        <!-- Green secured glow overlay -->
        <div class="secured-overlay" :class="{ 'secured-active': intrusionPhase === 'secured' }">
          <div class="checkmark-circle">
            <svg viewBox="0 0 52 52" class="checkmark">
              <circle cx="26" cy="26" r="25" fill="#22c55e" class="check-circle"></circle>
              <path fill="none" stroke="#fff" stroke-width="4" d="M14.1 27.2l7.1 7.2 16.7-16.8" class="check-mark"></path>
            </svg>
            <div class="secured-text">ACCESS GRANTED</div>
            <div class="secured-sub">Profile unlocked in read-only mode</div>
          </div>
        </div>

        <!-- Warning triangle overlay during detected/blocking -->
        <div class="warning-overlay" :class="{ 'warning-active': intrusionPhase === 'detected' || intrusionPhase === 'blocking' }">
          <div class="warning-triangle">
            <svg viewBox="0 0 200 180" class="warning-svg">
              <polygon
                points="100,15 188,168 12,168"
                fill="#ff1a1a"
                stroke="#ff4444"
                stroke-width="3"
                class="tri-outline"
              />
              <text x="100" y="145" text-anchor="middle" fill="#fff" font-size="88" font-weight="900" class="tri-mark">!</text>
            </svg>
            <div class="warning-label">{{ intrusionPhase === 'blocking' ? 'ADMIN INTERVENING' : 'INTRUSION DETECTED' }}</div>
          </div>
          <div class="warning-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Terminal output (only during intruding phase) -->
        <div class="intrusion-terminal" v-if="intrusionPhase === 'intruding'">
          <div class="terminal-line">
            <span class="prompt">$</span>
            <span class="cmd">access --profile {{ currentUser?.name || 'user' }} --bypass-security</span>
            <span class="cursor">_</span>
          </div>
          <div class="terminal-output" v-for="(line, i) in intrusionLines" :key="i" :class="{ 'alert-line': line.alert, 'success-line': line.success }">
            <span>{{ line.text }}</span>
          </div>
        </div>

        <!-- Status -->
        <div class="intrusion-status" v-if="intrusionPhase">
          <span class="status-dot" :class="{ 'alert-dot': intrusionPhase === 'detected' || intrusionPhase === 'blocking', 'success-dot': intrusionPhase === 'secured' }"></span>
          <span class="status-text">{{ intrusionStatus }}</span>
          <span class="status-arrow">↓</span>
        </div>

        <!-- Skip hint -->
        <div class="skip-hint" v-if="intrusionPhase">
          <span class="skip-key">Ctrl</span>
          <span class="skip-plus">+</span>
          <span class="skip-key">L</span>
          <span class="skip-label">跳过加载</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive } from 'vue'
import { useRouter } from 'vue-router'
import useClock from '../function/useClock'
import { useAuth } from '../function/useAuth'
import useResume from '../function/useResume'

const router = useRouter()
const { currentTime } = useClock()
const { user, fetchUserInfo, logout } = useAuth()
const { resume, findModuleByType, resumeList, listLoading, fetchResumeList } = useResume()

const showAvatarPanel = ref(false)
const animated = ref(false)

function toggleAvatarPanel() {
  showAvatarPanel.value = !showAvatarPanel.value
}

// 卡片放大过渡
const cardRef = ref<HTMLElement | null>(null)
const expandOverlay = reactive({ visible: false, expanded: false })
const expandOverlayStyle = ref<Record<string, string>>({})
const cardPressed = ref(false)
let expandStarted = false

function onOverlayClick() {
  if (expandStarted) return
  expandStarted = true
  skipAnimation()
}

function skipAnimation() {
  stopMatrixRain()
  expandStarted = false
  router.push('/resume')
}

function handleKeydown(e: KeyboardEvent) {
  if (expandOverlay.visible && e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault()
    skipAnimation()
  }
}

// 清理定时器和事件监听
function cleanupExpandTimers() {
  // 移除监听
  window.removeEventListener('keydown', handleKeydown)
}

// 黑客加载效果
const matrixCanvas = ref<HTMLCanvasElement | null>(null)
const hackerContentVisible = ref(false)
const hackerStatus = ref('')
const hackerOutputLines = ref<{ text: string; glitch?: boolean }[]>([])
let matrixAnimId: number | null = null

const currentUser = computed(() => user.value)

const hackerSteps = [
  { status: 'INITIALIZING KERNEL MODULE...', lines: [{ text: '[KERNEL] bootloader v4.2.1 ready', glitch: true }] },
  { status: 'ESTABLISHING SECURE TUNNEL...', lines: [{ text: '[NET] TLS handshake completed', glitch: false }, { text: '[NET] Certificate verified (SHA-256)', glitch: false }, { text: '[NET] Session cipher: AES-GCM-256', glitch: true }] },
  { status: 'AUTHENTICATING IDENTITY...', lines: [{ text: '[AUTH] Loading user credentials', glitch: false }, { text: '[AUTH] RSA-2048 decryption pass', glitch: true }, { text: '[AUTH] Biometric verification OK', glitch: false }] },
  { status: 'DECRYPTING PROFILE DATA...', lines: [{ text: '[DECRYPT] Symmetric key derived', glitch: false }, { text: '[DECRYPT] AES-256-GCM decrypting...', glitch: true }, { text: '[DECRYPT] Integrity check PASSED', glitch: false }] },
  { status: 'LOADING RESUME MODULES...', lines: [{ text: '[LOAD] education module......OK', glitch: false }, { text: '[LOAD] experience module....OK', glitch: false }, { text: '[LOAD] project module.......OK', glitch: true }, { text: '[LOAD] skill module.........OK', glitch: false }, { text: '[LOAD] contact module.......OK', glitch: false }] },
  { status: 'VERIFYING INTEGRITY...', lines: [{ text: '[HASH] SHA-512 verification...', glitch: true }, { text: '[HASH] All modules intact', glitch: false }] },
  { status: 'RENDERING FINAL OUTPUT...', lines: [{ text: '[RENDER] Compiling resume layout', glitch: false }, { text: '[RENDER] Resources: 82% ████░', glitch: true }] },
  { status: 'ACCESS GRANTED ✔', lines: [{ text: '[ACCESS] Profile unlocked successfully', glitch: false }, { text: '[READY] Welcome back, ' + '', glitch: false }] }
]

function startMatrixRain() {
  const canvas = matrixCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\|[]{}()=_+-'
  const fontSize = 14
  let columns = 0
  let drops: number[] = []

  function resize() {
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    columns = Math.floor(canvas.width / fontSize)
    drops = new Array(columns).fill(0).map(() => Math.random() * canvas.height / fontSize)
  }
  resize()
  window.addEventListener('resize', resize)

  function draw() {
    if (!ctx || !canvas) return
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#1a1a2e'
    ctx.font = fontSize + 'px monospace'

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * fontSize
      const y = drops[i] * fontSize
      ctx.fillText(char, x, y)

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }

    matrixAnimId = requestAnimationFrame(draw)
  }
  draw()
}

function stopMatrixRain() {
  if (matrixAnimId !== null) {
    cancelAnimationFrame(matrixAnimId)
    matrixAnimId = null
  }
}

async function expandToResume() {
  const el = cardRef.value
  if (!el) {
    router.push('/resume')
    return
  }
  const rect = el.getBoundingClientRect()

  // 点击反馈动画(快速按下再弹起)
  cardPressed.value = true
  setTimeout(() => { cardPressed.value = false }, 200)

  // 重置状态
  expandStarted = false
  hackerContentVisible.value = false
  hackerStatus.value = ''
  hackerOutputLines.value = []

  const initialStyle = {
    position: 'fixed',
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    borderRadius: '16px',
    background: '#fff',
    zIndex: '99999',
    pointerEvents: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
  }

  const targetStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    borderRadius: '0',
    background: '#fff',
    zIndex: '99999',
    pointerEvents: 'auto',
    boxShadow: 'none',
    transition: 'top 0.55s cubic-bezier(0.4, 0, 0.2, 1), left 0.55s cubic-bezier(0.4, 0, 0.2, 1), width 0.55s cubic-bezier(0.4, 0, 0.2, 1), height 0.55s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.55s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  // 注册键盘监听(允许 Ctrl+L 跳过)
  window.addEventListener('keydown', handleKeydown)

  // 第一帧:渲染初始状态
  expandOverlayStyle.value = initialStyle
  expandOverlay.visible = true

  // 第二帧:放大 + 启动黑客动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      expandOverlayStyle.value = targetStyle
      // 放大完成后显示黑客内容
      setTimeout(() => {
        startMatrixRain()
        runHackerSequence()
      }, 300)
    })
  })

  // 放大完成后,白色渐变为黑色
  setTimeout(() => {
    expandOverlayStyle.value = {
      ...targetStyle,
      background: '#0a0a1e',
      transition: 'background 0.4s ease'
    }
  }, 560)

  // 变黑完成后跳转(黑客效果6秒)
  setTimeout(() => {
    stopMatrixRain()
    cleanupExpandTimers()
    router.push('/resume')
  }, 6000)
}

async function runHackerSequence() {
  hackerContentVisible.value = true
  for (const step of hackerSteps) {
    hackerStatus.value = step.status
    for (const line of step.lines) {
      await new Promise(r => setTimeout(r, 180 + Math.random() * 80))
      hackerOutputLines.value.push({ ...line, glitch: Math.random() > 0.5 })
    }
    await new Promise(r => setTimeout(r, 250))
  }
}

// 显示的技能标签（取前6个）
const visibleTags = computed(() => {
  const tags: string[] = []
  const skillModule = findModuleByType('skill')
  skillModule?.content.forEach((s: any) => {
    if (s.items) tags.push(...s.items)
  })
  return tags.slice(0, 6)
})

// 教育信息预览
const educationSchool = computed(() => {
  const eduModule = findModuleByType('education')
  return eduModule?.content[0]?.school || '未填写'
})

// 工作信息预览
const experienceSummary = computed(() => {
  const expModule = findModuleByType('experience')
  const first = expModule?.content[0]
  if (!first) return '未填写'
  return `${first.company}${first.position ? ' · ' + first.position : ''}`
})

// 项目数量
const projectCount = computed(() => {
  const projModule = findModuleByType('project')
  return projModule?.content.length || 0
})

function goToResume() {
  router.push('/resume')
}

function goToReadonlyResume(id: number) {
  router.push({ path: '/resume', query: { mode: 'readonly', id: String(id) } })
}

// 他人简历列表项 - 黑客入侵动画（被管理员阻止）
const listItemRefs = ref<Map<number, HTMLElement>>(new Map())
const listExpand = reactive({ visible: false })
const listExpandStyle = ref<Record<string, string>>({})
const listMatrixCanvas = ref<HTMLCanvasElement | null>(null)
const intrusionPhase = ref<'intruding' | 'detected' | 'blocking' | 'secured' | null>(null)
const intrusionStatus = ref('')
const intrusionLines = ref<{ text: string; alert?: boolean; success?: boolean }[]>([])

// Territory occupation system
const blockCount = 180
const occupiedBlocks = ref<number[]>([])
const reclaimedBlocks = ref<number[]>([])
const reclaimingBlocks = ref<number[]>([])

// Grid dimensions: 18 columns x 10 rows for 180 blocks

let listMatrixAnimId: number | null = null
let listExpandJumpTimer: number | null = null

function onListOverlayClick() {
  if (!listExpand.visible) return
  skipListAnimation()
}

function skipListAnimation() {
  stopListMatrixRain()
  if (listExpandJumpTimer !== null) {
    clearTimeout(listExpandJumpTimer)
    listExpandJumpTimer = null
  }
  window.removeEventListener('keydown', handleListKeydown)
  resetTerritory()
  listExpand.visible = false
  router.push({ path: '/resume', query: { mode: 'readonly', id: String(currentListId) } })
}

let currentListId = 0

function handleListKeydown(e: KeyboardEvent) {
  if (listExpand.visible && e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault()
    skipListAnimation()
  }
}

function setListItemRef(id: number, el: HTMLElement | null) {
  if (el) {
    listItemRefs.value.set(id, el)
  } else {
    listItemRefs.value.delete(id)
  }
}

function startListMatrixRain() {
  const canvas = listMatrixCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'
  const fontSize = 12
  let columns = 0
  let drops: number[] = []

  function resize() {
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    columns = Math.floor(canvas.width / fontSize)
    drops = new Array(columns).fill(0).map(() => Math.random() * canvas.height / fontSize)
  }
  resize()
  window.addEventListener('resize', resize)

  function draw() {
    if (!ctx || !canvas) return
    ctx.fillStyle = 'rgba(26, 26, 46, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(26, 26, 46, 0.6)'
    ctx.font = fontSize + 'px monospace'
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * fontSize
      const y = drops[i] * fontSize
      ctx.fillText(char, x, y)
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
    listMatrixAnimId = requestAnimationFrame(draw)
  }
  draw()
}

function stopListMatrixRain() {
  if (listMatrixAnimId !== null) {
    cancelAnimationFrame(listMatrixAnimId)
    listMatrixAnimId = null
  }
}

function resetTerritory() {
  occupiedBlocks.value = []
  reclaimedBlocks.value = []
  reclaimingBlocks.value = []
}

async function occupyBlocks(count: number, maxPercent: number) {
  const targetCount = Math.floor(blockCount * maxPercent)
  const allIndices = Array.from({ length: blockCount }, (_, i) => i)
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]]
  }
  const targetIndices = allIndices.slice(0, targetCount)
  
  // Process in batches of 3 for slower, more visible fill
  for (let batch = 0; batch < targetIndices.length; batch += 3) {
    const batchEnd = Math.min(batch + 3, targetIndices.length)
    const newBlocks = [...occupiedBlocks.value]
    for (let i = batch; i < batchEnd; i++) {
      if (!newBlocks.includes(targetIndices[i])) {
        newBlocks.push(targetIndices[i])
      }
    }
    occupiedBlocks.value = newBlocks
    await new Promise(r => setTimeout(r, 20))
  }
}

async function occupyAllBlocks() {
  const allIndices = Array.from({ length: blockCount }, (_, i) => i)
  // Add remaining blocks in batches
  for (let batch = 0; batch < allIndices.length; batch += 8) {
    const batchEnd = Math.min(batch + 8, allIndices.length)
    const newBlocks = [...occupiedBlocks.value]
    for (let i = batch; i < batchEnd; i++) {
      if (!newBlocks.includes(allIndices[i])) {
        newBlocks.push(allIndices[i])
      }
    }
    occupiedBlocks.value = newBlocks
    await new Promise(r => setTimeout(r, 4))
  }
}

async function reclaimBlocks() {
  const blocksToReclaim = [...occupiedBlocks.value]
  // Sort by position for wave effect (top-left to bottom-right)
  blocksToReclaim.sort((a, b) => {
    const rowA = Math.floor(a / 18), colA = a % 18
    const rowB = Math.floor(b / 18), colB = b % 18
    return (rowA + colA) - (rowB + colB)
  })
  
  // Process in batches of 6
  for (let batch = 0; batch < blocksToReclaim.length; batch += 6) {
    const batchEnd = Math.min(batch + 6, blocksToReclaim.length)
    const newReclaiming = [...reclaimingBlocks.value]
    for (let i = batch; i < batchEnd; i++) {
      newReclaiming.push(blocksToReclaim[i])
    }
    reclaimingBlocks.value = newReclaiming
    await new Promise(r => setTimeout(r, 8))
  }
  
  // Move all to reclaimed state
  reclaimedBlocks.value = [...occupiedBlocks.value]
  reclaimingBlocks.value = []
  occupiedBlocks.value = []
}

async function runIntrusionSequence(id: number) {
  resetTerritory()
  
  // 阶段1: 黑客入侵 — 占领区块 (约 2s)
  intrusionLines.value = []
  intrusionPhase.value = 'intruding'
  intrusionStatus.value = '⚠ HACKER INTRUSION IN PROGRESS...'

  // Start occupying blocks simultaneously with terminal output
  const occupyPromise = occupyBlocks(blockCount, 0.88)

  const hackSteps = [
    { text: '[HACK] Injecting malicious payload v2.1...', alert: false },
    { text: '[HACK] Bypassing firewall: 4 of 5 rules bypassed', alert: false },
    { text: '[HACK] Elevating privileges to ROOT...', alert: false },
    { text: '[HACK] Accessing profile database (attempt #3)...', alert: false },
    { text: '[HACK] Decrypting profile records...', alert: false },
  ]

  for (const s of hackSteps) {
    await new Promise(r => setTimeout(r, 350))
    intrusionLines.value.push({ ...s })
  }

  // Wait for occupation to complete (blocks fill to ~88%)
  await occupyPromise

  // 阶段2: 入侵被检测 (约 1s)
  await new Promise(r => setTimeout(r, 200))
  intrusionPhase.value = 'detected'
  intrusionStatus.value = '⚠ INTRUSION DETECTED — ADMIN NOTIFIED'

  const alertSteps = [
    { text: '[ALERT] Intrusion attempt detected from IP: 192.168.1.247', alert: true },
    { text: '[ALERT] Territory occupation at ' + Math.round((occupiedBlocks.value.length / blockCount) * 100) + '%', alert: true },
    { text: '[ALERT] Auto-defense systems engaged', alert: true },
    { text: '[ADMIN] Admin team dispatched — counter-attack ready', alert: true },
  ]

  for (const s of alertSteps) {
    await new Promise(r => setTimeout(r, 200))
    intrusionLines.value.push({ ...s })
  }

  // 阶段3: 管理员介入 — 开始反占 (约 1.5s)
  await new Promise(r => setTimeout(r, 200))
  intrusionPhase.value = 'blocking'
  intrusionStatus.value = '🛡 ADMIN INTERVENING — RECLAIMING TERRITORY'

  const blockSteps = [
    { text: '[ADMIN] Authenticating admin credentials...', alert: false },
    { text: '[ADMIN] Initiating territory reclaim protocol...', alert: false },
    { text: '[ADMIN] Deploying counter-attack wave...', alert: false },
    { text: '[ADMIN] Blocks being reclaimed in real-time...', alert: false },
    { text: '[ADMIN] Restricting access to read-only mode', alert: false },
    { text: '[ADMIN] Running security audit...', alert: false },
  ]

  // Start reclaiming simultaneously with terminal output
  const reclaimPromise = reclaimBlocks()

  for (const s of blockSteps) {
    await new Promise(r => setTimeout(r, 200))
    intrusionLines.value.push({ ...s })
  }

  // Wait for reclaim to complete
  await reclaimPromise

  // 阶段4: 系统安全 — 所有块变绿色 (约 1s)
  await new Promise(r => setTimeout(r, 200))
  intrusionLines.value = []
  intrusionPhase.value = 'secured'
  intrusionStatus.value = '✓ SYSTEM SECURED — ACCESS GRANTED (READ-ONLY)'

  // Occupy ALL remaining blocks and convert them to green (no empty spots)
  occupyAllBlocks()
  // After a brief moment, move all to reclaimed (green) state
  setTimeout(() => {
    reclaimedBlocks.value = [...occupiedBlocks.value]
    occupiedBlocks.value = []
    reclaimingBlocks.value = []
  }, 300)

  const secureSteps = [
    { text: '[SECURE] All intrusion attempts blocked', success: true },
    { text: '[SECURE] Profile access granted in read-only mode', success: true },
    { text: '[SECURE] Full audit trail logged', success: true },
    { text: '[SECURE] System integrity verified ✓', success: true },
  ]

  for (const s of secureSteps) {
    await new Promise(r => setTimeout(r, 200))
    intrusionLines.value.push({ ...s })
  }

  // Wait for green animation to fully display
  await new Promise(r => setTimeout(r, 1200))
}

function expandListItemToFullscreen(id: number) {
  const el = listItemRefs.value.get(id)
  currentListId = id
  if (!el) {
    goToReadonlyResume(id)
    return
  }
  const rect = el.getBoundingClientRect()

  // 重置动画状态
  intrusionPhase.value = null
  intrusionStatus.value = ''
  intrusionLines.value = []
  resetTerritory()

  const initialStyle = {
    position: 'fixed',
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    borderRadius: '12px',
    background: '#fff',
    zIndex: '99998',
    pointerEvents: 'auto',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)'
  }

  const targetStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    borderRadius: '0',
    background: '#fff',
    zIndex: '99998',
    pointerEvents: 'auto',
    boxShadow: 'none',
    transition: 'top 0.5s cubic-bezier(0.4, 0, 0.2, 1), left 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.5s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease'
  }

  listExpandStyle.value = initialStyle
  listExpand.visible = true

  // 注册键盘监听
  window.addEventListener('keydown', handleListKeydown)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      listExpandStyle.value = { ...targetStyle, background: '#fff' }
    })
  })

  // 放大完成后变黑 + 启动入侵动画
  setTimeout(() => {
    listExpandStyle.value = { ...targetStyle, background: '#0a0a1e' }
    startListMatrixRain()
    runIntrusionSequence(id)
  }, 500)

  // 管理员介入阶段: 整个变红
  setTimeout(() => {
    listExpandStyle.value = {
      ...targetStyle,
      background: 'linear-gradient(135deg, #2a0a0a 0%, #1a0505 100%)',
      transition: 'background 0.6s ease'
    }
  }, 2500)

  // 系统安全阶段: 整个变绿
  setTimeout(() => {
    listExpandStyle.value = {
      ...targetStyle,
      background: 'linear-gradient(135deg, #0d2818 0%, #0a1f12 100%)',
      transition: 'background 1.2s ease'
    }
  }, 5000)

  // 完成后关闭动画，返回列表
  listExpandJumpTimer = window.setTimeout(() => {
    stopListMatrixRain()
    window.removeEventListener('keydown', handleListKeydown)
    listExpand.visible = false
    goToReadonlyResume(id)
  }, 9000)
}

const pressedListId = ref<number | null>(null)

function onListItemClick(id: number) {
  pressedListId.value = id
  setTimeout(() => {
    pressedListId.value = null
    expandListItemToFullscreen(id)
  }, 200)
}

function handleLogout() {
  logout()
  window.location.href = '/'
}

onMounted(async () => {
  fetchUserInfo()
  fetchResumeList()
  // 触发入场动画
  await nextTick()
  setTimeout(() => {
    animated.value = true
  }, 500)
})
</script>

<style>
@import '../style.css';
@import '../style/Home.css';
</style>
