# Ruizhu E-Commerce Platform Deployment Guide

## 目录
1. [部署概述](#部署概述)
2. [架构设计](#架构设计)
3. [部署环境](#部署环境)
4. [详细部署流程](#详细部署流程)
5. [配置说明](#配置说明)
6. [验证测试](#验证测试)
7. [故障排查](#故障排查)

---

## 部署概述

### 项目结构
Ruizhu 电商平台是一个前后端分离的应用，包含：
- **Admin 前端**: React + Vite (管理后台)
- **API 后端**: NestJS (REST API 服务)
- **反向代理**: Nginx (流量分发和静态文件服务)

### 部署目标
- Admin 前端：部署到 `https://yunjie.online/` (根域名)
- API 后端：在服务器本地 `127.0.0.1:3000` 运行
- API 访问：通过 `https://yunjie.online/api/` 代理转发

### 部署架构
```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                         │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                    │
│  Listen: 443 (HTTPS)                                        │
│  Domain: yunjie.online                                      │
└────────────┬────────────────────────────────────────────────┘
             │
     ┌───────┴────────────────┐
     │                        │
     ▼                        ▼
┌──────────────────┐  ┌──────────────────────┐
│  Static Files    │  │  API Proxy           │
│  /opt/ruizhu-app │  │  Location: /api/     │
│  /admin/         │  │  Upstream: 127.0.0.1│
│  (React SPA)     │  │           :3000      │
└──────────────────┘  └──────────────────────┘
                             │
                             ▼
                      ┌──────────────────┐
                      │  NestAPI Backend │
                      │  Port: 3000      │
                      │  (Node.js)       │
                      └──────────────────┘
```

---

## 架构设计

### 设计理念

#### 1. **SPA 路由策略**
- Admin 前端是单页应用 (Single Page Application)
- 客户端路由在浏览器处理
- Nginx 需要处理 SPA 路由 fallback：所有非静态资源请求返回 `index.html`
- 实现方式：`error_page 404 =200 /index.html`

#### 2. **静态资源分离**
- `index.html`: 不缓存，每次都重新请求 (包含最新应用代码)
- 版本化资源 (assets/*.js, assets/*.css): 缓存 1 年
- 版本化通过 Vite 构建时自动添加 hash

#### 3. **API 代理分离**
- `/api/` 路径转发到后端
- 保持 HTTP header，支持 WebSocket upgrade
- 设置代理 header，后端可获取客户端真实 IP

#### 4. **HTTPS/SSL 安全**
- 所有 HTTP 请求重定向到 HTTPS
- 支持 HTTP/2 以提高性能
- 强制使用 TLSv1.2 和 TLSv1.3

---

## 部署环境

### 服务器信息
- **Provider**: 腾讯云
- **IP**: 123.207.14.67
- **OS**: OpenCloudOS (基于 CentOS)
- **Web Server**: Nginx
- **Runtime**: Node.js (NestAPI)
- **Process Manager**: PM2

### 部署路径
```
/opt/ruizhu-app/
├── admin/                    # React Admin 前端
│   ├── index.html           # SPA 入口
│   ├── assets/              # 构建后的 JS/CSS
│   └── vite.svg             # 静态资源
├── nestapi-dist/            # NestAPI 后端编译后的代码
│   ├── main.js              # 应用入口
│   └── .env                 # 环境配置
└── ecosystem.config.js      # PM2 配置

/www/server/panel/vhost/nginx/
└── ruizhu.conf              # Nginx 虚拟主机配置

/www/server/nginx/conf/ssl/
├── yunjie.online_bundle.crt # SSL 证书链
└── yunjie.online.key        # SSL 私钥
```

---

## 详细部署流程

### 阶段 1: 准备工作

#### 1.1 获取 SSL 证书
```bash
# 证书路径
/www/server/nginx/conf/ssl/yunjie.online_bundle.crt
/www/server/nginx/conf/ssl/yunjie.online.key
```

#### 1.2 初始化部署目录
```bash
# SSH 登录服务器
sshpass -p "Pp123456" ssh -o StrictHostKeyChecking=no root@123.207.14.67

# 创建部署目录
mkdir -p /opt/ruizhu-app/admin
mkdir -p /opt/ruizhu-app/nestapi-dist

# 查看目录结构
ls -lh /opt/ruizhu-app/
```

---

### 阶段 2: Admin 前端部署

**重要**: Admin 是静态文件部署，不需要重启或重建 NestAPI 后端。Admin 和 API 完全独立。

#### 2.1 本地构建
在本地开发环境执行：

```bash
# 进入 admin 目录
cd admin/

# 创建生产环境配置文件
cat > .env.production << 'EOF'
# Production environment configuration
VITE_API_URL=https://yunjie.online/api
VITE_APP_NAME=Ruizhu Admin
EOF

# 验证 Vite 配置
# vite.config.ts 中应该有：
# - base: '/'
# - resolve.alias: '@': path.resolve(__dirname, './src')

# 构建应用
npm run build

# 构建输出
# dist/
# ├── index.html (540 bytes)
# ├── assets/
# │   ├── index-xxxxx.js
# │   ├── index-xxxxx.css
# │   └── ...
# └── vite.svg
```

#### 2.2 上传到服务器
```bash
# 清空旧文件
sshpass -p "Pp123456" ssh -o StrictHostKeyChecking=no root@123.207.14.67 \
  "rm -rf /opt/ruizhu-app/admin/* && echo '✓ Cleared old files'"

# 上传新文件
scp -r dist/* root@123.207.14.67:/opt/ruizhu-app/admin/

# 验证文件上传
sshpass -p "Pp123456" ssh -o StrictHostKeyChecking=no root@123.207.14.67 \
  "ls -lh /opt/ruizhu-app/admin/"
```

#### 2.3 验证构建输出
```bash
# 应该包含以下文件：
# - index.html (不含 hash，便于更新)
# - assets/index-XXXXX.js (含 hash，用于缓存)
# - assets/index-XXXXX.css (含 hash，用于缓存)
# - vite.svg
```

#### 2.4 重新加载 Nginx (仅此而已)
```bash
# 让 Nginx 读取新上传的静态文件
nginx -s reload
```

**就这样！** 不需要重启后端服务。

---

### 阶段 3: NestAPI 后端部署

#### 3.1 本地构建
```bash
# 进入 nestapi 目录
cd nestapi/

# 安装依赖
npm install

# 构建项目
npm run build

# 检查构建输出
ls -lh dist/

# 关键文件：
# - main.js (应用入口)
# - main.js.map (调试信息)
```

#### 3.2 上传到服务器
```bash
# 清空旧文件
sshpass -p "Pp123456" ssh -o StrictHostKeyChecking=no root@123.207.14.67 \
  "rm -rf /opt/ruizhu-app/nestapi-dist/*"

# 上传构建文件
scp -r dist/* root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/

# 上传 .env 配置
scp .env root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/

# 上传 node_modules (如果没有的话)
# scp -r node_modules root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/
```

#### 3.3 配置 PM2
```bash
# 检查/创建 PM2 配置
cat > /opt/ruizhu-app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ruizhu-backend',
      script: '/opt/ruizhu-app/nestapi-dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/nestapi-error.log',
      out_file: '/var/log/pm2/nestapi-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# 通过 PM2 启动/重启
pm2 start /opt/ruizhu-app/ecosystem.config.js
pm2 save
pm2 startup

# 验证运行状态
pm2 list
pm2 logs ruizhu-backend --lines 20
```

#### 3.4 验证后端健康
```bash
# 测试本地 API 端点
curl -s http://localhost:3000/api/products | jq '.code' # 应该返回 200
curl -s http://localhost:3000/api/banners | jq '.code'  # 应该返回 200
```

---

### 阶段 4: Nginx 配置

#### 4.1 定位 Nginx 配置文件

**关键发现**：Nginx 配置文件位置在 `/www/server/panel/vhost/nginx/`，不是 `/etc/nginx/conf.d/`

```bash
# 确认配置目录
ls -lh /www/server/nginx/conf/nginx.conf

# 主配置文件会 include 以下路径：
include /www/server/panel/vhost/nginx/*.conf;
```

#### 4.2 创建 Nginx 虚拟主机配置

编辑/创建文件：`/www/server/panel/vhost/nginx/ruizhu.conf`

```nginx
upstream ruizhu_backend {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name 123.207.14.67 yunjie.online *.yunjie.online;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器配置
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    server_name 123.207.14.67 yunjie.online *.yunjie.online;

    # SSL 证书配置
    ssl_certificate /www/server/nginx/conf/ssl/yunjie.online_bundle.crt;
    ssl_certificate_key /www/server/nginx/conf/ssl/yunjie.online.key;

    # SSL 协议和密码套件优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 50M;
    access_log /www/wwwlogs/ruizhu-access.log;
    error_log /www/wwwlogs/ruizhu-error.log;

    # 设置根目录为 Admin 前端
    root /opt/ruizhu-app/admin;
    index index.html index.htm;

    # 缓存静态资源 (版本化文件)
    location ~ \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 不缓存 index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API 代理：转发到 NestAPI 后端
    location /api/ {
        proxy_pass http://ruizhu_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # SPA 路由：404 返回 index.html (客户端处理路由)
    error_page 404 =200 /index.html;

    # 隐藏隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

#### 4.3 验证 Nginx 配置
```bash
# 验证语法
nginx -t

# 输出应该是：
# nginx: the configuration file /www/server/nginx/conf/nginx.conf syntax is ok
# nginx: configuration file /www/server/nginx/conf/nginx.conf test is successful
```

#### 4.4 重载 Nginx
```bash
# 方式 1：使用 nginx 命令
nginx -s reload

# 方式 2：使用 systemctl
systemctl reload nginx

# 验证 Nginx 重启
ps aux | grep nginx | grep -v grep
```

---

## 配置说明

### Admin 前端配置

#### .env.production
```bash
# API 服务地址 (生产环境)
VITE_API_URL=https://yunjie.online/api

# 应用名称
VITE_APP_NAME=Ruizhu Admin
```

#### vite.config.ts 关键配置
```typescript
export default defineConfig({
  // 应用部署在根路径
  base: '/',

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 开发服务器配置 (本地开发用)
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
```

### NestAPI 后端配置

#### .env 环境变量
```bash
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ruizhu

# 其他配置
JWT_SECRET=your_secret_key
API_PREFIX=/api
```

### Nginx 关键配置说明

| 配置项 | 说明 | 例子 |
|--------|------|------|
| `root` | 静态文件根目录 | `/opt/ruizhu-app/admin` |
| `index` | 默认文件 | `index.html index.htm` |
| `error_page 404 =200` | 404 错误处理 (SPA 路由) | `/index.html` |
| `expires 1y` | 缓存过期时间 | 资源文件 |
| `proxy_pass` | 代理目标地址 | `http://ruizhu_backend` |
| `proxy_set_header` | 代理请求头 | `X-Forwarded-For` 等 |

---

## 验证测试

### 测试清单

#### 1. Admin 前端访问
```bash
# ✓ 返回 HTTP 200，Content-Type: text/html
curl -I https://yunjie.online/

# ✓ 返回 Cache-Control: no-cache 头
curl -I https://yunjie.online/index.html

# ✓ 返回 Cache-Control: public, immutable 头
curl -I https://yunjie.online/assets/index-xxxxx.js
```

#### 2. API 代理测试
```bash
# ✓ 获取产品列表
curl -s https://yunjie.online/api/products | jq '.code'
# 输出: 200

# ✓ 获取首页 Banner
curl -s https://yunjie.online/api/banners | jq '.code'
# 输出: 200
```

#### 3. HTTPS 重定向
```bash
# ✓ HTTP 请求重定向到 HTTPS
curl -I http://yunjie.online/
# HTTP/1.1 301 Moved Permanently
# Location: https://yunjie.online/
```

#### 4. SPA 路由测试
```bash
# ✓ 非存在路径返回 index.html (SPA 路由)
curl -s https://yunjie.online/login | head -1
# 应该返回 <!doctype html>

curl -s https://yunjie.online/products | head -1
# 应该返回 <!doctype html>
```

#### 5. 后端健康检查
```bash
# ✓ 检查 NestAPI 运行状态
pm2 list
# 应该显示 ruizhu-backend 进程 online

# ✓ 查看最近日志
pm2 logs ruizhu-backend --lines 20
# 应该看到应用启动日志，无 error
```

---

## 故障排查

### 常见问题

#### 问题 1: Admin 页面返回 404 或后端响应
**症状**: 访问 `https://yunjie.online/` 返回 JSON 错误或 404
**原因**: Nginx 配置错误或找不到 admin 文件

**解决方案**:
```bash
# 1. 检查 admin 文件是否存在
ls -lh /opt/ruizhu-app/admin/index.html

# 2. 检查 Nginx 配置
cat /www/server/panel/vhost/nginx/ruizhu.conf | grep root

# 3. 检查 Nginx 错误日志
tail -30 /www/wwwlogs/ruizhu-error.log

# 4. 验证配置语法
nginx -t

# 5. 重新加载 Nginx
nginx -s reload
```

#### 问题 2: API 返回 Connection Refused
**症状**: `https://yunjie.online/api/products` 返回连接错误
**原因**: NestAPI 后端未运行或端口不对

**解决方案**:
```bash
# 1. 检查 NestAPI 进程
pm2 list
pm2 logs ruizhu-backend --lines 50

# 2. 检查端口监听
netstat -tlnp | grep 3000
ss -tlnp | grep 3000

# 3. 启动/重启 NestAPI
pm2 start /opt/ruizhu-app/ecosystem.config.js
pm2 restart ruizhu-backend

# 4. 本地测试 API
curl -s http://localhost:3000/api/products | jq '.code'
```

#### 问题 3: 静态资源 404
**症状**: CSS/JS 文件加载失败，出现 404
**原因**: 文件路径错误或文件未构建

**解决方案**:
```bash
# 1. 检查文件是否存在
ls -lh /opt/ruizhu-app/admin/assets/

# 2. 检查 index.html 中的资源路径
cat /opt/ruizhu-app/admin/index.html | grep src=

# 3. 重新构建上传
npm run build
scp -r dist/* root@123.207.14.67:/opt/ruizhu-app/admin/
```

#### 问题 4: HTTPS 证书错误
**症状**: 浏览器显示证书错误或不安全
**原因**: SSL 证书过期或配置错误

**解决方案**:
```bash
# 1. 检查证书有效期
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt -text -noout | grep -A2 "Validity"

# 2. 检查证书和密钥匹配
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt -noout -pubkey > /tmp/cert_pub.key
openssl rsa -in /www/server/nginx/conf/ssl/yunjie.online.key -pubout > /tmp/key_pub.key
diff /tmp/cert_pub.key /tmp/key_pub.key

# 3. 验证 Nginx 配置中证书路径
grep ssl_certificate /www/server/panel/vhost/nginx/ruizhu.conf
```

#### 问题 5: 缓存相关问题
**症状**: 更新 Admin 代码后页面还是旧版本
**原因**: 浏览器缓存 index.html

**解决方案**:
```bash
# 1. 确保 index.html 不被缓存
grep -A2 "location = /index.html" /www/server/panel/vhost/nginx/ruizhu.conf
# 应该包含: add_header Cache-Control "no-cache, no-store, must-revalidate";

# 2. 清除浏览器缓存
# - Ctrl+Shift+Delete (或在开发者工具中清除缓存)
# - 或使用 Ctrl+F5 强制刷新

# 3. 检查版本化文件是否有 hash
ls /opt/ruizhu-app/admin/assets/index-*.js
# 应该显示类似: index-a1b2c3d4.js
```

### 日志位置

| 日志文件 | 位置 | 用途 |
|---------|------|------|
| Nginx 访问日志 | `/www/wwwlogs/ruizhu-access.log` | 记录所有 HTTP 请求 |
| Nginx 错误日志 | `/www/wwwlogs/ruizhu-error.log` | 记录 Nginx 错误 |
| NestAPI 日志 | `pm2 logs ruizhu-backend` | 记录应用日志 |

### 调试命令

```bash
# 查看 Nginx 编译配置
nginx -V

# 动态显示 Nginx 请求
tail -f /www/wwwlogs/ruizhu-access.log | grep -v "assets"

# 监控进程资源使用
watch -n 1 'ps aux | grep -E "nginx|node" | grep -v grep'

# 检查网络连接
netstat -tlnp | grep -E "80|443|3000"

# 测试后端响应时间
curl -w "@/dev/stdin" -o /dev/null -s \
  "https://yunjie.online/api/products" << 'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

---

## 快速参考

### 部署检查清单

```
前端部署:
  [ ] npm run build (本地构建)
  [ ] .env.production 配置正确
  [ ] 上传 dist/ 到 /opt/ruizhu-app/admin/
  [ ] 验证 index.html 存在
  [ ] 验证 assets/ 目录有构建文件

后端部署:
  [ ] npm run build (本地构建)
  [ ] .env 配置正确
  [ ] 上传 dist/ 到 /opt/ruizhu-app/nestapi-dist/
  [ ] node_modules 存在或可被安装
  [ ] PM2 配置文件存在

Nginx 配置:
  [ ] /www/server/panel/vhost/nginx/ruizhu.conf 创建/更新
  [ ] root 路径指向 /opt/ruizhu-app/admin
  [ ] SSL 证书路径正确
  [ ] upstream 配置指向 127.0.0.1:3000
  [ ] error_page 404 配置存在
  [ ] nginx -t 验证通过

验证测试:
  [ ] curl -I https://yunjie.online/ (返回 200)
  [ ] curl https://yunjie.online/api/products (返回 JSON)
  [ ] 浏览器访问 https://yunjie.online (加载完整)
  [ ] pm2 logs ruizhu-backend (无错误)
  [ ] 测试 SPA 路由 (如 /login, /products)
```

### 常用部署命令速查

#### 部署 Admin 前端 (最常用)
```bash
# 1. 本地构建
cd admin && npm run build

# 2. 上传到服务器
scp -r dist/* root@123.207.14.67:/opt/ruizhu-app/admin/

# 3. 重新加载 Nginx (让新文件生效)
ssh -o StrictHostKeyChecking=no root@123.207.14.67 "nginx -s reload"

# 完成！不需要重启 NestAPI
```

#### 部署 NestAPI 后端
```bash
# 1. 本地构建
cd nestapi && npm run build

# 2. 上传到服务器
scp -r dist/* root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/
scp .env root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/

# 3. 重启后端服务
ssh -o StrictHostKeyChecking=no root@123.207.14.67 "pm2 restart ruizhu-backend"
```

#### 维护相关命令
```bash
# 查看 NestAPI 日志
pm2 logs ruizhu-backend --lines 50

# 查看 Nginx 错误日志
tail -30 /www/wwwlogs/ruizhu-error.log

# 验证 Nginx 配置
nginx -t

# 查看进程状态
pm2 list
ss -tlnp | grep -E "80|443|3000"
```

---

## 总结

这个部署方案实现了：

1. **分离部署**: 前端静态文件和后端 API 独立部署和扩展
2. **性能优化**: 静态资源 CDN 友好的缓存策略
3. **高可用**: Nginx 反向代理支持后端多实例
4. **安全性**: HTTPS/TLS, HTTP→HTTPS 重定向
5. **可维护性**: 清晰的目录结构和配置文件位置
6. **易调试**: 详细的日志和故障排查指南

部署完成后，所有来自 `https://yunjie.online` 的请求都会被 Nginx 正确路由：
- 静态资源请求 → Admin 前端目录
- `/api/` 请求 → NestAPI 后端代理
- SPA 路由请求 → index.html (客户端处理)
