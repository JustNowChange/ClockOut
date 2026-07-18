import { ref } from 'vue'

export const show = ref(true)
export const studyTime = ref('')

export function isShow() {
  window.open('https://typewords.cc/', '_blank')
  studyTime.value = new Date().toLocaleString('zh-CN')
  return show.value = !show.value
}