# Ruizhu 电商平台 - 快速参考卡片

## 🔗 访问地址

| 类型 | 地址 |
|------|------|
| **🌐 前端** | https://yunjie.online |
| **🔌 API** | https://yunjie.online/api/v1 |
| **📱 IP 访问** | https://123.207.14.67 |
| **🔄 HTTP 重定向** | http://yunjie.online → https://yunjie.online |

---

## 🖥️ 服务器信息

```
IP: 123.207.14.67
用户: root
密码: Pp123456
系统: OpenCloudOS 9.4
```

---

## 📌 常用命令

### 查看应用状态
```bash
ssh root@123.207.14.67
pm2 list                          # 查看所有进程
pm2 logs ruizhu-backend           # 查看实时日志
systemctl status nginx            # 查看 Nginx 状态
```

### 重启服务
```bash
pm2 restart ruizhu-backend        # 重启后端
systemctl reload nginx            # 重载 Nginx（无停机）
systemctl restart nginx           # 重启 Nginx（有停机）
```

### 查看日志
```bash
pm2 logs ruizhu-backend --lines 50           # 后端日志
tail -f /www/wwwlogs/ruizhu-access.log      # Nginx 访问日志
tail -f /www/wwwlogs/ruizhu-error.log       # Nginx 错误日志
```

---

## 🔐 SSL 证书

| 项目 | 值 |
|------|-----|
| **域名** | yunjie.online, www.yunjie.online |
| **有效期** | 2025-10-24 ~ 2026-10-24 |
| **位置** | /www/server/nginx/conf/ssl/ |
| **类型** | X.509 (PEM) |

### 检查证书
```bash
openssl x509 -in /www/server/nginx/conf/ssl/yunjie.online_bundle.crt -text -noout
```

---

## 📂 关键路径

| 路径 | 用途 |
|------|------|
| `/opt/ruizhu-app/` | 应用部署目录 |
| `/opt/ruizhu-app/admin-dist/` | 前端应用 |
| `/opt/ruizhu-app/nestapi-dist/` | 后端应用 |
| `/www/server/panel/vhost/nginx/ruizhu.conf` | Nginx 配置 |
| `/www/wwwlogs/` | Nginx 日志 |

---

## 🔄 更新流程

### 1️⃣ 本地更新代码
```bash
cd /Users/peak/work/pikecode/ruizhu_project
npm run build
```

### 2️⃣ 上传到服务器
```bash
# 上传后端
scp -r nestapi/dist root@123.207.14.67:/opt/ruizhu-app/

# 上传前端
scp -r admin/dist root@123.207.14.67:/opt/ruizhu-app/
```

### 3️⃣ 重启应用
```bash
ssh root@123.207.14.67
pm2 restart ruizhu-backend
systemctl reload nginx
```

### 4️⃣ 验证
```bash
curl https://yunjie.online/
curl https://yunjie.online/api/v1/
```

---

## ⚡ 性能检查

### 检查进程内存
```bash
pm2 monit
```

### 查看 CPU/内存
```bash
top
ps aux | grep node
```

### 测试 API 响应时间
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://yunjie.online/api/v1/
```

---

## 🆘 故障排查

### 应用无法访问
```bash
pm2 logs ruizhu-backend            # 查看后端错误
curl http://127.0.0.1:3000        # 测试后端
systemctl status nginx             # 检查 Nginx
```

### HTTPS 证书问题
```bash
openssl x509 -in cert.crt -text -noout   # 检查证书信息
openssl x509 -in cert.crt -dates         # 检查有效期
```

### 性能下降
```bash
pm2 monit                          # 监控进程
df -h                              # 检查磁盘
free -h                            # 检查内存
```

---

## 📊 数据库

| 项目 | 值 |
|------|-----|
| **主机** | gz-cdb-qtjza6az.sql.tencentcdb.com |
| **端口** | 27226 |
| **用户** | root |
| **密码** | Pp123456 |
| **数据库** | mydb |
| **表数** | 32 |

### 连接数据库
```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p
```

---

## 📝 文档导航

| 文档 | 内容 |
|------|------|
| **DEPLOYMENT_COMPLETE.md** | 部署完成报告 |
| **SSL_HTTPS_GUIDE.md** | SSL/HTTPS 配置指南 |
| **DEPLOYMENT_FINAL_SUMMARY.md** | 完整部署总结 |
| **QUICK_REFERENCE.md** | 本文档 - 快速参考 |

---

## ✅ 部署检查清单

- [x] 前端应用已部署
- [x] 后端服务已部署
- [x] HTTPS 已配置
- [x] SSL 证书已安装
- [x] PM2 集群已启动
- [x] Nginx 已配置
- [x] 数据库已初始化
- [x] 日志已启用

---

## 🚨 重要提醒

1. **修改密码** - 当前使用默认密码，建议立即修改
2. **证书更新** - 2026 年 10 月需要更新证书
3. **定期备份** - 建议每日备份数据库
4. **日志轮转** - 配置日志轮转避免磁盘满
5. **监控告警** - 建议配置监控告警系统

---

## 🎯 下次行动

1. **立即** - 修改数据库密码和 JWT_SECRET
2. **本周** - 配置数据库自动备份
3. **本月** - 配置监控告警系统
4. **明年** - 更新 SSL 证书

---

## 📞 帮助

遇到问题时：
1. 查看 SSL_HTTPS_GUIDE.md 的故障排查章节
2. 查看 DEPLOYMENT_FINAL_SUMMARY.md 的诊断指南
3. 检查日志文件找出具体错误
4. SSH 连接服务器直接调试

---

**最后更新**: 2025-10-26
**部署状态**: ✅ 生产就绪
**证书有效期**: 365 天
