import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

const TOKEN_KEY = 'clockout_token'
const REFRESH_TOKEN_KEY = 'clockout_refresh_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(refreshToken: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers && !config.headers['X-Skip-Token']) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
}> = []

function processQueue(error: any) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      reject(new Error('Token refreshed but request retry failed'))
    }
  })
  failedQueue = []
}

http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data as AxiosResponse
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          if (originalRequest.headers) {
            const newToken = getToken()
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
          }
          return http(originalRequest)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }
      
      isRefreshing = true
      originalRequest._retry = true
      
      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          removeToken()
          processQueue(new Error('No refresh token'))
          isRefreshing = false
          window.location.href = '/'
          return Promise.reject(error)
        }
        
        const refreshResponse = await http.post(
          '/auth/refresh',
          { refreshToken },
          { headers: { 'X-Skip-Token': 'true' } }
        ) as unknown as ApiResult<{ token: string; refreshToken: string }>
        
        if (refreshResponse.code === 200 && refreshResponse.data) {
          const newToken = refreshResponse.data.token
          const newRefreshToken = refreshResponse.data.refreshToken
          
          setToken(newToken)
          setRefreshToken(newRefreshToken)
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          
          processQueue(null)
          isRefreshing = false
          
          return http(originalRequest)
        } else {
          throw new Error('Refresh token invalid')
        }
      } catch (refreshError) {
        removeToken()
        processQueue(refreshError)
        isRefreshing = false
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default http
