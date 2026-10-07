import http, { ApiResult } from '../utils/http'

// ============================================================
// 管理端接口封装（/api/admin/**）
// ============================================================

// 当前管理员资料 GET /admin/info
export interface AdminInfo {
  id: number
  name: string
  username: string
  email?: string
}

// 控制台总览统计 GET /admin/stats
export interface AdminStats {
  totalUsers: number
  onlineUsers: number
  bannedUsers: number
  todayNewUsers: number
}

// 用户列表行
export interface AdminUserItem {
  uid: number
  username: string
  name: string
  email?: string | null
  registerTime?: string
  lastLoginTime?: string | null
  lastLoginIp?: string | null
  online: boolean
  banType: number      // 0正常 1临时封禁 2永久封禁
  banReason?: string | null
  banEnd?: string | null
}

// 用户分页结果
export interface AdminUserPage {
  total: number
  page: number
  pageSize: number
  list: AdminUserItem[]
}

// 用户列表查询参数
export interface AdminUserQuery {
  page?: number
  pageSize?: number
  keyword?: string
  banType?: number    // 0正常 1临时 2永久
  online?: number     // 1在线 0离线
}

// 封禁请求
export interface BanPayload {
  banType: number     // 1临时 2永久
  banReason: string
  banEnd?: string     // 临时封禁到期时间 yyyy-MM-dd HH:mm:ss
}

export function getAdminInfo(): Promise<ApiResult<AdminInfo>> {
  return http.get('/admin/info').then(res => res.data)
}

// 控制台总览统计
export function getAdminStats(): Promise<ApiResult<AdminStats>> {
  return http.get('/admin/stats').then(res => res.data)
}

// 用户分页列表
export function getAdminUsers(query: AdminUserQuery): Promise<ApiResult<AdminUserPage>> {
  return http.get('/admin/users', { params: query }).then(res => res.data)
}

// 封禁用户
export function banUser(uid: number, payload: BanPayload): Promise<ApiResult<string>> {
  return http.post(`/admin/users/${uid}/ban`, payload).then(res => res.data)
}

// 解封用户
export function unbanUser(uid: number): Promise<ApiResult<string>> {
  return http.post(`/admin/users/${uid}/unban`).then(res => res.data)
}

// 踢出登录
export function kickUser(uid: number, reason?: string): Promise<ApiResult<string>> {
  return http.post(`/admin/users/${uid}/kick`, { reason: reason || '' }).then(res => res.data)
}
