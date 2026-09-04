# Register 注册流程（两步注册）

注册分为两个页面：欢迎页（Register）+ 表单页（RegisterForm）。

| 路由 | 组件 | 说明 |
|---|---|---|
| `/register` | Register.vue | 欢迎页，跳到注册表单 |
| `/register/form` | RegisterForm.vue | 两步表单：基础信息 → 扩展信息 |
| 逻辑封装 | [src/function/useRegister.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useRegister.ts) | 注册 Composable |
| 样式 | Register.css / RegisterForm.css | 两个页面独立样式 |

---

## 目录

1. [流程概览](#1-流程概览)
2. [欢迎页 Register.vue](#2-欢迎页-registervue)
3. [表单页 RegisterForm.vue](#3-表单页-registerformvue)
4. [useRegister Composable](#4-useregister-composable)
5. [注册 API](#5-注册-api)
6. [表单校验规则](#6-表单校验规则)

---

## 1. 流程概览

```
/register（欢迎页）
  点击 "立即创建账号"
    ↓
/register/form（表单页）
  ├── 第一步：username + password（必填）
  ├── 第二步：name / title / phone / email / location / github 等（扩展信息）
  └── 提交 → register API → createResume API → 跳 /home
```

---

## 2. 欢迎页 Register.vue

[src/views/Register.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/Register.vue)

### 结构

```
.register-page
├── <CinematicIntro>        # 8.5s 烟花开场动画（v-if=!introDone）
├── <BackgroundDecor>       # 背景装饰
├── <DanmakuOverlay>        # 弹幕
├── <CuteContextMenu>       # 右键菜单
├── .welcome-card
│   ├── .logo               # LOGO（渐变色 + 发光）
│   ├── .title              # 欢迎标题
│   ├── .subtitle           # 副标题
│   ├── .feature-list       # 特性介绍列表
│   ├── .btn-primary        # "立即创建账号" → /register/form
│   └── .login-link         # "已有账号？登录" → /
└── <CuteClickText>         # 点击文字特效
```

### 入场动画

- 烟花 intro 结束后
- 欢迎卡片：从下往上 fadeUp + scaleIn 带 cubic-bezier 回弹
- Logo / 按钮 / 特性项依次延迟 100ms 入场

---

## 3. 表单页 RegisterForm.vue

[src/views/RegisterForm.vue](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/views/RegisterForm.vue)

### 两步结构

```
.register-form-page
├── <CinematicIntro>
├── .form-step-indicator    # 步骤进度条（Step 1/2）
├── Step 1（v-if=step===1）
│   ├── 用户名 <input>
│   ├── 密码   <input>（含 show/hide 图标）
│   ├── 确认密码 <input>
│   └── "下一步" 按钮
└── Step 2（v-if=step===2）
    ├── 姓名    <input>
    ├── 职位    <input>
    ├── 电话    <input>
    ├── 邮箱    <input>
    ├── 所在城市 <input>
    ├── GitHub  <input>
    ├── 简介    <textarea>
    ├── "上一步"
    └── "完成注册"
```

### 输入框规范

所有 `<input>` 必须带：
- `id` 和 `name` 属性（浏览器自动填充）
- `<label for="对应id">`（辅助功能）
- 清除浏览器默认高亮的自定义 focus 样式

---

## 4. useRegister Composable

[src/function/useRegister.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/function/useRegister.ts)

### 状态

| 字段 | 说明 |
|---|---|
| step | 当前步骤 `1 | 2` |
| username / password / confirmPwd | 第一步表单 |
| name / title / phone / email / location / github / summary | 第二步表单 |
| loading | 提交 loading |
| introDone | 烟花 intro 完成状态 |

### 方法

| 方法 | 说明 |
|---|---|
| `nextStep()` | 从 Step 1 跳到 Step 2（校验用户名/密码/确认密码） |
| `prevStep()` | 回到 Step 1 |
| `submit()` | 提交注册：register() → 自动登录 → 创建空简历 → 跳 /home |
| `goLogin()` | 跳到登录页 |

---

## 5. 注册 API

[src/api/auth.ts](file:///h:/node-v24.18.0-win-x64/node-v24.18.0-win-x64/Workspace/Clock%20Out/src/api/auth.ts)

```ts
interface RegisterRequest  { username: string; password: string }
interface RegisterResponse { id: number; username: string }
function register(data: RegisterRequest): Promise<ApiResult<RegisterResponse>>
```

### 提交链路

```
submit()
  → register(username, password)          // POST /api/auth/register
  → login(username, password)             // POST /api/auth/login 拿 token
  → localStorage.setItem('clockout_token', token)
  → getMyResume() 或 createResume()       // 确保有一份空简历
  → router.push('/home')
```

---

## 6. 表单校验规则

| 字段 | 规则 |
|---|---|
| 用户名 | 非空，长度 3-20 |
| 密码 | 非空，长度 6-30 |
| 确认密码 | 必须与密码完全一致 |
| 邮箱 | 如有填，需匹配 email 格式（可选） |
| 手机号 | 如有填，需是纯数字 11 位（可选） |
| 姓名 / 职位 / 城市 / GitHub | 均为选填 |

错误提示方式：`.form-error` 红色提示 + 边框抖动动画。
