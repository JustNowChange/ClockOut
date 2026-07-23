import http, { ApiResult } from '../utils/http'

export interface LoginResponse {
  id: number
  username: string
  token: string
}

export interface LoginRequest {
  username: string
  password: string
}

export function login(data: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return http.post('/auth/login', data).then(res => res.data)
}
