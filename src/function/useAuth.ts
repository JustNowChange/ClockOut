import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo } from '../api/auth'
import { setToken, setRefreshToken, removeToken, getToken } from '../utils/http'

export interface UserInfo {
  id: number
  username: string
  email: string
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
    if (error?.response?.data?.message) {
      return error.response.data.message
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
      
      if (response.code === 200 && response.data) {
        setToken(response.data.token)
        setRefreshToken(response.data.refreshToken)
        isAuthenticated.value = true
        user.value = response.data.user
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '登录失败'
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (err: any) {
      const message = getErrorMessage(err)
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    error.value = null
    try {
      await logoutApi()
    } catch (err: any) {
      error.value = getErrorMessage(err)
    } finally {
      removeToken()
      isAuthenticated.value = false
      user.value = null
    }
  }

  async function checkAuth(): Promise<boolean> {
    const storedToken = getToken()
    if (!storedToken) {
      isAuthenticated.value = false
      return false
    }

    error.value = null
    try {
      const response = await getUserInfo()
      if (response.code === 200) {
        isAuthenticated.value = true
        user.value = response.data
        return true
      } else {
        removeToken()
        isAuthenticated.value = false
        error.value = response.message || '认证失败'
        return false
      }
    } catch (err: any) {
      removeToken()
      isAuthenticated.value = false
      error.value = getErrorMessage(err)
      return false
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    error,
    token,
    login,
    logout,
    checkAuth,
    clearError
  }
}

export default useAuth
