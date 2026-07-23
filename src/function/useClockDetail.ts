import { ref, onMounted } from 'vue'
import { getClockDetail } from '../api/clock'

export function useClockDetail(dayId: number | null) {
  const detailData = ref<any>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDetail(targetDayId?: number) {
    const id = targetDayId ?? dayId
    if (!id) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await getClockDetail(id)
      detailData.value = res.data || {}
    } catch (err) {
      console.error('获取详情失败:', err)
      error.value = '获取详情失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDetail()
  })

  function updateImageUrl(imageUrl: string) {
    detailData.value.imageUrl = imageUrl
  }

  return {
    detailData,
    loading,
    error,
    fetchDetail,
    updateImageUrl
  }
}

export default useClockDetail
