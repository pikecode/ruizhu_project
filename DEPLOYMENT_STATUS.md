# 部署状态报告

**部署日期**: 2024-10-26
**目标服务器**: 123.207.14.67 (Tencent Cloud)
**部署用户**: root

---

## ✅ 已完成的部分

### 1. 本地构建 (✅ 完成)
- ✅ NestJS 后端编译: `nestapi/dist`
- ✅ React 前端构建: `admin/dist`
- ✅ 生成部署包

### 2. 文件上传 (✅ 完成)
- ✅ 后端编译文件已上传
- ✅ 前端打包文件已上传
- ✅ 数据库初始化脚本已上传
- ✅ Nginx 配置已上传
- ✅ 环境配置已上传

**部署位置**: `/opt/ruizhu-app`

---

## 📝 后续手动操作 (需要您执行)

### 步骤 1: SSH 连接到服务器

```bash
ssh root@123.207.14.67
# 密码: Pp123456
```

### 步骤 2: 完成服务器初始化

进入服务器后，运行以下命令：

```bash
cd /opt/ruizhu-app

# 安装系统依赖
apt-get update
apt-get install -y curl wget nodejs npm nginx mysql-client

# 安装全局工具
npm install -g pm2

# 启动后端服务
pm2 start nestapi-dist/main.js \
    --name "ruizhu-backend" \
    --env production \
    --env-file .env.production \
    --instances max \
    --exec-mode cluster

# 保存 PM2 进程
pm2 save
pm2 startup

# 配置 Nginx
cp nginx-config.conf /etc/nginx/sites-available/default
nginx -t
systemctl restart nginx
```

### 步骤 3: 初始化数据库

在服务器上执行：

```bash
cd /opt/ruizhu-app
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p < database-init-corrected.sql
# 输入数据库密码: Pp123456
```

### 步骤 4: 验证部署

```bash
# 查看后端服务状态
pm2 list

# 查看实时日志
pm2 logs ruizhu-backend

# 查看 Nginx 状态
systemctl status nginx

# 测试 API
curl http://localhost:8888/api/v1/health
```

---

## 📍 部署完成后的访问地址

| 服务 | 地址 |
|-----|------|
| 🌐 管理后台 | http://123.207.14.67 |
| 🔌 API 基础 URL | http://123.207.14.67/api/v1 |
| 📚 API 文档 | http://123.207.14.67:8888/api |

---

## 📂 服务器文件结构

```
/opt/ruizhu-app/
├── nestapi-dist/          # 后端编译文件
├── admin-dist/            # 前端打包文件
├── .env.production        # 生产环境变量
├── nginx-config.conf      # Nginx 配置
├── database-init-corrected.sql  # 数据库初始化脚本
└── server-setup.sh        # 服务器初始化脚本
```

---

## 🔧 常用服务管理命令

### PM2 进程管理

```bash
# 查看所有进程
pm2 list

# 查看实时日志
pm2 logs ruizhu-backend

# 重启服务
pm2 restart ruizhu-backend

# 停止服务
pm2 stop ruizhu-backend

# 启动服务
pm2 start ruizhu-backend

# 删除进程
pm2 delete ruizhu-backend
```

### Nginx 管理

```bash
# 重启 Nginx
systemctl restart nginx

# 停止 Nginx
systemctl stop nginx

# 启动 Nginx
systemctl start nginx

# 查看状态
systemctl status nginx

# 测试配置
nginx -t
```

### 数据库管理

```bash
# 连接到云数据库
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p

# 查看已有数据库
SHOW DATABASES;

# 查看表
USE mydb;
SHOW TABLES;
```

---

## 📊 日志位置

```
# 后端错误日志
/var/log/ruizhu-backend-error.log

# 后端输出日志
/var/log/ruizhu-backend-out.log

# Nginx 访问日志
/var/log/nginx/ruizhu-access.log

# Nginx 错误日志
/var/log/nginx/ruizhu-error.log

# PM2 日志
pm2 logs
```

---

## 🐛 常见问题排查

### 问题 1: 无法连接到服务器
**解决**:
```bash
# 检查网络连接
ping 123.207.14.67

# 检查 SSH 端口
nc -zv 123.207.14.67 22

# 检查防火墙规则
# 联系服务器提供商确保 22 端口开放
```

### 问题 2: 后端服务无法启动
**解决**:
```bash
# 查看 PM2 日志
pm2 logs ruizhu-backend

# 检查环境变量
cat /opt/ruizhu-app/.env.production

# 检查端口占用
lsof -i :8888

# 检查 Node.js 版本
node -v

# 重启服务
pm2 restart ruizhu-backend
```

### 问题 3: 数据库连接失败
**解决**:
```bash
# 测试数据库连接
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p

# 检查防火墙是否开放了数据库端口
# 检查数据库用户和密码是否正确
```

### 问题 4: 前端页面 404
**解决**:
```bash
# 检查前端文件是否存在
ls -la /opt/ruizhu-app/admin-dist/

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/ruizhu-error.log

# 重启 Nginx
systemctl restart nginx
```

---

## 🔐 安全建议

1. **更改默认密码**
   ```bash
   passwd  # SSH 登录后更改 root 密码
   ```

2. **配置防火墙**
   ```bash
   ufw allow 22   # SSH
   ufw allow 80   # HTTP
   ufw allow 443  # HTTPS (如需)
   ufw enable
   ```

3. **修改 JWT_SECRET**
   ```bash
   # 编辑 /opt/ruizhu-app/.env.production
   # 更改 JWT_SECRET 为强密码
   ```

4. **启用 HTTPS**
   ```bash
   # 使用 Let's Encrypt 获取免费证书
   apt-get install certbot python3-certbot-nginx
   certbot certonly --nginx -d your-domain.com
   ```

---

## 📝 快速参考

| 操作 | 命令 |
|------|------|
| SSH 连接 | `ssh root@123.207.14.67` |
| 进入部署目录 | `cd /opt/ruizhu-app` |
| 查看日志 | `pm2 logs` |
| 重启后端 | `pm2 restart ruizhu-backend` |
| 重启前端 | `systemctl restart nginx` |
| 重启数据库 | `mysql 命令重新连接` |
| 查看端口占用 | `lsof -i :8888` |
| 查看磁盘使用 | `df -h` |
| 查看内存使用 | `free -h` |

---

## 📞 需要帮助?

如遇到问题：

1. 查看日志文件（见日志位置部分）
2. 运行 `pm2 logs` 查看实时日志
3. 检查 Nginx 错误日志: `tail -f /var/log/nginx/ruizhu-error.log`
4. 参考"常见问题排查"部分

---

**部署完成后，服务将自动在服务器重启时启动。**

---

更新时间: 2024-10-26 UTC
部署版本: 1.0.0
环境: Production
