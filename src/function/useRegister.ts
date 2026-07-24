import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from './useAuth'

export function useRegister() {
  const router = useRouter()
  const { register: authRegister} = useAuth()
  
  const username = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const errorMsg = ref('')
  const isLoading = ref(false)
  const isError = ref(false)

  async function handleRegister() {
    errorMsg.value = ''
    isError.value = false
    
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
    
    if (!confirmPassword.value) {
      errorMsg.value = '请确认密码'
      isError.value = true
      triggerErrorRecovery()
      return
    }
    
    if (password.value !== confirmPassword.value) {
      errorMsg.value = '两次输入的密码不一致'
      isError.value = true
      triggerErrorRecovery()
      return
    }
    
    isLoading.value = true
    
    const result = await authRegister(username.value, password.value)
    
    if (result.success) {
      router.push('/')
    } else {
      errorMsg.value = result.message || '注册失败'
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

  function toggleConfirmPassword() {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  function resetForm() {
    username.value = ''
    password.value = ''
    confirmPassword.value = ''
    errorMsg.value = ''
    isError.value = false
  }

  return {
    username,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    errorMsg,
    isLoading,
    isError,
    handleRegister,
    togglePassword,
    toggleConfirmPassword,
    resetForm
  }
}

export default useRegister
