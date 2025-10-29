# Ruizhu 平台 - 详细部署诊断报告

**诊断时间**: 2025-10-29
**诊断范围**: 本地Nginx配置 + 远程服务器部署
**当前状态**: ⚠️ 需要修复

---

## 🔍 问题诊断

### 1. 部署架构理解

```
用户请求
  ↓
yunjie.online (DNS 解析)
  ↓
123.207.14.67 (远程服务器)
  ↓
远程服务器上的 Nginx
  ↓
NestAPI (localhost:3000)
```

### 2. 当前状态检查结果

| 检查项 | 结果 | 详情 |
|--------|------|------|
| DNS 解析 | ✅ | yunjie.online → 123.207.14.67 |
| HTTPS 连接 | ✅ | 状态码 200（但返回错误内容） |
| SSL 证书 | ✅ | 有效期到 2026年10月24日 |
| /banners 端点 | ❌ | 返回 Admin 前端 HTML（Vite应用） |
| /auth/login 端点 | ❌ | 返回 Nginx 405 Not Allowed |
| 本地 API (localhost:3000) | ✅ | 正常运行，数据返回正确 |
| 本地 Nginx | ⚠️ | 指向 stock-analysis-system (3007)，没有配置 yunjie.online |

---

## 🎯 根本原因

### 问题1: 远程服务器 Nginx 配置错误

远程服务器 (123.207.14.67) 上的 Nginx 配置有问题：
- 可能指向了 Admin 前端构建目录
- 可能使用了错误的 proxy_pass
- 或者没有正确配置反向代理

### 问题2: 本地 Nginx 配置不完整

本地 Nginx (`/Users/peakom/work/stock-analysis-system/nginx/nginx.conf`)：
- 上游后端指向 127.0.0.1:3007（stock-analysis-system）
- 没有配置 yunjie.online 的虚拟主机
- 没有配置对 Ruizhu NestAPI (localhost:3000) 的代理

---

## 🔧 解决方案

### 方案 A: 修复远程服务器 Nginx（推荐用于生产环境）

#### 第一步：SSH 连接到远程服务器

```bash
ssh root@yunjie.online
# 或
ssh root@123.207.14.67
```

#### 第二步：检查 Nginx 配置文件

在远程服务器上执行：

```bash
# 查看 Nginx 配置位置
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/conf.d/

# 查看为 yunjie.online 配置的文件
cat /etc/nginx/sites-available/yunjie.online
# 或
cat /etc/nginx/conf.d/yunjie.online.conf
```

#### 第三步：修复 Nginx 配置

编辑配置文件（假设在 `/etc/nginx/sites-available/yunjie.online`）：

```bash
sudo cp /etc/nginx/sites-available/yunjie.online /etc/nginx/sites-available/yunjie.online.backup
sudo nano /etc/nginx/sites-available/yunjie.online
```

**替换为以下正确的配置**：

```nginx
# HTTPS 配置 - Ruizhu NestAPI
server {
    listen 443 ssl http2;
    server_name yunjie.online;

    # SSL 证书路径（根据实际情况修改）
    ssl_certificate /etc/ssl/certs/yunjie.online.crt;
    ssl_certificate_key /etc/ssl/private/yunjie.online.key;

    # SSL 安全设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/yunjie.online-access.log combined;
    error_log /var/log/nginx/yunjie.online-error.log warn;

    # 上游后端 - 指向 NestAPI
    location / {
        proxy_pass http://localhost:3000;

        # 重要的代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yunjie.online;
    return 301 https://$server_name$request_uri;
}
```

#### 第四步：测试和应用配置

在远程服务器上：

```bash
# 1. 测试 Nginx 配置语法
sudo nginx -t

# 输出应该是：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 2. 重启 Nginx
sudo systemctl restart nginx

# 3. 验证 Nginx 状态
sudo systemctl status nginx

# 4. 验证 NestAPI 在 3000 端口运行
lsof -i :3000
# 或
netstat -tlnp | grep 3000

# 5. 测试本地 API
curl http://localhost:3000/banners?page=1&limit=3

# 6. 测试通过 Nginx 的请求
curl -k https://localhost/banners?page=1&limit=3

# 7. 查看 Nginx 日志
tail -50 /var/log/nginx/yunjie.online-access.log
tail -50 /var/log/nginx/yunjie.online-error.log
```

---

### 方案 B: 修复本地 Nginx（用于开发/测试）

如果你想在本地开发时也能测试 yunjie.online，修改本地 Nginx 配置：

编辑 `/Users/peakom/work/stock-analysis-system/nginx/nginx.conf`：

```nginx
# 添加 Ruizhu NestAPI 的上游配置
upstream ruizhu_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# 添加 yunjie.online 虚拟主机（在 http 块内）
server {
    listen 80;
    server_name yunjie.online localhost.yunjie;

    # 反向代理到 NestAPI
    location / {
        proxy_pass http://ruizhu_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

然后：
```bash
# 修改 /etc/hosts 来本地解析 yunjie.online（可选）
echo "127.0.0.1 yunjie.online" | sudo tee -a /etc/hosts

# 重新加载 Nginx
nginx -s reload
```

---

## 📋 修复前后对比

### 修复前
```
❌ https://yunjie.online/banners
   → 返回 Admin 前端 HTML

❌ https://yunjie.online/auth/login
   → 返回 Nginx 405 Not Allowed

❌ https://yunjie.online/
   → 返回前端应用（应该是 API）
```

### 修复后（预期）
```
✅ https://yunjie.online/banners?page=1&limit=3
   → 返回 JSON: {"data": {...}, "status": "success"}

✅ https://yunjie.online/auth/login
   → 返回 JSON: {"message": "Invalid credentials"} 或正常登录响应

✅ curl http://localhost:3000/health
   → 返回 200 OK（正常运行）
```

---

## 🔍 故障排查命令（远程服务器）

如果修复后仍有问题，在远程服务器上运行：

```bash
# 1. 检查 Nginx 进程
ps aux | grep nginx | grep -v grep

# 2. 检查 Nginx 监听的端口
lsof -i :80
lsof -i :443

# 3. 检查 NestAPI 进程
ps aux | grep node | grep -v grep
ps aux | grep "3000"

# 4. 检查端口占用
netstat -tlnp | grep -E "80|443|3000"

# 5. 查看 Nginx 错误日志（详细）
cat /var/log/nginx/yunjie.online-error.log

# 6. 实时监看 Nginx 日志
tail -f /var/log/nginx/yunjie.online-access.log

# 7. 测试后端连接
curl -v http://localhost:3000/health

# 8. 检查防火墙规则
ufw status
# 或
iptables -L -n

# 9. 查看 NestAPI 日志（如果有）
pm2 logs nestapi
# 或查找应用日志位置
find /home -name "*.log" -type f -mmin -5
```

---

## ✅ 验证修复成功

修复后，运行部署健康检查脚本：

```bash
cd /Users/peakom/work/ruizhu_project
chmod +x test-deployment.sh
./test-deployment.sh
```

**所有检查应该返回 ✅**：
```
✅ 域名解析成功
✅ HTTPS 连接成功 (HTTP Status: 200)
✅ /banners 端点正常
✅ /auth/login 端点正常
✅ SSL 证书有效
✅ 响应时间良好
✅ 本地 API 服务运行正常
```

---

## 📝 配置检查清单

在远程服务器上验证以下项目：

- [ ] Nginx 配置文件存在：`/etc/nginx/sites-available/yunjie.online`
- [ ] 配置中 `proxy_pass` 指向 `http://localhost:3000`
- [ ] 配置中 `server_name` 包含 `yunjie.online`
- [ ] 配置中有正确的 SSL 证书路径
- [ ] `sudo nginx -t` 输出 "syntax is ok" 和 "test is successful"
- [ ] `sudo systemctl status nginx` 显示 "active (running)"
- [ ] `lsof -i :3000` 显示 Node.js 进程在监听 3000 端口
- [ ] `curl http://localhost:3000/health` 返回 200 OK
- [ ] `/var/log/nginx/yunjie.online-error.log` 中没有错误日志

---

## 🚀 下一步行动

### 立即执行（关键）
1. SSH 连接到服务器：`ssh root@123.207.14.67`
2. 查看当前 Nginx 配置：`cat /etc/nginx/sites-available/yunjie.online`
3. 按照"方案 A"修复 Nginx 配置
4. 运行 `sudo nginx -t` 验证配置
5. 运行 `sudo systemctl restart nginx` 应用配置
6. 本地运行测试脚本验证修复

### 后续完善（重要）
- [ ] 检查 NestAPI 是否需要设置开机启动
- [ ] 配置 PM2 或 systemd 来管理 NestAPI 进程
- [ ] 设置 Nginx 日志轮转
- [ ] 配置监控告警（监控端口 3000 是否运行）
- [ ] 设置 SSL 证书自动续期（Let's Encrypt）

---

## 📞 常见问题

### Q: 为什么返回的是 Admin 前端而不是 API？
**A**: Nginx 配置指向了 Admin 前端的构建目录（可能是 `/dist` 或类似位置），而不是 localhost:3000。需要修改 `proxy_pass` 指向 NestAPI。

### Q: 如何确认 NestAPI 在运行？
**A**: 在服务器上运行 `curl http://localhost:3000/health`，应该返回 200 OK 和响应体。

### Q: Nginx 重启失败怎么办？
**A**: 运行 `sudo nginx -t` 检查配置错误，根据输出修复配置文件。

### Q: 如何查看实时日志？
**A**: 运行 `tail -f /var/log/nginx/yunjie.online-error.log` 实时查看错误。

---

**诊断完成**: 2025-10-29
**下一步**: 按照"方案 A"修复远程服务器 Nginx 配置

