# Ruizhu Platform - 部署健康检查指南

**部署环境**: 腾讯云 CVM
**域名**: yunjie.online
**服务器IP**: 123.207.14.67
**检查日期**: 2025-10-29

---

## ⚠️ 安全提醒

**重要**: 不要在代码、文档或任何公开的地方存储服务器凭证！

建议：
- 使用 SSH 密钥对代替密码
- 在 ~/.ssh/config 配置 SSH 连接
- 使用密码管理器存储凭证
- 定期更新服务器密码

---

## 📋 健康检查清单

### 1️⃣ 服务器基础设施检查

#### 1.1 检查服务器连通性

```bash
# 在本地测试
ping yunjie.online
curl -I https://yunjie.online
```

**期望结果**:
```
✅ 服务器响应正常
✅ HTTPS 连接成功
✅ 域名解析正确
```

#### 1.2 连接服务器

```bash
# SSH 连接到服务器
ssh root@123.207.14.67
# 或使用域名
ssh root@yunjie.online
```

---

### 2️⃣ NestAPI 服务状态检查

在服务器上执行以下命令：

#### 2.1 检查 NestAPI 进程

```bash
# 查看 NestAPI 是否运行
ps aux | grep "nest\|node" | grep -v grep

# 或使用 PM2 (如果使用了 PM2)
pm2 list

# 或检查端口占用
lsof -i :3000
netstat -tlnp | grep 3000
```

**期望结果**:
```
✅ NestAPI 进程正在运行
✅ 监听端口 3000 或指定的端口
✅ 状态为 online/running
```

#### 2.2 检查日志

```bash
# 查看 NestAPI 日志
tail -50 /path/to/nestapi/logs/app.log

# 或使用 PM2 日志
pm2 logs nest-api

# 检查错误
tail -50 /path/to/nestapi/logs/error.log
```

**期望结果**:
```
✅ 没有明显的错误信息
✅ 服务正常启动
✅ 数据库连接成功
```

#### 2.3 测试本地 API 连接

```bash
# 测试本地 API
curl http://localhost:3000/health

# 测试 banners 端点
curl http://localhost:3000/banners?page=1&limit=10
```

**期望结果**:
```json
✅ 返回 200 OK
✅ 返回有效的 JSON 数据
```

---

### 3️⃣ 数据库连接检查

#### 3.1 检查数据库服务

```bash
# 检查 PostgreSQL 是否运行
systemctl status postgresql

# 或检查进程
ps aux | grep postgres

# 测试数据库连接
psql -U postgres -h localhost -d ruizhu_db -c "SELECT 1"
```

**期望结果**:
```
✅ PostgreSQL 服务运行中
✅ 数据库连接成功
✅ 能够执行 SQL 查询
```

#### 3.2 检查数据库中的表

```bash
# 连接数据库
psql -U postgres -h localhost -d ruizhu_db

# 查看所有表
\dt

# 检查 users 表
SELECT COUNT(*) FROM "user";

# 检查 banners 表
SELECT COUNT(*) FROM "banner";

# 退出
\q
```

**期望结果**:
```
✅ 能查看所有表
✅ 数据表结构完整
✅ 有测试数据存在
```

---

### 4️⃣ 外网 API 访问检查

#### 4.1 从本地测试外网 API

```bash
# 测试域名 API
curl -I https://yunjie.online/banners?page=1&limit=10

# 获取具体数据
curl -s https://yunjie.online/banners?page=1&limit=10 | jq .

# 测试认证端点
curl -X POST https://yunjie.online/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

**期望结果**:
```
✅ 返回 200 或 401 (认证失败可接受)
✅ 返回 JSON 格式数据
✅ Nginx/反向代理正常工作
```

#### 4.2 检查 HTTPS/SSL

```bash
# 检查 SSL 证书
curl -vI https://yunjie.online

# 显示详细的 SSL 信息
openssl s_client -connect yunjie.online:443
```

**期望结果**:
```
✅ SSL 证书有效
✅ 证书信息显示正确
✅ 没有警告或错误
```

---

### 5️⃣ Nginx 配置检查

在服务器上：

```bash
# 检查 Nginx 是否运行
systemctl status nginx

# 检查 Nginx 配置文件
cat /etc/nginx/sites-available/yunjie.online
# 或
cat /etc/nginx/conf.d/yunjie.conf

# 测试 Nginx 配置
nginx -t

# 查看 Nginx 日志
tail -50 /var/log/nginx/access.log
tail -50 /var/log/nginx/error.log
```

**期望结果**:
```
✅ Nginx 服务运行中
✅ 配置文件正确
✅ 反向代理指向 localhost:3000
✅ 日志显示正常的请求
```

**示例 Nginx 配置**:
```nginx
server {
    listen 443 ssl http2;
    server_name yunjie.online;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yunjie.online;
    return 301 https://$server_name$request_uri;
}
```

---

### 6️⃣ 前后端集成检查

#### 6.1 检查 Admin 前端连接

```bash
# 在本地运行 Admin
cd admin
npm run dev

# 打开浏览器访问 http://localhost:3001
# 检查浏览器控制台是否有 API 连接错误
```

**期望结果**:
```
✅ Admin 成功加载
✅ 能够获取 banners 数据
✅ 控制台无错误
✅ 可以登录系统
```

#### 6.2 检查小程序连接

```bash
# 在小程序配置中修改 API 基础 URL
// 修改 miniprogram/src/services/auth.ts
const API_BASE_URL = 'https://yunjie.online'

# 在微信开发者工具中运行小程序
# 检查网络请求是否正常
# 查看请求的 URL 和响应
```

**期望结果**:
```
✅ 小程序能访问 API
✅ 网络请求返回正确的数据
✅ 没有跨域错误
✅ 可以成功登录
```

---

### 7️⃣ 性能和资源监控

```bash
# 检查 CPU 使用率
top
# 或
ps aux | head -20

# 检查内存使用
free -h

# 检查磁盘使用
df -h

# 检查 NestAPI 进程的资源占用
ps aux | grep "nest\|node"

# 实时监控
htop  # 需要先安装: apt-get install htop
```

**期望结果**:
```
✅ CPU 使用率 < 80%
✅ 内存使用 < 80% (可用内存充足)
✅ 磁盘使用 < 80%
✅ NestAPI 进程运行正常
```

---

### 8️⃣ 日志和错误检查

#### 8.1 检查应用日志

```bash
# NestAPI 日志目录
ls -la /path/to/nestapi/logs/

# 最近的错误
grep ERROR /path/to/nestapi/logs/app.log | tail -20

# 最近的请求
tail -100 /var/log/nginx/access.log | grep yunjie.online
```

#### 8.2 检查系统日志

```bash
# 检查系统消息
dmesg | tail -20

# 检查 journalctl 日志 (systemd)
journalctl -u nestapi -n 50  # 如果使用 systemd 管理
journalctl -u nginx -n 50
```

---

## 🔍 快速诊断脚本

在服务器上创建并运行此脚本：

**文件**: `/home/admin/health-check.sh`

```bash
#!/bin/bash

echo "=========================================="
echo "Ruizhu Platform - 部署健康检查"
echo "=========================================="
echo ""

# 1. 检查服务器基础信息
echo "1️⃣  服务器基础信息"
echo "hostname: $(hostname)"
echo "ip addr: $(hostname -I)"
echo "os: $(lsb_release -ds)"
echo ""

# 2. 检查 NestAPI 进程
echo "2️⃣  NestAPI 进程状态"
if pgrep -f "nest\|node" > /dev/null; then
    echo "✅ NestAPI 进程运行中"
    ps aux | grep "nest\|node" | grep -v grep | awk '{print "   PID: " $2 ", CPU: " $3 "%, MEM: " $4 "%"}'
else
    echo "❌ NestAPI 进程未运行"
fi
echo ""

# 3. 检查端口占用
echo "3️⃣  端口占用状态"
echo "端口 3000 (NestAPI):"
lsof -i :3000 || echo "  未占用"
echo "端口 80 (HTTP):"
lsof -i :80 || echo "  未占用"
echo "端口 443 (HTTPS):"
lsof -i :443 || echo "  未占用"
echo ""

# 4. 检查数据库连接
echo "4️⃣  数据库连接测试"
psql -U postgres -h localhost -d ruizhu_db -c "SELECT 'Database OK' as status" 2>/dev/null && \
    echo "✅ 数据库连接成功" || echo "❌ 数据库连接失败"
echo ""

# 5. 检查本地 API
echo "5️⃣  本地 API 测试"
curl -s http://localhost:3000/health > /dev/null && \
    echo "✅ API 响应正常" || echo "❌ API 无响应"
echo ""

# 6. 检查资源使用
echo "6️⃣  系统资源使用"
echo "内存使用: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "磁盘使用: $(df -h / | tail -1 | awk '{print $3 "/" $2}')"
echo "平均负载: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

echo "=========================================="
echo "检查完成"
echo "=========================================="
```

运行脚本：
```bash
chmod +x /home/admin/health-check.sh
./health-check.sh
```

---

## 📊 性能基准

| 指标 | 目标 | 方法 |
|------|------|------|
| API 响应时间 | < 200ms | `curl -w "@curl-format.txt" https://yunjie.online/banners` |
| 首屏加载时间 | < 3s | Chrome DevTools |
| 数据库查询时间 | < 100ms | NestAPI 日志中的查询时间 |
| CPU 使用率 | < 30% | `top` 或 `htop` |
| 内存使用率 | < 50% | `free -h` |

---

## 🚨 常见问题排查

### 问题 1: 服务无响应

```bash
# 检查进程
ps aux | grep node

# 查看日志
tail -100 /path/to/nestapi/logs/error.log

# 重启服务
systemctl restart nestapi
# 或使用 PM2
pm2 restart all
```

### 问题 2: 数据库连接错误

```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 测试连接
psql -U postgres -h localhost -d ruizhu_db -c "SELECT 1"

# 查看 PostgreSQL 日志
tail -50 /var/log/postgresql/postgresql.log
```

### 问题 3: HTTPS 证书问题

```bash
# 检查证书过期时间
openssl x509 -in /path/to/cert.pem -text -noout | grep -E "Not Before|Not After"

# 更新证书 (Let's Encrypt)
certbot renew
```

### 问题 4: 跨域错误

```bash
# 检查 Nginx 配置
cat /etc/nginx/conf.d/yunjie.conf

# 确保添加了 CORS 头
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
```

---

## 📈 监控建议

### 1. 设置自动重启

```bash
# 使用 PM2 配置自动重启
pm2 startup
pm2 save

# 或使用 systemd
cat > /etc/systemd/system/nestapi.service <<EOF
[Unit]
Description=Ruizhu NestAPI
After=network.target

[Service]
Type=simple
User=nodejs
ExecStart=/usr/bin/node /path/to/nestapi/dist/main.js
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nestapi
systemctl start nestapi
```

### 2. 添加监控和告警

```bash
# 使用 Prometheus + Grafana
# 或简单的健康检查 cron

# 每5分钟检查一次
*/5 * * * * curl -f https://yunjie.online/health || systemctl restart nestapi
```

### 3. 日志聚合

```bash
# 使用 ELK Stack 或 Datadog
# 或简单的日志轮转
logrotate /etc/logrotate.d/nestapi
```

---

## ✅ 完成检查清单

- [ ] 服务器基本连通性测试
- [ ] NestAPI 进程正常运行
- [ ] 数据库连接成功
- [ ] 外网 API 可访问
- [ ] HTTPS/SSL 证书有效
- [ ] Nginx 配置正确
- [ ] Admin 前端成功连接
- [ ] 小程序成功连接
- [ ] 系统资源使用正常
- [ ] 日志无明显错误
- [ ] 性能指标达成
- [ ] 自动重启机制就位

---

## 📞 需要帮助？

如有问题，请提供：
1. 错误日志内容
2. API 响应信息
3. 服务器资源使用情况
4. 网络拓扑图

---

**最后更新**: 2025-10-29
**检查周期**: 每周一次
**保留期限**: 长期维护
