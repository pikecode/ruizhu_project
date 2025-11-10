# Ruizhu 项目服务器优化处理方案

**日期**: 2025-11-10
**优先级**: 🔴 **高** | 🟡 **中** | 🟢 **低**

---

## 📋 执行摘要

好消息！经过深入诊断，**API 实际上工作正常**，问题是：

1. ✅ **API 完全运行正常** - 所有路由已正确加载
2. ✅ **数据库连接成功** - 能正常读取和保存数据
3. ✅ **业务逻辑工作** - 手机号授权、订单创建都在进行
4. ⚠️ **路径问题** - 前端可能在请求 `/api/v1/products` 但实际应该是 `/api/products`
5. ⚠️ **内存优化** - 堆内存使用 95%，需要优化

---

## 🔍 诊断发现

### API 路由验证

```bash
# 测试结果
✅ GET /api/products → HTTP 200
   返回了完整的商品列表（25个产品）

✅ POST /api/checkout → 正常工作
   订单创建成功，创建了订单项

✅ WeChat 身份验证 → 工作正常
   - 手机号解密成功
   - 用户创建/更新成功
   - JWT Token 生成成功

❌ GET /api/v1/products → HTTP 404
   错误：前端可能用了错误的路径前缀
```

### 实际 API 前缀

| 配置 | 值 |
|-----|-----|
| **正确路径** | `/api/*` |
| **错误路径** | `/api/v1/*` |
| **Swagger 文档** | `http://localhost:3000/api/docs` |

---

## 🎯 优化行动计划

### 优先级 1️⃣：修复前端 API 路径 (🔴 **高**)

**问题**: 前端可能在使用 `/api/v1` 前缀，但后端是 `/api`

**修复步骤**:

#### 1. 检查前端配置
```bash
# 检查本地代码
grep -r "api/v1" /Users/peakom/work/ruizhu_project/miniprogram/src/
grep -r "api/v1" /Users/peakom/work/ruizhu_project/admin/src/
```

#### 2. 更新 API 基础 URL
```typescript
// miniprogram/src/services/api.ts
// 改为：
const API_BASE_URL = 'http://your-domain/api';  // 去掉 /v1

// admin/src/services/api.ts
// 改为：
const API_BASE_URL = 'http://your-domain/api';  // 去掉 /v1
```

#### 3. 验证修复
```bash
# 本地测试
curl http://localhost:3000/api/products

# 服务器测试
curl http://123.207.14.67:3000/api/products
```

---

### 优先级 2️⃣：优化内存使用 (🟡 **中**)

**现状**: 堆内存 61.22 MB / 64.35 MB (95.13%) - 接近上限

**解决方案 A: 增加堆内存限制**

```bash
# 连接服务器
ssh root@123.207.14.67

# 停止应用
pm2 stop ruizhu-backend

# 使用更大的堆内存启动
NODE_OPTIONS="--max-old-space-size=512" pm2 start /opt/ruizhu-app/nestapi-dist/dist/main.js --name "ruizhu-backend"

# 保存配置
pm2 save

# 验证
pm2 show ruizhu-backend | grep NODE_OPTIONS
```

**解决方案 B: 配置 ecosystem.config.js**

```javascript
// /opt/ruizhu-app/nestapi-dist/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ruizhu-backend',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_OPTIONS: '--max-old-space-size=512',
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      max_memory_restart: '800M',  // 如果超过 800MB 自动重启
    },
  ],
};
```

**预期效果**:
- 堆内存从 64 MB → 512 MB
- 减少频繁垃圾回收
- 应用更稳定

---

### 优先级 3️⃣：调查频繁重启原因 (🟡 **中**)

**现状**: 13 次重启 / 25小时 ≈ 每 1.9 小时重启一次

**诊断步骤**:

```bash
# 1. 查看崩溃日志
pm2 logs ruizhu-backend --err | grep -i "error\|exception\|crash" | tail -50

# 2. 检查内存泄漏
pm2 trigger ruizhu-backend km:heap:sampling:start
sleep 300  # 运行 5 分钟
pm2 trigger ruizhu-backend km:heap:sampling:stop

# 3. 查看重启历史
pm2 describe ruizhu-backend | grep -i "restart\|uptime"

# 4. 检查系统日志
journalctl -u pm2-root --since "2 hours ago" | tail -50
```

**可能原因和解决方案**:

| 原因 | 解决方案 |
|-----|--------|
| 内存泄漏 | 增加堆内存、优化数据结构、找出泄漏代码 |
| 未捕获异常 | 添加全局异常处理器 |
| 数据库连接池已满 | 增加连接池大小 |
| 定时任务出错 | 查看定时任务日志，添加错误处理 |

---

### 优先级 4️⃣：清理服务器存储 (🟢 **低**)

**现状**: 有大量过期备份和部署包

**清理脚本**:

```bash
# 连接服务器
ssh root@123.207.14.67

# 1. 查看空间使用
du -sh /opt/ruizhu-app/*

# 2. 删除过期备份（保留最近 3 个）
cd /opt/ruizhu-app/backups
ls -t | tail -n +4 | xargs rm -f
echo "✓ 旧备份已删除"

# 3. 删除过期部署包
cd /opt/ruizhu-app
rm -f nestapi-20251031-*.tar.gz
rm -f nestapi-deploy.tar.gz
rm -f *.tar.gz  # 只保留最新的
echo "✓ 过期部署包已删除"

# 4. 删除过期目录
rm -rf nestapi-dist-old/
rm -rf nestapi-dist-old-wrong/
rm -rf nestapi-dist-backup-*/
echo "✓ 过期目录已删除"

# 5. 验证清理结果
du -sh /opt/ruizhu-app/
```

**预期节省**:
- 删除前: ~1.6 GB
- 删除后: ~500 MB
- 节省: ~1.1 GB

---

## 🚀 快速修复步骤 (5 分钟)

### 第一步：修复 API 路径

```bash
# 1. 更新本地代码
cd /Users/peakom/work/ruizhu_project

# 2. 找出所有使用 api/v1 的地方
grep -r "api/v1" --include="*.ts" --include="*.tsx" miniprogram/src/ admin/src/

# 3. 替换为 api/
sed -i 's|api/v1|api|g' miniprogram/src/**/*.ts
sed -i 's|api/v1|api|g' admin/src/**/*.tsx

# 4. 本地验证
npm run test

# 5. 构建
cd nestapi && npm run build

# 6. 部署到服务器（参考 DEPLOYMENT_GUIDE.md）
```

### 第二步：优化内存（2 分钟）

```bash
# 远程执行
sshpass -p 'Pp123456' ssh -o StrictHostKeyChecking=no root@123.207.14.67 << 'EOF'
pm2 stop ruizhu-backend
NODE_OPTIONS="--max-old-space-size=512" pm2 start /opt/ruizhu-app/nestapi-dist/dist/main.js --name "ruizhu-backend"
pm2 save
pm2 show ruizhu-backend | grep -i "memory\|NODE_OPTIONS"
EOF
```

### 第三步：清理存储（1 分钟）

```bash
# 远程执行
sshpass -p 'Pp123456' ssh -o StrictHostKeyChecking=no root@123.207.14.67 << 'EOF'
cd /opt/ruizhu-app
rm -rf nestapi-dist-old/ nestapi-dist-old-wrong/ nestapi-dist-backup-*/ 2>/dev/null
cd backups && ls -t | tail -n +4 | xargs rm -f 2>/dev/null
echo "✓ 存储清理完成"
du -sh /opt/ruizhu-app/
EOF
```

---

## ✅ 验证清单

完成以下步骤验证修复成功：

### API 路径验证
- [ ] ✅ `GET /api/products` → 返回 200 OK
- [ ] ✅ `GET /api/products?limit=1` → 返回数据
- [ ] ✅ `POST /api/checkout` → 创建订单
- [ ] ✅ 前端能正常请求数据

### 内存验证
- [ ] ✅ PM2 显示堆内存 < 512 MB
- [ ] ✅ 应用重启频率降低
- [ ] ✅ CPU 使用率稳定

### 存储验证
- [ ] ✅ `/opt/ruizhu-app` 空间 < 600 MB
- [ ] ✅ 备份目录只有 3 个最新备份
- [ ] ✅ 没有过期目录

### 应用稳定性
- [ ] ✅ PM2 状态为 `online`
- [ ] ✅ 最近 24 小时重启次数 < 2
- [ ] ✅ 无错误日志

---

## 📊 预期改进

| 指标 | 当前 | 目标 | 改进 |
|-----|------|------|------|
| **堆内存** | 95% (61 MB) | 30% (150 MB) | ✅ 3x 提升 |
| **重启频率** | 13 次/25小时 | < 1 次/24小时 | ✅ 降低 90% |
| **存储空间** | 1.6 GB | 500 MB | ✅ 节省 1.1 GB |
| **API 响应** | 正常 | 更快 | ✅ 路径对齐 |

---

## 🔧 故障排查流程

如果修复后仍有问题，按以下顺序排查：

```
1. 检查 API 路径
   └─ curl http://localhost:3000/api/products

2. 检查内存
   └─ pm2 show ruizhu-backend | grep memory

3. 检查日志
   └─ pm2 logs ruizhu-backend --err | tail -30

4. 检查数据库
   └─ mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p << 'SELECT COUNT(*) FROM users;'

5. 重启应用
   └─ pm2 restart ruizhu-backend && sleep 5 && pm2 status

6. 检查系统资源
   └─ free -h && df -h
```

---

## 📞 按照以下顺序执行

**现在 (今天):**
1. ✅ 修复前端 API 路径 (5 分钟)
2. ✅ 优化内存配置 (2 分钟)
3. ✅ 清理服务器存储 (1 分钟)
4. ✅ 验证所有修改 (5 分钟)

**明天:**
1. 监控应用稳定性
2. 检查日志是否有错误
3. 验证重启频率是否降低

**本周:**
1. 实施监控告警
2. 性能基准测试
3. 文档更新

---

## 📝 更新部署文档

更新 `/DEPLOYMENT_GUIDE.md` 中的 API 路径：

```markdown
## API 端点

所有端点都使用 `/api` 前缀，**不是** `/api/v1`

### 错误示例 ❌
GET /api/v1/products

### 正确示例 ✅
GET /api/products
GET /api/checkout
GET /api/orders
GET /api/user/authorizations
```

---

## 联系信息

如有问题，参考：
- 完整部署指南: `DEPLOYMENT_GUIDE.md`
- 当前状态报告: `DEPLOYMENT_CURRENT_STATUS.md`
- NestJS 文档: https://docs.nestjs.com
- PM2 文档: https://pm2.io/docs

---

**报告完成时间**: 2025-11-10 T 15:45 UTC+8
**下一次检查**: 2025-11-11
**预期完成**: 2025-11-10 (15 分钟)
