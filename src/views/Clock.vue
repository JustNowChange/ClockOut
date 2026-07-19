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
          <button v-if="screenshotData" @click="uploadScreenshot" class="upload-btn">上传截图</button>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useClock from '../function/useClock'
import { getClockDetail, uploadImage as uploadImageApi } from '../api/clock'
import { isShow, show, studyTime } from '../function/isShow'

const router = useRouter()
const route = useRoute()
const { currentTime } = useClock()
const screenshotData = ref<string>('')
const detailData = ref<any>({})

onMounted(async () => {
  const dayId = parseInt(route.query.dayId as string)
  if (dayId) {
    try {
      const res = await getClockDetail(dayId)
      detailData.value = res.data || {}
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }
})

function goBack() {
  router.push('/')
}

async function captureScreen() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    })
    const video = document.createElement('video')
    video.srcObject = stream
    await video.play()
    
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx!.drawImage(video, 0, 0)
    
    stream.getTracks().forEach(track => track.stop())
    screenshotData.value = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('截图失败:', error)
    alert('截图失败，请允许屏幕录制权限')
  }
}

async function uploadScreenshot() {
  if (!screenshotData.value) return
  try {
    const response = await fetch(screenshotData.value)
    const blob = await response.blob()
    const file = new File([blob], 'screenshot.png', { type: 'image/png' })
    const dayId = parseInt(route.query.dayId as string)
    
    const formData = new FormData()
    formData.append('image', file)
    formData.append('dayId', dayId.toString())
    
    const res = await uploadImageApi(formData)
    console.log('上传成功:', res)
    if (res) {
      detailData.value.imageUrl = `${import.meta.env.VITE_API_URL}${res}`
    }
    alert('截图上传成功')
    screenshotData.value = ''
  } catch (error) {
    console.error('上传失败:', error)
    alert('截图上传失败')
  }
}
</script>

<style>
@import '../style.css';
@import '../style/Clock.css';
</style>