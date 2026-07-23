import http from '../utils/http'

export interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    refreshToken: string
    expiresIn: number
    user: {
      id: number
      username: string
      email: string
    }
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export function login(data: LoginRequest) {
  return http.post<LoginResponse>('/auth/login', data)
}

export function logout() {
  return http.post('/auth/logout')
}

export function refreshToken(refreshToken: string) {
  return http.post<LoginResponse>('/auth/refresh', { refreshToken })
}

export function getUserInfo() {
  return http.get('/auth/me')
}
