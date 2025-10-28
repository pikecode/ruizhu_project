# 腾讯云 MySQL 数据库配置指南

完整配置 NestAPI 连接腾讯云 MySQL 数据库的说明。

---

## ✅ 当前配置信息

### 腾讯云 CDB MySQL

```
主机:     gz-cdb-qtjza6az.sql.tencentcdb.com
端口:     27226
用户名:   root
密码:     Pp123456
数据库:   ruizhu_ecommerce
```

---

## 📋 配置文件清单

已创建和更新的文件：

| 文件 | 说明 | 状态 |
|------|------|------|
| `.env` | 环境变量配置（腾讯云连接） | ✅ 已创建 |
| `.env.example` | 配置示例文件 | ✅ 已更新 |
| `src/database/database.config.ts` | 数据库配置函数 | ✅ 已创建 |
| `src/app.module.ts` | 应用主模块 | ✅ 已更新 |

---

## 🚀 快速启动

### 1. 安装依赖

```bash
cd nestapi
npm install
```

### 2. 启动 NestAPI

```bash
# 开发环境
npm run start:dev

# 或生产环境
npm run build
npm run start:prod
```

### 3. 验证数据库连接

启动时会看到以下输出：

```
═══════════════════════════════════════════════════
  数据库连接配置
═══════════════════════════════════════════════════
  主机: gz-cdb-qtjza6az.sql.tencentcdb.com
  端口: 27226
  用户: root
  数据库: ruizhu_ecommerce
  环境: development
  类型: 腾讯云 CDB MySQL ✓
═══════════════════════════════════════════════════
```

如果看到这个输出且没有报错，说明连接配置正确。

---

## 📊 .env 文件配置详解

### 当前配置

```env
# Application
PORT=3000
NODE_ENV=development

# ============================================
# 腾讯云 MySQL 数据库配置
# ============================================

# 腾讯云 CDB MySQL 主机
DB_HOST=gz-cdb-qtjza6az.sql.tencentcdb.com

# 腾讯云 MySQL 自定义端口
DB_PORT=27226

# 数据库用户名
DB_USER=root

# 数据库密码
DB_PASSWORD=Pp123456

# 数据库名称
DB_NAME=ruizhu_ecommerce

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d
```

### 字段说明

| 字段 | 值 | 说明 |
|------|-----|------|
| **DB_HOST** | gz-cdb-qtjza6az.sql.tencentcdb.com | 腾讯云 MySQL 的公网地址 |
| **DB_PORT** | 27226 | 腾讯云 MySQL 的自定义端口（不是标准 3306） |
| **DB_USER** | root | 数据库用户名 |
| **DB_PASSWORD** | Pp123456 | 数据库密码 |
| **DB_NAME** | ruizhu_ecommerce | 要连接的数据库名称 |

---

## 🔧 数据库配置说明

### database.config.ts 特性

✅ **自动检测腾讯云**
- 检测到 `tencentcdb.com` 域名时自动应用腾讯云特定配置

✅ **连接池管理**
- 最大连接数: 20
- 最小保持连接: 自动管理
- 连接超时: 20 秒

✅ **腾讯云优化**
- UTF8MB4 字符集支持
- Keep-Alive 连接保活
- SSL 支持（可选）

✅ **错误处理**
- 缺少环境变量时清晰的错误提示
- 连接失败时自动重试

✅ **日志配置**
- 开发环境: 显示所有 SQL 查询
- 生产环境: 仅显示错误日志

---

## 📱 app.module.ts 集成

已在主模块中配置：

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';

@Module({
  imports: [
    // 全局配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 腾讯云数据库连接
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // 其他业务模块
    AuthModule,
    UsersModule,
    RolesModule,
  ],
})
export class AppModule {}
```

---

## ✨ 功能特性

### 云数据库专用配置

```typescript
// 自动识别腾讯云
const isTencentCloud = dbHost.includes('tencentcdb.com');

// 腾讯云特定配置
...(isTencentCloud && {
  charset: 'utf8mb4',
  enableKeepAlive: true,
  keepAliveInitialDelaySeconds: 0,
})

// SSL 支持
...(isTencentCloud && {
  ssl: {
    rejectUnauthorized: false,
  },
})
```

### 连接管理

```typescript
// 连接池设置
connectionLimit: 20,          // 最多 20 个连接
waitForConnections: true,     // 等待可用连接
enableExitEvent: true,        // 优雅关闭

// 超时设置
connectTimeout: 20000,        // 20 秒连接超时
acquireTimeout: 30000,        // 30 秒获取连接超时
idleTimeout: 300000,          // 5 分钟空闲超时
reapIntervalMillis: 5000,     // 5 秒检查一次连接池
```

---

## 🧪 测试连接

### 方法 1: 通过启动日志验证

```bash
npm run start:dev
```

查看启动输出中的数据库连接信息段，应该显示：

```
═══════════════════════════════════════════════════
  数据库连接配置
═══════════════════════════════════════════════════
  主机: gz-cdb-qtjza6az.sql.tencentcdb.com
  端口: 27226
  用户: root
  数据库: ruizhu_ecommerce
  环境: development
  类型: 腾讯云 CDB MySQL ✓
═══════════════════════════════════════════════════
```

### 方法 2: 使用 TypeORM CLI

```bash
# 检查数据库连接
npm run typeorm -- migration:show

# 查看数据库信息
npm run typeorm -- schema:log
```

### 方法 3: 创建测试 API

```typescript
// src/test/test.controller.ts
import { Controller, Get } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Controller('test')
export class TestController {
  @Get('db-connection')
  async testConnection() {
    try {
      const productCount = await getRepository(Product).count();
      return {
        status: 'success',
        message: '数据库连接成功',
        productCount,
      };
    } catch (error) {
      return {
        status: 'error',
        message: '数据库连接失败',
        error: error.message,
      };
    }
  }
}
```

访问 `http://localhost:3000/test/db-connection`

---

## 🚨 常见问题和解决方案

### 问题 1: 连接超时

**症状**: `ER_NET_CONNECT_TIMEOUT`

**解决方案**:
1. 检查腾讯云白名单配置
2. 确认服务器 IP 已添加到安全组
3. 增加超时时间:

```typescript
extra: {
  connectTimeout: 30000,  // 增加到 30 秒
  acquireTimeout: 40000,  // 增加到 40 秒
}
```

### 问题 2: 认证失败

**症状**: `ER_ACCESS_DENIED_ERROR`

**解决方案**:
1. 确认用户名和密码正确
2. 检查 .env 文件中的 `DB_PASSWORD` 是否正确
3. 确保腾讯云用户有连接权限

```bash
# 测试本地连接
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456
```

### 问题 3: 数据库不存在

**症状**: `ER_BAD_DB_ERROR`

**解决方案**:
1. 确认数据库 `ruizhu_ecommerce` 已在腾讯云创建
2. 检查 .env 中的 `DB_NAME` 是否正确

```bash
# 在腾讯云创建数据库
CREATE DATABASE ruizhu_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题 4: Too many connections

**症状**: `ER_TOO_MANY_CONNECTIONS`

**解决方案**:
1. 减少连接池大小
2. 启用连接复用
3. 定期清理空闲连接

```typescript
extra: {
  connectionLimit: 10,    // 减少到 10
  idleTimeout: 60000,     // 减少到 1 分钟
  reapIntervalMillis: 3000, // 更频繁地检查
}
```

---

## 🔐 安全建议

### 1. 不要提交密码到 Git

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 2. 使用强密码

❌ 不要使用简单密码
✅ 建议: `Pp123456!@#$%^&*`

### 3. 配置安全组

腾讯云安全组设置：
- 入站规则: 允许应用服务器 IP
- 出站规则: 根据需要配置
- 定期审计访问日志

### 4. 定期备份

```sql
-- 定期备份数据库
BACKUP DATABASE ruizhu_ecommerce TO DISK = 's3://backup/...';
```

### 5. 环境隔离

```
开发环境: dev.env (本地数据库或测试云库)
测试环境: test.env (独立的腾讯云库)
生产环境: prod.env (生产腾讯云库)
```

---

## 📈 性能优化

### 1. 连接池优化

```typescript
// 根据并发量调整
// 低并发 (< 100 req/s):
connectionLimit: 10,

// 中等并发 (100-500 req/s):
connectionLimit: 20,

// 高并发 (> 500 req/s):
connectionLimit: 50,
```

### 2. 查询优化

```typescript
// 使用查询缓存
cache: true,
cacheDuration: 300000, // 5 分钟

// 分页查询
.take(20)
.skip((page - 1) * 20)
```

### 3. 索引优化

```sql
-- 添加常用查询的索引
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_price ON product_prices(current_price);
CREATE FULLTEXT INDEX ft_name ON products(name);
```

---

## 📝 导入初始化数据

### 步骤 1: 创建数据库

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 -e "CREATE DATABASE ruizhu_ecommerce CHARACTER SET utf8mb4;"
```

### 步骤 2: 导入表结构

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 ruizhu_ecommerce < nestapi/src/database/schema.sql
```

### 步骤 3: 导入初始化数据

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 ruizhu_ecommerce < nestapi/src/database/init-data.sql
```

---

## 🎯 完整部署流程

### 1. 本地开发测试

```bash
# 确保 .env 正确配置
npm run start:dev
# 验证日志输出 ✓
```

### 2. 构建生产版本

```bash
npm run build
# 输出: dist/
```

### 3. 环境变量切换

```bash
# 生产环境配置
cp .env.prod .env
NODE_ENV=production
```

### 4. 启动生产服务

```bash
npm run start:prod
# 或使用 PM2
pm2 start dist/main.js --name "ruizhu-api"
```

### 5. 监控和日志

```bash
# 检查运行状态
pm2 status

# 查看日志
pm2 logs ruizhu-api

# 重启服务
pm2 restart ruizhu-api
```

---

## 📚 相关文档

- 📄 `DATABASE_SCHEMA_DESIGN.md` - 数据库架构设计
- 📄 `PRODUCT_SPECIFICATION.md` - 商品数据规范
- 📄 `nestapi/src/database/database.config.ts` - 数据库配置源码

---

## ✅ 配置检查清单

启动前请确认：

- [ ] `.env` 文件已创建
- [ ] 腾讯云数据库连接信息正确填写
- [ ] 数据库 `ruizhu_ecommerce` 已创建
- [ ] 表结构和初始数据已导入
- [ ] 安全组已配置（允许应用服务器 IP）
- [ ] npm 依赖已安装
- [ ] 没有其他本地数据库监听 3306 端口

---

## 🎉 完成

现在 NestAPI 已配置为：
✨ **仅连接腾讯云 MySQL 数据库**
✨ **自动检测和优化腾讯云连接**
✨ **支持自动故障转移和连接池管理**

启动 `npm run start:dev` 开始开发！

---

*最后更新: 2024-10-28*
*版本: 1.0.0*
