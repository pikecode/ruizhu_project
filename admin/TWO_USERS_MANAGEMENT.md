# Admin 系统 - 两个用户管理

## 📋 概述

Admin 系统现在包含两个独立的用户管理模块：

1. **🔐 Admin 用户管理** - 管理 Admin 系统的管理员、经理、操作员
2. **👥 消费者用户管理** - 管理小程序的消费者用户

这两个系统完全独立，数据存储在不同的数据库表中。

## 🔐 Admin 用户管理

**页面路由**: `/users`
**菜单标签**: 🔐 Admin用户
**API 端点**: `/api/admin/users`
**数据表**: `admin_users`

### 功能特性

- ✅ 查看 Admin 用户列表（分页）
- ✅ 删除 Admin 用户
- ✅ 查看用户角色（Admin/Manager/Operator）
- ✅ 查看用户状态（启用/禁用/封禁）
- ✅ 查看登录统计信息

### 表格列

| 列名 | 说明 |
|------|------|
| ID | 用户唯一标识 |
| 用户名 | 登录用户名 |
| 昵称 | 用户显示名称 |
| 邮箱 | 联系邮箱 |
| 角色 | admin/manager/operator |
| 状态 | 启用/禁用/封禁 |
| 登录次数 | 用户总登录次数 |
| 最后登录 | 最后一次登录时间 |
| 操作 | 删除用户 |

### 默认 Admin 用户

```
用户名: admin          密码: admin123456   角色: 超级管理员
用户名: manager        密码: manager123456 角色: 经理
用户名: operator       密码: operator123456 角色: 操作员
```

## 👥 消费者用户管理

**页面路由**: `/consumer-users`
**菜单标签**: 👥 消费者用户
**API 端点**: `/api/users`
**数据表**: `users`

### 功能特性

- ✅ 查看消费者用户列表（分页）
- ✅ 查看用户基本信息（昵称、手机号、邮箱）
- ✅ 查看微信授权信息
- ✅ 禁用用户账户
- ✅ 删除用户
- ✅ 查看登录统计

### 表格列

| 列名 | 说明 |
|------|------|
| ID | 用户唯一标识 |
| 昵称 | 用户显示名称 |
| 手机号 | 绑定的手机号 |
| 邮箱 | 用户邮箱 |
| 微信 | 微信 openId（缩短显示） |
| 注册来源 | 微信小程序/Web/管理员创建 |
| 状态 | 活跃/禁用/已删除 |
| 登录次数 | 用户总登录次数 |
| 最后登录 | 最后一次登录时间 |
| 操作 | 禁用/删除用户 |

## 🔄 数据对比

### Admin 用户 (admin_users)

```sql
-- 字段
id, username, email, password, nickname, avatar_url,
role, status, is_super_admin, login_count, created_at, updated_at
```

**用途**: Admin 后台系统的管理员账户

### 消费者用户 (users)

```sql
-- 字段
id, phone, open_id, username, email, password, nickname,
avatar_url, gender, status, registration_source, login_count, created_at, updated_at
```

**用途**: 小程序消费者账户

## 🚀 使用流程

### Admin 用户管理

1. 打开菜单 → 点击 "🔐 Admin用户"
2. 查看 Admin 管理员列表
3. 点击"刷新"获取最新数据
4. 点击"删除"按钮删除用户

### 消费者用户管理

1. 打开菜单 → 点击 "👥 消费者用户"
2. 查看小程序用户列表
3. 点击"刷新"获取最新数据
4. 点击"禁用"按钮禁用用户账户
5. 点击"删除"按钮删除用户

## 📱 用户类型对比

| 功能 | Admin 用户 | 消费者用户 |
|------|-----------|----------|
| 系统 | Admin 后台 | 小程序 |
| 认证方式 | 用户名密码 | 微信登录 |
| 主要字段 | username, role | phone, openId |
| 管理角色 | admin/manager/operator | - |
| 可禁用 | ✅ | ✅ |
| 可删除 | ✅ | ✅ |
| 查看列表 | ✅ | ✅ |
| 编辑用户 | ⏳ | ⏳ |

## 🔒 权限说明

| 操作 | 需要权限 |
|------|---------|
| 查看 Admin 用户列表 | JWT Admin Token |
| 创建/编辑 Admin 用户 | JWT Admin Token (需要 admin 角色) |
| 查看消费者用户列表 | JWT Admin Token |
| 禁用消费者用户 | JWT Admin Token |
| 删除消费者用户 | JWT Admin Token |

## 📁 相关文件

### 前端文件

| 文件 | 说明 |
|------|------|
| `src/pages/Users.tsx` | Admin 用户管理页面 |
| `src/pages/ConsumerUsers.tsx` | 消费者用户管理页面 |
| `src/services/users.ts` | Admin 用户 API 服务 |
| `src/services/consumer-users.ts` | 消费者用户 API 服务 |
| `src/components/Layout.tsx` | 菜单导航 |
| `src/routes.tsx` | 路由配置 |

### 后端文件

| 文件 | 说明 |
|------|------|
| `src/entities/admin-user.entity.ts` | Admin 用户实体 |
| `src/modules/admin-users/` | Admin 用户模块 |
| `src/entities/user.entity.ts` | 消费者用户实体 |
| `src/users/` | 消费者用户模块 |

## ⚡ API 端点

### Admin 用户

```bash
GET    /api/admin/users?page=1&limit=10       # 获取列表
GET    /api/admin/users/{id}                  # 获取单个用户
POST   /api/admin/users                       # 创建用户
PATCH  /api/admin/users/{id}                  # 更新用户
DELETE /api/admin/users/{id}                  # 删除用户
```

### 消费者用户

```bash
GET    /api/users?page=1&limit=10             # 获取列表
GET    /api/users/{id}                        # 获取单个用户
DELETE /api/users/{id}                        # 删除用户
PATCH  /api/users/{id}                        # 更新用户（禁用等）
```

## 🎯 常见操作

### 禁用消费者用户

在消费者用户列表中，点击"禁用"按钮，用户状态将变为"禁用"。

### 删除 Admin 用户

在 Admin 用户列表中，点击"删除"按钮删除管理员账户。

### 查看用户统计

每个用户列表都显示：
- 总用户数（通过分页的 total）
- 用户登录次数
- 最后登录时间

## 🔐 数据安全

- ✅ 所有 API 都需要 JWT 认证
- ✅ Admin 用户密码使用 bcryptjs 加密
- ✅ 消费者用户数据与 Admin 数据隔离
- ✅ 所有操作都有访问权限检查

## 📞 支持

如有问题，参考：
- `USERS_API_GUIDE.md` - API 使用指南
- `ADMIN_USER_INIT.md` - Admin 用户初始化指南
- `README-CLOUD-DB-SETUP.md` - 云数据库设置指南
