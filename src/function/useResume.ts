import { ref, watch, computed } from 'vue'
import {
  getResumeList,
  getResumeById,
  getMyResume,
  updateResumeCore,
  addResumeModule,
  updateResumeModule,
  deleteResumeModule,
  updateResumeModuleSort,
  type ResumeListItem,
  type ResumeDetailResponse,
  type ResumeCoreUpdateRequestApi,
} from '../api/resume'
import { getToken } from '../utils/http'

const STORAGE_KEY = 'clockout_resume_data_v2'
const OLD_STORAGE_KEY = 'clockout_resume_data'

// ============ 类型定义 ============

/** 简历核心信息(固定字段,可精确查询) */
export interface ResumeCore {
  name: string
  title: string
  phone: string
  email: string
  location: string
  github: string
  summary: string
}

/** 模块条目(通用,不同 moduleType 字段不同) */
export interface ResumeItem {
  [key: string]: any
}

/** 简历扩展模块 */
export interface ResumeModule {
  id: string | number  // number=后端已持久化, string=本地临时新增(保存后会转为number)
  moduleType: string  // education/experience/project/skill/award/custom
  moduleTitle: string
  sortOrder: number
  content: ResumeItem[]
}

/** 完整简历数据 */
export interface ResumeData {
  core: ResumeCore
  modules: ResumeModule[]
}

/** 预设模块类型 -> 默认标题 */
export const MODULE_TYPES: Record<string, string> = {
  education: '教育背景',
  experience: '工作经历',
  project: '项目经验',
  skill: '专业技能',
  award: '荣誉奖项',
  custom: '自定义模块'
}

// ============ 默认数据 ============

const defaultCore: ResumeCore = {
  name: '',
  title: '',
  phone: '',
  email: '',
  location: '',
  github: '',
  summary: ''
}

function genTempId(): string {
  return 'tmp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** 创建默认模块(把原固定结构转换为模块化) */
function createDefaultModules(): ResumeModule[] {
  const types = ['education', 'experience', 'project', 'skill', 'award']
  return types.map((type, idx) => ({
    id: genTempId(),
    moduleType: type,
    moduleTitle: MODULE_TYPES[type],
    sortOrder: idx,
    content: []
  }))
}

const defaultResume: ResumeData = {
  core: { ...defaultCore },
  modules: createDefaultModules()
}

// ============ 存储读写(仅本地降级模式用) ============

/** 迁移旧数据(v1固定结构) -> 新结构(v2 core+modules) */
function migrateFromV1(old: any): ResumeData {
  return {
    core: {
      name: old.name ?? '',
      title: old.title ?? '',
      phone: old.phone ?? '',
      email: old.email ?? '',
      location: old.location ?? '',
      github: old.github ?? '',
      summary: old.summary ?? ''
    },
    modules: [
      old.education?.length ? { id: genTempId(), moduleType: 'education', moduleTitle: '教育背景', sortOrder: 0, content: old.education } : null,
      old.experience?.length ? { id: genTempId(), moduleType: 'experience', moduleTitle: '工作经历', sortOrder: 1, content: old.experience } : null,
      old.projects?.length ? { id: genTempId(), moduleType: 'project', moduleTitle: '项目经验', sortOrder: 2, content: old.projects } : null,
      old.skills?.length ? { id: genTempId(), moduleType: 'skill', moduleTitle: '专业技能', sortOrder: 3, content: old.skills } : null,
      old.awards?.length ? { id: genTempId(), moduleType: 'award', moduleTitle: '荣誉奖项', sortOrder: 4, content: old.awards } : null
    ].filter(Boolean) as ResumeModule[]
  }
}

function loadFromStorage(): ResumeData {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY)
    if (v2) {
      return JSON.parse(v2) as ResumeData
    }
    const v1 = localStorage.getItem(OLD_STORAGE_KEY)
    if (v1) {
      const migrated = migrateFromV1(JSON.parse(v1))
      saveToStorage(migrated)
      return migrated
    }
  } catch (e) {
    console.error('Failed to load resume from storage:', e)
  }
  return JSON.parse(JSON.stringify(defaultResume))
}

function saveToStorage(data: ResumeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save resume to storage:', e)
  }
}

// ============ 模块级共享状态 ============
const resume = ref<ResumeData>(loadFromStorage())
const isPrintMode = ref(false)

/** 是否使用后端模式(已登录=true, 未登录=false走本地存储) */
const useBackend = ref(false)

/** 保存时的 loading 状态 */
const saving = ref(false)

/** 从后端加载的初始模块ID集合(用于追踪哪些模块需要新增/更新/删除) */
const initialServerModuleIds = ref<Set<number>>(new Set())

/** 记录已删除的后端模块ID(等待保存时调用删除API) */
const deletedServerModuleIds = ref<Set<number>>(new Set())

/** 他人简历列表(只读预览) */
const resumeList = ref<ResumeListItem[]>([])
const listLoading = ref(false)

/** 只读模式数据(查看他人简历) */
const readonlyResume = ref<ResumeData | null>(null)
const readonlyLoading = ref(false)

// 自动保存到 localStorage(无论是否后端模式,作为草稿备份)
watch(resume, (newVal) => {
  saveToStorage(newVal)
}, { deep: true })

// ============ 内部工具方法 ============

/** API 返回 -> 前端数据结构转换 */
function convertDetailToResumeData(d: ResumeDetailResponse): ResumeData {
  return {
    core: { ...d.core },
    modules: d.modules.map(m => ({
      id: m.id,
      moduleType: m.moduleType,
      moduleTitle: m.moduleTitle,
      sortOrder: m.sortOrder,
      content: m.content
    }))
  }
}

/** 判断是否是后端ID(数字) */
function isServerId(id: string | number): id is number {
  return typeof id === 'number'
}

// ============ 组合式函数 ============
export function useResume() {
  /** 按排序获取模块 */
  const sortedModules = computed(() =>
    [...resume.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
  )

  function togglePrintMode() {
    isPrintMode.value = !isPrintMode.value
    if (isPrintMode.value) {
      document.body.classList.add('print-active')
    } else {
      document.body.classList.remove('print-active')
    }
  }

  function updateCore(data: Partial<ResumeCore>) {
    resume.value.core = { ...resume.value.core, ...data }
  }

  /** 新增模块(本地新增,保存时才提交后端) */
  function addModule(moduleType: string, moduleTitle?: string): ResumeModule {
    const title = moduleTitle || MODULE_TYPES[moduleType] || '自定义模块'
    const maxSort = resume.value.modules.reduce((max, m) => Math.max(max, m.sortOrder), -1)
    const newModule: ResumeModule = {
      id: genTempId(),
      moduleType,
      moduleTitle: title,
      sortOrder: maxSort + 1,
      content: []
    }
    resume.value.modules.push(newModule)
    return newModule
  }

  /** 更新模块(含 content) */
  function updateModule(id: string | number, data: Partial<ResumeModule>) {
    const m = resume.value.modules.find(x => x.id === id)
    if (m) {
      Object.assign(m, data)
    }
  }

  /** 删除模块 */
  function deleteModule(id: string | number) {
    const idx = resume.value.modules.findIndex(x => x.id === id)
    if (idx > -1) {
      // 如果是后端已有的模块,记录下来待保存时调用删除API
      if (isServerId(id)) {
        deletedServerModuleIds.value.add(id)
      }
      resume.value.modules.splice(idx, 1)
      reSortModules()
    }
  }

  /** 上移模块 */
  function moveModuleUp(id: string | number) {
    const sorted = [...resume.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(m => m.id === id)
    if (idx > 0) {
      const cur = sorted[idx]
      const prev = sorted[idx - 1]
      const tmp = cur.sortOrder
      cur.sortOrder = prev.sortOrder
      prev.sortOrder = tmp
    }
  }

  /** 下移模块 */
  function moveModuleDown(id: string | number) {
    const sorted = [...resume.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(m => m.id === id)
    if (idx > -1 && idx < sorted.length - 1) {
      const cur = sorted[idx]
      const next = sorted[idx + 1]
      const tmp = cur.sortOrder
      cur.sortOrder = next.sortOrder
      next.sortOrder = tmp
    }
  }

  /** 重新排序(删除后) */
  function reSortModules() {
    const sorted = [...resume.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
    sorted.forEach((m, i) => { m.sortOrder = i })
  }

  /** 按类型查找第一个模块 */
  function findModuleByType(moduleType: string): ResumeModule | undefined {
    return resume.value.modules
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .find(m => m.moduleType === moduleType)
  }

  function resetResume() {
    resume.value = JSON.parse(JSON.stringify(defaultResume))
    initialServerModuleIds.value.clear()
    deletedServerModuleIds.value.clear()
  }

  // ============ 后端集成:加载 & 保存 ============

  /** 从后端加载当前用户简历(没有则自动创建空简历) */
  async function loadMyResume(): Promise<boolean> {
    // 没有 token 则使用本地模式
    if (!getToken()) {
      useBackend.value = false
      resume.value = loadFromStorage()
      initialServerModuleIds.value.clear()
      deletedServerModuleIds.value.clear()
      return false
    }
    try {
      const res = await getMyResume()
      if (res.code === 1 && res.data) {
        useBackend.value = true
        resume.value = convertDetailToResumeData(res.data)
        // 记录初始后端模块ID
        initialServerModuleIds.value = new Set(
          resume.value.modules
            .filter(m => isServerId(m.id))
            .map(m => m.id as number)
        )
        deletedServerModuleIds.value.clear()
        return true
      }
    } catch (e) {
      console.warn('从后端加载简历失败，降级为本地模式:', e)
    }
    // 失败降级为本地
    useBackend.value = false
    resume.value = loadFromStorage()
    initialServerModuleIds.value.clear()
    deletedServerModuleIds.value.clear()
    return false
  }

  /**
   * 保存全部变更到后端(核心信息 + 模块增删改 + 排序)
   * 非后端模式时仅保存到 localStorage(视为成功)
   */
  async function saveAll(): Promise<{ success: boolean; message: string }> {
    if (!useBackend.value) {
      saveToStorage(resume.value)
      return { success: true, message: '已保存到本地' }
    }

    saving.value = true
    try {
      // ---- 1. 保存核心信息 ----
      const corePayload: ResumeCoreUpdateRequestApi = { ...resume.value.core }
      await updateResumeCore(corePayload)

      // ---- 2. 处理模块: 删除 -> 新增 -> 更新 ----
      // 2a. 删除已移除的后端模块
      for (const id of deletedServerModuleIds.value) {
        await deleteResumeModule(id)
      }
      deletedServerModuleIds.value.clear()

      // 2b. 新增本地模块(id 是字符串的) & 更新 id 映射
      const sorted = [...resume.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
      for (const m of sorted) {
        if (!isServerId(m.id)) {
          const res = await addResumeModule({
            moduleType: m.moduleType,
            moduleTitle: m.moduleTitle,
            content: JSON.stringify(m.content)
          })
          if (res.code === 1 && res.data) {
            // 替换为后端返回的真实 id
            m.id = res.data.id
          }
        }
      }

      // 2c. 更新后端已有的模块(全部更新一次,保证内容同步)
      const sorted2 = [...resume.value.modules].sort((a, b) => a.sortOrder - b.sortOrder)
      for (const m of sorted2) {
        if (isServerId(m.id)) {
          await updateResumeModule(m.id, {
            moduleTitle: m.moduleTitle,
            content: JSON.stringify(m.content)
          })
        }
      }

      // ---- 3. 同步排序(所有模块) ----
      const sortPayload = {
        moduleOrders: resume.value.modules.map(m => ({
          id: Number(m.id),  // 此时所有 id 都应该是数字了
          sortOrder: m.sortOrder
        }))
      }
      await updateResumeModuleSort(sortPayload)

      // ---- 4. 重新记录后端模块ID集合 ----
      initialServerModuleIds.value = new Set(
        resume.value.modules
          .filter(m => isServerId(m.id))
          .map(m => m.id as number)
      )

      return { success: true, message: '保存成功' }
    } catch (e: any) {
      console.error('保存简历失败:', e)
      const msg = e?.message || '保存失败，请稍后重试'
      return { success: false, message: msg }
    } finally {
      saving.value = false
    }
  }

  // ============ 他人简历列表 ============

  /** 获取他人简历列表(带mock降级) */
  async function fetchResumeList(): Promise<void> {
    listLoading.value = true
    try {
      const res = await getResumeList()
      if (res.code === 1 && res.data) {
        resumeList.value = res.data
      } else {
        resumeList.value = getMockList()
      }
    } catch (e) {
      console.warn('Failed to fetch resume list, using mock data:', e)
      resumeList.value = getMockList()
    } finally {
      listLoading.value = false
    }
  }

  /** Mock 数据(后端未就绪时使用) */
  function getMockList(): ResumeListItem[] {
    return [
      {
        id: 1,
        userId: 100,
        name: '李四',
        title: '前端工程师',
        education: '清华大学',
        experience: '腾讯 · 前端工程师',
        projectCount: 3,
        skills: ['Vue3', 'React', 'TypeScript', 'Node.js']
      },
      {
        id: 2,
        userId: 101,
        name: '王五',
        title: '后端工程师',
        education: '北京大学',
        experience: '美团 · Java工程师',
        projectCount: 5,
        skills: ['Java', 'Spring Boot', 'MySQL', 'Redis']
      },
      {
        id: 3,
        userId: 102,
        name: '赵六',
        title: '全栈工程师',
        education: '上海交通大学',
        experience: '京东 · 全栈开发',
        projectCount: 4,
        skills: ['Vue3', 'Node.js', 'Python', 'Docker']
      }
    ]
  }

  // ============ 只读模式 ============

  /** 加载指定简历(只读模式) */
  async function loadReadonlyResume(id: number): Promise<void> {
    readonlyLoading.value = true
    readonlyResume.value = null
    try {
      const res = await getResumeById(id)
      if (res.code === 1 && res.data) {
        readonlyResume.value = convertDetailToResumeData(res.data)
      }
    } catch (e) {
      console.warn('Failed to fetch resume detail:', e)
      readonlyResume.value = getMockReadonlyData(id)
    } finally {
      readonlyLoading.value = false
    }
  }

  /** Mock 只读数据 */
  function getMockReadonlyData(id: number): ResumeData {
    const mockList = getMockList()
    const item = mockList.find(x => x.id === id) || mockList[0]
    return {
      core: {
        name: item.name,
        title: item.title,
        phone: '',
        email: '',
        location: '',
        github: '',
        summary: '这是 ' + item.name + ' 的简历,点击编辑简历按钮可以修改。'
      },
      modules: [
        {
          id: 'mock-edu',
          moduleType: 'education',
          moduleTitle: '教育背景',
          sortOrder: 0,
          content: [{ school: item.education, major: '计算机科学', degree: '本科', startDate: '2016.09', endDate: '2020.06', gpa: '3.8', details: ['优秀毕业生'] }]
        },
        {
          id: 'mock-exp',
          moduleType: 'experience',
          moduleTitle: '工作经历',
          sortOrder: 1,
          content: [{ company: item.experience.split(' · ')[0], position: item.experience.split(' · ')[1] || '', location: '', startDate: '2020.07', endDate: '至今', details: ['负责核心项目开发', '优化系统性能'] }]
        },
        {
          id: 'mock-skill',
          moduleType: 'skill',
          moduleTitle: '专业技能',
          sortOrder: 2,
          content: [{ category: '技术栈', items: item.skills }]
        }
      ]
    }
  }

  function clearReadonlyResume() {
    readonlyResume.value = null
  }

  return {
    // 状态
    resume,
    isPrintMode,
    sortedModules,
    useBackend,
    saving,
    // 核心操作
    togglePrintMode,
    updateCore,
    addModule,
    updateModule,
    deleteModule,
    moveModuleUp,
    moveModuleDown,
    findModuleByType,
    resetResume,
    // 后端集成
    loadMyResume,
    saveAll,
    // 他人列表
    resumeList,
    listLoading,
    fetchResumeList,
    // 只读模式
    readonlyResume,
    readonlyLoading,
    loadReadonlyResume,
    clearReadonlyResume
  }
}

export default useResume
