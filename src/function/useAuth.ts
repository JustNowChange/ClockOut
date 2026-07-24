import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '../api/auth'
import { setToken, removeToken, getToken } from '../utils/http'

export interface UserInfo {
  id: number
  username: string
}

export interface AuthResult {
  success: boolean
  message?: string
  data?: any
}

export function useAuth() {
  const isAuthenticated = ref(false)
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const token = computed(() => getToken())

  function clearError() {
    error.value = null
  }

  function getErrorMessage(error: any): string {
    if (error?.response?.data?.msg) {
      return error.response.data.msg
    }
    if (error?.message) {
      return error.message
    }
    if (error?.response?.status) {
      const status = error.response.status
      const messages: Record<number, string> = {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '权限不足',
        404: '请求的资源不存在',
        500: '服务器内部错误',
      }
      return messages[status] || `请求失败 (${status})`
    }
    return '网络请求失败，请检查网络连接'
  }

  async function login(username: string, password: string): Promise<AuthResult> {
    loading.value = true
    error.value = null
    
    try {
      const response = await loginApi({ username, password })
      
      if (response.code === 1 && response.data) {
        setToken(response.data.token)
        isAuthenticated.value = true
        user.value = {
          id: response.data.id,
          username: response.data.username
        }
        return { success: true, data: response.data }
      } else {
        error.value = response.msg || '登录失败'
        return { success: false, message: response.msg || '登录失败' }
      }
    } catch (err: any) {
      const message = getErrorMessage(err)
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, password: string): Promise<AuthResult> {
    loading.value = true
    error.value = null
    
    try {
      const response = await registerApi({ username, password })
      
      if (response.code === 1 && response.data) {
        return { success: true, data: response.data }
      } else {
        error.value = response.msg || '注册失败'
        return { success: false, message: response.msg || '注册失败' }
      }
    } catch (err: any) {
      const message = getErrorMessage(err)
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    removeToken()
    isAuthenticated.value = false
    user.value = null
    error.value = null
  }

  function checkAuth(): boolean {
    const storedToken = getToken()
    if (storedToken) {
      isAuthenticated.value = true
      return true
    }
    isAuthenticated.value = false
    return false
  }

  return {
    isAuthenticated,
    user,
    loading,
    error,
    token,
    login,
    register,
    logout,
    checkAuth,
    clearError
  }
}

export default useAuth
