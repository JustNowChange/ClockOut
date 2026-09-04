<template>
  <div class="login-page" :class="{ 'page-ready': !showIntro }">
    <!-- 电影开场动画 -->
    <CinematicIntro v-if="showIntro" :visible="showIntro" @complete="onIntroComplete" />

    <!-- 实时弹幕背景 -->
    <DanmakuOverlay v-if="!showIntro" :density="1" :enabled="danmakuEnabled" />

    <!-- Loading Overlay -->
    <LoadingOverlay
      v-if="showLoading"
      :duration="3000"
      @complete="onAnimationComplete"
    />

    <!-- Left Panel -->
    <div class="left-panel">
      <!-- 主题装饰层 (樱花树 / 云 / 星月) -->
      <div class="theme-decor-layer" aria-hidden="true">
        <div class="decor decor-pink">
          <!-- 樱花树：位于左侧，树干从底部升起，树冠占左上方 -->
          <svg class="sakura-tree" viewBox="0 0 320 600" preserveAspectRatio="xMinYMax meet" xmlns="http://www.w3.org/2000/svg">
            <!-- 树干 -->
            <path d="M70,600 C72,530 60,480 68,430 C74,390 84,365 92,330 C96,310 94,288 100,266 C104,248 110,232 112,210"
                  stroke="#7a4a3d" stroke-width="14" fill="none" stroke-linecap="round" />
            <path d="M68,520 C50,510 38,500 28,482" stroke="#7a4a3d" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M80,470 C64,462 50,456 40,446" stroke="#7a4a3d" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M86,430 C110,420 132,408 150,390" stroke="#7a4a3d" stroke-width="8" fill="none" stroke-linecap="round"/>
            <path d="M90,360 C118,350 140,340 162,322" stroke="#7a4a3d" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M94,300 C120,294 140,286 158,270" stroke="#7a4a3d" stroke-width="5" fill="none" stroke-linecap="round"/>
            <!-- 树冠：多个重叠的粉色圆 -->
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
            <!-- 花朵点缀 -->
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
          <!-- 白色主题：柔和云朵 -->
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
          <!-- 黑色主题：月亮 + 星星 -->
          <svg class="star-decor" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <!-- 月亮 -->
            <defs>
              <radialGradient id="moon-grad" cx="40%" cy="40%" r="60%">
                <stop offset="0%"   stop-color="#fff9e6"/>
                <stop offset="100%" stop-color="#f0e6b8"/>
              </radialGradient>
            </defs>
            <circle cx="420" cy="90" r="42" fill="url(#moon-grad)" opacity="0.95"/>
            <!-- 星星 -->
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

      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
          <path d="M12 2L15 9H9L12 2Z" />
          <path d="M12 22L9 15H15L12 22Z" />
          <path d="M2 12L9 9V15L2 12Z" />
          <path d="M22 12L15 15V9L22 12Z" />
        </svg>
        <span>ClockOut</span>
      </div>

      <!-- 打字效果区域 -->
      <div class="typing-container">
        <span class="typing-prompt"></span>
        <span class="typing-text" ref="typingTextRef"></span>
        <span class="typing-cursor">_</span>
      </div>

      <div class="characters-wrapper">
        <div class="characters-scene" id="characters-scene">
          <img
            :src="charClicked ? charClickedImg : charDefaultImg"
            alt="characters"
            class="char-img"
          />
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
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
          <h1>欢迎回来</h1>
          <p>请输入您的账号信息</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">账号</label>
            <div class="input-wrapper">
              <input 
                id="username"
                name="username"
                v-model="username" 
                type="text" 
                placeholder="请输入账号" 
                autocomplete="off"
                @input="onTyping"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <div class="input-wrapper">
              <input 
                id="password"
                name="password"
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                @focus="onPasswordFocus"
                @blur="onPasswordBlur"
                @input="onPasswordInput"
              />
              <button type="button" class="toggle-password" @click="togglePassword">
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" /> 记住我
            </label>
            <a href="#" class="forgot-link">忘记密码？</a>
          </div>

          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
          </div>

          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <span class="btn-text">{{ isLoading ? '登录中...' : '登 录' }}</span>
            <div class="btn-hover-content">
              <span>登 录</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import useLogin from '../function/useLogin'
import useCharacters from '../function/useCharacters'
import LoadingOverlay from '../components/LoadingOverlay.vue'
import CinematicIntro from '../components/CinematicIntro.vue'
import DanmakuOverlay from '../components/DanmakuOverlay.vue'
import charDefaultImg from '../assets/char-default.webp'
import charClickedImg from '../assets/char-clicked.webp'
import { preloadImages } from '../utils/imageCache'

const {
  username,
  password,
  showPassword,
  rememberMe,
  errorMsg,
  isLoading,
  isError,
  loginSuccess,
  handleLogin,
  navigateToHome,
  togglePassword,
  loadRememberedUsername
} = useLogin()

const showLoading = ref(false)
const showIntro = ref(true)
const charClicked = ref(false)
let charResetTimer: number | null = null

// 弹幕开关：从 localStorage 读取，默认开
const DANMAKU_KEY = 'clockout-danmaku-enabled'
const danmakuEnabled = ref(true)
function loadDanmakuSetting() {
  const saved = localStorage.getItem(DANMAKU_KEY)
  if (saved === '0') danmakuEnabled.value = false
}
function onDanmakuToggleChanged() {
  const saved = localStorage.getItem(DANMAKU_KEY)
  danmakuEnabled.value = saved !== '0'
}

const INTERACTIVE_SELECTORS = 'input, button, textarea, select, a, label, [role="button"], [contenteditable], .no-cute'

function triggerCharacterChange() {
  charClicked.value = true
  if (charResetTimer) clearTimeout(charResetTimer)
  charResetTimer = window.setTimeout(() => {
    charClicked.value = false
    charResetTimer = null
  }, 400)
}

function onGlobalClick(e: MouseEvent) {
  if (showIntro.value) return
  const target = e.target as HTMLElement
  if (!target) return
  if (target.closest(INTERACTIVE_SELECTORS)) return
  triggerCharacterChange()
}

onMounted(() => {
  window.addEventListener('click', onGlobalClick)
  window.addEventListener('clockout-danmaku-toggle', onDanmakuToggleChanged)
  loadRememberedUsername()
  loadDanmakuSetting()
  // 预加载角色图片到浏览器缓存
  preloadImages([charDefaultImg, charClickedImg])
  setTimeout(() => { startTypingAnimation() }, 800)
})

onUnmounted(() => {
  window.removeEventListener('click', onGlobalClick)
  window.removeEventListener('clockout-danmaku-toggle', onDanmakuToggleChanged)
  cleanupTypingTimers()
})

function onIntroComplete() {
  showIntro.value = false
}

function onAnimationComplete() {
  showLoading.value = false
  navigateToHome()
}

watch(loginSuccess, (newVal) => {
  if (newVal) {
    showLoading.value = true
  }
})

// 打字效果
const typingTextRef = ref<HTMLElement | null>(null)
const typingMessages = [
  '欢迎来到 ClockOut...',
  '"我没有天赋..."',
  '"但我总想试一试,一个普通人怀有梦想会是什么样..."',
  '"人生没有无用的经历..."',
  '"所以..."',
  '"很简单，我进厂不就是了"',
  '"说完，他的气息不再掩饰，显露而出"',
  '"再回流水线，竟是大专巅峰修为！"',
  '"我乃大专巅峰！谁敢叼我 谁能叼我！"',
  '"一瞬间，流水线再次一寂"',
  '"只见他挥手间就飞出三只蛊虫，一转苦力蛊，二转牛马蛊，三转吗喽蛊!"',
  '"电子厂中寒风吹  流水线上大神归。"',
  '"无休倒班万人退，本科悔而我不悔！"',
  '"他牢牢占据工位，转身低眉道:不过是些许夜班罢了"',
  'clockout init --success ✓'
]
let typingTimer: number | null = null
let clearTimer: number | null = null
let messageIndex = 0
let charIndex = 0
let isDeleting = false

function startTypingAnimation() {
  if (!typingTextRef.value) return

  const currentMessage = typingMessages[messageIndex]
  const el = typingTextRef.value

  if (!isDeleting) {
    // 正在打字
    if (charIndex < currentMessage.length) {
      el.textContent = currentMessage.substring(0, charIndex + 1)
      charIndex++
      const typingSpeed = Math.random() > 0.8 ? 120 : 60 + Math.random() * 40
      typingTimer = window.setTimeout(startTypingAnimation, typingSpeed)
    } else {
      // 打完了，等待一会开始删除
      isDeleting = true
      clearTimer = window.setTimeout(startTypingAnimation, 2500)
    }
  } else {
    // 正在删除
    if (charIndex > 0) {
      el.textContent = currentMessage.substring(0, charIndex - 1)
      charIndex--
      clearTimer = window.setTimeout(startTypingAnimation, 30)
    } else {
      // 删除完了，换下一条
      isDeleting = false
      messageIndex = (messageIndex + 1) % typingMessages.length
      clearTimer = window.setTimeout(startTypingAnimation, 500)
    }
  }
}

function cleanupTypingTimers() {
  if (typingTimer !== null) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
  if (clearTimer !== null) {
    clearTimeout(clearTimer)
    clearTimer = null
  }
}

const {
  setTyping,
  triggerError,
  schedulePeek,
  isPasswordFocused,
  passwordLength
} = useCharacters()

function onTyping() {
  setTyping(true)
}

function onPasswordFocus() {
  isPasswordFocused.value = true
}

function onPasswordBlur() {
  isPasswordFocused.value = false
}

function onPasswordInput() {
  passwordLength.value = password.value.length
  setTyping(true)
}

watch(showPassword, (newVal) => {
  if (newVal && password.value.length > 0) {
    schedulePeek()
  }
})

watch(isError, (newVal) => {
  if (newVal) {
    triggerError()
  }
})
</script>

<style>
@import '../style.css';
@import '../style/Login.css';
</style>
