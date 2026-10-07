import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getUserInfo as getUserInfoApi } from '../api/auth'
import { setToken, removeToken, getToken, setUserId, removeUserId, getUserId, setRefreshToken, removeRefreshToken, ADMIN_UID } from '../utils/http'
import { logout as logoutApi } from '../api/auth'

export interface UserInfo {
  id: number
  username: string
  name?: string
  email?: string
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

  // 是否管理员：响应式 user 优先，页面硬刷新后从 sessionStorage 的 userId 兜底
  const isAdmin = computed(() => (user.value?.id ?? getUserId()) === ADMIN_UID)

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
        setRefreshToken(response.data.refreshToken)  // 刷新令牌存本标签 sessionStorage（多账号并行）
        setUserId(response.data.id)  // 保存 userId 到 sessionStorage
        isAuthenticated.value = true
        user.value = {
          id: response.data.id,
          username: response.data.username,
          name: response.data.name,
          email: response.data.email
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

  async function logout(): Promise<void> {
    // 通知后端删除本标签页这一条刷新令牌会话(按jti, 不影响其它标签)
    // 注意顺序: 必须先等请求落地(或超时)再清 sessionStorage —— axios 请求拦截器
    // 是异步微任务, 若先清存储, 拦截器 getToken() 拿到 null, 请求会因缺 token 被
    // 后端 JWT 拦截器 401 打回, 后端根本执行不到登出
    // 尽力而为: 800ms 未响应也放行(调用方随后跳转), 失败不阻塞本地登出
    await Promise.race([
      logoutApi().catch(() => {}),
      new Promise<void>(r => setTimeout(r, 800))
    ])
    removeToken()
    removeRefreshToken()  // 清除本标签刷新令牌
    removeUserId()  // 清除 userId
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

  async function fetchUserInfo(): Promise<void> {
    if (!checkAuth()) return
    
    // 优先使用响应式数据中的 id，其次从 sessionStorage 获取
    const userId = user.value?.id || getUserId()
    if (!userId) return
    
    try {
      const response = await getUserInfoApi(userId)
      
      if (response.code === 1 && response.data) {
        user.value = {
          id: response.data.id,
          username: response.data.username || response.data.name || '',
          name: response.data.name,
          email: response.data.email
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch user info:', err)
    }
  }

  return {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    error,
    token,
    login,
    register,
    logout,
    checkAuth,
    fetchUserInfo,
    clearError
  }
}

export default useAuth
