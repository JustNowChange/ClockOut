<template>
  <div class="admin-page">
    <!-- 左侧菜单栏 -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span class="brand-badge">C</span>
        <span class="brand-text">ClockOut 管理端</span>
      </div>

      <nav class="sidebar-nav">
        <div
          v-for="m in menus"
          :key="m.key"
          class="nav-item"
          :class="{ active: activeMenu === m.key }"
          @click="switchMenu(m.key)"
        >
          <span class="nav-label">{{ m.label }}</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="admin-content">
      <!-- ============ 控制台总览 ============ -->
      <section v-if="activeMenu === 'dashboard'" class="panel">
        <div class="panel-head pop-in">
          <div>
            <h1 class="panel-title">控制台总览</h1>
            <p class="panel-sub">欢迎回来{{ adminInfo?.name ? '，' + adminInfo.name : '' }}，这里是站点全局状态</p>
          </div>
          <button class="btn-ghost btn-small" :disabled="statsLoading" @click="refreshAll">
            {{ statsLoading ? '刷新中...' : '刷新数据' }}
          </button>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div
            v-for="(c, i) in statCards"
            :key="c.key"
            class="stat-card pop-in"
            :style="{ animationDelay: 0.06 * i + 's' }"
          >
            <span class="stat-icon" :class="c.key">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path :d="c.icon" fill="currentColor" />
              </svg>
            </span>
            <div class="stat-body">
              <span class="stat-value">{{ statsLoading ? '—' : c.value }}</span>
              <span class="stat-label">{{ c.label }}</span>
            </div>
          </div>
        </div>

        <!-- 管理员资料小卡 -->
        <div class="dash-info pop-in" style="animation-delay: 0.28s">
          <div class="sparkle-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.5 9H10.5L12 2Z" fill="currentColor" />
              <path d="M12 22L10.5 15H13.5L12 22Z" fill="currentColor" />
              <path d="M2 12L9 10.5V13.5L2 12Z" fill="currentColor" />
              <path d="M22 12L15 13.5V10.5L22 12Z" fill="currentColor" />
            </svg>
          </div>
          <div class="dash-info-list">
            <div class="dash-info-row">
              <span>账号</span><b>{{ adminInfo?.username || '—' }}</b>
            </div>
            <div class="dash-info-row">
              <span>ID</span><b>{{ adminInfo?.id ?? '—' }}</b>
            </div>
            <div class="dash-info-row">
              <span>邮箱</span><b>{{ adminInfo?.email || '—' }}</b>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 用户管理 ============ -->
      <section v-else-if="activeMenu === 'users'" class="panel">
        <div class="panel-head pop-in">
          <div>
            <h1 class="panel-title">用户管理</h1>
            <p class="panel-sub">查询用户、封禁解封、踢出登录</p>
          </div>
        </div>

        <!-- 筛选工具栏 -->
        <div class="toolbar pop-in" style="animation-delay: 0.06s">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
              <path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              id="admin-user-search"
              v-model="keyword"
              class="filter-input"
              type="text"
              placeholder="搜索账号 / 昵称"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="select-wrap">
            <select v-model="filterBanType" class="filter-select">
              <option value="">全部状态</option>
              <option value="0">正常</option>
              <option value="1">临时封禁</option>
              <option value="2">永久封禁</option>
            </select>
          </div>

          <div class="select-wrap">
            <select v-model="filterOnline" class="filter-select">
              <option value="">全部在线</option>
              <option value="1">仅在线</option>
              <option value="0">仅离线</option>
            </select>
          </div>

          <button class="btn-primary" @click="handleSearch">查询</button>
          <button class="btn-ghost" @click="handleReset">重置</button>
        </div>

        <!-- 用户表格 -->
        <div class="table-card pop-in" style="animation-delay: 0.12s">
          <div v-if="usersLoading" class="table-loading">加载中...</div>

          <div v-else-if="userList.length === 0" class="empty-state">
            <span class="empty-emoji">∅</span>
            <p>没有符合条件的用户</p>
          </div>

          <table v-else class="admin-table">
            <thead>
              <tr>
                <th>用户</th>
                <th>注册时间</th>
                <th>最近登录</th>
                <th>状态</th>
                <th class="th-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in userList" :key="u.uid">
                <td>
                  <div class="user-cell">
                    <span class="online-dot" :class="{ on: u.online }"></span>
                    <div class="user-meta">
                      <span class="user-name">{{ u.name || u.username }}</span>
                      <span class="user-sub">@{{ u.username }} · #{{ u.uid }}</span>
                    </div>
                  </div>
                </td>
                <td class="cell-time">{{ u.registerTime || '—' }}</td>
                <td class="cell-time">
                  <span v-if="u.lastLoginTime">{{ u.lastLoginTime }}</span>
                  <span v-else class="cell-muted">从未登录</span>
                  <span v-if="u.lastLoginIp" class="login-ip">{{ u.lastLoginIp }}</span>
                </td>
                <td>
                  <span v-if="u.banType === 0" class="ban-tag ok">正常</span>
                  <span v-else class="ban-tag" :class="u.banType === 2 ? 'perm' : 'temp'">
                    {{ u.banType === 2 ? '永久封禁' : '临时封禁' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button
                      v-if="u.banType === 0"
                      class="act-btn ban"
                      @click="openBan(u)"
                    >封禁</button>
                    <button
                      v-else
                      class="act-btn unban"
                      @click="askUnban(u)"
                    >解封</button>
                    <button class="act-btn kick" @click="askKick(u)">踢出</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="!usersLoading && total > 0" class="pagination pop-in" style="animation-delay: 0.18s">
          <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">‹</button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            class="page-btn"
            :class="{ active: p === page }"
            @click="goPage(p)"
          >{{ p }}</button>
          <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">›</button>
          <span class="page-total">共 {{ total }} 条</span>
        </div>
      </section>

      <!-- ============ 其余菜单：占位页 ============ -->
      <section v-else class="panel">
        <div class="placeholder-card pop-in">
          <p class="placeholder-title">{{ activeLabel }} · 功能开发中</p>
          <p class="placeholder-desc">该模块正在路上，敬请期待</p>
        </div>
      </section>
    </main>

    <!-- ============ 封禁弹窗 ============ -->
    <div v-if="banModal.show" class="modal-overlay" @click.self="closeBan">
      <div class="modal-card">
        <div class="modal-head">
          <h2>封禁用户</h2>
          <button class="modal-close" @click="closeBan">×</button>
        </div>

        <p class="modal-target">对象：{{ banModal.name }} <span class="cell-muted">@{{ banModal.username }}</span></p>

        <!-- 封禁类型切换 -->
        <div class="ban-type-switch">
          <button
            class="ban-type-btn"
            :class="{ active: banModal.banType === 1 }"
            @click="banModal.banType = 1"
          >临时封禁</button>
          <button
            class="ban-type-btn"
            :class="{ active: banModal.banType === 2 }"
            @click="banModal.banType = 2"
          >永久封禁</button>
        </div>

        <div v-if="banModal.banType === 1" class="field">
          <label for="ban-end">到期时间</label>
          <input id="ban-end" v-model="banModal.banEnd" class="modal-input" type="datetime-local" />
        </div>

        <div class="field">
          <label for="ban-reason">封禁原因</label>
          <textarea
            id="ban-reason"
            v-model="banModal.reason"
            class="modal-input modal-textarea"
            rows="3"
            maxlength="512"
            placeholder="请填写封禁原因（最长512字）"
          ></textarea>
        </div>

        <p v-if="banModal.error" class="modal-error">{{ banModal.error }}</p>

        <div class="modal-actions">
          <button class="btn-ghost" :disabled="banModal.submitting" @click="closeBan">取消</button>
          <button class="btn-danger" :disabled="banModal.submitting" @click="submitBan">
            {{ banModal.submitting ? '提交中...' : '确认封禁' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============ 确认弹窗（解封/踢出） ============ -->
    <div v-if="confirmModal.show" class="modal-overlay" @click.self="closeConfirm">
      <div class="modal-card modal-confirm">
        <div class="modal-head">
          <h2>{{ confirmModal.title }}</h2>
        </div>
        <p class="confirm-desc">{{ confirmModal.desc }}</p>
        <p v-if="confirmModal.error" class="modal-error">{{ confirmModal.error }}</p>
        <div class="modal-actions">
          <button class="btn-ghost" :disabled="confirmModal.submitting" @click="closeConfirm">取消</button>
          <button class="btn-danger" :disabled="confirmModal.submitting" @click="doConfirm">
            {{ confirmModal.submitting ? '处理中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 轻提示 -->
    <transition name="toast">
      <div v-if="toastMsg" class="action-toast">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getAdminInfo, getAdminStats, getAdminUsers, banUser, unbanUser, kickUser,
  type AdminInfo, type AdminStats, type AdminUserItem
} from '../api/admin'
import { useAuth } from '../function/useAuth'

const { logout } = useAuth()

// 左侧菜单项
const menus = [
  { key: 'dashboard', label: '控制台总览' },
  { key: 'users',     label: '用户管理' },
  { key: 'resumes',   label: '简历管理' },
  { key: 'settings',  label: '系统设置' },
]

const activeMenu = ref('dashboard')
const activeLabel = computed(() => menus.find(m => m.key === activeMenu.value)?.label || '')

function switchMenu(key: string) {
  activeMenu.value = key
  // 切到用户管理时, 若从未加载过则拉一次
  if (key === 'users' && !usersLoaded.value) {
    loadUsers()
  }
}

// ---------- 管理员资料 & 统计 ----------
const adminInfo = ref<AdminInfo | null>(null)
const stats = ref<AdminStats>({ totalUsers: 0, onlineUsers: 0, bannedUsers: 0, todayNewUsers: 0 })
const statsLoading = ref(false)

async function loadInfo() {
  const res = await getAdminInfo()
  if (res.code === 1 && res.data) {
    adminInfo.value = res.data
  }
}

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await getAdminStats()
    if (res.code === 1 && res.data) {
      stats.value = res.data
    }
  } finally {
    statsLoading.value = false
  }
}

// 刷新按钮: 资料 + 统计一起重载(onMounted失败后可手动自愈)
async function refreshAll() {
  await Promise.all([loadInfo(), loadStats()])
}

// 统计卡片配置(纯色icon, 简约)
const statCards = computed(() => [
  {
    key: 'total', label: '用户总数', value: stats.value.totalUsers,
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z'
  },
  {
    key: 'online', label: '在线人数', value: stats.value.onlineUsers,
    icon: 'M12 21s-7-4.6-7-10a7 7 0 0 1 14 0c0 5.4-7 10-7 10Zm0-7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'
  },
  {
    key: 'banned', label: '封禁中', value: stats.value.bannedUsers,
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a1.5 1.5 0 0 1 1.5 1.5V12a1.5 1.5 0 0 1-3 0V8.5A1.5 1.5 0 0 1 12 7Zm0 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z'
  },
  {
    key: 'today', label: '今日新增', value: stats.value.todayNewUsers,
    icon: 'M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.6 6.4 19.5l2.1-6.7L3 8.8h6.8L12 2Z'
  },
])

// ---------- 用户列表 ----------
const userList = ref<AdminUserItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const usersLoading = ref(false)
const usersLoaded = ref(false)

// 筛选条件(输入态)
const keyword = ref('')
const filterBanType = ref('')
const filterOnline = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 分页按钮(当前页±2, 至少5个)
const pageNumbers = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, Math.min(page.value - 2, totalPages.value - 4))
  const end = Math.min(totalPages.value, start + 4)
  for (let p = start; p <= end; p++) pages.push(p)
  return pages
})

async function loadUsers() {
  usersLoading.value = true
  try {
    const res = await getAdminUsers({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      banType: filterBanType.value === '' ? undefined : Number(filterBanType.value),
      online: filterOnline.value === '' ? undefined : Number(filterOnline.value),
    })
    if (res.code === 1 && res.data) {
      userList.value = res.data.list
      total.value = res.data.total
      usersLoaded.value = true
    }
  } catch {
    // 错误由http层抛出, 列表保持空态
  } finally {
    usersLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadUsers()
}

function handleReset() {
  keyword.value = ''
  filterBanType.value = ''
  filterOnline.value = ''
  page.value = 1
  loadUsers()
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  loadUsers()
}

// ---------- 轻提示 ----------
const toastMsg = ref('')
let toastTimer: number | null = null
function showToast(msg: string) {
  toastMsg.value = msg
  if (toastTimer !== null) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2000)
}

// ---------- 封禁弹窗 ----------
const banModal = ref({
  show: false,
  uid: 0,
  username: '',
  name: '',
  banType: 1,
  reason: '',
  banEnd: '',
  submitting: false,
  error: '',
})

// datetime-local格式工具: Date -> yyyy-MM-ddTHH:mm
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openBan(u: AdminUserItem) {
  // 默认到期时间: 7天后
  const d = new Date()
  d.setDate(d.getDate() + 7)
  banModal.value = {
    show: true,
    uid: u.uid,
    username: u.username,
    name: u.name || u.username,
    banType: 1,
    reason: '',
    banEnd: toLocalInput(d),
    submitting: false,
    error: '',
  }
}

function closeBan() {
  banModal.value.show = false
}

async function submitBan() {
  const m = banModal.value
  m.error = ''

  if (!m.reason.trim()) {
    m.error = '请填写封禁原因'
    return
  }

  // datetime-local(yyyy-MM-ddTHH:mm) -> 后端约定 yyyy-MM-dd HH:mm:ss
  let banEnd: string | undefined
  if (m.banType === 1) {
    if (!m.banEnd) {
      m.error = '请选择到期时间'
      return
    }
    banEnd = m.banEnd.replace('T', ' ') + ':00'
  }

  m.submitting = true
  try {
    const res = await banUser(m.uid, {
      banType: m.banType,
      banReason: m.reason.trim(),
      banEnd,
    })
    if (res.code === 1) {
      m.show = false
      showToast('封禁成功，该用户已被踢下线')
      loadUsers()
      loadStats()
    } else {
      m.error = res.msg || '封禁失败'
    }
  } catch (e: any) {
    m.error = e?.message || '封禁失败'
  } finally {
    m.submitting = false
  }
}

// ---------- 确认弹窗(解封/踢出) ----------
const confirmModal = ref({
  show: false,
  type: '' as '' | 'unban' | 'kick',
  title: '',
  desc: '',
  uid: 0,
  submitting: false,
  error: '',
})

function askUnban(u: AdminUserItem) {
  confirmModal.value = {
    show: true,
    type: 'unban',
    title: '解封用户',
    desc: `确定要解除「${u.name || u.username}」的封禁吗？解封后该用户可立即重新登录。`,
    uid: u.uid,
    submitting: false,
    error: '',
  }
}

function askKick(u: AdminUserItem) {
  confirmModal.value = {
    show: true,
    type: 'kick',
    title: '踢出登录',
    desc: `确定要踢出「${u.name || u.username}」吗？会结束该用户全部在线会话，但其可以重新登录。`,
    uid: u.uid,
    submitting: false,
    error: '',
  }
}

function closeConfirm() {
  confirmModal.value.show = false
}

async function doConfirm() {
  const c = confirmModal.value
  c.error = ''
  c.submitting = true
  try {
    if (c.type === 'unban') {
      const res = await unbanUser(c.uid)
      if (res.code !== 1) {
        c.error = res.msg || '解封失败'
        return
      }
      c.show = false
      showToast('解封成功')
    } else if (c.type === 'kick') {
      const res = await kickUser(c.uid, '管理员踢出')
      if (res.code !== 1) {
        c.error = res.msg || '踢出失败'
        return
      }
      c.show = false
      showToast('已踢出，该用户全部会话已失效')
    }
    loadUsers()
    loadStats()
  } catch (e: any) {
    c.error = e?.message || '操作失败'
  } finally {
    c.submitting = false
  }
}

// ---------- 退出 ----------
async function handleLogout() {
  // 等登出请求落地(或800ms超时)再硬跳转, 避免导航中断请求导致后端会话未删除
  await logout()
  window.location.href = '/'
}

onMounted(async () => {
  try {
    await loadInfo()
    await loadStats()
  } catch (err: any) {
    // 403 说明不是管理员（正常情况下路由守卫已拦截），回用户端首页
    if (err?.response?.status === 403) {
      window.location.href = '/home'
    }
  }
})
</script>

<style>
@import '../style.css';
@import '../style/Admin.css';
</style>
