<template>
  <div class="container">
    <button @click="goBack" class="back-btn">← 返回</button>
    
    <header>
      <h1>打卡页面</h1>
      <p class="current-time">{{ currentTime }}</p>
    </header>

    <div class="main-content">
      <div class="study-panel">
        <button class="Bclass" @click="isShow" v-if="show && !detailData.status">英语学习</button>
        
        <div v-if="studyTime" class="study-info">
          <p>学习时间: {{ studyTime }}</p>
          <button v-if="!detailData.status" @click="captureScreen" class="upload-btn">截取屏幕</button>
          <button v-if="screenshotData" @click="handleUpload" class="upload-btn">上传截图</button>
        </div>
      </div>
      
      <div class="image-panel">
        <img v-if="detailData.imageUrl" :src="detailData.imageUrl" class="screenshot-preview" />
        <img v-else-if="screenshotData" :src="screenshotData" class="screenshot-preview" />
        <div v-else class="image-placeholder">
          <p>P</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useClock from '../function/useClock'
import useScreenshot from '../function/useScreenshot'
import useClockDetail from '../function/useClockDetail'
import { isShow, show, studyTime } from '../function/isShow'

const router = useRouter()
const route = useRoute()
const { currentTime } = useClock()
const { screenshotData, captureScreen, uploadScreenshot } = useScreenshot()

const dayId = computed(() => {
  const id = parseInt(route.query.dayId as string)
  return isNaN(id) ? null : id
})

const { detailData, updateImageUrl } = useClockDetail(dayId.value)

function goBack() {
  router.push('/home')
}

function handleUpload() {
  if (dayId.value) {
    uploadScreenshot(dayId.value, (imageUrl) => {
      updateImageUrl(imageUrl)
    })
  }
}
</script>

<style>
@import '../style.css';
@import '../style/Clock.css';
</style>
