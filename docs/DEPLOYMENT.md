# 韵界电商平台 - 部署文档

## 1. 部署概述

本文档描述韵界电商平台的完整部署流程，包括环境准备、服务部署和运维管理。

## 2. 环境要求

### 2.1 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 硬盘 | 50 GB SSD | 100 GB SSD |
| 带宽 | 5 Mbps | 10 Mbps |
| 系统 | CentOS 7+ / Ubuntu 18+ | Ubuntu 22.04 LTS |

### 2.2 软件依赖

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | 16.x+ | 后端运行环境 |
| npm | 8.x+ | 包管理器 |
| MySQL | 5.7+ | 数据库 |
| Nginx | 1.18+ | Web 服务器 |
| PM2 | 5.x+ | 进程管理 |
| Git | 2.x+ | 版本控制 |

## 3. 环境准备

### 3.1 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v
npm -v
```

### 3.2 安装 PM2

```bash
npm install -g pm2
pm2 -v
```

### 3.3 安装 Nginx

```bash
# Ubuntu
sudo apt update
sudo apt install nginx -y

# CentOS
sudo yum install epel-release -y
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.4 安装 MySQL (可选，推荐使用云数据库)

```bash
# Ubuntu
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 或使用项目提供的脚本
cd /path/to/project/scripts
./install-mysql-ubuntu.sh
```

## 4. 项目部署

### 4.1 克隆项目

```bash
cd /var/www
git clone <repository-url> ruizhu_project
cd ruizhu_project
```

### 4.2 后端部署 (NestAPI)

#### 4.2.1 安装依赖

```bash
cd nestapi
npm install
```

#### 4.2.2 配置环境变量

```bash
cp .env.example .env
vim .env
```

编辑 `.env` 文件：

```env
# 应用配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=ruizhu_db

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# 腾讯云 COS 配置
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket-name
COS_REGION=ap-guangzhou

# 微信小程序配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret

# 微信支付配置
WECHAT_MCH_ID=your-mch-id
WECHAT_MCH_KEY=your-mch-key
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/api/wechat/payment/callback
```

#### 4.2.3 构建项目

```bash
npm run build
```

#### 4.2.4 数据库迁移

```bash
npm run migration:run
```

#### 4.2.5 启动服务

```bash
# 使用 PM2 启动
pm2 start dist/main.js --name nestapi

# 或使用项目配置
pm2 start ecosystem.config.js
```

### 4.3 管理后台部署 (Admin)

#### 4.3.1 安装依赖

```bash
cd ../admin
npm install
```

#### 4.3.2 配置环境变量

```bash
cp .env.example .env.production
vim .env.production
```

编辑 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-domain.com/api
```

#### 4.3.3 构建项目

```bash
npm run build
```

#### 4.3.4 部署静态文件

```bash
# 复制构建产物到 Nginx 目录
sudo cp -r dist/* /var/www/admin/
```

### 4.4 小程序部署 (MiniProgram)

#### 4.4.1 安装依赖

```bash
cd ../miniprogram
npm install
```

#### 4.4.2 配置 API 地址

编辑 `src/services/api.ts`，修改 `BASE_URL` 为生产环境地址。

#### 4.4.3 构建微信小程序

```bash
npm run build:mp-weixin
```

#### 4.4.4 上传小程序

1. 打开微信开发者工具
2. 导入 `dist/build/mp-weixin` 目录
3. 点击"上传"按钮
4. 在微信公众平台提交审核

## 5. Nginx 配置

### 5.1 配置文件

创建 `/etc/nginx/sites-available/yunjie.conf`：

```nginx
# API 服务
upstream nestapi {
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yunjie.online www.yunjie.online;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name yunjie.online www.yunjie.online;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yunjie.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yunjie.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 管理后台
    location / {
        root /var/www/admin;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://nestapi;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Swagger 文档
    location /swagger {
        proxy_pass http://nestapi;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/admin;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/yunjie.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 6. SSL 证书配置

### 6.1 安装 Certbot

```bash
# Ubuntu
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 申请证书

```bash
sudo certbot --nginx -d yunjie.online -d www.yunjie.online
```

### 6.3 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# 添加定时任务
sudo crontab -e
# 添加以下行
0 0 1 * * /usr/bin/certbot renew --quiet
```

## 7. PM2 进程管理

### 7.1 ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'nestapi',
      script: './dist/main.js',
      cwd: '/var/www/ruizhu_project/nestapi',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '1G'
    }
  ]
};
```

### 7.2 常用命令

```bash
# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs nestapi

# 重启服务
pm2 restart nestapi

# 停止服务
pm2 stop nestapi

# 删除服务
pm2 delete nestapi

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
```

## 8. 数据库管理

### 8.1 数据库备份

```bash
# 手动备份
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d).sql

# 定时备份脚本
#!/bin/bash
BACKUP_DIR=/var/backups/mysql
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +7 -delete
```

### 8.2 数据库恢复

```bash
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < backup.sql
```

## 9. 监控与日志

### 9.1 PM2 监控

```bash
# 实时监控
pm2 monit

# Web 监控面板
pm2 plus
```

### 9.2 日志管理

```bash
# 查看实时日志
pm2 logs

# 清空日志
pm2 flush

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 10. 常见问题

### 10.1 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000
# 或
netstat -tlnp | grep 3000

# 终止进程
kill -9 <PID>
```

### 10.2 权限问题

```bash
# 修改目录权限
sudo chown -R $USER:$USER /var/www/ruizhu_project
chmod -R 755 /var/www/ruizhu_project
```

### 10.3 内存不足

```bash
# 查看内存使用
free -h

# 创建 swap 文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 10.4 Nginx 502 错误

```bash
# 检查后端服务状态
pm2 status

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 重启服务
pm2 restart nestapi
sudo systemctl restart nginx
```

## 11. 更新部署

### 11.1 后端更新

```bash
cd /var/www/ruizhu_project/nestapi
git pull origin main
npm install
npm run build
pm2 restart nestapi
```

### 11.2 管理后台更新

```bash
cd /var/www/ruizhu_project/admin
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/admin/
```

### 11.3 一键部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

echo "=== 开始部署 ==="

# 拉取最新代码
git pull origin main

# 部署后端
echo "=== 部署后端 ==="
cd nestapi
npm install
npm run build
pm2 restart nestapi

# 部署管理后台
echo "=== 部署管理后台 ==="
cd ../admin
npm install
npm run build
sudo cp -r dist/* /var/www/admin/

echo "=== 部署完成 ==="
```
