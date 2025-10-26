# 腾讯云服务器部署指南

本文档说明如何将 Ruizhu 电商平台部署到腾讯云服务器。

## 📋 部署信息

- **服务器 IP**: 123.207.14.67
- **用户**: root
- **部署路径**: /opt/ruizhu-app
- **云数据库**: gz-cdb-qtjza6az.sql.tencentcdb.com:27226
- **数据库名**: mydb

## 🚀 快速部署步骤

### 前置要求

1. **本地环境**
   - macOS/Linux 系统
   - 已安装 Node.js 18+ 和 npm
   - 已安装 sshpass（用于密码认证）

   ```bash
   # macOS 安装 sshpass
   brew install sshpass

   # Ubuntu 安装 sshpass
   sudo apt-get install sshpass
   ```

2. **服务器访问权限**
   - 服务器 IP: 123.207.14.67
   - SSH 端口: 22 (默认)
   - 用户: root
   - 密码: Pp123456

### 部署步骤

#### Step 1: 准备本地项目

```bash
# 1. 进入项目根目录
cd /Users/peak/work/pikecode/ruizhu_project

# 2. 检查部署脚本
ls -la scripts/deploy-to-tencent.sh

# 3. 确保脚本有执行权限
chmod +x scripts/deploy-to-tencent.sh
```

#### Step 2: 执行部署脚本

```bash
# 运行部署脚本（会自动构建、上传、配置、启动）
./scripts/deploy-to-tencent.sh
```

脚本将自动完成以下步骤：
- ✅ 构建后端 (NestJS)
- ✅ 构建前端 (React)
- ✅ 生成部署包
- ✅ 上传到服务器
- ✅ 初始化服务器环境
- ✅ 启动服务
- ✅ 配置 Nginx

#### Step 3: 服务器端数据库初始化

登录服务器手动初始化数据库：

```bash
# SSH 连接到服务器
ssh root@123.207.14.67

# 进入部署目录
cd /opt/ruizhu-app

# 初始化数据库
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p < database-init-corrected.sql

# 输入密码: Pp123456
```

#### Step 4: 验证部署

```bash
# 检查后端服务
curl http://123.207.14.67:8888/api/v1/health

# 预期响应: {"statusCode":200,"message":"OK"}

# 检查前端
curl http://123.207.14.67/
```

## 📍 访问地址

部署成功后，可通过以下地址访问：

| 服务 | URL | 说明 |
|-----|-----|------|
| 管理后台 | http://123.207.14.67 | React 管理系统 |
| API 基础 URL | http://123.207.14.67/api/v1 | RESTful API |
| API 文档 | http://123.207.14.67:8888/api | Swagger 文档 |

## 🔧 服务管理命令

在服务器上运行以下命令管理服务：

### PM2 进程管理

```bash
# 查看所有进程
pm2 list

# 查看特定服务日志
pm2 logs ruizhu-backend

# 重启服务
pm2 restart ruizhu-backend

# 停止服务
pm2 stop ruizhu-backend

# 启动服务
pm2 start ruizhu-backend

# 删除进程
pm2 delete ruizhu-backend

# 保存 PM2 进程
pm2 save
pm2 startup
```

### Nginx 管理

```bash
# 重启 Nginx
systemctl restart nginx

# 停止 Nginx
systemctl stop nginx

# 启动 Nginx
systemctl start nginx

# 检查 Nginx 状态
systemctl status nginx

# 测试 Nginx 配置
nginx -t
```

### 数据库管理

```bash
# 连接云数据库
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p

# 查看数据库列表
SHOW DATABASES;

# 选择数据库
USE mydb;

# 查看表列表
SHOW TABLES;
```

## 📊 日志位置

### 应用日志

```bash
# 后端错误日志
tail -f /var/log/ruizhu-backend-error.log

# 后端输出日志
tail -f /var/log/ruizhu-backend-out.log

# PM2 日志
pm2 logs
```

### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/ruizhu-access.log

# 错误日志
tail -f /var/log/nginx/ruizhu-error.log
```

## 🐛 常见问题及解决方案

### 1. 部署脚本执行失败

**问题**: `sshpass command not found`

**解决**:
```bash
# macOS
brew install sshpass

# Ubuntu
sudo apt-get install sshpass
```

### 2. 连接超时

**问题**: `ssh: connect to host 123.207.14.67 port 22: Connection timed out`

**解决**:
- 检查服务器 IP 是否正确
- 确认服务器安全组是否开放 22 端口
- 检查网络连接

### 3. 权限被拒绝

**问题**: `Permission denied (publickey,password)`

**解决**:
- 确认用户名和密码正确
- 检查脚本中的服务器认证信息

### 4. 后端服务无法启动

**问题**: `pm2 logs 显示错误`

**解决**:
```bash
# 1. 检查日志
pm2 logs ruizhu-backend

# 2. 检查环境变量
cat /opt/ruizhu-app/.env.production

# 3. 检查数据库连接
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p

# 4. 检查端口占用
lsof -i :8888

# 5. 查看 Node.js 进程
ps aux | grep node
```

### 5. 前端页面 404

**问题**: 访问前端出现 404

**解决**:
```bash
# 1. 检查前端文件是否存在
ls -la /opt/ruizhu-app/admin-dist/

# 2. 检查 Nginx 配置
nginx -t

# 3. 查看 Nginx 日志
tail -f /var/log/nginx/ruizhu-error.log

# 4. 重启 Nginx
systemctl restart nginx
```

### 6. 跨域问题

**问题**: 前端请求 API 返回 CORS 错误

**解决**:
```typescript
// 在 nestapi/src/main.ts 中添加 CORS 配置
app.enableCors({
  origin: '*', // 或指定具体的前端地址
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});
```

## 🔐 安全建议

1. **更改默认密码**
   ```bash
   # SSH 连接后修改 root 密码
   passwd
   ```

2. **配置 SSH 密钥**
   ```bash
   # 生成本地 SSH 密钥
   ssh-keygen -t rsa -b 4096

   # 上传公钥到服务器
   ssh-copy-id -i ~/.ssh/id_rsa.pub root@123.207.14.67
   ```

3. **配置防火墙**
   ```bash
   # 允许 SSH
   ufw allow 22

   # 允许 HTTP
   ufw allow 80

   # 允许 HTTPS
   ufw allow 443

   # 启用防火墙
   ufw enable
   ```

4. **配置 HTTPS（SSL 证书）**
   ```bash
   # 使用 Let's Encrypt 获取免费证书
   apt-get install certbot python3-certbot-nginx
   certbot certonly --nginx -d your-domain.com

   # 在 Nginx 配置中使用证书
   ```

5. **环境变量安全**
   - 修改 JWT_SECRET
   - 修改数据库密码
   - 修改 WeChat 配置信息

## 📈 性能优化

### PM2 集群模式

当前配置已启用集群模式（`--instances max`），自动使用所有 CPU 核心。

### Nginx 优化

Nginx 配置包含：
- ✅ Gzip 压缩
- ✅ 静态资源缓存
- ✅ 连接保持活动
- ✅ 请求缓冲优化

### 数据库优化

- 使用云数据库（托管服务）
- 配置了必要的索引
- 建议定期备份

## 🔄 持续部署和更新

### 更新应用

```bash
# 1. 本地更新代码
git pull origin main

# 2. 重新运行部署脚本
./scripts/deploy-to-tencent.sh

# 或手动更新：
# 3. 重启服务
pm2 restart ruizhu-backend
```

### 回滚版本

```bash
# 1. 查看提交历史
git log

# 2. 回退到上一个版本
git revert HEAD

# 3. 重新部署
./scripts/deploy-to-tencent.sh
```

## 📞 获取帮助

- 检查日志文件（见日志位置部分）
- 运行 `pm2 logs` 查看实时日志
- 检查 Nginx 错误日志
- 测试 API 连接：`curl http://server-ip/api/v1/health`

## 📝 部署检查清单

- [ ] 本地环境准备完成
- [ ] sshpass 已安装
- [ ] 部署脚本已执行
- [ ] 后端服务正常运行
- [ ] 前端可正常访问
- [ ] 数据库已初始化
- [ ] API 正常响应
- [ ] Nginx 正常运行
- [ ] 日志正常记录

---

**部署日期**: 2024-10-26
**项目**: Ruizhu 电商平台
**版本**: 1.0.0
