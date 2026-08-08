<template>
  <div class="login-page">
    <!-- Left Panel -->
    <div class="left-panel" :class="{ 'animate-in': animated }">
      <!-- ============ 他人简历列表 ============ -->
      <div class="resume-list-section">
        <div class="section-header">
          <h2>他人简历</h2>
          <span class="list-count">{{ resumeList.length }} 份简历</span>
        </div>

        <div class="resume-list" :class="{ 'loading': listLoading }">
          <div class="resume-list-item"
            v-for="(item, idx) in resumeList"
            :key="item.id"
            :style="animated ? { animation: 'fadeInUp 0.8s ease forwards', animationDelay: (1.2 + idx * 0.12) + 's' } : {}"
            @click="goToReadonlyResume(item.id)">
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

        <!-- Study Days List -->
        <div class="study-days-list">
          <div class="grid-item"
            v-for="(day, idx) in studyDays"
            :key="day.id"
            :style="animated ? { animation: 'fadeInUp 0.8s ease forwards', animationDelay: (1.2 + idx * 0.12) + 's' } : {}"
            @click="goToStudy(day)">
            <div class="day-header">
              <p>{{ day.name }}</p>
              <span v-if="day.status === 1" class="check-icon">✓</span>
            </div>
            <p v-if="day.status === 1 && day.completeTime" class="complete-time">{{ day.completeTime }}</p>
            <button :class="{ 'completed': day.status === 1 }">
              {{ day.status === 1 ? '查看详情' : '开始学习' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Avatar at bottom center -->
    <div class="user-avatar-wrapper" @mouseenter="showAvatarPanel = true" @mouseleave="showAvatarPanel = false">
      <div class="user-avatar" @click="goToResume">
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
          <div class="menu-item" @click="goToResume">
            <span>我的简历</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive } from 'vue'
import { useRouter } from 'vue-router'
import useClock from '../function/useClock'
import useStudyDays from '../function/useStudyDays'
import { useAuth } from '../function/useAuth'
import useResume from '../function/useResume'

const router = useRouter()
const { currentTime } = useClock()
const { studyDays } = useStudyDays()
const { user, fetchUserInfo, logout } = useAuth()
const { resume, findModuleByType, resumeList, listLoading, fetchResumeList } = useResume()

const showAvatarPanel = ref(false)
const animated = ref(false)

// 卡片放大过渡
const cardRef = ref<HTMLElement | null>(null)
const expandOverlay = reactive({ visible: false, expanded: false })
const expandOverlayStyle = ref<Record<string, string>>({})
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

function goToStudy(day: any) {
  router.push(`/clock?dayId=${day.id}`)
}

function handleLogout() {
  logout()
  router.push('/')
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
