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
      
      <!-- User Avatar with dropdown -->
      <div class="user-avatar-wrapper" @mouseenter="showAvatarPanel = true" @mouseleave="showAvatarPanel = false">
        <div class="user-avatar">
          <div class="avatar-circle">
            <span>{{ user?.username ? user.username.charAt(0).toUpperCase() : 'U' }}</span>
          </div>
        </div>
        
        <!-- User Panel -->
        <div class="avatar-panel" :class="{ 'visible': showAvatarPanel }">
          <div class="panel-avatar">
            <div class="panel-avatar-circle">
              <span>{{ user?.username ? user.username.charAt(0).toUpperCase() : 'U' }}</span>
            </div>
          </div>
          <div class="panel-info">
            <div class="panel-username">{{ user?.username || 'User' }}</div>
            <div class="panel-status" :style="{ color: getStatusColor(user?.status || 0) }">
              {{ getStatusText(user?.status || 0) }}
            </div>
          </div>
          <div class="panel-divider"></div>
          <div class="panel-menu">
            <div class="menu-item">
              <span>个人中心</span>
            </div>
            <div class="menu-item">
              <span>设置</span>
            </div>
            <div class="menu-item logout">
              <span>退出登录</span>
            </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useClock from '../function/useClock'
import useStudyDays from '../function/useStudyDays'
import useCharacters from '../function/useCharacters'
import { useAuth } from '../function/useAuth'

const router = useRouter()
const { currentTime } = useClock()
const { studyDays } = useStudyDays()
const { user, fetchUserInfo } = useAuth()
useCharacters()

const showAvatarPanel = ref(false)

// 获取状态文字
const getStatusText = (status: number) => {
  return status === 1 ? '在线' : '离线'
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  return status === 1 ? '#10b981' : '#9ca3af'
}

function goToStudy(day: any) {
  router.push(`/clock?dayId=${day.id}`)
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style>
@import '../style.css';
@import '../style/Home.css';
</style>
