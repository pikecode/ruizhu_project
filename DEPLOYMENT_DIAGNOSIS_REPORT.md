# Ruizhu Platform - 部署诊断报告

**生成时间**: 2025-10-29
**诊断对象**: yunjie.online (123.207.14.67)
**诊断状态**: ⚠️ 需要修复

---

## 📊 检查结果总结

| 检查项 | 状态 | 详情 |
|-------|------|------|
| 域名解析 | ✅ | 域名解析成功，指向 123.207.14.67 |
| HTTPS 连接 | ✅ | 可以建立 HTTPS 连接（HTTP 403） |
| SSL 证书 | ✅ | 有效期到 2026 年 10 月 24 日 |
| 响应时间 | ✅ | 242ms，性能良好 |
| 本地 API | ✅ | localhost:3000 正常运行 |
| **API 端点** | ❌ | **返回 COS 错误，不是 NestAPI** |

---

## 🚨 关键问题

### 问题描述

访问 `https://yunjie.online/banners` 返回的是**腾讯云 COS（对象存储）错误**：

```xml
<Error>
    <Code>AccessDenied</Code>
    <Message>Access Denied.</Message>
    <Resource>/banners</Resource>
</Error>
```

**这说明**: 域名被指向到了**腾讯云 COS** 而不是 **NestAPI 服务器**！

---

## 🔧 解决方案

### 步骤 1: SSH 连接到服务器

```bash
ssh root@yunjie.online
# 或
ssh root@123.207.14.67
```

### 步骤 2: 检查 Nginx 配置

```bash
# 查看 Nginx 配置文件
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/conf.d/

# 查看为 yunjie.online 配置的文件
cat /etc/nginx/sites-available/yunjie.online
# 或
cat /etc/nginx/conf.d/yunjie.online.conf
# 或
cat /etc/nginx/conf.d/default.conf
```

### 步骤 3: 问题诊断

#### 情况 A: 如果 Nginx 配置指向了 COS

```nginx
# ❌ 错误的配置
server {
    listen 443 ssl;
    server_name yunjie.online;

    location / {
        proxy_pass https://your-cos-bucket.cos.ap-region.myqcloud.com;  # ❌ 这是错误的！
    }
}
```

#### 情况 B: 如果没有 Nginx 配置或配置错误

```nginx
# ❌ 没有反向代理配置或指向错误的上游服务器
```

### 步骤 4: 正确的 Nginx 配置

```nginx
# ✅ 正确的配置
server {
    listen 443 ssl http2;
    server_name yunjie.online;

    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/yunjie.online.crt;
    ssl_certificate_key /etc/ssl/private/yunjie.online.key;

    # SSL 安全设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/yunjie.online-access.log;
    error_log /var/log/nginx/yunjie.online-error.log;

    # 反向代理到 NestAPI
    location / {
        proxy_pass http://localhost:3000;

        # 重要的代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yunjie.online;
    return 301 https://$server_name$request_uri;
}
```

### 步骤 5: 修复步骤

```bash
# 1. 备份原配置
sudo cp /etc/nginx/sites-available/yunjie.online /etc/nginx/sites-available/yunjie.online.backup

# 2. 编辑配置文件
sudo nano /etc/nginx/sites-available/yunjie.online

# 3. 删除 COS 相关的配置，添加正确的反向代理配置
# （将上面的正确配置复制进去）

# 4. 测试 Nginx 配置是否正确
sudo nginx -t

# 5. 如果输出 "syntax is ok" 和 "test is successful"，则重启 Nginx
sudo systemctl restart nginx

# 6. 验证 Nginx 已重启
sudo systemctl status nginx
```

### 步骤 6: 验证修复

```bash
# 在服务器上本地测试
curl http://localhost:3000/banners?page=1&limit=3

# 测试通过 Nginx 的请求
curl https://localhost/banners?page=1&limit=3 -k

# 或在本地机器上测试
curl https://yunjie.online/banners?page=1&limit=3
```

---

## 📋 检查清单

在服务器上执行以下命令来诊断问题：

```bash
# 1. 检查 Nginx 是否运行
systemctl status nginx

# 2. 查看 Nginx 进程
ps aux | grep nginx

# 3. 检查 Nginx 配置文件
cat /etc/nginx/nginx.conf | grep -A 5 "include"

# 4. 列出所有 Nginx 配置
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/conf.d/

# 5. 查看当前生效的配置
cat /etc/nginx/sites-enabled/yunjie.online

# 6. 检查 NestAPI 是否在监听 3000 端口
lsof -i :3000
netstat -tlnp | grep 3000

# 7. 测试本地 API
curl http://localhost:3000/health

# 8. 查看 Nginx 访问日志
tail -50 /var/log/nginx/yunjie.online-access.log

# 9. 查看 Nginx 错误日志
tail -50 /var/log/nginx/yunjie.online-error.log
```

---

## 🔐 可能的其他原因

### 原因 1: DNS 记录指向错误

如果 DNS 记录指向了 COS 的 CNAME：

```bash
# 检查 DNS 记录
nslookup yunjie.online
dig yunjie.online

# DNS 应该返回: 123.207.14.67
```

**修复**: 在 DNS 管理面板中，确保 A 记录指向 `123.207.14.67`

### 原因 2: CDN 配置

如果配置了腾讯云 CDN，CDN 可能被配置指向了 COS：

**修复**:
1. 登录腾讯云控制台
2. 进入 CDN 配置
3. 修改源站为 `123.207.14.67:3000` 或你的 NestAPI 地址

### 原因 3: 负载均衡器配置

如果使用了腾讯云负载均衡：

**修复**:
1. 检查负载均衡器的后端服务
2. 确保指向了正确的 NestAPI 实例

---

## 📈 修复后的验证

修复后，运行测试脚本验证：

```bash
cd /path/to/project
chmod +x test-deployment.sh
./test-deployment.sh
```

**期望结果**:
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

## 🚀 最佳实践

### 1. Nginx 配置最佳实践

```nginx
# 添加安全头
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;

# 添加 CORS 头（如果需要）
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
```

### 2. 日志分析

```bash
# 查看最近的请求
tail -f /var/log/nginx/yunjie.online-access.log

# 查找错误
tail -f /var/log/nginx/yunjie.online-error.log

# 统计访问
cat /var/log/nginx/yunjie.online-access.log | wc -l

# 查看独立 IP
cat /var/log/nginx/yunjie.online-access.log | awk '{print $1}' | sort -u
```

### 3. 监控和告警

```bash
# 设置自动检查脚本
cat > /home/admin/check-api.sh <<'EOF'
#!/bin/bash
curl -s https://yunjie.online/banners?page=1 | grep -q "data" || {
    echo "API 不可用，重启 NestAPI"
    systemctl restart nestapi
}
EOF

# 添加到 crontab
(crontab -l; echo "*/5 * * * * /home/admin/check-api.sh") | crontab -
```

---

## 📞 需要帮助？

如果修复后仍有问题，请提供：

1. `nginx -t` 的输出
2. `/etc/nginx/sites-enabled/yunjie.online` 的内容（删除敏感信息）
3. `curl -v https://yunjie.online/banners` 的完整输出
4. `/var/log/nginx/yunjie.online-error.log` 的错误日志
5. `ps aux | grep node` 和 `ps aux | grep nginx` 的输出

---

## ✅ 完成检查清单

- [ ] 连接到服务器
- [ ] 检查 Nginx 配置
- [ ] 备份原配置
- [ ] 修改 Nginx 配置，移除 COS 指向
- [ ] 添加正确的反向代理配置
- [ ] 测试 Nginx 配置 (`nginx -t`)
- [ ] 重启 Nginx
- [ ] 验证 NestAPI 在 3000 端口运行
- [ ] 本地测试 API
- [ ] 运行 `test-deployment.sh` 验证
- [ ] 所有测试通过 ✅

---

**诊断完成时间**: 2025-10-29
**下一步**: 按照上述步骤修复 Nginx 配置
