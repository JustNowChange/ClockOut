import http, { ApiResult } from '../utils/http'

export interface LoginResponse {
  id: number
  username: string
  token: string
}

export interface UserInfoResponse {
  id: number
  name: string     // 后端返回的是 name，不是 username
  status: number   // 在线状态：0-离线，1-在线
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  id: number
  username: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export function login(data: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return http.post('/auth/login', data).then(res => res.data)
}

export function register(data: RegisterRequest): Promise<ApiResult<RegisterResponse>> {
  return http.post('/auth/register', data).then(res => res.data)
}

export function getUserInfo(id: number): Promise<ApiResult<UserInfoResponse>> {
  return http.get(`/auth/user-info/${id}`).then(res => res.data)
}
