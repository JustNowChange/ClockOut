<template>
  <div class="login-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2L15 9H9L12 2Z" />
          <path d="M12 22L9 15H15L12 22Z" />
          <path d="M2 12L9 9V15L2 12Z" />
          <path d="M22 12L15 15V9L22 12Z" />
        </svg>
        <span>ClockOut</span>
      </div>
      <div class="characters-wrapper">
        <div class="characters-scene" id="characters-scene">
          <!-- Purple character -->
          <div class="character char-purple" id="char-purple">
            <div class="eyes" id="purple-eyes" style="left: 45px; top: 40px; gap: 28px">
              <div class="eyeball" id="purple-eye-l" style="width: 18px; height: 18px">
                <div class="pupil" id="purple-pupil-l" style="width: 7px; height: 7px"></div>
              </div>
              <div class="eyeball" id="purple-eye-r" style="width: 18px; height: 18px">
                <div class="pupil" id="purple-pupil-r" style="width: 7px; height: 7px"></div>
              </div>
            </div>
          </div>
          <!-- Black character -->
          <div class="character char-black" id="char-black">
            <div class="eyes" id="black-eyes" style="left: 26px; top: 32px; gap: 20px">
              <div class="eyeball" id="black-eye-l" style="width: 16px; height: 16px">
                <div class="pupil" id="black-pupil-l" style="width: 6px; height: 6px"></div>
              </div>
              <div class="eyeball" id="black-eye-r" style="width: 16px; height: 16px">
                <div class="pupil" id="black-pupil-r" style="width: 6px; height: 6px"></div>
              </div>
            </div>
          </div>
          <!-- Orange character -->
          <div class="character char-orange" id="char-orange">
            <div class="eyes" id="orange-eyes" style="left: 82px; top: 90px; gap: 28px">
              <div class="bare-pupil" id="orange-pupil-l"></div>
              <div class="bare-pupil" id="orange-pupil-r"></div>
            </div>
            <div class="orange-mouth" id="orange-mouth" style="left: 90px; top: 120px"></div>
          </div>
          <!-- Yellow character -->
          <div class="character char-yellow" id="char-yellow">
            <div class="eyes" id="yellow-eyes" style="left: 52px; top: 40px; gap: 20px">
              <div class="bare-pupil" id="yellow-pupil-l"></div>
              <div class="bare-pupil" id="yellow-pupil-r"></div>
            </div>
            <div class="yellow-mouth" id="yellow-mouth" style="left: 40px; top: 88px"></div>
          </div>
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
            <label>账号</label>
            <div class="input-wrapper">
              <input 
                v-model="username" 
                type="text" 
                placeholder="请输入账号" 
                autocomplete="off"
                @input="onTyping"
              />
            </div>
          </div>

          <div class="form-group">
            <label>密码</label>
            <div class="input-wrapper">
              <input 
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
import { watch, onMounted } from 'vue'
import useLogin from '../function/useLogin'
import useCharacters from '../function/useCharacters'

const {
  username,
  password,
  showPassword,
  rememberMe,
  errorMsg,
  isLoading,
  isError,
  handleLogin,
  togglePassword,
  loadRememberedUsername
} = useLogin()

onMounted(() => {
  loadRememberedUsername()
})

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
