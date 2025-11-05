# 🚀 更新的部署指南

**更新时间**: 2025-11-01

## 📋 快速开始

### 环境变量配置

在部署前，设置以下环境变量：

```bash
# 必需：服务器配置
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="Pp123456"

# 可选：Admin 部署配置（使用默认值）
export ADMIN_REMOTE_PATH="/opt/ruizhu-app/admin"
export ADMIN_DOMAIN="yunjie.online"

# 可选：NestAPI 部署配置（使用默认值）
export NESTAPI_REMOTE_PATH="/opt/ruizhu-app/nestapi-dist"
export NESTAPI_PORT="8888"
export NESTAPI_PM2_NAME="ruizhu-backend"
```

或在脚本运行时交互输入密码：

```bash
./deploy/admin-deploy.sh prod
# 脚本会提示输入密码
```

---

## 🔧 部署 Admin 前端

### 方式 1: 设置环境变量（推荐）

```bash
# 1. 导出环境变量
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="Pp123456"
export ADMIN_DOMAIN="yunjie.online"

# 2. 执行部署脚本
./deploy/admin-deploy.sh prod

# 3. 部署完成后验证
curl https://yunjie.online/
```

### 方式 2: 交互输入密码

```bash
# 1. 执行部署脚本（不设置密码环境变量）
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
./deploy/admin-deploy.sh prod

# 2. 脚本会提示输入密码
请输入 root@123.207.14.67 的密码:

# 3. 输入密码并继续
```

### 部署选项

```bash
# 完整部署（包括验证和 Nginx 重载）
./deploy/admin-deploy.sh prod

# 跳过验证
./deploy/admin-deploy.sh prod --no-verify

# 不自动重载 Nginx（手动重载）
./deploy/admin-deploy.sh prod --no-reload

# 显示帮助
./deploy/admin-deploy.sh --help
```

---

## 🔧 部署 NestAPI 后端

### 方式 1: 设置环境变量（推荐）

```bash
# 1. 导出环境变量
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="Pp123456"
export NESTAPI_REMOTE_PATH="/opt/ruizhu-app/nestapi-dist"
export NESTAPI_PORT="8888"
export NESTAPI_PM2_NAME="ruizhu-backend"

# 2. 执行部署脚本
./deploy/nestapi-deploy.sh

# 3. 部署完成后验证
curl http://localhost:8888/api
```

### 方式 2: 交互输入密码

```bash
# 1. 执行部署脚本（不设置密码环境变量）
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
./deploy/nestapi-deploy.sh

# 2. 脚本会提示输入密码
请输入 root@123.207.14.67 的密码:

# 3. 输入密码并继续
```

### 部署选项

```bash
# 完整部署（包括数据库迁移）
./deploy/nestapi-deploy.sh

# 跳过构建（仅打包和部署）
./deploy/nestapi-deploy.sh --skip-build

# 跳过数据库迁移（数据库无更新时）
./deploy/nestapi-deploy.sh --skip-migration

# 测试运行（不实际部署）
./deploy/nestapi-deploy.sh --dry-run

# 显示帮助
./deploy/nestapi-deploy.sh --help
```

---

## ✅ 验证部署

### Admin 前端验证

```bash
# 1. 检查首页
curl -I https://yunjie.online/

# 2. 在浏览器中访问
https://yunjie.online/

# 3. 检查浏览器控制台（F12）确保没有错误
```

### NestAPI 后端验证

```bash
# 1. 检查本地端口
curl http://localhost:8888/api

# 2. 远程检查
sshpass -p "Pp123456" ssh root@123.207.14.67 'curl http://localhost:8888/api'

# 3. 查看 PM2 状态
sshpass -p "Pp123456" ssh root@123.207.14.67 'pm2 status'

# 4. 查看应用日志
sshpass -p "Pp123456" ssh root@123.207.14.67 'pm2 logs ruizhu-backend'
```

---

## 🔐 安全建议

### ✅ 正确的做法

```bash
# 1. 使用环境变量（仅在当前 shell 有效）
export DEPLOY_PASS="Pp123456"
./deploy/admin-deploy.sh prod

# 2. 或交互输入（更安全）
./deploy/admin-deploy.sh prod
# 系统会提示输入密码，不会显示在历史记录中
```

### ❌ 避免的做法

```bash
# 不要在脚本中硬编码密码
# 不要在命令行历史记录中保存密码
# 不要在配置文件中明文存储密码
```

### 🔑 使用 SSH Key（长期推荐）

```bash
# 1. 生成 SSH Key
ssh-keygen -t rsa -b 4096 -C "deployment@example.com"

# 2. 复制到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub root@123.207.14.67

# 3. 脚本会自动使用 SSH Key（无需 sshpass）
./deploy/admin-deploy.sh prod  # 不需要设置密码
```

---

## 📊 脚本改进总结

### 修复的问题

| 问题 | 修复方案 |
|------|---------|
| 密码硬编码 | ✅ 改为从环境变量读取 |
| NestAPI 端口错误 | ✅ 修复从 3000 → 8888 |
| .env 验证缺失 | ✅ 添加配置验证逻辑 |
| 硬编码 URL | ✅ 使用环境变量配置 |
| PM2 应用名硬编码 | ✅ 改为环境变量可配置 |

### 新增的功能

| 功能 | 说明 |
|------|------|
| 密码交互输入 | 没有设置 DEPLOY_PASS 时，交互提示输入 |
| 配置验证 | 部署前验证服务器地址和密码 |
| 环境变量支持 | 所有敏感信息均可通过环境变量配置 |
| 灵活的端口配置 | NestAPI 端口现在可配置 |
| 远程 .env 保留 | 确保生产环境配置不被覆盖 |

---

## 🚀 一键部署脚本（可选）

创建文件 `deploy.sh`：

```bash
#!/bin/bash

# 设置环境变量
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="Pp123456"
export ADMIN_DOMAIN="yunjie.online"
export NESTAPI_PORT="8888"
export NESTAPI_PM2_NAME="ruizhu-backend"

# 部署 Admin
echo "🚀 开始部署 Admin..."
./deploy/admin-deploy.sh prod || exit 1
echo "✅ Admin 部署完成"

# 部署 NestAPI
echo "🚀 开始部署 NestAPI..."
./deploy/nestapi-deploy.sh || exit 1
echo "✅ NestAPI 部署完成"

echo "🎉 所有部署完成！"
```

使用：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 检查清单

在部署前，请确保：

- [ ] 本地 Admin `.env` 已配置
- [ ] 本地 NestAPI `.env` 已配置
- [ ] 云数据库连接信息正确
- [ ] 服务器 SSH 连接正常
- [ ] 部署环境变量已设置或准备交互输入
- [ ] Git 变更已提交（如有）

在部署后，请验证：

- [ ] Admin 首页可正常访问
- [ ] NestAPI 应用已启动（pm2 status）
- [ ] 数据库迁移完成
- [ ] API 接口可正常调用
- [ ] 前端可正常调用后端 API

---

## 🆘 故障排除

### Admin 部署失败

```bash
# 1. 检查 npm 安装日志
cat /tmp/npm-install.log

# 2. 检查构建日志
cat /tmp/npm-build.log

# 3. 检查上传日志
cat /tmp/scp-upload.log

# 4. 检查 Nginx 日志
cat /tmp/nginx-reload.log
```

### NestAPI 部署失败

```bash
# 1. 检查服务器连接
sshpass -p "Pp123456" ssh root@123.207.14.67 'echo OK'

# 2. 检查应用状态
sshpass -p "Pp123456" ssh root@123.207.14.67 'pm2 status'

# 3. 查看应用日志
sshpass -p "Pp123456" ssh root@123.207.14.67 'pm2 logs ruizhu-backend'

# 4. 检查 .env 文件
sshpass -p "Pp123456" ssh root@123.207.14.67 'cat /opt/ruizhu-app/nestapi-dist/.env'
```

### 数据库连接问题

```bash
# 检查云数据库连接
sshpass -p "Pp123456" ssh root@123.207.14.67 \
  'mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -u root -pPp123456 -e "SELECT 1"'
```

---

## 📝 配置文件对应关系

| 配置项 | Admin | NestAPI | 说明 |
|--------|--------|----------|------|
| DB URL | ❌ | ✅ | .env 中配置 |
| API URL | ✅ | ❌ | admin/.env 中配置 |
| Port | ❌ | ✅ | nestapi/.env 中配置 |
| JWT Secret | ❌ | ✅ | nestapi/.env 中配置 |
| COS Config | ❌ | ✅ | nestapi/.env 中配置 |
| WeChat Config | ❌ | ✅ | nestapi/.env 中配置 |

---

**下一步**: 根据您的实际服务器配置修改环境变量，然后运行部署脚本。
