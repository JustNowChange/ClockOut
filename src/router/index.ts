import { createRouter, createWebHistory } from 'vue-router'

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

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('clockout_token')

  if (token && AUTH_PAGES.includes(to.path)) {
    // 已登录访问登录页 → 跳首页
    next('/home')
  } else if (!token && PROTECTED_PAGES.includes(to.path)) {
    // 未登录访问受保护页 → 跳登录
    next('/')
  } else {
    next()
  }
})

export default router