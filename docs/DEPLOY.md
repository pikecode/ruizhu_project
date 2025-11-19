# Ruizhu 项目部署指南

## 服务器信息

- **服务器 IP**: 123.207.14.67
- **域名**: https://yunjie.online/
- **用户**: root
- **密码**: (请填写)

## 目录结构

```
/opt/ruizhu-app/
├── nestapi-dist/          # NestAPI 后端
│   ├── dist/              # 编译后的代码
│   ├── node_modules/      # 依赖
│   └── .env               # 环境配置
├── admin/                 # React Admin 前端
│   ├── assets/            # 静态资源
│   └── index.html         # 入口文件
└── backups/               # 备份目录
```

## 一键部署

```bash
# 在项目根目录执行
./scripts/deploy.sh
```

脚本会自动执行：
1. 本地构建 NestAPI 和 Admin
2. 上传文件到服务器
3. 重启 PM2 和 Nginx
4. 验证部署状态

## 手动部署步骤

### 1. 本地构建

```bash
# 构建 NestAPI
cd nestapi && npm run build

# 构建 Admin
cd admin && npm run build
```

### 2. 上传文件

```bash
# 上传 NestAPI
sshpass -p "YOUR_PASSWORD" scp -r nestapi/dist/* root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/dist/

# 上传 Admin
sshpass -p "YOUR_PASSWORD" ssh root@123.207.14.67 "rm -rf /opt/ruizhu-app/admin && mkdir -p /opt/ruizhu-app/admin"
sshpass -p "YOUR_PASSWORD" scp -r admin/dist/* root@123.207.14.67:/opt/ruizhu-app/admin/
```

### 3. 重启服务

```bash
sshpass -p "YOUR_PASSWORD" ssh root@123.207.14.67 "pm2 restart ruizhu-backend && nginx -s reload"
```

## 服务管理

### PM2 命令

```bash
# 查看状态
pm2 list

# 查看日志
pm2 logs ruizhu-backend

# 重启服务
pm2 restart ruizhu-backend

# 停止服务
pm2 stop ruizhu-backend

# 启动服务
pm2 start ruizhu-backend
```

### Nginx 命令

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 重启 Nginx
systemctl restart nginx
```

## 数据库信息

- **主机**: gz-cdb-qtjza6az.sql.tencentcdb.com
- **端口**: 27226
- **用户**: root
- **密码**: (请填写)
- **数据库**: mydb

```bash
# 连接数据库
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p
```

## Nginx 配置

配置文件位置: `/www/server/panel/vhost/nginx/ruizhu.conf`

关键配置：
- HTTP 重定向到 HTTPS
- Admin 根目录: `/opt/ruizhu-app/admin`
- API 代理到: `127.0.0.1:3000`

## 常见问题

### 1. 404 错误

检查 Admin 文件是否在正确目录：
```bash
ls -la /opt/ruizhu-app/admin/
```

### 2. API 无响应

查看 PM2 日志：
```bash
pm2 logs ruizhu-backend --err
```

### 3. 浏览器缓存

强制刷新：`Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (Mac)

## 回滚

如需回滚，从备份目录恢复：
```bash
# 查看备份
ls /opt/ruizhu-app/backups/

# 恢复备份
cd /opt/ruizhu-app
tar -xzf backups/nestapi-backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart ruizhu-backend
```

---

**最后更新**: 2025-11-19
