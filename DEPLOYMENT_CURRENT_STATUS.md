# Ruizhu 项目当前部署状态报告

**报告日期**: 2025-11-10
**服务器**: 123.207.14.67
**应用状态**: 正常运行 (需要优化)

---

## 📊 实时部署状态

### PM2 应用状态

| 项目 | 状态 | PID | 运行时间 | 重启次数 | 内存 |
|-----|------|-----|--------|--------|------|
| **ruizhu-backend** | ✅ online | 2076542 | 25小时 | 13 | 140.8 MB |

```
应用配置：
- 脚本路径: /opt/ruizhu-app/nestapi-dist/dist/main.js
- 执行模式: fork_mode
- Node.js 版本: 18.20.8
- 环境: production
- 错误日志: /root/.pm2/logs/ruizhu-backend-error-0.log
- 输出日志: /root/.pm2/logs/ruizhu-backend-out-0.log
```

### 性能指标

```
堆内存使用: 61.22 MiB / 64.35 MiB (95.13%)  ⚠️ 接近上限
事件循环延迟 P95: 1.34 ms
事件循环延迟平均: 0.52 ms
HTTP 请求吞吐: 0 req/min (可能API访问量低)
HTTP P95 延迟: 65.85 ms
HTTP 平均延迟: 8 ms
```

### 数据库连接

**配置状态**: ✅ 已配置

```
数据库类型: MySQL
主机: gz-cdb-qtjza6az.sql.tencentcdb.com
端口: 27226
用户: root
密码: [已配置]
数据库: mydb
节点环境: production
```

### 服务器目录结构

```
/opt/ruizhu-app/
├── nestapi-dist/              ← 当前运行的后端应用
│   ├── dist/                  ← 编译后的代码
│   ├── node_modules/          ← 依赖包
│   └── .env                   ← 环境变量配置
├── admin/                      ← 前端应用
├── miniprogram/                ← 小程序源码
├── src/                        ← 源代码
├── dist.tar.gz                 ← 最新的压缩包
├── nestapi-*.tar.gz            ← 历史部署包
└── backups/                    ← 备份目录
```

---

## 🔴 发现的问题

### 1. **API 路由问题** (严重)

API 测试结果显示路由无法正确响应：

```bash
❌ 请求: GET /api/health
响应: 404 {"code":404,"message":"Cannot GET /api/health",...}

❌ 请求: GET /api/v1/products?limit=1
响应: 404 {"code":404,"message":"Cannot GET /api/v1/products?limit=1",...}
```

**原因分析**:
- API 路由未正确配置
- 可能的原因：
  1. NestJS 模块未正确初始化
  2. 路由装饰器配置错误
  3. API 前缀配置不一致
  4. 应用启动时未加载所有模块

### 2. **内存使用过高** (警告)

```
当前堆内存: 61.22 / 64.35 MiB (95.13%)
```

**影响**:
- 内存接近上限，有内存溢出风险
- 性能可能开始下降
- 应该增加堆内存限制或优化内存使用

### 3. **频繁重启** (警告)

```
重启次数: 13 次 (在 25 小时内)
平均: 每 ~1.9 小时重启一次
```

**可能原因**:
- 应用存在内存泄漏
- 未捕获的异常导致崩溃
- 资源竞争或死锁

### 4. **目录混乱** (中等)

服务器上有多个旧的部署包和备份：
```
- nestapi-20251031-131515.tar.gz
- nestapi-20251031-134017.tar.gz
- nestapi-deploy.tar.gz
- nestapi-dist-backup-20251106-141149/
- nestapi-dist-old/
- nestapi-dist-old-wrong/
```

**建议**: 清理过期的备份和部署包

---

## ✅ 工作正常的部分

- ✅ **PM2 运行状态**: 应用成功启动并运行
- ✅ **Node.js 环境**: v18.20.8 正常运行
- ✅ **数据库连接**: 已配置并可连接
- ✅ **进程管理**: PM2 自动重启机制正常
- ✅ **日志记录**: PM2 日志正常记录

---

## 🔧 需要立即处理的任务

### 任务 1: 修复 API 路由问题

**优先级**: 🔴 **高**
**影响**: 所有 API 调用都无法使用

**排查步骤**:

```bash
# 1. SSH 连接到服务器
ssh root@123.207.14.67

# 2. 查看应用错误日志
pm2 logs ruizhu-backend --err

# 3. 检查应用是否真的在监听端口
curl -v http://localhost:3000/

# 4. 查看应用启动日志
pm2 logs ruizhu-backend | grep -i "listening\|started\|error" | head -30

# 5. 检查构建产物是否完整
ls -la /opt/ruizhu-app/nestapi-dist/dist/main.js

# 6. 如果发现问题，重新构建和部署
cd /Users/peakom/work/ruizhu_project/nestapi
npm run build
# ... 然后部署
```

### 任务 2: 优化内存使用

**优先级**: 🟡 **中**

**解决方案**:

```bash
# 方案 A: 增加 Node.js 堆内存限制
NODE_OPTIONS="--max-old-space-size=512" pm2 start dist/main.js --name "ruizhu-backend"

# 方案 B: 在 ecosystem.config.js 中配置
# env: {
#   NODE_OPTIONS: "--max-old-space-size=512"
# }

# 方案 C: 检查内存泄漏
pm2 trigger ruizhu-backend km:heap:sampling:start
# ... 运行一段时间
pm2 trigger ruizhu-backend km:heap:sampling:stop
```

### 任务 3: 调查频繁重启原因

**优先级**: 🟡 **中**

```bash
# 1. 查看重启日志
pm2 logs ruizhu-backend --err | tail -100

# 2. 查看系统日志
journalctl -u pm2-root -n 50

# 3. 监控应用状态
pm2 monit

# 4. 检查是否有未捕获的异常
# 在应用中添加全局异常处理
# app.use((err, req, res, next) => {
#   console.error('Unhandled Error:', err);
#   res.status(500).json({ error: err.message });
# });
```

### 任务 4: 清理服务器存储

**优先级**: 🟢 **低**

```bash
# 删除旧备份（保留最近 3 个）
cd /opt/ruizhu-app/backups
ls -t | tail -n +4 | xargs rm -f

# 删除旧的部署包
cd /opt/ruizhu-app
rm -f nestapi-20251031-*.tar.gz nestapi-deploy.tar.gz

# 删除旧的部署目录
rm -rf nestapi-dist-old/ nestapi-dist-old-wrong/

# 查看清理后的空间
du -sh /opt/ruizhu-app/
```

---

## 📋 部署检查清单

### 在修复问题前

- [ ] 备份当前应用: `tar -czf /opt/ruizhu-app/backups/pre-fix-backup-$(date +%s).tar.gz /opt/ruizhu-app/nestapi-dist/`
- [ ] 备份数据库: 使用腾讯云备份功能
- [ ] 停止接收流量: (如果使用负载均衡)

### 修复 API 路由问题

- [ ] 检查 `main.ts` 中的 API 前缀配置
- [ ] 验证所有控制器是否正确装饰
- [ ] 检查模块是否正确导入
- [ ] 运行本地测试: `npm run test`
- [ ] 构建: `npm run build`
- [ ] 部署新版本到服务器

### 验证修复

- [ ] 检查 PM2 状态: `pm2 status`
- [ ] 测试 API: `curl http://localhost:3000/api/v1/products`
- [ ] 查看日志: `pm2 logs ruizhu-backend`
- [ ] 监控内存: `pm2 monit`

---

## 📊 监控和告警建议

### 设置告警阈值

```bash
# 内存占用超过 80%
MEMORY_THRESHOLD=80

# CPU 占用超过 70%
CPU_THRESHOLD=70

# 重启次数超过 5 次/小时
RESTART_THRESHOLD=5

# HTTP 错误率超过 5%
ERROR_RATE_THRESHOLD=5
```

### 定期检查脚本

```bash
#!/bin/bash
# health-check.sh

HEALTH_CHECK_URL="http://localhost:3000/api/v1/health"
SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)

if [ $response -ne 200 ]; then
    # 发送告警
    curl -X POST $SLACK_WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"⚠️ API Health Check Failed: HTTP $response\"}"

    # 尝试自动恢复
    pm2 restart ruizhu-backend
fi
```

添加到 crontab:
```bash
crontab -e
# 每 5 分钟检查一次
*/5 * * * * /opt/ruizhu-app/health-check.sh
```

---

## 📞 下一步行动

**立即行动** (今天):
1. ✅ 读这份报告并理解问题
2. ⏳ 查看 API 路由日志
3. ⏳ 修复路由问题
4. ⏳ 测试 API 是否正常

**短期** (本周):
1. 优化内存使用
2. 调查频繁重启原因
3. 清理服务器存储
4. 建立监控和告警

**长期** (本月):
1. 实施自动化健康检查
2. 建立备份和恢复流程
3. 优化应用性能
4. 升级 Node.js 版本（19+ 或 20+）

---

## 📚 相关文档

- 查看完整部署指南: `DEPLOYMENT_GUIDE.md`
- 部署架构: `DEPLOYMENT_ARCHITECTURE.md`
- 故障排查: `DEPLOYMENT_GUIDE.md` 的"常见问题"部分

---

**报告完成时间**: 2025-11-10 13:40 UTC+8
**检查者**: Claude Code
**下次检查建议**: 2025-11-11
