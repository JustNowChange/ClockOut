# Home 主页

- **路由**：`/home`
- **入口组件**：[src/views/Home.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/Home.vue)
- **逻辑封装**：
  - [src/function/useAuth.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useAuth.ts)
  - [src/function/useCharacters.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useCharacters.ts)
  - [src/function/useClock.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useClock.ts)
  - [src/function/useIntro.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useIntro.ts)
  - [src/function/useResume.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useResume.ts)
- **样式文件**：[src/style/Home.css](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/style/Home.css)

> **2026-09-04 删除**：原逻辑封装中的 `isShow.ts`、`useStudyDays.ts`、`useScreenshot.ts` 已随打卡模块（study_days/Clock）整体移除。详见 [docs/CHANGELOG.md](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/docs/CHANGELOG.md)。

---

## 目录

1. [功能概览](#1-功能概览)
2. [页面结构](#2-页面结构)
3. [角色系统](#3-角色系统)
4. [我的简历卡片](#4-我的简历卡片)
5. [其他简历卡片列表](#5-其他简历卡片列表)
6. [底部视频入口](#6-底部视频入口)
7. [右键菜单功能](#7-右键菜单功能)
8. [公共覆盖层](#8-公共覆盖层)
9. [useAuth 与登录态](#9-useauth-与登录态)

---

## 1. 功能概览

| 功能 | 说明 |
|---|---|
| 用户信息展示 | 头像 + 昵称 + 学校 + 个性签名 |
| 我的简历 | 左侧简版简历卡片，点击编辑（全屏放大 + Matrix 黑客加载动画） |
| 他人简历 | 左侧其他用户卡片（含「黑客入侵 → 管理员介入」剧情动画，5 阶段 180 网格） |
| 点击角色 | 切换角色 + 点击弹跳反馈 + 点击文字特效 |
| 烟花开场 | CinematicIntro 8.5s 动画 |
| 星空背景 | BackgroundDecor 全屏雪花/星空粒子 |
| 弹幕 | DanmakuOverlay 多轨道滚动 |
| 截图 | 右键菜单一键截图下载 |

> **2026-09-04 删除**：原「打卡进度」（已打卡/未打卡卡片列表 + 跳转 `/clock`）已移除。

---

## 2. 页面结构

```
.login-page
├── <CinematicIntro>              # 烟花开场
├── <BackgroundDecor>             # 雪花/星空（樱花树、云、星月 SVG 装饰层）
├── <DanmakuOverlay :density=1>   # 弹幕
│
├── .left-panel.animate-in        # 左栏
│   ├── .theme-decor-layer        #   樱花树 / 云 / 星月 SVG（aria-hidden）
│   ├── .resume-list-section      #   他人简历列表（含标题/条数/空态提示）
│   │   └── .resume-list-item v-for （点击触发入侵剧情动画）
│   └── .my-resume-section        #   我的简历简版卡片（点击放大 → /resume）
│
├── .right-panel.animate-in       # 右栏
│   └── .form-container
│       ├── .sparkle-icon (4星SVG)
│       └── .form-header
│           ├── h1: 打卡系统      #   标题（产品品牌名，保留不变，与已删 study_days 功能无关）
│           └── p: currentTime    #   实时时间（useClock.ts，本地 Date）
│
├── .user-avatar-wrapper          # 底部居中用户头像
│   └── .avatar-panel (hover/click 弹出)
│       ├── 头像 / 昵称 / 职位
│       └── 菜单：退出登录
│
├── <Teleport to="body">          # 我的简历 → 放大动画覆盖层
│   └── .expand-overlay
│       ├── <canvas matrix-rain>
│       ├── 8 阶段黑客终端加载（Ctrl+L 跳过 → /resume）
│
├── <Teleport to="body">          # 他人简历 → 黑客入侵剧情覆盖层
│   └── .list-expand-overlay
│       ├── <canvas matrix-rain>
│       ├── 18×10=180 领地色块（红占领 → 绿回收，无空格）
│       ├── 警告三角 / 终端 / 状态灯（5 阶段）
│       └── Ctrl+L 跳过 → /resume?mode=readonly&id=xx
│
├── <CuteContextMenu>             # 右键菜单
└── <CuteClickText>               # 点击文字特效
```

---

## 3. 角色系统

[src/function/useCharacters.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useCharacters.ts)

> 角色图片实际用于**登录页**（[Login.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/Login.vue)），详见 [Login.md · 8. 角色图片资源（WebP）](Login.md#8-角色图片资源webp)。Home 页本身不渲染角色图。

| 资源 | 路径 |
|---|---|
| 默认图 | `src/assets/char-default.webp` |
| 点击图 | `src/assets/char-clicked.webp` |

### 交互
- 点击登录页空白区域：切到 clicked 图，400ms 后自动复位
- 按压回弹动画：pressAndBounce（cubic-bezier press）
- 旧版多角色 DOM 联动（眼球跟随/眨眼/偷看密码/输入对视等）已废弃：`useCharacters.updateCharacters()` 现为空实现（注释 `Characters replaced with static images - skip DOM manipulation`），保留函数仅为不破坏调用方

---

## 4. 我的简历卡片

左侧简版卡片：

```
┌─────────────────────────┐
│ [头像] 鸢一折纸          │
│        后端工程师 [编辑]│
│ 教育  未填写            │
│ 工作  未填写            │
│ 项目  0 个项目          │
│ 我的简历  点击前往编辑 > │
└─────────────────────────┘
```

### 点击流程（8 阶段黑客加载）

点击卡片 → 卡片按 `pressAndBounce` 压缩反馈 → 记录当前位置固定到屏幕 → 放大到全屏（0.55s cubic-bezier）→ 背景白→黑渐变（0.4s）→ Matrix 雨 + 终端 8 阶段打印：

| 阶段 | 状态文字 |
|---|---|
| 1 | INITIALIZING KERNEL MODULE... |
| 2 | ESTABLISHING SECURE TUNNEL... |
| 3 | AUTHENTICATING IDENTITY... |
| 4 | DECRYPTING PROFILE DATA... |
| 5 | LOADING RESUME MODULES... |
| 6 | VERIFYING INTEGRITY... |
| 7 | RENDERING FINAL OUTPUT... |
| 8 | ACCESS GRANTED ✔ |

总时长：放大 0.55s + 背景转黑 0.4s + 黑客序列 ~6s ≈ 7s，完成后硬跳 `/resume`。
`Ctrl+L` 可跳过。

---

## 5. 其他简历卡片列表

**重要规则：点击他人简历会触发「黑客入侵 → 管理员介入」剧情动画**

剧情动画 5 阶段：

| 阶段 | 效果 |
|---|---|
| 1. zoom | 卡片放大到全屏（0.5s）→ 背景渐变深色 |
| 2. intruding | 弹出 18×10=180 网格，红/黄/绿三色块填充（每批 3 块，20ms 间隔）占领到 ~88%，终端输出 hacker 灰色文字 |
| 3. detected | 红警告闪烁叠加，警告三角 SVG，终端输出红色 alert 文字 |
| 4. blocking | 管理员介入，180 网格逐格回收为绿色（6 块批处理 + 8ms 间隔），终端输出绿色 success 文字 |
| 5. secured | 所有 180 块变绿色（无空格），绿色勾 SVG，ACCESS GRANTED READ-ONLY |

### 关键规格
- 网格：18 × 10 = 180 个纯色块，最终状态**无空格**
- 终端文字颜色：灰色（hacker）→ 红色（warning）→ 绿色（success）
- 状态灯颜色序列：蓝色 → 红色 → 绿色
- 覆盖层背景序列：白 → 黑（#0a0a1e）→ 红（#2a0a0a）→ 绿（#0d2818）
- 动画期间 overlay `pointer-events: auto` 阻止交互，`Ctrl+L` 可跳过
- 完成后硬跳 `/resume?mode=readonly&id=xx`（只读模式打开他人简历）

---

## 6. 底部视频入口

（待补充具体实现）

---

## 7. 右键菜单功能

| 菜单项 | 功能 |
|---|---|
| 关闭弹幕 / 开启动画 | 切换弹幕显示（写 localStorage + dispatchEvent） |
| 截图 | 下载当前页面 PNG |
| 刷新页面 | F5 |
| 返回首页 | /home |

> **2026-09-04 删除**：原打卡模块专用的 `useScreenshot.ts`（上传打卡证明）已移除；右键菜单截图为独立下载实现，不受影响。

---

## 8. 公共覆盖层

- [DanmakuOverlay.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/DanmakuOverlay.vue) — 弹幕
  - 多轨道（3-N，基于屏幕高度，间距 38px）
  - 随机速度：1.5-4.0 px/frame
  - 随机字号：18px / 22px
  - 开关：localStorage `clockout-danmaku-enabled`
- [BackgroundDecor.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/BackgroundDecor.vue) — 背景装饰（雪花粒子 Canvas + 樱花树/云/星月 SVG 装饰层）
- [CuteContextMenu.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/CuteContextMenu.vue) — 右键菜单
- [LoadingOverlay.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/components/LoadingOverlay.vue) — 登录加载像素赛博朋克动画（16×16 网格 / VT323 字体 / 3 秒）

---

## 9. useAuth 与登录态

[src/function/useAuth.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useAuth.ts)

| 方法 | 说明 |
|---|---|
| `token` | ComputedRef，从 localStorage 读 `clockout_token` |
| `userInfo` | ComputedRef，从 localStorage 读 `clockout_user` |
| `logout()` | 清除 token + userInfo → 跳 `/` |
| `ensureLogin()` | 无 token 立即跳 `/` |

> 路由级守卫见 [src/router/index.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/router/index.ts)：受保护页面 `/home`、`/resume` 未登录自动硬跳 `/`；登录状态访问登录页硬跳 `/home`。所有跳转走浏览器级刷新（`window.location.href`），不做 SPA 软切换。
