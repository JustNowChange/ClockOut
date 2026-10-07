import http, { ApiResult, getRefreshToken } from '../utils/http'

export interface LoginResponse {
  id: number
  name: string          // 昵称
  username: string
  email?: string
  token: string         // 访问令牌(短期)
  refreshToken: string  // 刷新令牌(长期)，前端存 sessionStorage，刷新时放请求头
}

export interface UserInfoResponse {
  id: number
  name: string
  username?: string
  email?: string
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

// 退出登录: 刷新令牌放请求头，后端只删除当前标签页这一条会话(按jti)
export function logout(): Promise<ApiResult<null>> {
  const refreshToken = getRefreshToken()
  return http.post('/auth/logout', null, {
    headers: refreshToken ? { RefreshToken: refreshToken } : {}
  }).then(res => res.data)
}
