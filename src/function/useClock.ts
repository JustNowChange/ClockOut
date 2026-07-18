import { ref, onMounted, onUnmounted } from "vue"

export default function () {
  const currentTime = ref('')
  const finishTime = ref('')

  let timer: number | null = null

  function updateCurrentTime() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  function ACurrentTime() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    finishTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  onMounted(() => {
    updateCurrentTime()
    ACurrentTime()
    timer = window.setInterval(updateCurrentTime, 1000)
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  return {
    currentTime,
    finishTime
  }
}