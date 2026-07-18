<template>
  <div class="container">
    <header>
      <h1>打卡系统</h1>
      <p class="current-time">{{ currentTime }}</p>
    </header>

    <div class="grid-container">
      <div class="grid-item" v-for="day in studyDays" :key="day.id">
        <div class="day-header">
          <p>{{ day.name }}</p>
          <span v-if="day.status === 1" class="check-icon">✓</span>
        </div>
        <p v-if="day.status === 1 && day.completeTime" class="complete-time">{{ day.completeTime }}</p>
        <button @click="goToStudy(day)" :class="{ 'completed': day.status === 1 }">
          {{ day.status === 1 ? '查看详情' : '开始' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useClock from '../function/useClock'
import { getStudyDays } from '../api/clock'

const router = useRouter()
const { currentTime } = useClock()
const studyDays = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await getStudyDays()
    studyDays.value = res.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
    studyDays.value = [
      { id: 1, name: 'day 1', status: 1, completeTime: '2026-07-17 18:30:00' },
      { id: 2, name: 'day 2', status: 0 },
      { id: 3, name: 'day 3', status: 0 },
      { id: 4, name: 'day 4', status: 0 }
    ]
  }
})

function goToStudy(day: any) {
  router.push({ path: '/clock', query: { dayId: day.id } })
}
</script>

<style>
@import '../style.css';
@import '../style/Home.css';
</style>