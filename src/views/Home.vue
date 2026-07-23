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
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact</a>
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
          <h1>打卡系统</h1>
          <p>{{ currentTime }}</p>
        </div>

        <!-- Study Days List -->
        <div class="study-days-list">
          <div class="grid-item" v-for="day in studyDays" :key="day.id" @click="goToStudy(day)">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useClock from '../function/useClock'
import { getStudyDays } from '../api/clock'

const router = useRouter()
const { currentTime } = useClock()
const studyDays = ref<any[]>([])

// Mouse tracking for character animation
let mouseX = 0, mouseY = 0
let isPurpleBlinking = false, isBlackBlinking = false
let typingTimer: ReturnType<typeof setTimeout> | null = null
let blinkPurpleTimer: ReturnType<typeof setTimeout> | null = null
let blinkBlackTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  // Fetch study days
  try {
    const res = await getStudyDays()
    studyDays.value = res.data || []
  } catch (error) {
    console.error('获取学习天数失败:', error)
  }

  // Character animation setup
  document.addEventListener('mousemove', handleMouseMove)
  scheduleBlinkPurple()
  scheduleBlinkBlack()
  updateCharacters()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  if (typingTimer) clearTimeout(typingTimer)
  if (blinkPurpleTimer) clearTimeout(blinkPurpleTimer)
  if (blinkBlackTimer) clearTimeout(blinkBlackTimer)
})

function handleMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  updateCharacters()
}

function goToStudy(day: any) {
  router.push(`/clock?dayId=${day.id}`)
}

// Character animation logic
function calcPosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX - cx
  const dy = mouseY - cy
  const faceX = Math.max(-15, Math.min(15, dx / 20))
  const faceY = Math.max(-10, Math.min(10, dy / 30))
  const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
  return { faceX, faceY, bodySkew }
}

function calcPupilOffset(el: HTMLElement, maxDist: number) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

function scheduleBlinkPurple() {
  blinkPurpleTimer = setTimeout(() => {
    isPurpleBlinking = true
    updateCharacters()
    setTimeout(() => {
      isPurpleBlinking = false
      updateCharacters()
      scheduleBlinkPurple()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function scheduleBlinkBlack() {
  blinkBlackTimer = setTimeout(() => {
    isBlackBlinking = true
    updateCharacters()
    setTimeout(() => {
      isBlackBlinking = false
      updateCharacters()
      scheduleBlinkBlack()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function updateCharacters() {
  const purple = document.getElementById('char-purple') as HTMLElement
  const black = document.getElementById('char-black') as HTMLElement
  const orange = document.getElementById('char-orange') as HTMLElement
  const yellow = document.getElementById('char-yellow') as HTMLElement

  if (!purple || !black || !orange || !yellow) return

  const purplePos = calcPosition(purple)
  const blackPos = calcPosition(black)
  const orangePos = calcPosition(orange)
  const yellowPos = calcPosition(yellow)

  // Purple body
  purple.style.transform = `skewX(${purplePos.bodySkew}deg)`
  purple.style.height = '370px'

  // Purple eyes
  const purpleEyes = document.getElementById('purple-eyes') as HTMLElement
  const purpleEyeL = document.getElementById('purple-eye-l') as HTMLElement
  const purpleEyeR = document.getElementById('purple-eye-r') as HTMLElement
  const purplePupilL = document.getElementById('purple-pupil-l') as HTMLElement
  const purplePupilR = document.getElementById('purple-pupil-r') as HTMLElement

  purpleEyeL.style.height = isPurpleBlinking ? '2px' : '18px'
  purpleEyeR.style.height = isPurpleBlinking ? '2px' : '18px'
  purpleEyes.style.left = 45 + purplePos.faceX + 'px'
  purpleEyes.style.top = 40 + purplePos.faceY + 'px'
  const po = calcPupilOffset(purpleEyeL, 5)
  purplePupilL.style.transform = `translate(${po.x}px, ${po.y}px)`
  purplePupilR.style.transform = `translate(${po.x}px, ${po.y}px)`

  // Black body
  black.style.transform = `skewX(${blackPos.bodySkew}deg)`

  // Black eyes
  const blackEyes = document.getElementById('black-eyes') as HTMLElement
  const blackEyeL = document.getElementById('black-eye-l') as HTMLElement
  const blackEyeR = document.getElementById('black-eye-r') as HTMLElement
  const blackPupilL = document.getElementById('black-pupil-l') as HTMLElement
  const blackPupilR = document.getElementById('black-pupil-r') as HTMLElement

  blackEyeL.style.height = isBlackBlinking ? '2px' : '16px'
  blackEyeR.style.height = isBlackBlinking ? '2px' : '16px'
  blackEyes.style.left = 26 + blackPos.faceX + 'px'
  blackEyes.style.top = 32 + blackPos.faceY + 'px'
  const bo = calcPupilOffset(blackEyeL, 4)
  blackPupilL.style.transform = `translate(${bo.x}px, ${bo.y}px)`
  blackPupilR.style.transform = `translate(${bo.x}px, ${bo.y}px)`

  // Orange body
  orange.style.transform = `skewX(${orangePos.bodySkew}deg)`

  // Orange eyes
  const orangeEyes = document.getElementById('orange-eyes') as HTMLElement
  const orangePupilL = document.getElementById('orange-pupil-l') as HTMLElement
  const orangePupilR = document.getElementById('orange-pupil-r') as HTMLElement

  orangeEyes.style.left = 82 + orangePos.faceX + 'px'
  orangeEyes.style.top = 90 + orangePos.faceY + 'px'
  const oo = calcPupilOffset(orangePupilL, 5)
  orangePupilL.style.transform = `translate(${oo.x}px, ${oo.y}px)`
  orangePupilR.style.transform = `translate(${oo.x}px, ${oo.y}px)`

  // Yellow body
  yellow.style.transform = `skewX(${yellowPos.bodySkew}deg)`

  // Yellow eyes & mouth
  const yellowEyes = document.getElementById('yellow-eyes') as HTMLElement
  const yellowPupilL = document.getElementById('yellow-pupil-l') as HTMLElement
  const yellowPupilR = document.getElementById('yellow-pupil-r') as HTMLElement
  const yellowMouth = document.getElementById('yellow-mouth') as HTMLElement

  yellowEyes.style.left = 52 + yellowPos.faceX + 'px'
  yellowEyes.style.top = 40 + yellowPos.faceY + 'px'
  const yo = calcPupilOffset(yellowPupilL, 5)
  yellowPupilL.style.transform = `translate(${yo.x}px, ${yo.y}px)`
  yellowPupilR.style.transform = `translate(${yo.x}px, ${yo.y}px)`
  yellowMouth.style.left = 40 + yellowPos.faceX + 'px'
  yellowMouth.style.top = 88 + yellowPos.faceY + 'px'
  yellowMouth.style.transform = 'rotate(0deg)'
}
</script>

<style>
@import '../style.css';
@import '../style/Home.css';
</style>
