# 变更记录（Changelog）

本文件记录前端（Clock Out）的重要变更，最新在最上。

---

## 变更 A · 2026-09-04 · 登录角色图 WebP 优化 + Home.vue 构建修复

- **变更类型**：性能优化（图片资源） + 构建修复
- **触发源**：登录页角色图片加载慢（白屏），参考 NewIdea 项目 `scripts/convert-webp.mjs` 的 PNG→WebP 方案

### A1. 根因

登录页角色图为超大 PNG，一次需加载 **5.3 MB** 才显示角色，但实际仅渲染在 480×360 的框内：

| 文件 | 优化前 | 实际显示 |
|---|---|---|
| `src/assets/char-default.png` | 2.5 MB（2080×1856） | ~480px |
| `src/assets/char-clicked.png` | 2.7 MB（2541×1650） | ~480px |

### A2. 优化措施

用 sharp 将两张 PNG 转 WebP（quality 82），长边缩放到 1024px（覆盖 2x 视网膜屏）：

| 文件 | 优化后 | 尺寸 | 降幅 |
|---|---|---|---|
| `char-default.webp` | ~79 KB | 1024×914 | −96.9% |
| `char-clicked.webp` | ~65 KB | 1024×665 | −97.6% |
| **合计** | **144 KB** | — | **−97.3%** |

### A3. 修改文件

| 文件 | 操作 |
|---|---|
| `src/assets/char-default.webp` | 新增（由 char-default.png 转换缩放） |
| `src/assets/char-clicked.webp` | 新增（由 char-clicked.png 转换缩放） |
| [src/views/Login.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/Login.vue#L234-L235) | 2 行 import 由 `.png` 改为 `.webp` |
| `src/assets/char-default.png` / `char-clicked.png` | 原图保留为备份，已不被引用（可删） |

> `env.d.ts` 已有 `*.webp` 模块声明，TypeScript 无需改动；Vite 构建自动 hash 命名。

### A4. Home.vue 构建修复（顺带）

构建时报两处错误，根因是「变更 B」删打卡模块时 Home.vue 处于半修改状态：

1. `[plugin:vite:vue] Invalid end tag` —— 文件缺少 `<template>` 根包裹标签（首行直接是 `<div class="login-page">`，但 script 前无 `</template>`）。
2. `Could not resolve '../function/useStudyDays'` —— 模板与 script 仍残留 `studyDays` 数据绑定、`useStudyDays()` 调用、`goToStudy()` 函数，但对应 composable 文件已删。

修复：补回 `<template>` / `</template>`；删除 `.study-days-list` 打卡卡片 DOM、`const { studyDays } = useStudyDays()`、`goToStudy()` 函数。左右两栏结构与所有样式类保持不变。

### A5. 验证

- `npm run build` 通过：`✓ 127 modules transformed` → `✓ built`
- 构建产物：`dist/assets/char-default-*.webp 81KB`、`char-clicked-*.webp 66KB`
- 角色交互（点击空白切换表情、400ms 复位、预加载缓存）逻辑未动

---

## 变更 B · 2026-09-04 · 删除打卡模块（study_days / Clock）

- **触发源**：后端项目 `H:\项目1\ClockOut` 中标记为 `TODO 标记删除` 的代码
- **变更类型**：破坏性删除（移除一个完整的业务模块）

---

## 1. 后端删除依据（TODO 源清单）

以下 5 处后端 TODO 构成本次前端变更的唯一依据，未标记 TODO 的后端代码一律不触及。

| 序号 | 后端文件 | 行号 | TODO 原文 | 实际删除范围 |
|---|---|---|---|---|
| 1 | `demo/src/main/java/.../service/ClockService.java` | 1 | `// TODO 标记删除 包括表` | ClockService 整体（3 个方法：getlist / updateStatus / getDetail） |
| 2 | `demo/src/main/java/.../service/serviceImpl/ClockServiceImpl.java` | 2 | `//TODO 标记删除 包括表` | ClockServiceImpl 整体 |
| 3 | `demo/src/main/java/.../mapper/ClockMapper.java` | 11 | `// TODO 标记删除 包括表` | `getlist()` → `SELECT * FROM study_days` |
| 4 | `demo/src/main/java/.../mapper/ClockMapper.java` | 18 | `// TODO 标记删除 包括表` | `getDetail(int id)` → `SELECT * FROM study_days WHERE id = ?` |
| 5 | `demo/src/main/java/.../Controller/Controller.java` | 23 | `// TODO 标记删除` | `GET /api/study/days` 端点 |

> **连带删除（后端同文件未标 TODO，但完全依赖 study_days 表，与上述 TODO 「包括表」语义直接相关）**：
> - `ClockMapper.updateStatus()` — `UPDATE study_days SET status=1 ...`
> - `Controller.getClockDetail()` — `GET /api/clock/detail/{dayId}`（与 ClockMapper.getDetail 成对）

---

## 2. 对应删除的后端接口

本变更生效后以下接口不再存在，前端所有调用必须删除：

| Method | Path | 原用途 |
|---|---|---|
| GET | `/api/study/days` | 获取学习天数卡片列表（未打卡/已打卡） |
| GET | `/api/clock/detail/{dayId}` | 获取单个打卡项详情（含 imageUrl 截图） |

> `/api/upload`（上传图片）未被任何 TODO 标记，予以保留。

---

## 3. 前端变更总览

```
前端变更共：12 处
├── 删除文件：6 个（与 Clock / study_days 直接绑定）
├── 修改文件：4 个（API 声明 / 路由 / 主页 / 样式 API 文件）
└── 保留未改：2 类文件（非打卡绑定的通用逻辑 + 样式兼容保留）
```

---

## 4. 已删除文件清单（6 个）

| 序号 | 原路径 | 原用途 | 删除依据 |
|---|---|---|---|
| 1 | `src/views/Clock.vue` | 打卡详情页：英语学习按钮（打开 typewords.cc）、截图、详情展示，依赖 `/clock/detail` 与 dayId 参数 | Clock 页面整体为打卡模块 |
| 2 | `src/style/Clock.css` | Clock.vue 的专属样式文件 | Clock.vue 已删 |
| 3 | `src/function/useStudyDays.ts` | composable：调用 `getStudyDays()` 获取 Days 列表，Home.vue 打卡卡片数据源 | 直接绑定 `/study/days` |
| 4 | `src/function/useClockDetail.ts` | composable：调用 `getClockDetail(dayId)` 获取打卡详情 | 直接绑定 `/clock/detail/{dayId}` |
| 5 | `src/function/useScreenshot.ts` | composable：捕获屏幕 → 以 `dayId` 为参数调用 `uploadImage()` 上传打卡证明 | `uploadScreenshot(dayId, cb)` 的 dayId 参数绑定 study_days 主键 |
| 6 | `src/function/isShow.ts` | 英语学习开关：`window.open('https://typewords.cc/')` 并记录 studyTime，由 Clock.vue 「英语学习」按钮调用 | 仅 Clock.vue 页面引用 |

---

## 5. 已修改文件清单（4 个）

### 5.1 `src/api/clock.ts`

| 操作 | 内容 |
|---|---|
| 删除 | `export interface Days { id, name, status, completeTime }` |
| 删除 | `export function getStudyDays()` → `GET /study/days` |
| 删除 | `export function getClockDetail(dayId)` → `GET /clock/detail/${dayId}` |
| **保留** | `export function uploadImage(data: FormData)` → `POST /upload`（后端未标 TODO，为通用上传能力） |

**修改后完整内容**（9 行）：
```ts
import http, { ApiResult } from '../utils/http'

export function uploadImage(data: FormData): Promise<ApiResult<string>> {
  return http.post('/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}
```

### 5.2 `src/router/index.ts`

| 操作 | 内容 |
|---|---|
| 删除路由 | `{ path: '/clock', name: 'Clock', component: Clock.vue }` |
| 调整路由数组 | 原 6 条路由 → 5 条（Login / Register / RegisterForm / Home / Resume） |
| 调整 `PROTECTED_PAGES` | `['/home', '/clock', '/resume']` → `['/home', '/resume']` |

> `AUTH_PAGES`（'/'、'/register'、'/register/form'）未变。

### 5.3 `src/views/Home.vue` — 精准删除，**格式完全保留**

**关键约束**：Home 页面的左右两栏结构、外层 CSS 类、动画钩子必须保持不变。

**保留不动的结构**（100% 原样）：

```
.login-page
├── .left-panel.animate-in              ← 完整保留（樱花树/云/星月装饰 + 他人简历列表 + 我的简历卡片）
├── .right-panel.animate-in             ← 容器完整保留
│   └── .form-container                 ← 容器完整保留
│       ├── .sparkle-icon (SVG 4 星)    ← 保留
│       └── .form-header                ← 保留(h1/p 标签结构不变)
├── .user-avatar-wrapper (+面板)        ← 完整保留
├── <Teleport> 我的简历放大 overlay     ← 完整保留(matrix/终端/8 阶段加载)
└── <Teleport> 他人简历入侵动画 overlay ← 完整保留(180 网格 + 5 阶段入侵)
```

**具体 3 处修改**：

**① 模板删除打卡卡片网格（17 行 → 0）**

原 `<div class="study-days-list">` 内部的 `.grid-item v-for`（渲染 `studyDays` 数据源，点击跳转 `/clock?dayId=...`）整段删除。

`.form-header` 中的标题文字「打卡系统」**保留不变**（属产品品牌名，与已删除的 study_days 打卡功能无关）；`h1 / p(currentTime)` 的 DOM 结构与 CSS 类完全保持。

**② script 删除导入与变量**

```diff
 import useClock from '../function/useClock'
-import useStudyDays from '../function/useStudyDays'
 import { useAuth } from '../function/useAuth'
 import useResume from '../function/useResume'

 const { currentTime } = useClock()
-const { studyDays } = useStudyDays()
 const { user, fetchUserInfo, logout } = useAuth()
 const { resume, ... } = useResume()
```

**③ 删除 `goToStudy` 函数**

```diff
-function goToStudy(day: any) {
-  router.push(`/clock?dayId=${day.id}`)
-}
-
 function handleLogout() {
   logout()
   window.location.href = '/'
 }
```

> `useClock.ts`（仅 `currentTime` / `finishTime` 时间字符串，不依赖任何后端接口）保留。

### 5.4 `docs/Home.md`（同步更新，见第 7 节）

---

## 6. 保留未删除的边界说明

| 项目 | 说明 | 未删原因 |
|---|---|---|
| `src/function/useClock.ts` | 返回 `currentTime` / `finishTime` 的 composable（本地 Date，不请求接口） | 非 Clock 模块专属，Home.vue `.form-header p` 仍在使用 |
| `src/style/Home.css` 中 `.grid-item` / `.study-days-list` 等 CSS 声明 | 打卡卡片样式 | 移除后不会触发 JS 错误，保留可避免后续若恢复卡片需重写样式；不影响页面显示 |
| `useClock` 文件名 | 命名中含 "Clock"，但实现纯本地时间 | 不造成功能耦合，改名属重构范畴，非本次删除范围 |
| `src/api/clock.ts` 文件名与 `index.ts: export * from './clock'` | 文件仅剩 `uploadImage` | 后端 UploadController 未标 TODO，`clock.ts` 重命名属重构范畴 |
| `Register.vue` 中 `<span class="tagline">打卡系统</span>` | 注册页底部品牌标语 | 文件已在「注册」文档范围，与 study_days 表无直接代码绑定；若要一致建议改成 "ClockOut"，非本次必须 |
| `DanmakuOverlay.vue` 弹幕词「打卡第 5201314 天」「打卡系统好评」 | 纯前端弹幕文案池 | 不触发任何 API，纯展示；可在 UI 微调时统一修改 |

---

## 7. `docs/Home.md` 同步更新内容

本文件中所有指向已删除模块/章节的引用均已修正，目录编号连续无空洞。

### 7.1 删除的逻辑封装引用（3 条）

```diff
- [src/function/isShow.ts]        ← 已删除文件
  [src/function/useAuth.ts]
  [src/function/useCharacters.ts]
  [src/function/useIntro.ts]
- [src/function/useStudyDays.ts]  ← 已删除文件
- [src/function/useScreenshot.ts] ← 已删除文件
```

### 7.2 功能概览表删除「打卡进度」行

```diff
 | 用户信息展示 | 头像 + 昵称 + 学校 + 个性签名 |
-| 打卡进度     | 已打卡/未打卡卡片列表，点击跳转 /clock |
 | 我的简历     | 左下角简版简历卡片，点击编辑 |
```

### 7.3 目录重排

原 10 节 → 9 节，删除「4. 打卡卡片列表」，后续前移：

```
1. 功能概览
2. 页面结构          ← 更新 ASCII 图，去掉 .study-card-list，改为实际左右两栏结构
3. 角色系统
4. 我的简历卡片      ← 原 5 → 4
5. 其他简历卡片列表  ← 原 6 → 5
6. 底部视频入口      ← 原 7 → 6
7. 右键菜单功能      ← 原 8 → 7
8. 公共覆盖层        ← 原 9 → 8
9. useAuth 与登录态  ← 原 10 → 9
```

### 7.4 删除整节：「4. 打卡卡片列表」

整节 22 行（Days 接口说明 + 卡片状态表 + 入场动画）全部移除。

### 7.5 页面结构 ASCII 图改写为实际左右分栏

原文档写入的是早期 `.home-content + .study-card-list + .resume-cards` 结构，当前实际代码为左右分栏。同步改写（保持与 `Home.vue` 模板一致）。

---

## 8. 验证结果

| 验证项 | 结果 |
|---|---|
| IDE 类型诊断（GetDiagnostics） | ✅ 0 错误 |
| 全文 grep 已删除模块引用（useStudyDays / useClockDetail / useScreenshot / isShow.ts / Clock.vue / Clock.css / `/clock` / dayId / goToStudy / getStudyDays / getClockDetail） | ✅ 仅 `src/api/index.ts: export * from './clock'`（clock.ts 仍存在，属正常） |
| `router.PROTECTED_PAGES` 残留 `/clock` | ✅ 已移除 |
| Home.vue 中 `studyDays` 变量引用残留 | ✅ 0 处 |
| Home.vue 左右面板层次（left-panel / right-panel / form-container / form-header / sparkle-icon） | ✅ 完整保留，无结构改动 |
| `uploadImage()` 导出（未被 TODO 标记） | ✅ 保留 |

---

## 9. 已知未处理项（需人工确认）

1. **注册页标语**：`src/views/Register.vue` 底部 `<span class="tagline">打卡系统</span>` — 与 ClockOut 品牌不完全一致，但不影响功能，需确认是否改为「ClockOut」。
2. **弹幕文案**：`src/components/DanmakuOverlay.vue` 的 bulletPool 中 2 条打卡相关文案（"打卡第 5201314 天"、"打卡系统好评"）— 纯展示，需确认是否从词池移除。
3. **Home.css 残留样式**：`.study-days-list` / `.grid-item` / `.day-header` / `.complete-time` 等约 90 行 CSS 声明 — 不会报错，需确认是否批量删除。
4. **`src/api/clock.ts` 重命名**：文件仅剩 `uploadImage` 单一导出，是否改为 `upload.ts` 并同步修改 `api/index.ts` 与引用处？属重构范畴。
5. **`useClock.ts` 重命名**：文件功能仅为本地时间格式化，是否改为 `useTime.ts`？同样属重构范畴。
