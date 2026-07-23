import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router