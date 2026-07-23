import http, { ApiResult } from '../utils/http'

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  user: {
    id: number
    username: string
    email: string
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export function login(data: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return http.post('/auth/login', data) as Promise<ApiResult<LoginResponse>>
}

export function logout(): Promise<ApiResult> {
  return http.post('/auth/logout') as Promise<ApiResult>
}

export function refreshToken(refreshToken: string): Promise<ApiResult<LoginResponse>> {
  return http.post('/auth/refresh', { refreshToken }) as Promise<ApiResult<LoginResponse>>
}

export function getUserInfo(): Promise<ApiResult<{ id: number; username: string; email: string }>> {
  return http.get('/auth/me') as Promise<ApiResult<{ id: number; username: string; email: string }>>
}
