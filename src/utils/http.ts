import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}


const http = axios.create({
  baseURL: "/api",
  timeout: 10000,
  transformResponse: [(data: string) => {
    try {
      const result = JSON.parse(data) as ApiResult
      if (result.code === 1) {
        return result
      } else {
        throw new Error(result.msg || '请求失败')
      }
    } catch (e) {
      return data
    }
  }]
})

// ============================================================
// 多账号并行：全部登录态存 sessionStorage（按标签页隔离）
// A/B 标签页可同时登录不同账号，互不覆盖；关标签页自动清除。
// ============================================================
const TOKEN_KEY = 'clockout_token'              // 访问令牌(短期)
const REFRESH_TOKEN_KEY = 'clockout_refresh'    // 刷新令牌(长期)，刷新时放在请求头回传
const USER_ID_KEY = 'clockout_user_id'

// 管理员判定：通过 uid（与后端 sky.admin-uid 配置保持一致）
// dev 环境固定 100001（账号 ace）；若后端 ADMIN_UID 变更，此处需同步改值或通过 .env 覆盖
export const ADMIN_UID = 100001

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getUserId(): number | null {
  const id = sessionStorage.getItem(USER_ID_KEY)
  return id ? parseInt(id) : null
}

export function setUserId(id: number): void {
  sessionStorage.setItem(USER_ID_KEY, id.toString())
}

export function removeUserId(): void {
  sessionStorage.removeItem(USER_ID_KEY)
}

http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers && !config.headers['X-Skip-Token']) {
      // 主动预检: token临期(剩余<阈值)先静默刷新再发原请求, 避免红色401(POST也不会丢)
      try {
        const validToken = await ensureFreshToken(token)
        config.headers.token = validToken
      } catch {
        // 刷新令牌也失效: 清登录态跳登录页, 原请求终止
        clearAuthAndRedirect()
        return Promise.reject(new Error('登录状态已失效'))
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 双token: 请求重放标记(只重放一次, 防止刷新接口自身401时死循环)
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    __isRetry?: boolean
  }
}

// ---------- 双token: 主动预检 + 401兜底, 共用并发锁 ----------
// 刷新令牌存于本标签页 sessionStorage，刷新时通过自定义请求头 RefreshToken 回传，
// 不依赖 cookie，因此同浏览器多标签页可登录不同账号而互不串号。
// 并发锁: 刷新期间本标签内所有请求(含被动401)共用同一个刷新Promise, 不会重复刷新。

// 主动刷新提前量: token剩余不足该值即静默刷新(生产TTL 30min, 提前20s足够覆盖网络波动)
const REFRESH_AHEAD_MS = 20_000

let refreshingPromise: Promise<string> | null = null

// 解析JWT的exp(秒级): payload为Base64URL编码的JSON; 解析失败返回null交给401兜底
function getTokenExp(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // exp是数字, 无中文, atob直接解码即可
    const claims = JSON.parse(atob(base64))
    return typeof claims.exp === 'number' ? claims.exp : null
  } catch {
    return null
  }
}

// 判断token是否进入临期窗口; exp解析失败不预判(时钟漂移/格式异常由401链路兜底)
function isTokenExpiring(token: string): boolean {
  const exp = getTokenExp(token)
  if (exp == null) return false
  return exp * 1000 - Date.now() < REFRESH_AHEAD_MS
}

// 返回当前可用token: 未临期原样返回, 临期则走共享刷新
function ensureFreshToken(token: string): Promise<string> {
  return isTokenExpiring(token) ? startRefresh() : Promise.resolve(token)
}

// 发起刷新(并发安全): 用裸axios调刷新接口, 避免走本实例拦截器造成循环
function startRefresh(): Promise<string> {
  if (refreshingPromise) {
    return refreshingPromise
  }
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return Promise.reject(new Error('登录状态已失效'))
  }
  refreshingPromise = axios.post('/api/auth/refresh', null, {
    headers: { RefreshToken: refreshToken }
  }).then(({ data }) => {
    if (data.code !== 1 || !data.data?.token) {
      // 刷新令牌无效/过期 → 登录态彻底失效
      throw new Error(data.msg || '登录状态已失效')
    }
    // 更新访问令牌 + 新刷新令牌(均只影响本标签页)
    setToken(data.data.token)
    if (data.data.refreshToken) setRefreshToken(data.data.refreshToken)
    return data.data.token as string
  }).finally(() => {
    refreshingPromise = null   // 释放锁
  })
  return refreshingPromise
}

http.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => response,
  (error) => {
    const { response, config } = error

    // 非401、或已重放过的请求(刷新接口自身失败), 直接抛出
    if (response?.status !== 401 || config?.__isRetry) {
      return Promise.reject(error)
    }

    // 401兜底: 预检未覆盖的情况(服务端踢下线/封禁/本地时钟漂移), 刷新后重放原请求一次
    return startRefresh()
      .then((newToken) => {
        config.__isRetry = true
        config.headers.token = newToken
        return http(config)
      })
      .catch(() => {
        // 刷新失败: 清本标签登录态, 跳登录页
        clearAuthAndRedirect()
        return Promise.reject(error)
      })
  }
)

function clearAuthAndRedirect(): void {
  removeToken()
  removeRefreshToken()
  removeUserId()
  window.location.href = '/'
}

export default http
