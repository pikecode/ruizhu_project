# Ruizhu Project 部署指南

本文档说明如何将本地代码更新部署到服务器。

## 目录

- [环境准备](#环境准备)
- [NestAPI 后端部署](#nestapi-后端部署)
- [Admin 前端部署](#admin-前端部署)
- [常见问题](#常见问题)

---

## 环境准备

### 1. 设置环境变量

在本地终端设置以下环境变量（或添加到 `~/.bashrc` / `~/.zshrc`）：

```bash
# 服务器配置
export DEPLOY_HOST='123.207.14.67'        # 服务器IP地址
export DEPLOY_USER='root'                 # SSH用户名（默认root）
export DEPLOY_PASS='your-password'        # SSH密码

# NestAPI 配置
export NESTAPI_REMOTE_PATH='/opt/ruizhu-app/nestapi-dist'  # 后端部署路径
export NESTAPI_PM2_NAME='ruizhu-backend'  # PM2应用名称
export NESTAPI_PORT='8888'                # 后端端口

# Admin 配置
export ADMIN_REMOTE_PATH='/opt/ruizhu-app/admin'  # 前端部署路径
export ADMIN_DOMAIN='yunjie.online'       # 前端域名
```

### 2. 安装依赖工具

确保本地已安装以下工具：

```bash
# macOS
brew install sshpass

# Linux (Ubuntu/Debian)
sudo apt-get install sshpass

# 验证安装
which sshpass
which node
which npm
```

---

## NestAPI 后端部署

### 快速部署（推荐）

当你在 NestAPI 项目中更新了代码，需要部署到服务器时，使用以下手动步骤确保部署成功：

#### 步骤 1: 本地构建

```bash
# 进入 NestAPI 目录
cd /Users/peak/work/pikecode/ruizhu_project/nestapi

# 构建项目
npm run build

# 验证构建成功
ls -lh dist/
```

#### 步骤 2: 打包构建产物

```bash
# 创建发布目录
mkdir -p deploy/releases

# 打包 dist 目录
cd /Users/peak/work/pikecode/ruizhu_project/nestapi
RELEASE_NAME="nestapi-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf deploy/releases/$RELEASE_NAME dist/

# 验证打包成功
ls -lh deploy/releases/$RELEASE_NAME
```

#### 步骤 3: 上传到服务器

```bash
# 上传构建包到服务器临时目录
sshpass -p 'Pp123456' scp -o StrictHostKeyChecking=no \
  deploy/releases/$RELEASE_NAME \
  root@123.207.14.67:/tmp/
```

#### 步骤 4: 服务器端部署

```bash
# SSH 登录服务器执行部署
sshpass -p 'Pp123456' ssh -o StrictHostKeyChecking=no root@123.207.14.67 'bash -s' << 'EOF'
set -e

echo "=== 停止 PM2 应用 ==="
pm2 stop ruizhu-backend

echo ""
echo "=== 创建备份 ==="
BACKUP_DIR="/opt/ruizhu-app/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_NAME="nestapi-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
cd /opt/ruizhu-app/nestapi-dist
if [ -d "dist" ]; then
  tar -czf "$BACKUP_DIR/$BACKUP_NAME" dist/
  echo "✓ 备份创建: $BACKUP_DIR/$BACKUP_NAME"
fi

echo ""
echo "=== 解压新版本 ==="
cd /tmp
RELEASE_FILE=$(ls -t nestapi-*.tar.gz | head -1)
tar -xzf "$RELEASE_FILE"

echo ""
echo "=== 部署新文件 ==="
cd /opt/ruizhu-app/nestapi-dist
rm -rf dist/
mv /tmp/dist ./

echo ""
echo "=== 重启 PM2 应用 ==="
pm2 restart ruizhu-backend

echo ""
echo "=== 等待应用启动 ==="
sleep 10

echo ""
echo "=== 检查状态 ==="
pm2 status

echo ""
echo "=== 健康检查 ==="
curl -f http://localhost:3000/api && echo "" && echo "✓ 部署成功!" || echo "⚠ 健康检查失败"
EOF
```

### 自动部署脚本（可选）

也可以使用自动部署脚本：

```bash
# 进入项目根目录
cd /Users/peak/work/pikecode/ruizhu_project

# 运行部署脚本
./deploy/nestapi-deploy.sh
```

### 部署流程

脚本会自动执行以下步骤：

1. **验证部署配置** - 检查环境变量是否设置
2. **本地构建** - 运行 `npm run build` 编译 TypeScript
3. **本地打包** - 将构建产物打包为 `.tar.gz`
4. **上传到服务器** - 通过 SCP 上传到服务器
5. **服务器部署**：
   - 停止 PM2 应用
   - 创建备份
   - 解压新版本
   - 安装依赖 `npm ci --legacy-peer-deps`
   - 重启 PM2 应用
   - 健康检查
6. **数据库迁移** - 运行 TypeORM 迁移（如果有）

### 部署选项

```bash
# 跳过本地构建（仅重新打包和部署）
./deploy/nestapi-deploy.sh --skip-build

# 跳过打包（使用最新包部署）
./deploy/nestapi-deploy.sh --skip-pack

# 跳过数据库迁移
./deploy/nestapi-deploy.sh --skip-migration

# 测试运行（不实际部署）
./deploy/nestapi-deploy.sh --dry-run
```

### 验证部署

部署完成后，可以通过以下命令验证：

```bash
# 查看应用状态
sshpass -p "$DEPLOY_PASS" ssh root@123.207.14.67 pm2 status

# 查看应用日志
sshpass -p "$DEPLOY_PASS" ssh root@123.207.14.67 pm2 logs ruizhu-backend

# 测试API
sshpass -p "$DEPLOY_PASS" ssh root@123.207.14.67 'curl http://localhost:8888/api'

# 或从本地测试
curl https://yunjie.online/api
```

---

## Admin 前端部署

### 快速部署（推荐）

当你在 Admin 项目中更新了代码，需要部署到服务器时，使用以下手动步骤：

#### 步骤 1: 本地构建

```bash
# 进入 Admin 目录
cd /Users/peak/work/pikecode/ruizhu_project/admin

# 构建项目
npm run build

# 验证构建成功
ls -lh dist/
# 应该看到: index.html, assets/, vite.svg
```

#### 步骤 2: 上传到服务器

```bash
# 创建临时目录并上传
sshpass -p 'Pp123456' ssh -o StrictHostKeyChecking=no root@123.207.14.67 'mkdir -p /tmp/admin-deploy'

sshpass -p 'Pp123456' scp -r -o StrictHostKeyChecking=no \
  dist/* \
  root@123.207.14.67:/tmp/admin-deploy/
```

#### 步骤 3: 服务器端部署

```bash
# SSH 登录服务器执行部署
sshpass -p 'Pp123456' ssh -o StrictHostKeyChecking=no root@123.207.14.67 'bash -s' << 'EOF'
set -e

echo "=== 备份当前部署 ==="
if [ -d "/opt/ruizhu-app/admin" ]; then
  mv /opt/ruizhu-app/admin /opt/ruizhu-app/admin-backup-$(date +%Y%m%d-%H%M%S)
  echo "✓ 备份完成"
fi

echo ""
echo "=== 部署新文件 ==="
mkdir -p /opt/ruizhu-app/admin
mv /tmp/admin-deploy/* /opt/ruizhu-app/admin/
echo "✓ 文件部署完成"

echo ""
echo "=== 验证部署 ==="
ls -lh /opt/ruizhu-app/admin/

echo ""
echo "=== 重载 Nginx ==="
nginx -s reload && echo "✓ Nginx 重载成功" || echo "⚠ Nginx 重载失败"

echo ""
echo "=== 测试访问 ==="
sleep 2
curl -I http://localhost/ | head -10
EOF
```

#### 步骤 4: 验证部署

```bash
# 从本地测试公网访问
curl -I https://yunjie.online/

# 在浏览器中打开
open https://yunjie.online/
```

### 自动部署脚本（可选）

也可以使用自动部署脚本：

```bash
# 进入项目根目录
cd /Users/peak/work/pikecode/ruizhu_project

# 运行部署脚本
./deploy/admin-deploy.sh prod
```

### 部署流程

脚本会自动执行以下步骤：

1. **验证部署配置** - 检查环境变量和依赖
2. **检查目录** - 验证项目结构
3. **清理旧构建** - 删除旧的 `dist` 目录
4. **本地构建** - 运行 `npm install && npm run build`
5. **验证构建** - 检查 `index.html` 和 `assets` 目录
6. **上传到服务器** - 通过 SCP 上传到服务器
7. **验证远程文件** - 确认文件已正确上传
8. **重载 Nginx** - 重新加载 Nginx 配置
9. **测试部署** - 测试 HTTPS 连接和 API 代理

### 部署选项

```bash
# 完整部署（包括验证和 Nginx 重载）
./deploy/admin-deploy.sh prod

# 部署但跳过验证
./deploy/admin-deploy.sh prod --no-verify

# 部署但不重载 Nginx
./deploy/admin-deploy.sh prod --no-reload
```

### 验证部署

部署完成后，访问以下地址验证：

```bash
# 打开浏览器访问
https://yunjie.online/

# 或使用 curl 测试
curl -I https://yunjie.online/
```

---

## 常见问题

### 1. 部署失败：sshpass 未找到

**问题**：
```
-bash: sshpass: command not found
```

**解决方案**：
```bash
# macOS
brew install sshpass

# Linux
sudo apt-get install sshpass
```

### 2. 部署失败：环境变量未设置

**问题**：
```
[❌ ERROR] 服务器地址未设置
```

**解决方案**：
```bash
# 设置环境变量
export DEPLOY_HOST='123.207.14.67'
export DEPLOY_PASS='your-password'

# 或将环境变量添加到 ~/.zshrc 或 ~/.bashrc
echo 'export DEPLOY_HOST="123.207.14.67"' >> ~/.zshrc
echo 'export DEPLOY_PASS="your-password"' >> ~/.zshrc
source ~/.zshrc
```

### 3. NestAPI 构建失败

**问题**：
```
npm run build 失败
```

**解决方案**：
```bash
# 进入 nestapi 目录
cd nestapi

# 清除 node_modules 和重新安装
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

### 4. Admin 构建失败

**问题**：
```
npm run build 失败
```

**解决方案**：
```bash
# 进入 admin 目录
cd admin

# 清除 node_modules 和重新安装
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

### 5. PM2 应用未启动

**问题**：
```
应用启动，但健康检查返回 HTTP 404
```

**解决方案**：
```bash
# SSH 登录服务器
ssh root@123.207.14.67

# 查看 PM2 日志
pm2 logs ruizhu-backend --lines 100

# 重启应用
pm2 restart ruizhu-backend

# 如果需要，删除并重新创建 PM2 应用
pm2 delete ruizhu-backend
pm2 start dist/main.js --name ruizhu-backend
```

### 6. Nginx 502 错误

**问题**：
访问 `https://yunjie.online/api` 返回 502

**解决方案**：
```bash
# SSH 登录服务器
ssh root@123.207.14.67

# 检查 NestAPI 是否运行
pm2 status
curl http://localhost:8888/api

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 重启 Nginx
nginx -s reload
```

### 7. 前端页面白屏

**问题**：
访问 `https://yunjie.online/` 显示白屏

**解决方案**：
```bash
# 检查浏览器控制台错误
# F12 -> Console

# SSH 登录服务器检查文件
ssh root@123.207.14.67
cd /opt/ruizhu-app/admin
ls -la

# 确认 index.html 和 assets 存在
cat index.html

# 检查 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 8. NestJS 依赖注入错误（SchedulerMetadataAccessor）

**问题**：
```
UnknownDependenciesException: Nest can't resolve dependencies of the SchedulerMetadataAccessor (?)
```

**原因**：
新安装的 node_modules 与 NestJS 版本不兼容

**解决方案**：
```bash
# SSH 登录服务器
ssh root@123.207.14.67

# 停止应用
cd /opt/ruizhu-app/nestapi-dist
pm2 stop ruizhu-backend

# 备份有问题的 node_modules
mv node_modules node_modules.backup-$(date +%Y%m%d-%H%M%S)

# 从旧的工作部署复制 node_modules
cp -r /opt/ruizhu-app/node_modules /opt/ruizhu-app/nestapi-dist/

# 重启应用
pm2 restart ruizhu-backend

# 检查状态
pm2 logs ruizhu-backend --lines 20
curl http://localhost:3000/api
```

### 9. PM2 应用找不到环境变量

**问题**：
```
缺少必需的数据库环境变量: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
```

**原因**：
PM2 启动时没有加载 .env 文件

**解决方案**：
```bash
# SSH 登录服务器
ssh root@123.207.14.67

# 创建 PM2 ecosystem 配置文件
cd /opt/ruizhu-app
cat > ecosystem.config.js << 'EOFCONFIG'
module.exports = {
  apps: [{
    name: 'ruizhu-backend',
    script: './dist/main.js',
    cwd: '/opt/ruizhu-app/nestapi-dist',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    env_file: '/opt/ruizhu-app/nestapi-dist/.env',
    error_file: '/root/.pm2/logs/ruizhu-backend-error.log',
    out_file: '/root/.pm2/logs/ruizhu-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOFCONFIG

# 使用 ecosystem 配置重启应用
pm2 delete ruizhu-backend
pm2 start ecosystem.config.js
pm2 save

# 验证
pm2 status
pm2 logs ruizhu-backend --lines 20
```

---

## 服务器配置信息

### PM2 配置

**当前 PM2 配置文件位置**: `/opt/ruizhu-app/ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'ruizhu-backend',
    script: './dist/main.js',
    cwd: '/opt/ruizhu-app/nestapi-dist',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    env_file: '/opt/ruizhu-app/nestapi-dist/.env',
    error_file: '/root/.pm2/logs/ruizhu-backend-error.log',
    out_file: '/root/.pm2/logs/ruizhu-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

**PM2 管理命令**:
```bash
# 启动应用
pm2 start /opt/ruizhu-app/ecosystem.config.js

# 重启应用
pm2 restart ruizhu-backend

# 停止应用
pm2 stop ruizhu-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs ruizhu-backend

# 保存配置（开机自启）
pm2 save
```

### Nginx 配置

**配置文件位置**: `/etc/nginx/conf.d/yunjie.conf`

主要配置：
- **域名**: yunjie.online
- **SSL**: 已启用 (Let's Encrypt)
- **Frontend 路径**: `/opt/ruizhu-app/admin/`
- **API 代理**: `/api/` → `http://127.0.0.1:3000`
- **Backend 端口**: 3000

```nginx
# Frontend (SPA)
location / {
    root /opt/ruizhu-app/admin;
    try_files $uri $uri/ /index.html;
}

# API Proxy
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 环境变量

**NestAPI 环境变量位置**: `/opt/ruizhu-app/nestapi-dist/.env`

关键配置：
- `PORT=3000`
- `NODE_ENV=production`
- 数据库：腾讯云 MySQL
- 文件存储：腾讯云 COS

---

## 部署文件位置

### NestAPI

- **本地构建目录**: `nestapi/dist/`
- **打包发布目录**: `nestapi/deploy/releases/`
- **服务器部署目录**: `/opt/ruizhu-app/nestapi-dist/`
- **服务器备份目录**: `/opt/ruizhu-app/backups/`
- **PM2 配置文件**: `/opt/ruizhu-app/ecosystem.config.js`
- **环境变量文件**: `/opt/ruizhu-app/nestapi-dist/.env`

### Admin

- **本地构建目录**: `admin/dist/`
- **服务器部署目录**: `/opt/ruizhu-app/admin/`
- **Nginx 配置**: `/etc/nginx/conf.d/yunjie.conf`

---

## 快速命令参考

```bash
# === 部署 ===
# 部署后端
./deploy/nestapi-deploy.sh

# 部署前端
./deploy/admin-deploy.sh prod

# === 服务器管理 ===
# SSH 登录
ssh root@123.207.14.67

# 查看 PM2 状态
pm2 status

# 查看后端日志
pm2 logs ruizhu-backend

# 重启后端
pm2 restart ruizhu-backend

# 重载 Nginx
nginx -s reload

# === 测试 ===
# 测试后端 API
curl https://yunjie.online/api

# 测试前端
curl -I https://yunjie.online/

# === 回滚 ===
# 查看备份
ssh root@123.207.14.67 'ls -lh /opt/ruizhu-app/backups/'

# 恢复备份（需要手动操作）
# 1. SSH 登录服务器
# 2. 解压备份文件到部署目录
# 3. 重启 PM2 应用
```

---

## 注意事项

1. **部署前备份**：部署脚本会自动创建备份，但建议在重大更新前手动创建备份
2. **测试环境**：建议先在测试环境验证，再部署到生产环境
3. **数据库迁移**：如果有数据库更改，确保迁移文件已创建
4. **环境变量**：确保服务器上的 `.env` 文件正确配置
5. **权限问题**：确保部署用户有足够的权限操作部署目录

---

## 部署检查清单

### NestAPI 后端部署检查

- [ ] 本地构建成功 (`npm run build`)
- [ ] 构建产物已打包 (`tar.gz`)
- [ ] 上传到服务器成功
- [ ] 服务器端创建备份
- [ ] PM2 应用已停止
- [ ] 新文件已部署到 `/opt/ruizhu-app/nestapi-dist/dist/`
- [ ] PM2 应用已重启
- [ ] PM2 状态显示 `online`
- [ ] 本地健康检查通过 (`curl http://localhost:3000/api`)
- [ ] 公网健康检查通过 (`curl https://yunjie.online/api/`)
- [ ] PM2 日志无错误

### Admin 前端部署检查

- [ ] 本地构建成功 (`npm run build`)
- [ ] 构建产物包含 `index.html` 和 `assets/`
- [ ] 上传到服务器成功
- [ ] 服务器端创建备份
- [ ] 新文件已部署到 `/opt/ruizhu-app/admin/`
- [ ] Nginx 重载成功
- [ ] 本地访问测试通过 (`curl http://localhost/`)
- [ ] 公网访问测试通过 (`curl https://yunjie.online/`)
- [ ] 浏览器访问正常显示
- [ ] 前端可以正常调用 API

---

## 部署后验证步骤

### 1. 后端验证

```bash
# 检查 PM2 状态
ssh root@123.207.14.67 pm2 status

# 检查后端日志（确保无错误）
ssh root@123.207.14.67 pm2 logs ruizhu-backend --lines 50

# 测试本地 API
ssh root@123.207.14.67 'curl http://localhost:3000/api'

# 测试公网 API
curl https://yunjie.online/api/
```

### 2. 前端验证

```bash
# 测试公网访问
curl -I https://yunjie.online/

# 浏览器访问
open https://yunjie.online/

# 检查前端文件
ssh root@123.207.14.67 'ls -lh /opt/ruizhu-app/admin/'
```

### 3. 完整功能测试

- [ ] 用户登录功能正常
- [ ] 商品列表加载正常
- [ ] 图片上传功能正常
- [ ] 数据库操作正常
- [ ] API 响应时间正常

---

## 支持

如有问题，请查看：
- 部署日志：`/tmp/npm-build.log`, `/tmp/scp-upload.log` 等
- PM2 日志：`pm2 logs ruizhu-backend`
- Nginx 日志：`/var/log/nginx/error.log`
- 本部署文档：`/Users/peak/work/pikecode/ruizhu_project/DEPLOYMENT_GUIDE.md`
