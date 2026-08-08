<template>
  <div class="login-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <!-- ============ 他人简历列表 ============ -->
      <div class="resume-list-section">
        <div class="section-header">
          <h2>他人简历</h2>
          <span class="list-count">{{ resumeList.length }} 份简历</span>
        </div>

        <div class="resume-list" :class="{ 'loading': listLoading }">
          <div class="resume-list-item" v-for="item in resumeList" :key="item.id" @click="goToReadonlyResume(item.id)">
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
        <div class="resume-preview-card" @click="goToResume">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

onMounted(() => {
  fetchUserInfo()
  fetchResumeList()
})
</script>

<style>
@import '../style.css';
@import '../style/Home.css';
</style>
