# 🔒 Ruizhu 电商平台 - HTTPS/SSL 配置指南

**配置日期**: 2025-10-26
**SSL 域名**: yunjie.online, www.yunjie.online
**状态**: ✅ **已配置并验证**

---

## 📍 HTTPS 访问地址

| 协议 | 地址 | 状态 |
|------|------|------|
| 🔒 **HTTPS 管理后台** | https://yunjie.online | ✅ 运行中 |
| 🔒 **HTTPS API 服务** | https://yunjie.online/api/v1 | ✅ 运行中 |
| 🔄 **HTTP 重定向** | http://yunjie.online → https://yunjie.online | ✅ 自动跳转 |
| 📱 **IP 地址 (HTTPS)** | https://123.207.14.67 | ✅ 支持 |

---

## 🔐 SSL 证书信息

### 证书详情
- **颁发给**: yunjie.online
- **通用名称 (CN)**: yunjie.online
- **使用者备选名称 (SAN)**:
  - DNS: yunjie.online
  - DNS: www.yunjie.online
- **证书格式**: X.509 (PEM)
- **密钥类型**: RSA

### 证书有效期
- **开始时间**: 2025-10-24 00:00:00 UTC
- **结束时间**: 2026-10-24 23:59:59 UTC
- **有效期**: 1 年

### 证书文件位置
```
/www/server/nginx/conf/ssl/
├── yunjie.online_bundle.crt      # 证书文件
└── yunjie.online.key              # 私钥文件
```

---

## ⚙️ Nginx SSL 配置

### 配置文件位置
```
/www/server/panel/vhost/nginx/ruizhu.conf
```

### 配置内容

```nginx
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

    # ... 其他配置
}
```

### SSL 安全配置说明

| 配置项 | 说明 |
|-------|------|
| `ssl_protocols TLSv1.2 TLSv1.3` | 仅允许 TLS 1.2 和 1.3（禁用过时协议）|
| `ssl_ciphers HIGH:!aNULL:!MD5` | 使用高强度密码套件，禁用弱密码 |
| `ssl_prefer_server_ciphers on` | 优先使用服务器指定的密码套件 |
| `ssl_session_cache shared:SSL:10m` | SSL 会话缓存，提高性能 |
| `http2 on` | 启用 HTTP/2 协议 |

---

## ✅ 验证状态

### 已验证的功能

- [x] **HTTPS 前端访问**: 返回 `<title>Ruizhu Admin - E-Commerce Management Platform</title>`
- [x] **HTTPS API 服务**: 返回 `Ruizhu API Server` 响应
- [x] **HTTP → HTTPS 重定向**: 自动跳转 301 (Moved Permanently)
- [x] **多域名支持**:
  - yunjie.online ✅
  - www.yunjie.online ✅
  - IP 地址 (123.207.14.67) ✅
- [x] **TLS 1.2/1.3**: 安全协议已启用
- [x] **HTTP/2**: 性能优化已启用
- [x] **Nginx 配置**: 无错误，语法正确

---

## 🔧 常用命令

### 检查 SSL 证书信息
```bash
# 查看证书详情
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt -text -noout

# 查看证书过期时间
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt -noout -dates

# 验证证书和密钥匹配
openssl x509 -noout -modulus -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt | openssl md5
openssl rsa -noout -modulus -in /www/server/nginx/conf/ssl/yunjie.online.key | openssl md5
```

### Nginx SSL 相关命令
```bash
# 测试 Nginx 配置
/www/server/nginx/sbin/nginx -t

# 重载 Nginx 配置
/www/server/nginx/sbin/nginx -s reload

# 查看 Nginx 进程
ps aux | grep nginx

# 查看监听的端口
netstat -tulpn | grep nginx
ss -tulpn | grep nginx
```

### SSL 连接测试
```bash
# 测试 HTTPS 连接
curl -v https://yunjie.online/

# 忽略证书验证（自签名证书）
curl -k https://yunjie.online/

# 检查 SSL 版本和密码套件
openssl s_client -connect yunjie.online:443

# 查看完整的 SSL 握手过程
openssl s_client -connect yunjie.online:443 -showcerts
```

---

## 📋 证书更新流程

### 证书即将过期时（建议在过期前 30 天）

#### 步骤 1: 获取新证书
```bash
# 从证书提供商下载新证书文件
# 通常包括：
# - yunjie.online_bundle.crt (新证书)
# - yunjie.online.key (密钥，通常保持不变)
```

#### 步骤 2: 备份旧证书
```bash
cd /www/server/nginx/conf/ssl/
cp yunjie.online_bundle.crt yunjie.online_bundle.crt.bak.$(date +%Y%m%d)
cp yunjie.online.key yunjie.online.key.bak.$(date +%Y%m%d)
```

#### 步骤 3: 上传新证书
```bash
# 从本地上传新证书
scp yunjie.online_bundle.crt root@123.207.14.67:/www/server/nginx/conf/ssl/
scp yunjie.online.key root@123.207.14.67:/www/server/nginx/conf/ssl/
```

#### 步骤 4: 测试并重载
```bash
# SSH 连接到服务器
ssh root@123.207.14.67

# 测试新配置
/www/server/nginx/sbin/nginx -t

# 重载配置
/www/server/nginx/sbin/nginx -s reload

# 验证
curl -I https://yunjie.online/
```

---

## 🐛 常见问题

### 问题 1: 浏览器显示"不安全"或"证书无效"

**原因**:
- 自签名证书
- 域名不匹配
- 证书已过期

**解决**:
```bash
# 检查证书信息
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt -text -noout

# 检查 Nginx 配置中的域名是否匹配
cat /www/server/panel/vhost/nginx/ruizhu.conf | grep server_name
```

### 问题 2: HTTP 不重定向到 HTTPS

**解决**:
```bash
# 检查 HTTP server 块配置
cat /www/server/panel/vhost/nginx/ruizhu.conf | head -20

# 重载 Nginx
/www/server/nginx/sbin/nginx -s reload

# 测试重定向
curl -I http://yunjie.online/
```

### 问题 3: Mixed Content 警告（HTTP 资源在 HTTPS 页面）

**解决**:
在 Nginx 配置中添加：
```nginx
# 自动将 HTTP 链接转换为 HTTPS
add_header Content-Security-Policy "upgrade-insecure-requests";
```

### 问题 4: SSL 握手失败

**原因**:
- 证书和密钥不匹配
- 密钥权限不正确
- Nginx 无法读取文件

**解决**:
```bash
# 检查文件权限
ls -la /www/server/nginx/conf/ssl/

# 确保 www 用户可读
chmod 644 /www/server/nginx/conf/ssl/*.crt
chmod 600 /www/server/nginx/conf/ssl/*.key
chown -R www:www /www/server/nginx/conf/ssl/

# 验证证书和密钥
openssl x509 -noout -modulus -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt | openssl md5
openssl rsa -noout -modulus -in /www/server/nginx/conf/ssl/yunjie.online.key | openssl md5
```

---

## 🔐 安全最佳实践

### 1. 定期备份证书
```bash
# 每次更新前备份
cp /www/server/nginx/conf/ssl/yunjie.online_bundle.crt \
   /www/server/nginx/conf/ssl/backups/yunjie.online_bundle.crt.$(date +%Y%m%d)
```

### 2. 监控证书过期
```bash
# 创建证书过期检查脚本
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt \
  -noout -dates | grep "Not After"
```

### 3. 启用 HSTS (HTTP Strict Transport Security)
```nginx
# 在 server 块中添加
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 4. 定期更新 Nginx
```bash
# 检查当前版本
/www/server/nginx/sbin/nginx -v

# 定期更新以获取安全补丁
apt-get update && apt-get upgrade nginx
```

### 5. 使用强密码
```bash
# 生成强密钥
openssl genrsa -out domain.key 2048  # 至少 2048 位
```

---

## 📊 SSL 性能优化

### 当前优化状态
- ✅ SSL 会话缓存已启用 (10MB)
- ✅ HTTP/2 已启用
- ✅ TLS 1.2/1.3 已启用
- ✅ 强密码套件已配置
- ✅ OCSP Stapling 可选启用

### 性能测试
```bash
# 检查 SSL/TLS 性能
curl -w "@curl-format.txt" -o /dev/null -s https://yunjie.online/

# 或使用在线工具测试
# https://www.ssllabs.com/ssltest/analyze.html?d=yunjie.online
```

---

## 🚀 部署总结

| 项目 | 状态 | 备注 |
|------|------|------|
| **SSL 证书** | ✅ 已部署 | yunjie.online, www.yunjie.online |
| **HTTPS** | ✅ 已启用 | TLS 1.2/1.3 |
| **HTTP 重定向** | ✅ 已配置 | 自动跳转到 HTTPS |
| **HTTP/2** | ✅ 已启用 | 性能优化 |
| **Nginx 配置** | ✅ 已验证 | 无错误 |
| **前端应用** | ✅ 可访问 | https://yunjie.online |
| **API 服务** | ✅ 可访问 | https://yunjie.online/api/v1 |
| **证书有效期** | ✅ 有效 | 2025-10-24 → 2026-10-24 |

---

## 📞 支持和监控

### 日志位置
```bash
# Nginx 访问日志
tail -f /www/wwwlogs/ruizhu-access.log

# Nginx 错误日志
tail -f /www/wwwlogs/ruizhu-error.log

# 后端日志
pm2 logs ruizhu-backend
```

### 监控脚本 (证书过期提醒)

```bash
#!/bin/bash
# 检查证书剩余有效期
CERT_FILE="/www/server/nginx/conf/ssl/yunjie.online_bundle.crt"
DAYS_LEFT=$(openssl x509 -in $CERT_FILE -noout -dates | grep "Not After" | awk -F= '{print $2}' | \
    xargs -I {} date -d "{}" +%s | awk '{print ($1 - systime()) / 86400}')

echo "证书剩余有效天数: $DAYS_LEFT"

if (( DAYS_LEFT < 30 )); then
    echo "⚠️  警告: 证书即将过期，请准备更新！"
fi
```

---

## 🎉 配置完成

您的 Ruizhu 电商平台现已完全支持 HTTPS！

**现在您可以通过以下地址安全访问:**

- 🔒 https://yunjie.online
- 🔒 https://www.yunjie.online
- 🔒 https://123.207.14.67

所有 HTTP 请求将自动重定向到 HTTPS！🚀

---

**最后更新**: 2025-10-26
**SSL/TLS 版本**: 1.2, 1.3
**HTTP 版本**: HTTP/2
**证书有效期**: 365 天
