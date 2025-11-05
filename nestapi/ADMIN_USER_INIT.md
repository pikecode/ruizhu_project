# Admin 系统用户初始化指南

本文档说明如何为 Admin 后台管理系统创建和初始化测试账户。

## 概述

Admin 系统的用户与小程序的消费者用户完全分离：

- **admin_users 表**: Admin 后台管理系统用户（管理员、经理、操作员）
- **users 表**: 小程序消费者用户（购买商品的用户）

## 初始化步骤

### 方式 1: 运行数据库迁移（推荐）

#### 1. 首先运行迁移创建表

```bash
cd nestapi

# 运行 NestJS TypeORM 迁移
npm run typeorm migration:run
```

这会创建 `admin_users` 表。

#### 2. 导入初始数据

使用 MySQL 客户端导入初始数据：

```bash
# 在 nestapi 目录执行
mysql -h <your-host> -u <your-user> -p <your-database> < src/database/init-admin-users.sql
```

或者使用 MySQL Workbench / phpMyAdmin：
1. 打开数据库管理工具
2. 连接到你的数据库
3. 打开文件 `nestapi/src/database/init-admin-users.sql`
4. 执行 SQL 脚本

### 方式 2: 运行初始化脚本

如果你有 Node.js 环境，可以使用 TypeScript 脚本：

```bash
cd nestapi

# 安装依赖（如果还未安装）
npm install

# 运行初始化脚本
ts-node src/database/scripts/init-admin-users.ts
```

这个脚本会：
1. 连接到数据库
2. 检查 `admin_users` 表是否存在
3. 创建三个测试账户
4. 显示账户信息

## 默认测试账户

初始化后，会创建以下三个测试账户：

### 1. 超级管理员
- **用户名**: `admin`
- **密码**: `admin123456`
- **邮箱**: `admin@ruizhu.com`
- **角色**: admin (超级管理员)
- **权限**: 最高权限

### 2. 商品经理
- **用户名**: `manager`
- **密码**: `manager123456`
- **邮箱**: `manager@ruizhu.com`
- **角色**: manager (经理)
- **权限**: 商品管理权限

### 3. 操作员
- **用户名**: `operator`
- **密码**: `operator123456`
- **邮箱**: `operator@ruizhu.com`
- **角色**: operator (操作员)
- **权限**: 基础操作权限

## 登录 Admin 系统

1. 启动 Admin 前端和 NestAPI 服务：

```bash
# 终端 1: 启动 Admin 前端
cd admin
npm run dev

# 终端 2: 启动 NestAPI 后端
cd nestapi
npm run start:dev
```

2. 打开浏览器访问：`http://localhost:5175/login`

3. 使用上述任意账户登录

4. 登录页面会显示测试账户信息

## 修改密码

登录后可以修改密码（需要实现修改密码功能）。

## 添加新的 Admin 用户

### 通过 TypeORM 实体创建

```typescript
import { AdminUsersService } from '../modules/admin-users/admin-users.service';
import * as bcryptjs from 'bcryptjs';

export class SomeService {
  constructor(private adminUsersService: AdminUsersService) {}

  async addNewAdminUser() {
    const password = 'new_password_123';
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newAdmin = await this.adminUsersService.create({
      username: 'newadmin',
      email: 'newadmin@ruizhu.com',
      password: hashedPassword,
      nickname: '新管理员',
      role: 'manager',
    });

    return newAdmin;
  }
}
```

### 通过 SQL 手动添加

```sql
-- 首先生成密码哈希（使用 bcryptjs）
-- 然后执行：
INSERT INTO admin_users (username, email, password, nickname, role, status)
VALUES (
  'newuser',
  'newuser@ruizhu.com',
  '$2a$10$<bcryptjs_hash_here>',
  '新用户',
  'operator',
  'active'
);
```

## 数据库表结构

admin_users 表包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 用户ID (主键) |
| username | VARCHAR(100) | 用户名 (唯一) |
| email | VARCHAR(100) | 邮箱 (唯一) |
| password | VARCHAR(255) | 密码哈希 (bcryptjs) |
| nickname | VARCHAR(100) | 昵称 |
| avatar_url | VARCHAR(500) | 头像URL |
| role | ENUM | 角色: admin/manager/operator |
| permissions | JSON | 权限列表 |
| status | ENUM | 状态: active/inactive/banned |
| is_super_admin | BOOLEAN | 是否超级管理员 |
| last_login_at | TIMESTAMP | 最后登录时间 |
| last_login_ip | VARCHAR(50) | 最后登录IP |
| login_count | INT | 登录次数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 故障排除

### 问题 1: "admin_users 表不存在"

**解决**: 运行数据库迁移创建表
```bash
npm run typeorm migration:run
```

### 问题 2: 初始化脚本连接失败

**检查**:
1. 确认数据库连接信息正确
2. 检查 `.env` 文件中的 `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
3. 确认数据库服务正在运行

### 问题 3: 登录失败 "用户名或密码错误"

**检查**:
1. 确认账户已成功创建：
```sql
SELECT username, role, status FROM admin_users;
```

2. 确认 NestAPI 服务正在运行
3. 检查浏览器控制台是否有错误信息

## 安全建议

⚠️ **重要**: 这些只是测试账户，部署到生产环境前请：

1. **更改所有默认密码**: 使用强密码替换默认密码
2. **删除不需要的账户**: 只保留必要的管理员账户
3. **启用 HTTPS**: 确保登录连接加密
4. **使用环境变量**: 不要在代码中硬编码密码
5. **启用审计日志**: 记录所有管理操作
6. **定期审核权限**: 确保用户权限与其角色匹配

## 相关文件

- 迁移文件: `src/database/migrations/1730500000000-CreateAdminUsersTable.sql`
- 初始化 SQL: `src/database/init-admin-users.sql`
- 初始化脚本: `src/database/scripts/init-admin-users.ts`
- Admin 用户实体: `src/entities/admin-user.entity.ts`
- Admin 用户服务: `src/modules/admin-users/admin-users.service.ts`
- Admin 认证服务: `src/modules/auth/admin-auth.service.ts`
