import http from '../utils/http'

export function getStudyDays() {
  return http.get('/study/days')
}

export function getClockDetail(dayId: number) {
  return http.get(`/clock/detail/${dayId}`)
}

export function uploadImage(data: FormData) {
  return http.post('/upload/image', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}