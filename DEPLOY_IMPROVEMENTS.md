# NestAPI 部署脚本改进总结

## 改进时间
2025-10-30

## 核心问题回顾

### 前期症状
1. 502 Bad Gateway 错误
2. 部署后服务无法启动

### 根本原因
**服务器上 node_modules 目录缺失** - npm 依赖未在部署后安装或验证

## 主要改进

### 1. ✅ npm 依赖自动安装（核心改进）

**位置**: `deploy/auto-deploy.sh` 第 289-317 行

**改进内容**:
```bash
# 自动检查并安装 npm 依赖
if [ -d "node_modules" ]; then
  # 检查关键依赖是否完整
  if [ ! -d "node_modules/@nestjs/core" ]; then
    # 重新安装
    npm ci --legacy-peer-deps
  fi
else
  # 首次安装
  npm ci --legacy-peer-deps
fi

# 验证安装结果
if [ ! -d "node_modules" ]; then
  echo "❌ npm 依赖安装失败"
  exit 1
fi
```

**优势**:
- 自动检测并安装缺失的依赖
- 使用 `npm ci` 确保一致的版本
- 包含关键依赖校验机制
- 失败时提供明确错误日志

---

### 2. ✅ 部署前验证

**位置**: `deploy/auto-deploy.sh` 第 155-159 行

**改进内容**:
```bash
# 验证 package-lock.json 存在
if [ ! -f "$PROJECT_ROOT/nestapi/package-lock.json" ]; then
  log_warning "⚠️  package-lock.json 不存在"
fi
```

**作用**: 提前发现配置问题

---

### 3. ✅ 改进部署后的健康检查

**位置**: `deploy/auto-deploy.sh` 第 327-337 行

**改进内容**:
```bash
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3000/api/docs)

if [ "$HEALTH_CHECK" == "200" ]; then
  echo "✅ 应用已启动并运行正常"
else
  echo "⚠️  应用启动但健康检查返回 HTTP $HEALTH_CHECK"
  echo "可能原因："
  echo "  1. 依赖安装失败"
  echo "  2. 应用启动中"
  echo "  3. 配置文件缺失"
fi
```

**优势**:
- 详细的诊断信息
- 指导用户进行故障排查

---

### 4. ✅ 增强数据库迁移检查

**位置**: `deploy/auto-deploy.sh` 第 362-381 行

**改进内容**:
```bash
# 检查 TypeORM CLI 是否可用（依赖于 npm 安装）
if [ -f "node_modules/.bin/typeorm" ]; then
  npm run typeorm migration:run 2>&1
else
  echo "⚠️  TypeORM CLI 未找到，跳过迁移"
fi
```

**优势**:
- 确保依赖完整再执行迁移
- 避免因缺失依赖导致的失败

---

## 部署流程对比

### 改进前
```
阶段1: 本地构建 ✅
  ↓
阶段2: 本地打包 ✅
  ↓
阶段3: 部署前检查 (基础)
  ↓
阶段4: 上传文件 ✅
  ↓
阶段5: 服务器部署
  ├── 解压文件
  ├── 更新配置
  └── PM2 重启 ❌ (依赖缺失)
  ↓
阶段6: 数据库迁移 (可能失败)
```

### 改进后
```
阶段1: 本地构建 ✅
  ↓
阶段2: 本地打包 ✅
  ↓
阶段3: 部署前检查 ✅ (增强)
  ├── 验证 package-lock.json
  └── 提示依赖安装信息
  ↓
阶段4: 上传文件 ✅
  ↓
阶段5: 服务器部署 ✅
  ├── 解压文件
  ├── 更新配置
  ├── ⭐ 自动安装 npm 依赖
  ├── 验证依赖完整性
  ├── 健康检查
  └── PM2 重启 ✅ (依赖完整)
  ↓
阶段6: 数据库迁移 ✅
  └── (依赖可用，迁移可靠)
```

---

## 使用方式

### 标准部署
```bash
cd nestapi/deploy
./auto-deploy.sh
```

### 跳过构建（仅重新部署）
```bash
./auto-deploy.sh --skip-build
```

### 跳过打包（使用最新包）
```bash
./auto-deploy.sh --skip-pack
```

### 跳过数据库迁移
```bash
./auto-deploy.sh --skip-migration
```

### 测试模式（不实际部署）
```bash
./auto-deploy.sh --dry-run
```

---

## 故障排查

### 如果部署后仍然 502

1. **检查依赖**:
```bash
ssh root@123.207.14.67
cd /opt/ruizhu-app/nestapi-dist
ls -la node_modules/@nestjs/core
```

2. **重新安装依赖**:
```bash
npm ci --legacy-peer-deps
pm2 restart ruizhu-backend
```

3. **查看详细日志**:
```bash
pm2 logs ruizhu-backend --lines 50
```

### 如果 npm 安装超时

脚本会自动重试，如果多次失败：
```bash
sshpass -p "Pp123456" ssh root@123.207.14.67 \
  "cd /opt/ruizhu-app/nestapi-dist && \
   npm ci --legacy-peer-deps --prefer-offline --no-audit"
```

---

## 关键配置详解

### npm ci vs npm install

| 方面 | npm ci | npm install |
|-----|--------|-------------|
| 用途 | 生产环境 | 开发环境 |
| 版本控制 | 严格按 lock 文件 | 可能更新 |
| 一致性 | 100% 一致 | 可能有差异 |
| 性能 | 快 | 较慢 |

### --legacy-peer-deps 标志

用于解决 peer dependency 冲突：
- `@nestjs/typeorm` 依赖特定版本的 `@nestjs/common`
- 此标志告诉 npm 忽略这些冲突（安全的情况下）

---

## 监控和维护

### 定期检查
```bash
# 检查部署历史
ls -lh /opt/ruizhu-app/backups

# 检查当前依赖
npm list --depth=0

# 检查过时的依赖
npm outdated
```

### 自动化建议
考虑添加 cron 任务定期检查依赖：
```bash
# 每周检查一次依赖完整性
0 2 * * 0 cd /opt/ruizhu-app/nestapi-dist && \
  npm ci --legacy-peer-deps 2>&1 | \
  mail -s "NestAPI Dependency Check" admin@example.com
```

---

## 下一步优化建议

### 短期（本周）
- [x] 添加 npm 自动安装
- [x] 增强错误处理
- [ ] 添加部署回滚脚本

### 中期（下月）
- [ ] Docker 容器化（彻底解决依赖问题）
- [ ] 自动化测试流程
- [ ] 部署前代码检查（linting, tests）

### 长期（下季度）
- [ ] 使用 systemd 代替 PM2
- [ ] 蓝绿部署（零停机时间）
- [ ] 自动化监控和告警

---

## 改进清单

- [x] 添加 npm 依赖自动安装
- [x] 完整性检查机制
- [x] 错误诊断信息
- [x] 健康检查增强
- [x] 数据库迁移验证
- [x] 部署前预检查
- [ ] 自动回滚机制
- [ ] 部署监控告警

---

## 版本历史

| 日期 | 版本 | 改进 |
|-----|-----|------|
| 2025-10-30 | 2.0 | 添加 npm 依赖自动安装 |
| 2025-10-29 | 1.1 | 修复 package.sh 目录结构 |
| 2025-10-15 | 1.0 | 初始一键部署脚本 |

---

## 联系和支持

如有问题，请检查：
1. `/tmp/deploy.log` - 部署日志
2. `pm2 logs ruizhu-backend` - 应用日志
3. 服务器系统日志：`/var/log/syslog`
