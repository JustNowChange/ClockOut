import http, { ApiResult } from '../utils/http'

export interface ResumeListItem {
  id: number
  userId: number
  name: string
  title: string
  education: string
  experience: string
  projectCount: number
  skills: string[]
}

export interface ResumeDetailResponse {
  id: number
  userId: number
  core: {
    name: string
    title: string
    phone: string
    email: string
    location: string
    github: string
    summary: string
  }
  modules: Array<{
    id: number
    moduleType: string
    moduleTitle: string
    sortOrder: number
    content: any[]
  }>
}

/** 新增模块请求（前端发送给后端） */
export interface ModuleCreateRequestApi {
  moduleType: string
  moduleTitle: string
  content: string  // JSON 字符串
}

/** 更新模块请求 */
export interface ModuleUpdateRequestApi {
  moduleTitle?: string
  content?: string  // JSON 字符串
}

/** 排序项 */
export interface ModuleSortItem {
  id: number
  sortOrder: number
}

/** 排序请求 */
export interface ModuleSortRequestApi {
  moduleOrders: ModuleSortItem[]
}

/** 核心信息更新请求 */
export interface ResumeCoreUpdateRequestApi {
  name: string
  title: string
  phone: string
  email: string
  location: string
  github: string
  summary: string
}

// 单个简历模块
export interface ResumeModuleItem {
  id: number
  moduleType: string
  moduleTitle: string
  sortOrder: number
  content: any[]
}

// ========== API函数 ==========

/**
 * GET /api/resume
 * 获取当前用户简历（不存在自动创建空简历），需要登录
 */
export function getMyResume(): Promise<ApiResult<ResumeDetailResponse>> {
  return http.get('/resume').then(res => res.data)
}

/**
 * PUT /api/resume
 * 更新当前用户简历核心信息，需要登录
 */
export function updateResumeCore(data: ResumeCoreUpdateRequestApi): Promise<ApiResult<ResumeDetailResponse['core']>> {
  return http.put('/resume', data).then(res => res.data)
}

/**
 * POST /api/resume/module
 * 新增简历模块，需要登录
 */
export function addResumeModule(data: ModuleCreateRequestApi): Promise<ApiResult<ResumeModuleItem>> {
  return http.post('/resume/module', data).then(res => res.data)
}

/**
 * PUT /api/resume/module/{id}
 * 更新简历模块（标题 + content），需要登录
 */
export function updateResumeModule(id: number, data: ModuleUpdateRequestApi): Promise<ApiResult<ResumeModuleItem>> {
  return http.put(`/resume/module/${id}`, data).then(res => res.data)
}

/**
 * DELETE /api/resume/module/{id}
 * 删除简历模块，需要登录
 */
export function deleteResumeModule(id: number): Promise<ApiResult<void>> {
  return http.delete(`/resume/module/${id}`).then(res => res.data)
}

/**
 * PATCH /api/resume/module/sort
 * 批量调整模块排序，需要登录
 */
export function updateResumeModuleSort(data: ModuleSortRequestApi): Promise<ApiResult<void>> {
  return http.patch('/resume/module/sort', data).then(res => res.data)
}

/**
 * GET /api/resume/list
 * 获取他人简历列表（排除自己）
 */
export function getResumeList(): Promise<ApiResult<ResumeListItem[]>> {
  return http.get('/resume/list').then(res => res.data)
}

/**
 * GET /api/resume/{id}
 * 查看指定简历详情（只读，自动脱敏）
 */
export function getResumeById(id: number): Promise<ApiResult<ResumeDetailResponse>> {
  return http.get(`/resume/${id}`).then(res => res.data)
}
