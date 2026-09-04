# Login 登录页

- **路由**：`/` (默认首页)
- **入口组件**：[src/views/Login.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/Login.vue)
- **逻辑封装**：[src/function/useLogin.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useLogin.ts)
- **样式文件**：[src/style/Login.css](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/style/Login.css)

---

## 目录

1. [功能概览](#1-功能概览)
2. [入场动画序列](#2-入场动画序列)
3. [useLogin Composable](#3-uselogin-composable)
4. [登录 API](#4-登录-api)
5. [登录成功加载动画](#5-登录成功加载动画)
6. [公共覆盖组件](#6-公共覆盖组件)
7. [样式要点](#7-样式要点)
8. [角色图片资源（WebP）](#8-角色图片资源webp)

---

## 1. 功能概览

| 功能 | 说明 |
|---|---|
| 账号密码登录 | 调用 `/api/auth/login` 拿到 token 后存储 localStorage |
| 自动登录 | 初始化时若 token 存在 → 自动跳到 `/home` |
| 跳到注册页 | 点击 "没有账号？立即注册" 跳到 `/register` |
| 登录成功 Loading | 3 秒像素赛博朋克风格 Loading 覆盖层 |
| 入场动画 | 电影级烟花 intro + 登录框淡入 |
| 角色图片 | Q 版白发和服角色，点击空白区域切换「默认 / 被点」表情（WebP 资源，见第 8 节） |
| 右键菜单 | 关闭弹幕 / 开启动画 / 截图等 |

---

## 2. 入场动画序列

```
0-0.5s   纯黑屏
0.5s     第一束烟花升空（带拖尾）
~1.8s    烟花爆炸
         Logo 从中心渐入放大（纯白色 + 白色光晕）
2.5s+    持续随机烟花
4s       5连发庆祝烟花
6s       4连发庆祝烟花
7.5s     开始淡出
8.5s     动画结束，跳 /home
```

覆盖层动画：
- 阻止任何用户交互（`pointer-events: none` 禁用跳过）
- 动画结束后自动卸载组件（v-if 控制）

---

## 3. useLogin Composable

[src/function/useLogin.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useLogin.ts)

### 返回值

| 字段 | 类型 | 说明 |
|---|---|---|
| username | `Ref<string>` | 双向绑定用户名输入框 |
| password | `Ref<string>` | 双向绑定密码输入框 |
| loading | `Ref<boolean>` | 按钮 loading 状态 |
| showSuccessLoading | `Ref<boolean>` | 成功后 Loading 覆盖层 |
| login | `() => Promise<void>` | 执行登录（表单校验 + 请求 + 3s Loading + 跳转） |
| goRegister | `() => void` | 跳 `/register` |
| introDone | `Ref<boolean>` | CinematicIntro 是否结束 |
| isIntroSkipped | 同步控制 intro 是否被提前跳过 |

### 执行流程

```
login() 点击
  → 校验 username/password 非空
  → showSuccessLoading = true（按钮禁用）
  → 调用 login API
  → 成功：
       token 存 localStorage（key: clockout_token）
       userInfo 存 localStorage（key: clockout_user）
       showSuccessLoading = true（全屏 Loading）
       3 秒后 → router.push('/home')
  → 失败：
       alert 错误信息
       loading = false
```

---

## 4. 登录 API

[src/api/auth.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/api/auth.ts)

```ts
interface LoginRequest  { username: string; password: string }
interface LoginResponse { id: number; username: string; token: string }
function login(data: LoginRequest): Promise<ApiResult<LoginResponse>>

interface UserInfoResponse { id: number; name: string; status: number }
function getUserInfo(id: number): Promise<ApiResult<UserInfoResponse>>
```

Base URL：所有请求通过 `/api` 前缀（Vite 代理转发到后端）。Token 通过 `Authorization: Bearer <token>` 传递。

---

## 5. 登录成功加载动画

Loading 覆盖层规格：

| 属性 | 值 |
|---|---|
| 时长 | **3 秒**（固定） |
| 风格 | **像素赛博朋克** |
| 背景网格 | 16×16 方格背景 |
| 粒子效果 | 霓虹像素粒子飞散 |
| Logo 特效 | Glitch 故障艺术效果 |
| 字体 | `VT323` / `Share Tech Mono` |
| 主色调 | 紫 / 青 / 品红 / 黄 |

---

## 6. 公共覆盖组件

| 组件 | 文件 | 说明 |
|---|---|---|
| `CinematicIntro` | [components/CinematicIntro.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/CinematicIntro.vue) | 8.5s 烟花开场动画 |
| `LoadingOverlay` | [components/LoadingOverlay.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/LoadingOverlay.vue) | 3s 像素 Loading |
| `CuteContextMenu` | [components/CuteContextMenu.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/CuteContextMenu.vue) | 右键菜单（关闭弹幕等） |
| `DanmakuOverlay` | [components/DanmakuOverlay.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/DanmakuOverlay.vue) | 弹幕覆盖层 |
| `CuteClickText` | [components/CuteClickText.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/CuteClickText.vue) | 点击弹出文字特效 |
| `IceOverlay` | [components/IceOverlay.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/IceOverlay.vue) | 他人简历点击的黑客入侵剧情 |
| `BackgroundDecor` | [components/BackgroundDecor.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/BackgroundDecor.vue) | 全局背景装饰（雪花/星空） |

---

## 7. 样式要点

样式表文件：[src/style/Login.css](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/style/Login.css)

| 类 | 说明 |
|---|---|
| `.login-box` | 登录框容器：毛玻璃 + 圆角 + 阴影 |
| `.login-btn` | 登录按钮：按压弹跳反馈（cubic-bezier press） |
| `.login-title` | 标题：渐变色 + 发光效果 |
| `.secured-text` | 安全提示（呼吸式 glow 动画） |
| `.secured-indicator` | 状态指示灯（蓝→红→绿序列） |

### 动画关键帧（摘录）

```
pressAndBounce   ——  按钮按下回弹（0.36, 0.07, 0.19, 0.97）
securedTextGlow  ——  安全文字呼吸光晕
```

注意：
- 所有动画关键帧需保留已有的 `transform: translateY()`，避免 hover 冲突
- 复杂属性用 `!important` 确保优先级
- `Ctrl+L` 快捷键监听器在动画结束后必须 removeEventListener

---

## 8. 角色图片资源（WebP）

登录页右侧 `.characters-scene`（480×360，圆角卡片）内的 `.char-img`，是 Q 版白发和服角色，点击空白区域时在「默认 / 被点」两张图之间切换。

### 交互逻辑（[Login.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/Login.vue)）

| 项 | 说明 |
|---|---|
| 默认态 | `char-default.webp` —— 闭眼傲娇、流汗表情 |
| 被点态 | `char-clicked.webp` —— 单眼眨、星星眼、比耶、张嘴开心 |
| 切换 | `charClicked` ref 控制 `:src`；点击非交互区域（`onGlobalClick`，排除 input/button/a 等）触发 `triggerCharacterChange()`，置 true 后 400ms 自动复位 |
| 预加载 | `onMounted` 调用 `preloadImages([charDefaultImg, charClickedImg])`，见 [utils/imageCache.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/utils/imageCache.ts)（Cache API 后台缓存，二次访问走缓存） |

### 资源清单（2026-09-04 优化）

> 原图为超大 PNG（合计 5.3 MB），登录页加载白屏。已用 sharp 转 WebP 并将长边缩到 1024px（显示仅需 ~480px，覆盖 2x 视网膜屏）。

| 文件 | 格式 | 尺寸 | 大小 | 用途 |
|---|---|---|---|---|
| `src/assets/char-default.webp` | WebP q82 | 1024×914 | ~79 KB | 默认表情（当前引用） |
| `src/assets/char-clicked.webp` | WebP q82 | 1024×665 | ~65 KB | 被点表情（当前引用） |
| `src/assets/char-default.png` | PNG | 2080×1856 | 2.5 MB | 原图备份（已不被引用，可删） |
| `src/assets/char-clicked.png` | PNG | 2541×1650 | 2.7 MB | 原图备份（已不被引用，可删） |

**优化效果**：登录页角色资源 **5.17 MB → 144 KB（−97.3%）**，画质肉眼无差别。

```ts
// Login.vue 中的引用（.png → .webp）
import charDefaultImg from '../assets/char-default.webp'
import charClickedImg from '../assets/char-clicked.webp'
```

转换配方（参照 NewIdea 项目 `scripts/convert-webp.mjs`）：
```
sharp(src)
  .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 82, effort: 5, smartSubsample: true })
```

> `env.d.ts` 已声明 `*.webp` 模块，TypeScript 可直接 import；Vite 构建会自动 hash 命名（如 `char-default-x9wt3C1F.webp`）。
