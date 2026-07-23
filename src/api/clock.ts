import http, { ApiResult } from '../utils/http'

export interface Days {
  id: number
  name: string
  status: number
  completeTime: string
}

export function getStudyDays(): Promise<ApiResult<Days[]>> {
  return http.get('/study/days').then(res => res.data)
}

export function getClockDetail(dayId: number): Promise<ApiResult<Days>> {
  return http.get(`/clock/detail/${dayId}`).then(res => res.data)
}

export function uploadImage(data: FormData): Promise<ApiResult<string>> {
  return http.post('/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}
