import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}


const http = axios.create({
  baseURL: "https://clockout-backend-production.up.railway.app/api",
    // baseURL: "http://localhost:5173/api",
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

const TOKEN_KEY = 'clockout_token'
const USER_ID_KEY = 'clockout_user_id'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUserId(): number | null {
  const id = localStorage.getItem(USER_ID_KEY)
  return id ? parseInt(id) : null
}

export function setUserId(id: number): void {
  localStorage.setItem(USER_ID_KEY, id.toString())
}

export function removeUserId(): void {
  localStorage.removeItem(USER_ID_KEY)
}

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers && !config.headers['X-Skip-Token']) {
      config.headers.token = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

http.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default http
