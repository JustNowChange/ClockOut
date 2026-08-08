<template>
  <div class="resume-page" :class="{ 'readonly-mode': isReadonly }">
    <!-- 只读模式提示 -->
    <div class="readonly-badge" v-if="isReadonly">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <span>只读模式</span>
    </div>

    <!-- 保存提示 Toast -->
    <transition name="fade">
      <div class="toast" :class="toastType" v-if="toastVisible">
        {{ toastMessage }}
      </div>
    </transition>

    <div class="resume-container" :class="{ 'print-mode': isPrintMode, 'edit-mode': isEditMode }">
      <!-- 加载中 -->
      <div class="loading-overlay" v-if="(isReadonly && readonlyLoading) || myResumeLoading">
        <div class="loading-spinner"></div>
        <p>{{ isReadonly ? '加载简历中...' : '加载我的简历中...' }}</p>
      </div>

      <template v-if="currentData">
        <!-- ============ 核心信息(固定字段) ============ -->
        <header class="resume-header">
          <div class="header-left">
            <h1 class="name" v-if="!isEditMode">{{ currentData.core.name }}</h1>
            <input class="edit-input name" v-else v-model="currentData.core.name" placeholder="姓名" />
            <p class="title" v-if="!isEditMode">{{ currentData.core.title }}</p>
            <input class="edit-input title" v-else v-model="currentData.core.title" placeholder="职位" />
          </div>
          <div class="header-right">
            <div class="contact-item" v-if="currentData.core.phone || isEditMode">
              <span class="contact-label">电话</span>
              <span v-if="!isEditMode">{{ currentData.core.phone }}</span>
              <input
                class="edit-input"
                :class="{ 'input-error': phoneError }"
                v-else
                v-model="currentData.core.phone"
                placeholder="请输入11位手机号"
                @blur="validatePhoneField"
              />
              <span class="field-error" v-if="phoneError && isEditMode">{{ phoneError }}</span>
            </div>
            <div class="contact-item" v-if="currentData.core.email || isEditMode">
              <span class="contact-label">邮箱</span>
              <span v-if="!isEditMode">{{ currentData.core.email }}</span>
              <input
                class="edit-input"
                :class="{ 'input-error': emailError }"
                v-else
                v-model="currentData.core.email"
                placeholder="example@mail.com"
                @blur="validateEmailField"
              />
              <span class="field-error" v-if="emailError && isEditMode">{{ emailError }}</span>
            </div>
            <div class="contact-item" v-if="currentData.core.location || isEditMode">
              <span class="contact-label">所在地</span>
              <span v-if="!isEditMode">{{ currentData.core.location }}</span>
              <input class="edit-input" v-else v-model="currentData.core.location" placeholder="如：重庆" />
            </div>
            <div class="contact-item" v-if="currentData.core.github || isEditMode">
              <span class="contact-label">GitHub</span>
              <span v-if="!isEditMode">{{ currentData.core.github }}</span>
              <input
                class="edit-input"
                :class="{ 'input-error': githubError }"
                v-else
                v-model="currentData.core.github"
                placeholder="github.com/username 或 用户名"
                @blur="validateGithubField"
              />
              <span class="field-error" v-if="githubError && isEditMode">{{ githubError }}</span>
            </div>
          </div>
        </header>

        <!-- 个人简介 -->
        <section class="resume-section" v-if="currentData.core.summary || isEditMode">
          <h2 class="section-title">个人简介</h2>
          <p class="summary-text" v-if="!isEditMode">{{ currentData.core.summary }}</p>
          <textarea class="edit-textarea" v-else v-model="currentData.core.summary" placeholder="个人简介" rows="4"></textarea>
        </section>

        <!-- ============ 扩展模块(动态渲染) ============ -->
        <section
          v-for="module in currentSortedModules"
          :key="module.id"
          class="resume-module"
        >
          <div class="module-header">
            <h2 class="section-title" v-if="!isEditMode">{{ module.moduleTitle }}</h2>
            <input
              v-else
              class="edit-input module-title-input"
              v-model="module.moduleTitle"
              placeholder="模块标题"
            />
            <div class="module-actions" v-if="isEditMode">
              <button class="module-action-btn" title="上移" @click="moveModuleUp(module.id)">↑</button>
              <button class="module-action-btn" title="下移" @click="moveModuleDown(module.id)">↓</button>
              <button class="module-action-btn danger" title="删除模块" @click="deleteModule(module.id)">✕</button>
            </div>
          </div>

          <!-- ===== 教育背景 ===== -->
          <template v-if="module.moduleType === 'education'">
            <div class="timeline-item" v-for="(edu, index) in module.content" :key="index">
              <div class="item-header">
                <h3 class="item-title" v-if="!isEditMode">{{ edu.school }}</h3>
                <input class="edit-input item-title" v-else v-model="edu.school" placeholder="学校" />
                <span class="item-date" v-if="!isEditMode">{{ edu.startDate }} - {{ edu.endDate }}</span>
                <div class="date-inputs" v-else>
                  <input class="edit-input date-input" v-model="edu.startDate" placeholder="开始" />
                  <span> - </span>
                  <input class="edit-input date-input" v-model="edu.endDate" placeholder="结束" />
                </div>
              </div>
              <div class="item-subtitle">
                <span v-if="!isEditMode">{{ edu.major }}</span>
                <input class="edit-input mini" v-else v-model="edu.major" placeholder="专业" />
                <span class="separator">·</span>
                <span v-if="!isEditMode">{{ edu.degree }}</span>
                <input class="edit-input mini" v-else v-model="edu.degree" placeholder="学位" />
                <template v-if="!isEditMode && edu.gpa">
                  <span class="separator">·</span>
                  <span>GPA: {{ edu.gpa }}</span>
                </template>
                <input class="edit-input mini gpa" v-else v-model="edu.gpa" placeholder="GPA" />
              </div>
              <ul class="item-list" v-if="edu.details?.length || isEditMode">
                <li v-for="(detail, i) in edu.details" :key="i">
                  <span v-if="!isEditMode">{{ detail }}</span>
                  <div class="detail-edit-row" v-else>
                    <input class="edit-input" v-model="edu.details[i]" placeholder="描述" />
                    <button class="row-del-btn" @click="edu.details.splice(i, 1)">✕</button>
                  </div>
                </li>
              </ul>
              <button class="add-btn" v-if="isEditMode" @click="addItemDetail(edu)">+ 添加描述</button>
            </div>
            <button class="add-section-btn" v-if="isEditMode" @click="addEduItem(module)">+ 添加教育经历</button>
          </template>

          <!-- ===== 工作经历 ===== -->
          <template v-else-if="module.moduleType === 'experience'">
            <div class="timeline-item" v-for="(exp, index) in module.content" :key="index">
              <div class="item-header">
                <h3 class="item-title" v-if="!isEditMode">{{ exp.company }}</h3>
                <input class="edit-input item-title" v-else v-model="exp.company" placeholder="公司" />
                <span class="item-date" v-if="!isEditMode">{{ exp.startDate }} - {{ exp.endDate }}</span>
                <div class="date-inputs" v-else>
                  <input class="edit-input date-input" v-model="exp.startDate" placeholder="开始" />
                  <span> - </span>
                  <input class="edit-input date-input" v-model="exp.endDate" placeholder="结束" />
                </div>
              </div>
              <div class="item-subtitle">
                <span v-if="!isEditMode">{{ exp.position }}</span>
                <input class="edit-input mini" v-else v-model="exp.position" placeholder="职位" />
                <template v-if="!isEditMode && exp.location">
                  <span class="separator">·</span>
                  <span>{{ exp.location }}</span>
                </template>
                <input class="edit-input mini" v-else v-model="exp.location" placeholder="地点" />
              </div>
              <ul class="item-list" v-if="exp.details?.length || isEditMode">
                <li v-for="(detail, i) in exp.details" :key="i">
                  <span v-if="!isEditMode">{{ detail }}</span>
                  <div class="detail-edit-row" v-else>
                    <input class="edit-input" v-model="exp.details[i]" placeholder="工作描述" />
                    <button class="row-del-btn" @click="exp.details.splice(i, 1)">✕</button>
                  </div>
                </li>
              </ul>
              <button class="add-btn" v-if="isEditMode" @click="addItemDetail(exp)">+ 添加描述</button>
            </div>
            <button class="add-section-btn" v-if="isEditMode" @click="addExpItem(module)">+ 添加工作经历</button>
          </template>

          <!-- ===== 项目经验 ===== -->
          <template v-else-if="module.moduleType === 'project'">
            <div class="timeline-item" v-for="(proj, index) in module.content" :key="index">
              <div class="item-header">
                <h3 class="item-title" v-if="!isEditMode">{{ proj.name }}</h3>
                <input class="edit-input item-title" v-else v-model="proj.name" placeholder="项目名称" />
                <span class="item-date" v-if="!isEditMode">{{ proj.date }}</span>
                <input class="edit-input item-date" v-else v-model="proj.date" placeholder="时间" />
              </div>
              <div class="item-subtitle" v-if="proj.role || proj.link || isEditMode">
                <span v-if="!isEditMode">{{ proj.role }}</span>
                <input class="edit-input mini" v-else v-model="proj.role" placeholder="角色" />
                <template v-if="!isEditMode && proj.link">
                  <span class="separator">·</span>
                  <span class="project-link">{{ proj.link }}</span>
                </template>
                <input class="edit-input mini" v-else v-model="proj.link" placeholder="链接" />
              </div>
              <ul class="item-list" v-if="proj.details?.length || isEditMode">
                <li v-for="(detail, i) in proj.details" :key="i">
                  <span v-if="!isEditMode">{{ detail }}</span>
                  <div class="detail-edit-row" v-else>
                    <input class="edit-input" v-model="proj.details[i]" placeholder="项目描述" />
                    <button class="row-del-btn" @click="proj.details.splice(i, 1)">✕</button>
                  </div>
                </li>
              </ul>
              <div class="tech-tags" v-if="proj.tech?.length || isEditMode">
                <template v-if="!isEditMode">
                  <span class="tag" v-for="(t, i) in proj.tech" :key="i">{{ t }}</span>
                </template>
                <input
                  v-else
                  class="edit-input tech-input"
                  :value="proj.tech.join(', ')"
                  @input="syncTechInput($event, proj)"
                  placeholder="技术栈(逗号分隔)"
                />
              </div>
              <button class="add-btn" v-if="isEditMode" @click="addItemDetail(proj)">+ 添加描述</button>
            </div>
            <button class="add-section-btn" v-if="isEditMode" @click="addProjItem(module)">+ 添加项目</button>
          </template>

          <!-- ===== 专业技能 ===== -->
          <template v-else-if="module.moduleType === 'skill'">
            <div class="skills-container">
              <div class="skill-group" v-for="(group, index) in module.content" :key="index">
                <template v-if="!isEditMode">
                  <span class="skill-label">{{ group.category }}</span>
                  <span class="skill-content">{{ group.items?.join('、') }}</span>
                </template>
                <template v-else>
                  <input class="edit-input skill-label-input" v-model="group.category" placeholder="分类" />
                  <input
                    class="edit-input skill-content-input"
                    :value="group.items?.join(', ')"
                    @input="syncItemsInput($event, group)"
                    placeholder="技能(逗号分隔)"
                  />
                  <button class="row-del-btn" @click="module.content.splice(index, 1)">✕</button>
                </template>
              </div>
            </div>
            <button class="add-section-btn" v-if="isEditMode" @click="addSkillItem(module)">+ 添加技能分类</button>
          </template>

          <!-- ===== 荣誉奖项 ===== -->
          <template v-else-if="module.moduleType === 'award'">
            <ul class="awards-list">
              <li v-for="(award, index) in module.content" :key="index">
                <span class="award-name" v-if="!isEditMode">{{ award.name }}</span>
                <input class="edit-input award-name-input" v-else v-model="award.name" placeholder="奖项名称" />
                <span class="award-date" v-if="!isEditMode">{{ award.date }}</span>
                <input class="edit-input award-date-input" v-else v-model="award.date" placeholder="时间" />
                <button class="row-del-btn" v-if="isEditMode" @click="module.content.splice(index, 1)">✕</button>
              </li>
            </ul>
            <button class="add-section-btn" v-if="isEditMode" @click="addAwardItem(module)">+ 添加奖项</button>
          </template>

          <!-- ===== 自定义模块(通用渲染) ===== -->
          <template v-else>
            <div class="timeline-item" v-for="(item, index) in module.content" :key="index">
              <div class="item-header">
                <h3 class="item-title" v-if="!isEditMode">{{ item.title }}</h3>
                <input class="edit-input item-title" v-else v-model="item.title" placeholder="条目标题" />
                <span class="item-date" v-if="!isEditMode && item.date">{{ item.date }}</span>
                <input class="edit-input item-date" v-else v-model="item.date" placeholder="时间(可选)" />
              </div>
              <div class="item-subtitle" v-if="item.subTitle || isEditMode">
                <span v-if="!isEditMode">{{ item.subTitle }}</span>
                <input class="edit-input mini" v-else v-model="item.subTitle" placeholder="副标题(可选)" />
              </div>
              <ul class="item-list" v-if="item.details?.length || isEditMode">
                <li v-for="(detail, i) in item.details" :key="i">
                  <span v-if="!isEditMode">{{ detail }}</span>
                  <div class="detail-edit-row" v-else>
                    <input class="edit-input" v-model="item.details[i]" placeholder="描述" />
                    <button class="row-del-btn" @click="item.details.splice(i, 1)">✕</button>
                  </div>
                </li>
              </ul>
              <button class="add-btn" v-if="isEditMode" @click="addItemDetail(item)">+ 添加描述</button>
            </div>
            <button class="add-section-btn" v-if="isEditMode" @click="addCustomItem(module)">+ 添加条目</button>
          </template>
        </section>

        <!-- 添加模块按钮(编辑模式) -->
        <div class="add-module-area" v-if="isEditMode">
          <div class="add-module-trigger" @click="showModulePicker = !showModulePicker">
            + 添加新模块
          </div>
          <div class="module-picker" v-if="showModulePicker">
            <div
              class="picker-item"
              v-for="(title, type) in MODULE_TYPES"
              :key="type"
              @click="handleAddModule(type as string)"
            >
              <span class="picker-icon">{{ getModuleIcon(type as string) }}</span>
              <span>{{ title }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ============ 工具栏 ============ -->
    <div class="resume-toolbar" v-if="!isPrintMode">
      <template v-if="!isReadonly">
        <button v-if="!isEditMode" class="toolbar-btn primary" @click="toggleEdit">
          <span>编辑简历</span>
        </button>
        <template v-else>
          <button class="toolbar-btn success" @click="saveAndExit" :disabled="saving">
            <span v-if="!saving">保存</span>
            <span v-else>保存中...</span>
          </button>
          <button class="toolbar-btn secondary" @click="cancelEdit" :disabled="saving">
            <span>取消</span>
          </button>
        </template>
        <button class="toolbar-btn" @click="togglePrint" v-if="!isEditMode">
          <span>打印 / 保存PDF</span>
        </button>
      </template>
      <button class="toolbar-btn secondary" @click="goBack">
        <span>返回</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useResume, { MODULE_TYPES } from '../function/useResume'

const route = useRoute()
const router = useRouter()
const {
  resume,
  isPrintMode,
  saving,
  togglePrintMode,
  addModule,
  deleteModule,
  moveModuleUp,
  moveModuleDown,
  readonlyResume,
  readonlyLoading,
  loadReadonlyResume,
  clearReadonlyResume,
  loadMyResume
} = useResume()

// ============ 只读模式判断 ============
const isReadonly = computed(() => route.query.mode === 'readonly')

// 根据模式选择数据源
const currentData = computed(() => {
  if (isReadonly.value && readonlyResume.value) {
    return readonlyResume.value
  }
  return resume.value
})

// 按排序获取当前数据的模块
const currentSortedModules = computed(() =>
  [...currentData.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
)

// 我的简历加载状态
const myResumeLoading = ref(false)

// ============ 表单字段校验 ============
const phoneError = ref('')
const emailError = ref('')
const githubError = ref('')

const PHONE_REGEX = /^1[3-9]\d{9}$/
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]?(\/.*)?$/
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]?$/

function validatePhoneField() {
  const val = currentData.value.core.phone?.trim() || ''
  if (!val) { phoneError.value = ''; return }
  const digits = val.replace(/[\s-]/g, '')
  if (!PHONE_REGEX.test(digits)) {
    phoneError.value = '请输入有效的11位手机号'
  } else {
    phoneError.value = ''
  }
}

function validateEmailField() {
  const val = currentData.value.core.email?.trim() || ''
  if (!val) { emailError.value = ''; return }
  if (!EMAIL_REGEX.test(val)) {
    emailError.value = '邮箱格式不正确'
  } else {
    emailError.value = ''
  }
}

function validateGithubField() {
  const val = currentData.value.core.github?.trim() || ''
  if (!val) { githubError.value = ''; return }
  if (GITHUB_URL_REGEX.test(val)) {
    githubError.value = ''
    return
  }
  if (GITHUB_USERNAME_REGEX.test(val) && val.length <= 39) {
    githubError.value = ''
    return
  }
  githubError.value = '请输入有效的 GitHub 链接或用户名'
}

function validateAll(): boolean {
  validatePhoneField()
  validateEmailField()
  validateGithubField()
  return !phoneError.value && !emailError.value && !githubError.value
}

// ============ Toast 提示 ============
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: number | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 2500)
}

// ============ 页面挂载 ============
onMounted(async () => {
  if (isReadonly.value) {
    // 只读模式:加载指定ID的简历
    const id = Number(route.query.id)
    if (id) {
      await loadReadonlyResume(id)
    }
  } else {
    // 编辑模式:从后端加载自己的简历
    myResumeLoading.value = true
    try {
      await loadMyResume()
    } finally {
      myResumeLoading.value = false
    }
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('print-active')
  if (isReadonly.value) {
    clearReadonlyResume()
  }
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
})

// ============ 编辑相关(仅非只读模式可用) ============
const isEditMode = ref(false)
const originalData = ref<any>(null)
const showModulePicker = ref(false)
const { saveAll } = useResume()

const togglePrint = () => {
  togglePrintMode()
  setTimeout(() => {
    window.print()
  }, 300)
}

const toggleEdit = () => {
  originalData.value = JSON.parse(JSON.stringify(resume.value))
  isEditMode.value = true
}

const saveAndExit = async () => {
  if (!validateAll()) {
    showToast('请修正表单中的错误后再保存', 'error')
    return
  }
  const result = await saveAll()
  if (result.success) {
    showToast(result.message, 'success')
    isEditMode.value = false
    showModulePicker.value = false
  } else {
    showToast(result.message, 'error')
  }
}

const cancelEdit = () => {
  if (originalData.value) {
    resume.value = JSON.parse(JSON.stringify(originalData.value))
  }
  isEditMode.value = false
  showModulePicker.value = false
}

// ============ 模块条目操作 ============
function addItemDetail(item: any) {
  if (!item.details) item.details = []
  item.details.push('')
}
function addEduItem(module: any) {
  module.content.push({ school: '', major: '', degree: '', startDate: '', endDate: '', gpa: '', details: [''] })
}
function addExpItem(module: any) {
  module.content.push({ company: '', position: '', location: '', startDate: '', endDate: '', details: [''] })
}
function addProjItem(module: any) {
  module.content.push({ name: '', role: '', date: '', link: '', details: [''], tech: [] })
}
function addSkillItem(module: any) {
  module.content.push({ category: '', items: [] })
}
function addAwardItem(module: any) {
  module.content.push({ name: '', date: '' })
}
function addCustomItem(module: any) {
  module.content.push({ title: '', subTitle: '', date: '', details: [''] })
}

function syncTechInput(e: Event, proj: any) {
  const val = (e.target as HTMLInputElement).value
  proj.tech = val.split(',').map((t: string) => t.trim()).filter(Boolean)
}
function syncItemsInput(e: Event, group: any) {
  const val = (e.target as HTMLInputElement).value
  group.items = val.split(',').map((t: string) => t.trim()).filter(Boolean)
}

function handleAddModule(type: string) {
  addModule(type)
  showModulePicker.value = false
}

function getModuleIcon(type: string): string {
  const icons: Record<string, string> = {
    education: '🎓',
    experience: '💼',
    project: '🚀',
    skill: '⚡',
    award: '🏆',
    custom: '✨'
  }
  return icons[type] || '📋'
}

const goBack = () => {
  router.back()
}
</script>

<style>
@import '../style/Resume.css';

/* Toast 样式 */
.toast {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}
.toast.success {
  background-color: #10b981;
}
.toast.error {
  background-color: #ef4444;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}

/* 保存按钮禁用态 */
.toolbar-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 表单字段校验错误样式 */
.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15) !important;
}
.field-error {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
