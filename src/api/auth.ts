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

export function logout(): Promise<ApiResult> {
  return http.post('/auth/logout', null).then(res => res.data)
}

export function getUserInfo(): Promise<ApiResult<{ id: number; username: string }>> {
  return http.get('/auth/me').then(res => res.data)
}
