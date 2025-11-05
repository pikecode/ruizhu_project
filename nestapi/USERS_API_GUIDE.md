# 用户管理 API 指南

本文档说明如何区分和使用两套用户系统的 API。

## 📌 两套独立的用户系统

### 1️⃣ Admin 系统用户 (管理员)

| 项目 | 说明 |
|------|------|
| **数据表** | `admin_users` |
| **API 路径** | `/api/admin/users` |
| **认证方式** | JWT (Admin 专用) |
| **用户角色** | admin, manager, operator |
| **访问控制** | 需要 JWT token，仅管理员可访问 |
| **用途** | Admin 后台系统的用户管理 |

### 2️⃣ 小程序消费者用户

| 项目 | 说明 |
|------|------|
| **数据表** | `users` |
| **API 路径** | `/api/users` |
| **认证方式** | JWT (消费者 token) |
| **注册来源** | 微信小程序登录 |
| **访问控制** | 需要消费者 JWT token |
| **用途** | 小程序用户数据管理 |

## 🔐 Admin 用户 API 端点

所有 Admin API 端点都需要 JWT 认证（Admin token）。

### 获取 Admin 用户列表 (分页)

```bash
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <admin_jwt_token>
```

**响应示例：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@ruizhu.com",
        "nickname": "超级管理员",
        "role": "admin",
        "isSuperAdmin": true,
        "status": "active",
        "lastLoginAt": "2025-11-01T09:30:00.000Z",
        "loginCount": 5
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 获取单个 Admin 用户

```bash
GET /api/admin/users/{id}
Authorization: Bearer <admin_jwt_token>
```

### 创建 Admin 用户

```bash
POST /api/admin/users
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "username": "newadmin",
  "email": "newadmin@ruizhu.com",
  "password": "securepassword123",
  "nickname": "新管理员",
  "role": "manager"
}
```

### 更新 Admin 用户

```bash
PATCH /api/admin/users/{id}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "nickname": "更新的昵称",
  "role": "operator"
}
```

### 删除 Admin 用户

```bash
DELETE /api/admin/users/{id}
Authorization: Bearer <admin_jwt_token>
```

### 获取当前登录 Admin 用户信息

```bash
GET /api/admin/users/profile/current
Authorization: Bearer <admin_jwt_token>
```

**响应示例：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@ruizhu.com",
    "nickname": "超级管理员",
    "role": "admin",
    "isSuperAdmin": true,
    "status": "active"
  }
}
```

## 👥 小程序消费者用户 API 端点

小程序用户的 API 端点（使用消费者 JWT token）。

### 获取消费者用户列表 (分页)

```bash
GET /api/users?page=1&limit=10
Authorization: Bearer <consumer_jwt_token>
```

**响应示例：**
```json
{
  "items": [
    {
      "id": 1,
      "phone": "18621872825",
      "openId": "olzBg1wVntph5cMmLqypebK4nNno",
      "nickname": "用户_2825",
      "gender": "unknown",
      "status": "active",
      "registrationSource": "wechat_mini_program",
      "lastLoginAt": "2025-10-31T15:36:23.000Z",
      "loginCount": 16
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 获取单个消费者用户

```bash
GET /api/users/{id}
Authorization: Bearer <consumer_jwt_token>
```

## 🔑 获取 JWT Token

### Admin 登录获取 Token

```bash
POST /api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123456"
}
```

**响应：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@ruizhu.com",
    "nickname": "超级管理员",
    "role": "admin",
    "isSuperAdmin": true
  }
}
```

### 消费者登录获取 Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "some_user",
  "password": "user_password"
}
```

或使用微信小程序登录：

```bash
POST /api/auth/wechat/phone-login
Content-Type: application/json

{
  "openId": "user_openid",
  "encryptedPhone": "encrypted_data",
  "iv": "iv",
  "sessionKey": "session_key"
}
```

## 📊 数据库表结构对比

### admin_users 表
```sql
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  role ENUM('admin', 'manager', 'operator'),
  is_super_admin BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'banned'),
  last_login_at TIMESTAMP,
  login_count INT,
  ...
);
```

### users 表 (消费者用户)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE,
  open_id VARCHAR(100) UNIQUE,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  status ENUM('active', 'banned', 'deleted'),
  registration_source ENUM('wechat_mini_program', 'web', 'admin'),
  last_login_at TIMESTAMP,
  login_count INT,
  ...
);
```

## 🚀 使用示例

### 使用 cURL 获取 Admin 用户列表

```bash
# 1. 首先登录获取 token
TOKEN=$(curl -X POST http://localhost:8888/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}' \
  | jq -r '.access_token')

# 2. 使用 token 获取用户列表
curl -X GET "http://localhost:8888/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 使用 Postman

1. 在 Postman 中设置 `Authorization` 为 `Bearer Token`
2. 在 token 字段填入 JWT token
3. 发送请求到对应的 API 端点

## ⚠️ 常见错误

### 错误 1: 401 Unauthorized
- **原因**: 缺少或无效的 JWT token
- **解决**: 先调用 `/api/auth/admin/login` 获取有效的 token

### 错误 2: 403 Forbidden
- **原因**: 权限不足（例如 operator 角色尝试创建用户）
- **解决**: 使用有足够权限的账户（如 admin）

### 错误 3: 404 Not Found
- **原因**: API 路径错误
- **检查**: 确认使用的是 `/api/admin/users` 而不是 `/api/users`

## 📋 权限对照表

| 操作 | Admin | Manager | Operator |
|------|-------|---------|----------|
| 查看 Admin 用户列表 | ✅ | ✅ | ✅ |
| 创建 Admin 用户 | ✅ | ❌ | ❌ |
| 编辑 Admin 用户 | ✅ | ❌ | ❌ |
| 删除 Admin 用户 | ✅ | ❌ | ❌ |
| 查看消费者用户 | ✅ | ✅ | ✅ |
| 管理商品 | ✅ | ✅ | ❌ |
| 系统配置 | ✅ | ❌ | ❌ |

注：权限系统需要在各端点中实现角色检查。

## 🔒 安全建议

1. **定期更换密码** - Admin 用户应定期更换密码
2. **最小权限原则** - 为用户分配最小必要权限
3. **启用 HTTPS** - 生产环境必须使用 HTTPS
4. **监控登录日志** - 追踪所有 Admin 用户的登录活动
5. **删除过期账户** - 定期清理不再使用的账户

## 相关文件

- `src/entities/admin-user.entity.ts` - Admin 用户实体
- `src/modules/admin-users/admin-users.controller.ts` - Admin 用户控制器
- `src/modules/admin-users/admin-users.service.ts` - Admin 用户服务
- `src/modules/auth/admin-auth.service.ts` - Admin 认证服务
- `admin/src/services/users.ts` - 前端用户服务
