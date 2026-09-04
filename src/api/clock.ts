import http, { ApiResult } from '../utils/http'

export function uploadImage(data: FormData): Promise<ApiResult<string>> {
  return http.post('/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}
