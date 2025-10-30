# 部署脚本使用指南

统一的部署脚本入口，管理 Admin 前端和 NestAPI 后端的部署。

## 目录结构

```
deploy/
├── README.md                    # 本文件
├── admin-deploy.sh             # Admin 前端部署脚本
├── nestapi-deploy.sh           # NestAPI 后端部署脚本（包装器）
└── config-update.sh            # 配置文件更新脚本
```

## 快速开始

### 部署 Admin 前端

```bash
# 完整部署（包括验证和 Nginx 重载）
./deploy/admin-deploy.sh prod

# 部署但跳过验证
./deploy/admin-deploy.sh prod --no-verify

# 部署但不自动重载 Nginx
./deploy/admin-deploy.sh prod --no-reload

# 显示帮助信息
./deploy/admin-deploy.sh --help
```

### 部署 NestAPI 后端

```bash
# 完整部署（调用 nestapi/deploy/auto-deploy.sh）
./deploy/nestapi-deploy.sh

# 显示帮助信息
./deploy/nestapi-deploy.sh --help
```

### 更新配置文件

```bash
# 更新 NestAPI 配置（仅上传，不重启）
./deploy/config-update.sh nestapi

# 更新 NestAPI 配置并重启服务
./deploy/config-update.sh nestapi --restart

# 显示帮助信息
./deploy/config-update.sh --help
```

## 脚本说明

### admin-deploy.sh

**功能**: 全自动化的 Admin 前端部署脚本

**步骤**:
1. ✅ 检查依赖（Node.js、npm、scp、sshpass）
2. ✅ 检查本地目录结构
3. ✅ 清理旧的构建产物
4. ✅ 本地构建（npm install + npm run build）
5. ✅ 验证构建产物
6. ✅ 上传到服务器
7. ✅ 验证远程文件
8. ✅ 重载 Nginx
9. ✅ 测试部署

**配置项**:
```bash
SERVER_HOST="123.207.14.67"           # 服务器 IP
SERVER_USER="root"                    # SSH 用户
SERVER_PASS="Pp123456"                # SSH 密码
REMOTE_ADMIN_PATH="/opt/ruizhu-app/admin"  # 远程路径
```

**日志文件**:
- `/tmp/npm-install.log` - npm install 日志
- `/tmp/npm-build.log` - npm build 日志
- `/tmp/ssh-clean.log` - SSH 清理日志
- `/tmp/scp-upload.log` - 文件上传日志
- `/tmp/nginx-reload.log` - Nginx 重载日志

### nestapi-deploy.sh

**功能**: NestAPI 后端部署脚本（包装器）

**说明**: 调用 `nestapi/deploy/auto-deploy.sh` 进行实际的部署操作

**为什么是包装器?**
- 统一的入口点：用户只需从 `deploy/` 目录执行脚本
- 保持模块独立性：`nestapi/deploy/` 中的脚本独立完整
- 便于维护：每个模块有自己的部署脚本，修改不影响其他模块

### config-update.sh

**功能**: 自动化配置文件更新脚本，快速推送 `.env` 变更到生产服务器

**支持的模块**:
- `nestapi` - NestAPI 后端配置

**步骤**:
1. ✅ 校验本地 `.env` 文件存在
2. ✅ 显示配置文件内容预览
3. ✅ 交互式确认上传
4. ✅ 创建远程备份（带时间戳）
5. ✅ 使用 SCP 上传配置文件
6. ✅ 验证远程文件上传成功
7. ✅ 可选：自动重启 PM2 服务

**配置项**:
```bash
SERVER_HOST="123.207.14.67"           # 服务器 IP
SERVER_USER="root"                    # SSH 用户
SERVER_PASS="Pp123456"                # SSH 密码
REMOTE_NESTAPI_PATH="/opt/ruizhu-app/nestapi-dist"  # 远程路径
```

**使用场景**:
- 更新环境变量（数据库连接、API 密钥、自定义域名等）
- 不需要重新构建或完整部署时的快速配置更新
- 保留备份以便快速回滚

**备份文件**:
远程备份保存在: `/opt/ruizhu-app/nestapi-dist/.env.backup.YYYYMMDD_HHMMSS`

## 部署流程概览

### Admin 前端部署流程

```
本地开发
   ↓
./deploy/admin-deploy.sh prod
   ├─ 检查依赖
   ├─ npm install
   ├─ npm run build
   ├─ 上传到服务器
   ├─ Nginx 重载
   └─ 部署验证
   ↓
上线完成（https://yunjie.online/）
```

### NestAPI 后端部署流程

```
本地开发
   ↓
./deploy/nestapi-deploy.sh
   ├─ npm install
   ├─ npm run build
   ├─ 打包为 tar.gz
   ├─ 上传到服务器
   ├─ PM2 重启
   └─ 数据库迁移
   ↓
上线完成（通过 Nginx 代理 /api/）
```

## 前置条件

### 系统要求

- macOS / Linux / WSL (Windows)
- Bash 4.0+

### 必需工具

**本地开发环境**:
```bash
node --version    # v14+
npm --version     # v6+
ssh --version
```

**SSH 认证**（选择一种）:
```bash
# 方案 1: 使用 SSH Key（推荐）
# 脚本会自动使用系统的 SSH 密钥

# 方案 2: 使用密码认证（需要 sshpass）
sshpass --version
```

### 安装依赖

**macOS**:
```bash
# 使用 Homebrew 安装
brew install node
brew install sshpass  # 如果使用密码认证
```

**Ubuntu/Debian**:
```bash
sudo apt-get install nodejs npm openssh-client sshpass
```

## 常见问题

### Q: 如何使用 SSH Key 而不是密码?

A: 脚本会自动检测 `sshpass`。如果未安装，会自动使用 SSH Key 认证。

```bash
# 生成 SSH Key
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@123.207.14.67

# 之后脚本会自动使用密钥认证
```

### Q: Admin 部署失败，如何调试?

A: 查看日志文件：

```bash
# 检查 npm 构建日志
cat /tmp/npm-build.log

# 检查 SCP 上传日志
cat /tmp/scp-upload.log

# 检查 Nginx 重载日志
cat /tmp/nginx-reload.log
```

### Q: NestAPI 部署如何工作?

A: `deploy/nestapi-deploy.sh` 是一个包装脚本，它调用 `nestapi/deploy/auto-deploy.sh`。

实际的部署逻辑在 `nestapi/deploy/auto-deploy.sh` 中。详见 [nestapi/deploy/DEPLOY_GUIDE.md](../nestapi/deploy/DEPLOY_GUIDE.md)

### Q: 如何跳过部署验证?

A: 使用 `--no-verify` 选项：

```bash
./deploy/admin-deploy.sh prod --no-verify
```

### Q: 如何手动重载 Nginx?

A: 使用 `--no-reload` 选项，之后手动执行：

```bash
./deploy/admin-deploy.sh prod --no-reload
ssh root@123.207.14.67 'nginx -s reload'
```

## 脚本权限

确保脚本有执行权限：

```bash
chmod +x deploy/*.sh
```

## 安全建议

### 1. 避免硬编码密码

如果使用密码认证，建议：

```bash
# 设置环境变量
export DEPLOY_PASS="your_password"

# 脚本从环境变量读取（可选实现）
# 或使用 SSH Key 认证（推荐）
```

### 2. 限制脚本权限

```bash
# 只有所有者可读写执行
chmod 700 deploy/*.sh

# 在 .gitignore 中忽略配置文件
echo "deploy/.env.local" >> .gitignore
```

### 3. 使用 SSH Key（推荐）

```bash
# 生成 SSH Key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 复制到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub root@123.207.14.67

# 之后脚本会自动使用密钥认证
```

## 文件对应关系

| 脚本 | 用途 | 详细文档 |
|------|------|---------|
| `deploy/admin-deploy.sh` | Admin 前端部署 | [DEPLOY_SCRIPT_README.md](../DEPLOY_SCRIPT_README.md) |
| `deploy/nestapi-deploy.sh` | NestAPI 后端部署（包装器） | [nestapi/deploy/DEPLOY_GUIDE.md](../nestapi/deploy/DEPLOY_GUIDE.md) |
| `deploy/config-update.sh` | 配置文件更新 | 本 README（见快速开始及脚本说明）|

## 下一步

1. 编辑脚本中的服务器配置
2. 测试 SSH 连接
3. 运行部署脚本
4. 验证部署是否成功

## 相关文档

- [README.md](../README.md) - 项目总览
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DOCS_INDEX.md](../DOCS_INDEX.md) - 文档索引
- [admin/README.md](../admin/README.md) - Admin 项目文档
- [nestapi/README.md](../nestapi/README.md) - NestAPI 项目文档
- [nestapi/deploy/DEPLOY_GUIDE.md](../nestapi/deploy/DEPLOY_GUIDE.md) - NestAPI 部署详细指南
