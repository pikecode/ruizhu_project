# Admin 一键部署脚本使用指南

## 📌 概述

`deploy-admin.sh` 是一个全自动化的 Admin 前端部署脚本，可以一键完成以下工作：

1. ✅ 检查依赖和环境
2. ✅ 本地构建 (npm run build)
3. ✅ 上传到服务器
4. ✅ 重载 Nginx
5. ✅ 验证部署成功

## 🚀 快速开始

### 基本使用

```bash
# 完整部署（包括验证和 Nginx 重载）
./deploy-admin.sh prod
```

### 高级用法

```bash
# 部署但跳过验证
./deploy-admin.sh prod --no-verify

# 部署但不自动重载 Nginx（手动重载）
./deploy-admin.sh prod --no-reload

# 显示帮助信息
./deploy-admin.sh --help
```

## 📋 前置条件

### 系统要求

- macOS / Linux / WSL (Windows)
- Bash 4.0+

### 必需工具

```bash
# Node.js 和 npm
node --version    # v14+
npm --version     # v6+

# SSH 工具
ssh --version

# 密码认证用 (可选，有 SSH key 的话不需要)
sshpass --version
```

### 安装依赖

**macOS:**
```bash
# 使用 Homebrew 安装
brew install node
brew install sshpass  # 可选
```

**Ubuntu/Debian:**
```bash
sudo apt-get install nodejs npm openssh-client sshpass
```

## ⚙️ 脚本配置

编辑脚本顶部的配置部分 (行号 13-26)：

```bash
# 服务器配置
SERVER_HOST="123.207.14.67"           # 服务器 IP
SERVER_USER="root"                    # SSH 用户
SERVER_PASS="Pp123456"                # SSH 密码
REMOTE_ADMIN_PATH="/opt/ruizhu-app/admin"  # 远程路径

# 本地配置
LOCAL_ADMIN_DIR="..."                 # Admin 本地目录
```

**重要**: 更新这些配置以适应你的环境。

## 📖 详细说明

### 脚本执行流程

```
1. 检查依赖
   ├─ Node.js
   ├─ npm
   ├─ scp
   └─ sshpass (可选)

2. 检查目录
   ├─ Admin 目录存在
   ├─ package.json 存在
   └─ vite.config.ts 存在

3. 清理旧构建
   └─ 删除 dist/ 目录

4. 本地构建
   ├─ npm install
   └─ npm run build

5. 构建验证
   ├─ 检查 index.html
   └─ 检查 assets 目录

6. 上传到服务器
   ├─ 清空远程目录
   └─ 使用 scp 上传文件

7. 远程验证 (可选)
   ├─ 验证 index.html
   └─ 验证 assets 目录

8. 重载 Nginx (可选)
   ├─ 验证 Nginx 配置
   └─ 重载 Nginx

9. 在线测试 (可选)
   ├─ 测试 Admin 首页
   ├─ 检查 API 代理
   └─ 测试缓存策略
```

### 选项说明

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `prod` | 生产环境标识 (必须) | - |
| `--no-verify` | 跳过部署验证 | 不跳过 |
| `--no-reload` | 不自动重载 Nginx | 自动重载 |
| `-h, --help` | 显示帮助信息 | - |

### 输出日志

脚本会在 `/tmp` 目录生成多个日志文件：

```bash
# 本地构建日志
/tmp/npm-install.log    # npm install 日志
/tmp/npm-build.log      # npm run build 日志

# 远程操作日志
/tmp/ssh-clean.log      # 清空远程目录日志
/tmp/scp-upload.log     # 文件上传日志
/tmp/remote-files.log   # 远程文件列表
/tmp/nginx-reload.log   # Nginx 重载日志
```

## 🎨 脚本输出示例

```
════════════════════════════════════════════════════════════
  🚀 Ruizhu Admin 一键部署
════════════════════════════════════════════════════════════

环境: prod
验证部署: true
自动重载 Nginx: true

▶ 检查依赖
✓ Node.js: v16.13.0
✓ npm: 8.1.0
✓ scp: 已安装

▶ 检查目录
✓ Admin 目录: /path/to/admin
✓ package.json 已找到
✓ vite.config.ts 已找到

▶ 清理旧的构建
✓ 删除旧的 dist 目录

▶ 开始本地构建
ℹ 安装依赖...
ℹ 构建项目...
✓ 构建完成
ℹ 产物: 45 个文件，大小: 2.3M

▶ 验证构建产物
✓ index.html (540 bytes)
✓ assets 目录 (42 个文件)
✓ vite.svg

▶ 上传到服务器
ℹ 目标服务器: 123.207.14.67
ℹ 目标目录: /opt/ruizhu-app/admin
ℹ 清空远程目录...
✓ 远程目录已清空
ℹ 上传文件...
✓ 文件上传完成

▶ 验证远程文件
✓ index.html 已上传
✓ assets 目录已上传

▶ 重载 Nginx
ℹ 目标服务器: 123.207.14.67
✓ Nginx 已重载
✓ Nginx 重载完成

▶ 测试部署
ℹ 测试 HTTPS 连接...
ℹ 测试 1: 检查 Admin 首页...
✓ Admin 首页返回 200 OK
ℹ 测试 2: 检查 index.html 缓存头...
✓ index.html 缓存策略正确
ℹ 测试 3: 检查 API 代理...
✓ API 代理返回 200 OK

════════════════════════════════════════════════════════════
✓ Admin 前端部署成功！
════════════════════════════════════════════════════════════
```

## ❌ 常见错误和解决方案

### 1. "未找到 Node.js"

**问题**: 脚本检查失败，Node.js 未安装

**解决**:
```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm
```

### 2. "未找到 sshpass"

**问题**: 使用密码认证需要 sshpass

**解决**:
```bash
# macOS
brew install sshpass

# Ubuntu/Debian
sudo apt-get install sshpass

# 或者配置 SSH key (推荐)
ssh-keygen -t rsa -b 4096
ssh-copy-id root@123.207.14.67
```

### 3. "Admin 目录不存在"

**问题**: 脚本找不到 Admin 目录

**解决**: 编辑脚本中的 `LOCAL_ADMIN_DIR` 变量，确保指向正确的路径。

```bash
# 查找 Admin 目录
find ~ -name "admin" -type d | grep -v node_modules
```

### 4. "npm run build 失败"

**问题**: 本地构建出错

**解决**:
```bash
# 查看详细日志
cat /tmp/npm-build.log

# 清理并重试
cd admin
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 5. "scp 上传失败"

**问题**: 连接服务器失败

**解决**:
```bash
# 检查 SSH 连接
ssh -v root@123.207.14.67 "ls /opt/ruizhu-app/"

# 检查密码是否正确
sshpass -p "Pp123456" ssh root@123.207.14.67 "echo ok"
```

### 6. "Nginx 重载失败"

**问题**: Nginx 配置有问题

**解决**:
```bash
# SSH 到服务器，手动检查
ssh root@123.207.14.67

# 验证配置
nginx -t

# 查看错误日志
tail -50 /www/wwwlogs/ruizhu-error.log

# 手动重载
nginx -s reload
```

## 🔒 安全建议

### 1. 避免硬编码密码

更安全的方式是使用 SSH key：

```bash
# 生成 SSH key
ssh-keygen -t rsa -b 4096 -C "你的邮箱"

# 复制公钥到服务器
ssh-copy-id root@123.207.14.67

# 编辑脚本，改用 SSH key 认证
# SERVER_PASS="" (留空)
```

### 2. 使用环境变量

```bash
# 设置环境变量
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="password"

# 脚本会自动从环境变量读取
./deploy-admin.sh prod
```

### 3. 限制脚本权限

```bash
# 只有所有者可读写
chmod 700 deploy-admin.sh

# 在 .gitignore 中忽略脚本
echo "deploy-admin.sh" >> .gitignore
```

## 📊 脚本统计

- **文件大小**: ~15 KB
- **执行时间**: 2-5 分钟 (取决于网络)
- **支持的环境**: macOS, Linux, WSL
- **依赖工具**: Node.js, npm, scp, sshpass (可选)

## 🆘 获取帮助

显示脚本帮助信息：

```bash
./deploy-admin.sh --help
```

查看脚本源码了解更多细节：

```bash
less deploy-admin.sh
```

查看日志文件诊断问题：

```bash
cat /tmp/npm-build.log
cat /tmp/scp-upload.log
cat /tmp/nginx-reload.log
```

## 💡 使用技巧

### 1. 在后台运行

```bash
# 使用 nohup 在后台运行
nohup ./deploy-admin.sh prod > deploy.log 2>&1 &

# 查看日志
tail -f deploy.log
```

### 2. 定时部署

```bash
# 使用 cron 定时部署
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨2点部署）
0 2 * * * cd /path/to/project && ./deploy-admin.sh prod --no-verify
```

### 3. 跳过构建

如果只想上传已构建的文件：

```bash
# 编辑脚本，注释掉 build_locally 函数调用
# 或创建一个 upload-only 版本
```

## 📝 更新日志

### v1.0 (2025-10-30)
- 初始版本
- 支持一键部署
- 自动验证和测试
- 详细的错误日志

## 🎯 下一步

1. 查看 [部署指南](./DEPLOYMENT_GUIDE.md) 了解完整的部署架构
2. 根据需要自定义脚本配置
3. 测试脚本运行 (使用 --no-verify 选项)
4. 在生产环境中使用
