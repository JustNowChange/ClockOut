import http, { ApiResult } from '../utils/http'

// 当前登录用户资料（后端 Controller/common/CommonController，管理员与普通用户共用）
export interface MyProfile {
  id: number
  name: string
  username: string
  email?: string
}

export function getMyProfile(): Promise<ApiResult<MyProfile>> {
  return http.get('/common/me').then(res => res.data)
}
