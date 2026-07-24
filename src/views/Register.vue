<template>
  <div class="register-page">
    <!-- Intro Screen -->
    <div 
      class="intro-screen" 
      :class="{ hidden: showForm }"
      @click="enterRegister"
      :style="{ pointerEvents: transitioning || step < 4 ? 'none' : 'auto' }"
    >
      <!-- Top-left status -->
      <div class="top-left-status">
        <span v-if="step < 4">{{ Math.round(progress) }}%</span>
        <span v-else>READY</span>
      </div>

      <!-- Loading Circle Container -->
      <div class="enter-circle" :class="{ 'loaded': step === 4 }">
       
        <!-- Step 2: Solid ring outline -->
        <div class="ring-outline" :class="{ 'visible': step >= 2 }"></div>
        
        <!-- Step 3: Loading progress ring -->
        <div class="ring-progress" :class="{ 'visible': step >= 3 }">
          <svg viewBox="0 0 100 100" class="progress-svg">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(91, 33, 182, 0.8)"
              stroke-width="1"
              stroke-linecap="round"
              class="progress-circle"
              :style="{ strokeDashoffset: 283 - (283 * progress) / 100 }"
            />
          </svg>
        </div>
        
        <!-- Center content -->
        <div class="center-content" :class="{ 'hidden': transitioning }">
          <!-- Logo (show during step 2-3) -->
          <div class="logo" :class="{ 'visible': step >= 2 && step < 4 }">
            <span>R</span>
          </div>
          <!-- Final text (show at step 4) -->
          <div class="enter-text" :class="{ 'blink': step === 4 }">
            {{ step === 4 ? 'Welcome' : '' }}
          </div>
        </div>
        
        <!-- Transition text: REGISTER ACCESS -->
        <div class="transition-text" :class="{ 'visible': showTransitionText }">
          REGISTER ACCESS
        </div>
        
        <!-- Outer dashed ring - show after loading complete -->
      </div>

      <!-- Footer Info -->
      <div class="footer-info">
        <div class="footer-item left" :class="{ 'visible': step >= 1 }">
          <span class="brand">ClockOut</span>
          <span class="tagline">打卡系统</span>
        </div>
        <div class="footer-item center" :class="{ 'visible': step >= 1 }">
          <span class="label">OVERVIEW:</span>
          <span class="value">OB PROJECTS</span>
        </div>
        <div class="footer-item right" :class="{ 'visible': step >= 1 }">
          <span class="label">V-0.02</span>
        </div>
      </div>
      
      <!-- Wipe Line Animation -->
      <div class="wipe-line"></div>
      <div class="wipe-mask"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import{ useIntro }from '../function/useIntro'

const router = useRouter()
const showForm = ref(false)
const { step, progress, transitioning, showTransitionText, startProgress, enterRegister, cleanup } = useIntro(() => {
  router.push('/register/form')
})

onMounted(() => {
  // Step 1: Footer text + spinning dashed ring
  setTimeout(() => {
    step.value = 1
  }, 300)
  
  // Step 2: Solid ring + logo appears
  setTimeout(() => {
    step.value = 2
  }, 1200)
  
  // Step 3: Progress starts (0-100%)
  setTimeout(() => {
    step.value = 3
    startProgress()
  }, 1800)
  
  // Step 4: Loading complete
  setTimeout(() => {
    step.value = 4
  }, 4500)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style>
@import '../style/Register.css';
</style>
