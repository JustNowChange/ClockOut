import { ref, onMounted } from 'vue'
import { getStudyDays } from '../api/clock'

export function useStudyDays() {
  const studyDays = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStudyDays() {
    loading.value = true
    error.value = null
    
    try {
      const res = await getStudyDays()
      studyDays.value = res.data || []
    } catch (err) {
      console.error('获取学习天数失败:', err)
      error.value = '获取学习天数失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchStudyDays()
  })

  function refresh() {
    fetchStudyDays()
  }

  return {
    studyDays,
    loading,
    error,
    refresh
  }
}

export default useStudyDays
