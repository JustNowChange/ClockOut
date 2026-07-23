import { ref } from 'vue'
import { uploadImage as uploadImageApi } from '../api/clock'

export function useScreenshot() {
  const screenshotData = ref<string>('')

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

  async function uploadScreenshot(dayId: number, onSuccess?: (imageUrl: string) => void) {
    if (!screenshotData.value) return
    
    try {
      const response = await fetch(screenshotData.value)
      const blob = await response.blob()
      const file = new File([blob], 'screenshot.png', { type: 'image/png' })
      
      const formData = new FormData()
      formData.append('image', file)
      formData.append('dayId', dayId.toString())
      
      const res = await uploadImageApi(formData)
      console.log('上传成功:', res)
      
      if (res) {
        const imageUrl = `${import.meta.env.VITE_API_URL}${res}`
        onSuccess?.(imageUrl)
      }
      
      alert('截图上传成功')
      screenshotData.value = ''
    } catch (error) {
      console.error('上传失败:', error)
      alert('截图上传失败')
    }
  }

  function clearScreenshot() {
    screenshotData.value = ''
  }

  return {
    screenshotData,
    captureScreen,
    uploadScreenshot,
    clearScreenshot
  }
}

export default useScreenshot
