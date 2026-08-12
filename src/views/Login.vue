<template>
  <div class="login-page" :class="{ 'page-ready': !showIntro }">
    <!-- 电影开场动画 -->
    <CinematicIntro v-if="showIntro" :visible="showIntro" @complete="onIntroComplete" />

    <!-- 实时弹幕背景 -->
    <DanmakuOverlay v-if="!showIntro" :density="1" :enabled="true" />

    <!-- Loading Overlay -->
    <LoadingOverlay
      v-if="showLoading"
      :duration="3000"
      @complete="onAnimationComplete"
    />

    <!-- Left Panel -->
    <div class="left-panel">
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
import charDefaultImg from '../assets/char-default.png'
import charClickedImg from '../assets/char-clicked.png'
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
  loadRememberedUsername()
  // 预加载角色图片到浏览器缓存
  preloadImages([charDefaultImg, charClickedImg])
  setTimeout(() => { startTypingAnimation() }, 800)
})

onUnmounted(() => {
  window.removeEventListener('click', onGlobalClick)
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
