<template>
  <div class="register-form-page" :class="{ 'scale-in': isScaled, 'content-in': isContentVisible }">
    <!-- Background gradient animation -->
    <div class="bg-gradient"></div>
    <div class="bg-gradient-2"></div>
    
    <div class="form-container">
      <div class="form-header" :class="{ 'fade-in': isContentVisible }">
        <h1>创建账号</h1>
        <p>开启您的ClockOut</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group" :class="{ 'slide-up': isContentVisible }">
          <input 
            v-model="username" 
            type="text" 
            placeholder="账号" 
            autocomplete="off"
            class="input-field"
          />
        </div>

        <div class="form-group" :class="{ 'slide-up': isContentVisible }">
          <input 
            v-model="password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="密码"
            class="input-field"
          />
          <button type="button" class="toggle-password" @click="togglePassword">
            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>

        <div class="form-group" :class="{ 'slide-up': isContentVisible }">
          <input 
            v-model="confirmPassword" 
            :type="showConfirmPassword ? 'text' : 'password'" 
            placeholder="确认密码"
            class="input-field"
          />
          <button type="button" class="toggle-password" @click="toggleConfirmPassword">
            <svg v-if="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>

        <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>

        <button type="submit" class="btn-register" :class="{ 'fade-in': isContentVisible }" :disabled="isLoading">
          <span>{{ isLoading ? '注册中...' : '注 册' }}</span>
        </button>
      </form>

      <div class="form-footer" :class="{ 'fade-in': isContentVisible }">
        <span>已有账号？</span>
        <router-link to="/">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useRegister from '../function/useRegister'

const isScaled = ref(false)
const isContentVisible = ref(false)

const {
  username,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  errorMsg,
  isLoading,
  handleRegister,
  togglePassword,
  toggleConfirmPassword
} = useRegister()

onMounted(() => {
  // Step 1: Start scale animation (shrink -> expand)
  setTimeout(() => {
    isScaled.value = true
  }, 100)
  
  // Step 2: Show content after scale animation completes (800ms)
  setTimeout(() => {
    isContentVisible.value = true
  }, 900)
})
</script>

<style>
@import '../style/RegisterForm.css';
</style>
