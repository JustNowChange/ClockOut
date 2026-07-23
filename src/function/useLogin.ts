import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from './useAuth'

export function useLogin() {
  const router = useRouter()
  const { login: authLogin, loading: authLoading } = useAuth()
  
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const rememberMe = ref(false)
  const errorMsg = ref('')
  const isLoading = ref(false)
  const isError = ref(false)
  const submitCount = ref(0)

  async function handleLogin() {
    errorMsg.value = ''
    isError.value = false
    submitCount.value++
    
    if (!username.value.trim()) {
      errorMsg.value = '请输入账号'
      isError.value = true
      triggerErrorRecovery()
      return
    }
    
    if (!password.value) {
      errorMsg.value = '请输入密码'
      isError.value = true
      triggerErrorRecovery()
      return
    }
    
    if (password.value.length < 6) {
      errorMsg.value = '密码长度至少6位'
      isError.value = true
      triggerErrorRecovery()
      return
    }
    
    isLoading.value = true
    
    const result = await authLogin(username.value, password.value)
    
    if (result.success) {
      if (rememberMe.value) {
        localStorage.setItem('clockout_remember_username', username.value)
      } else {
        localStorage.removeItem('clockout_remember_username')
      }
      router.push('/home')
    } else {
      errorMsg.value = result.message || '登录失败'
      isError.value = true
      triggerErrorRecovery()
    }
    
    isLoading.value = false
  }

  function triggerErrorRecovery() {
    setTimeout(() => {
      isError.value = false
    }, 2500)
  }

  function togglePassword() {
    showPassword.value = !showPassword.value
  }

  function resetForm() {
    username.value = ''
    password.value = ''
    errorMsg.value = ''
    isError.value = false
  }

  function loadRememberedUsername() {
    const remembered = localStorage.getItem('clockout_remember_username')
    if (remembered) {
      username.value = remembered
      rememberMe.value = true
    }
  }

  return {
    username,
    password,
    showPassword,
    rememberMe,
    errorMsg,
    isLoading,
    isError,
    submitCount,
    handleLogin,
    togglePassword,
    resetForm,
    loadRememberedUsername
  }
}

export default useLogin
