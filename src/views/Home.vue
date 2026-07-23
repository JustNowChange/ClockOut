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
import { useRouter } from 'vue-router'
import useClock from '../function/useClock'
import useStudyDays from '../function/useStudyDays'
import useCharacters from '../function/useCharacters'

const router = useRouter()
const { currentTime } = useClock()
const { studyDays } = useStudyDays()
useCharacters()

function goToStudy(day: any) {
  router.push(`/clock?dayId=${day.id}`)
}
</script>

<style>
@import '../style.css';
@import '../style/Home.css';
</style>
