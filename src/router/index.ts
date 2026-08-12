import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/register/form',
    name: 'RegisterForm',
    component: () => import('../views/RegisterForm.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/clock',
    name: 'Clock',
    component: () => import('../views/Clock.vue')
  },
  {
    path: '/resume',
    name: 'Resume',
    component: () => import('../views/Resume.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const AUTH_PAGES = ['/', '/register', '/register/form']
// 受保护页面：未登录用户禁止访问
const PROTECTED_PAGES = ['/home', '/clock', '/resume']

// ============================================================
// 全局强制硬刷新：所有 SPA 跳转都改成浏览器级刷新（等价于 F5）
// 1) 重写 router.push / router.replace → window.location.href / replace
// 2) beforeEach 中的守卫跳转也直接走 window.location，避免死循环
// ============================================================

function resolveFullPath(to: RouteLocationRaw): string {
  try {
    return router.resolve(to).href
  } catch {
    return typeof to === 'string' ? to : (to as any).path || '/'
  }
}

const originalPush = router.push.bind(router)
const originalReplace = router.replace.bind(router)
router.back.bind(router);
router.go.bind(router);
router.push = async (to: RouteLocationRaw) => {
  const href = resolveFullPath(to)
  window.location.href = href
  return Promise.resolve(undefined as any)
}

router.replace = async (to: RouteLocationRaw) => {
  const href = resolveFullPath(to)
  window.location.replace(href)
  return Promise.resolve(undefined as any)
}

// back / go：不要手动 setTimeout(reload)，交给 popstate 统一处理。
// 否则 history.back() + 手动 reload + popstate reload 会重复触发/互相打断，导致卡死或白屏。
// 如果当前没有历史可回（history.length == 1，比如直接打开 Resume 链接），则兜底跳 /home。
router.back = () => {
  // history.length > 1 时，走浏览器后退，之后 popstate 会自动触发 reload
  // 否则说明是直接打开的子页，后退会离开站点，不如强制回首页
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = '/home'
  }
}

router.go = (delta: number) => {
  window.history.go(delta)
}

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('clockout_token')

  if (token && AUTH_PAGES.includes(to.path)) {
    // 已登录访问登录页 → 硬跳首页（触发刷新）
    window.location.href = '/home'
    return false
  } else if (!token && PROTECTED_PAGES.includes(to.path)) {
    // 未登录访问受保护页 → 硬跳登录（触发刷新）
    window.location.href = '/'
    return false
  } else {
    next()
  }
})

// 浏览器前进/后退按钮也强制刷新
window.addEventListener('popstate', () => {
  window.location.reload()
})

// 兼容可能直接调用 originalPush / originalReplace 的内部场景（当前无）
export { originalPush, originalReplace }
export default router