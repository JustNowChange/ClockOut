# 管理端 JSON 数据契约与实现计划

## 范围
- 模块：**控制台总览** + **用户管理**
- 前后端一起实现，所有新接口挂在 `/api/admin/**`（复用现有 JWT + 封禁 + AdminInterceptor 三重校验）

## 数据基础（现有表结构）

| 来源 | 字段 |
|------|------|
| `user_account` | uid, username, password_hash, name, email, register_time, last_login_time, last_login_ip, is_delete |
| `user_ban` | id, uid, ban_type(1临时/2永久), ban_start, ban_end, ban_reason, operator_uid, create_time, revoke_time, revoke_operator |
| Redis | `refresh:login:{uid}:{jti}` 会话记录（有 key=在线）、`user:ban:{uid}` 封禁缓存 |

**时间格式约定**：所有时间字段统一输出 `"yyyy-MM-dd HH:mm:ss"`（后端 VO 加 `@JsonFormat`，前端零处理）。

---

# 一、JSON 契约（重点审核）

## 1. 控制台总览统计

### `GET /api/admin/stats`

无请求参数。

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "totalUsers": 128,
    "onlineUsers": 12,
    "bannedUsers": 3,
    "todayNewUsers": 5
  }
}
```

| 字段 | 含义 | 取数方式 |
|------|------|---------|
| totalUsers | 用户总数（排除软删除） | count user_account where is_delete=0 |
| onlineUsers | 在线人数 | SCAN `refresh:login:*` 聚合去重 uid |
| bannedUsers | 封禁中人数（临时+永久） | 统计最新 ban 记录 isEffective 的 uid |
| todayNewUsers | 今日新增 | count where register_time >= 今日0点 |

---

## 2. 用户列表（分页 + 搜索 + 筛选）

### `GET /api/admin/users`

Query 参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，从 1 开始，默认 1 |
| pageSize | int | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 模糊匹配 username / name |
| banType | int | 否 | 0正常 1临时封禁 2永久封禁；不传=全部 |
| online | int | 否 | 1仅在线 0仅离线；不传=全部 |

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 128,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "uid": 100001,
        "username": "zhangsan",
        "name": "张三",
        "email": "zs@example.com",
        "registerTime": "2026-09-01 12:00:00",
        "lastLoginTime": "2026-09-29 10:00:00",
        "lastLoginIp": "127.0.0.1",
        "online": true,
        "banType": 0,
        "banReason": null,
        "banEnd": null
      },
      {
        "uid": 100002,
        "username": "lisi",
        "name": "李四",
        "email": null,
        "registerTime": "2026-09-10 09:30:00",
        "lastLoginTime": null,
        "lastLoginIp": null,
        "online": false,
        "banType": 1,
        "banReason": "发布违规内容",
        "banEnd": "2026-10-06 12:00:00"
      }
    ]
  }
}
```

字段说明：
- `online`：Redis 是否存在该 uid 的会话 key
- `banType`：最新一条**生效中**封禁的类型；无生效封禁为 0
- 从未登录的用户 `lastLoginTime / lastLoginIp` 为 null

---

## 3. 封禁用户

### `POST /api/admin/users/{uid}/ban`

```json
{
  "banType": 1,
  "banReason": "发布违规内容",
  "banEnd": "2026-10-06 12:00:00"
}
```

| 字段 | 规则 |
|------|------|
| banType | 1=临时封禁（banEnd 必填且必须晚于当前时间）；2=永久封禁（banEnd 忽略） |
| banReason | 必填，最长 512 |
| banEnd | 临时封禁到期时间，字符串 `"yyyy-MM-dd HH:mm:ss"` |

后端动作（一个方法内顺序执行）：
1. 插入 `user_ban`：ban_start=now，operator_uid=当前管理员
2. 删除缓存 `user:ban:{uid}`
3. 删除该用户全部会话 `refresh:login:{uid}:*` → **立即踢下线，封禁即时生效**

```json
{ "code": 1, "msg": null, "data": "封禁成功" }
```

---

## 4. 解封用户

### `POST /api/admin/users/{uid}/unban`

无请求体（空 `{}` 即可）。

后端动作：最新封禁记录写 `revoke_time=now`、`revoke_operator=当前管理员`；删除 `user:ban:{uid}` 缓存。

```json
{ "code": 1, "msg": null, "data": "解封成功" }
```

---

## 5. 踢出登录

### `POST /api/admin/users/{uid}/kick`

```json
{ "reason": "管理员踢出，请重新登录" }
```

`reason` 可选（仅日志记录，不入库）。

后端动作：删除 `refresh:login:{uid}:*` 全部会话。**不写封禁记录，用户可重新登录**。

```json
{ "code": 1, "msg": null, "data": "已踢出" }
```

被踢用户的实际体验：下次业务请求 401 → 拿 refresh 刷新时 Redis 无记录 → 刷新失败 → 前端清登录态回登录页。

---

## 通用规则

- 错误响应统一：`{ "code": 0, "msg": "原因", "data": null }`
- 管理员**不能封禁/解封/踢出自己**：`uid == 当前登录uid` → code=0「不能对自己执行该操作」
- 封禁一个已封禁用户：允许，新插入一条 ban 记录（最新记录优先生效，天然覆盖）

---

# 二、实现计划（JSON 确认后执行）

## 后端（H:\项目1\ClockOut）

| 文件 | 动作 |
|------|------|
| `Vo/AdminUserListItemVO.java` | 新建：列表行 VO（含 online/banType/banReason/banEnd） |
| `Vo/AdminUserPageVO.java` | 新建：分页结果 { total, page, pageSize, list } |
| `Vo/AdminStatsVO.java` | 新建：总览统计 |
| `request/BanRequest.java` | 新建：{ banType, banReason, banEnd } |
| `request/KickRequest.java` | 新建：{ reason } |
| `mapper/UserMapper.java` | 新增：分页条件查询、总数统计、今日新增统计、封禁人数统计、插入 ban 记录、解封更新 |
| `resources/mapper/UserMapper.xml` | 新增对应动态 SQL（keyword 模糊、banType/online 筛选） |
| `service/UserService.java` + Impl | 新增：stats / pageUsers / ban / unban / kick 方法，封禁人数统计考虑 Redis 缓存短 TTL |
| `Controller/admin/AdminController.java` | 新增 5 个端点；操作 Redis 会话复用 SCAN 方式（同 RefreshToken.deleteAllUserSessions） |

## 前端（Workspace\Clock Out）

| 文件 | 动作 |
|------|------|
| `src/api/admin.ts` | 新增类型 + 5 个接口封装 |
| `src/views/Admin.vue` | 总览：4 个统计卡片；用户管理：搜索筛选栏 + 表格 + 分页 + 封禁弹窗 |
| `src/style/Admin.css` | 新增统计卡片、表格、搜索栏、弹窗、分页样式，全部沿用现有粉色圆角 + 主题变量体系 |

## 风格要点（严格对齐现有风格）
- 白色圆角卡片（20px）、粉色描边 `#ffd6e7`、柔和粉影；黑色主题紫色 `#5b4a8e/#b894ff`
- 按钮按压 `scale(0.95)` + `cubic-bezier(0.36, 0.07, 0.19, 0.97)`
- 入场弹性 pop `cubic-bezier(0.34, 1.56, 0.64, 1)`
- 在线状态用小圆点（绿=在线/灰=离线），封禁标签粉色/红色胶囊
- 不引入新依赖、不改路由结构

## 验证
1. 后端 `mvnw compile` 通过
2. 前端 `npm run build` 通过
3. 接口手工验证：stats 取数、列表分页/搜索/筛选、封禁后目标会话消失、踢出后目标刷新失败回登录页
