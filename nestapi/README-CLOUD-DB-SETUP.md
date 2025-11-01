# 云数据库初始化指南

本文档说明如何在腾讯云 MySQL 数据库上初始化 Admin 系统用户。

## 快速开始

### 前提条件

- 确保 Node.js 已安装（版本 14+）
- 确保数据库连接信息在 `.env` 文件中正确配置

### 初始化步骤

#### 1. 创建表（仅需一次）

如果 `admin_users` 表还不存在，使用 `insert-admin-users.js` 脚本时会自动创建（已在 SQL 迁移文件中定义）。

或者手动创建表：

```bash
# 使用提供的迁移文件
mysql -h <host> -u <user> -p < src/database/migrations/1730500000000-CreateAdminUsersTable.sql
```

#### 2. 插入初始数据

运行初始化脚本：

```bash
node insert-admin-users.js
```

这个脚本会：
- ✅ 连接到云数据库
- ✅ 创建 3 个测试账户
- ✅ 验证数据插入成功

### 已初始化的测试账户

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【超级管理员】(管理员)
  用户名: admin
  密码: admin123456
  邮箱: admin@ruizhu.com
  角色: admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【商品经理】
  用户名: manager
  密码: manager123456
  邮箱: manager@ruizhu.com
  角色: manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【操作员】
  用户名: operator
  密码: operator123456
  邮箱: operator@ruizhu.com
  角色: operator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 相关文件

| 文件 | 说明 |
|------|------|
| `insert-admin-users.js` | ✅ Admin 用户初始化脚本 |
| `src/database/migrations/1730500000000-CreateAdminUsersTable.sql` | 创建 admin_users 表的 SQL |
| `src/database/init-admin-users.sql` | 初始化数据的 SQL（备用）|
| `ADMIN_USER_INIT.md` | Admin 用户完整文档 |

## 故障排除

### 问题 1: 连接失败

检查 `.env` 文件中的数据库配置：

```env
DB_HOST=gz-cdb-qtjza6az.sql.tencentcdb.com
DB_PORT=27226
DB_USER=root
DB_PASSWORD=Pp123456
DB_NAME=mydb
```

### 问题 2: 表已存在或账户已存在

这是正常的，脚本会自动处理（使用 `INSERT IGNORE`）。

### 问题 3: 权限问题

确保数据库用户有以下权限：
- CREATE TABLE
- INSERT
- SELECT
- UPDATE
- DELETE

## 在生产环境中

⚠️ **重要安全提示**：

1. **更改所有默认密码** - 使用强密码替换
2. **删除不需要的账户** - 只保留必要的管理员
3. **启用 HTTPS** - 确保所有连接加密
4. **定期备份** - 数据库定期备份
5. **监控访问日志** - 追踪所有管理员操作

## 添加新的管理员账户

修改 `insert-admin-users.js` 或直接在数据库中插入：

```javascript
// 例：生成密码哈希
const bcryptjs = require('bcryptjs');
const hash = bcryptjs.hashSync('your_password', 10);
console.log(hash);

// 然后在 insert-admin-users.js 中添加新用户对象
```

## 支持

如有问题，参考：
- `ADMIN_USER_INIT.md` - 详细文档
- `src/entities/admin-user.entity.ts` - 用户实体定义
- `src/modules/admin-users/admin-users.service.ts` - 用户服务
