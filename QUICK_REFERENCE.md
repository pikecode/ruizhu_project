# 一键部署脚本 - 快速参考

## 常用命令

### 标准部署
```bash
cd nestapi/deploy && ./auto-deploy.sh
```

### 仅重新部署（跳过构建）
```bash
./auto-deploy.sh --skip-build --skip-pack
```

### 部署预检查（不实际部署）
```bash
./auto-deploy.sh --dry-run
```

---

## 关键改进一览

| 改进项 | 解决问题 | 工作原理 |
|-------|---------|--------|
| **npm 自动安装** | 502 Bad Gateway | 部署后自动执行 `npm ci --legacy-peer-deps` |
| **依赖完整性检查** | 部分依赖缺失 | 验证 `node_modules/@nestjs/core` 存在 |
| **健康检查增强** | 无法诊断问题 | HTTP 状态检查 + 故障提示 |
| **部署前验证** | 配置错误 | 检查 `package-lock.json` 存在 |
| **数据库迁移保障** | 迁移失败 | 确保 TypeORM CLI 可用再执行 |

---

## 部署流程图

```
开始
  ↓
┌─────────────────────┐
│ 本地构建 (npm run build)
└─────────────────────┘
  ↓
┌─────────────────────┐
│ 本地打包 (tar.gz)
└─────────────────────┘
  ↓
┌─────────────────────┐
│ 部署前检查 ✨ 改进
├─ 验证 package-lock.json
└─────────────────────┘
  ↓
┌─────────────────────┐
│ 确认部署 (y/n)
└─────────────────────┘
  ↓
┌─────────────────────┐
│ 上传文件到服务器
└─────────────────────┘
  ↓
┌─────────────────────┐
│ 服务器部署 ✨ 改进
├─ 解压文件
├─ 更新配置
├─ npm ci 自动安装 ⭐
├─ 依赖完整性检查 ⭐
├─ PM2 重启
└─ 健康检查 ⭐
  ↓
┌─────────────────────┐
│ 数据库迁移 ✨ 改进
└─────────────────────┘
  ↓
完成
```

---

## 故障排查速查

### 问题：502 Bad Gateway

**检查清单**:
```bash
# 1. SSH 连接到服务器
ssh root@123.207.14.67

# 2. 检查依赖是否存在
ls -la /opt/ruizhu-app/nestapi-dist/node_modules/@nestjs/core

# 3. 若不存在，重新安装
cd /opt/ruizhu-app/nestapi-dist
npm ci --legacy-peer-deps

# 4. 重启应用
pm2 restart ruizhu-backend

# 5. 查看日志
pm2 logs ruizhu-backend --lines 50
```

### 问题：npm 安装超时

**解决**:
```bash
npm ci --legacy-peer-deps \
  --prefer-offline \
  --no-audit \
  --timeout=600000
```

### 问题：部署确认卡住

**解决**: 确保您的终端支持交互输入，或使用:
```bash
echo "y" | ./auto-deploy.sh
```

---

## 日志位置

| 类型 | 路径 | 查看命令 |
|-----|------|---------|
| 部署日志 | `/tmp/deploy.log` | `tail -f /tmp/deploy.log` |
| 应用日志 | PM2 日志 | `pm2 logs ruizhu-backend` |
| 系统日志 | `/var/log/syslog` | `tail -f /var/log/syslog` |
| 备份文件 | `/opt/ruizhu-app/backups/` | `ls -lh` |

---

## 性能指标

部署耗时参考（正常情况）:

| 阶段 | 耗时 |
|-----|-----|
| 构建 | 20-30s |
| 打包 | 10-15s |
| 上传 (328KB) | 2-5s |
| 服务器解压 | 5-10s |
| npm 安装 | 60-120s ⭐ |
| PM2 重启 | 5-10s |
| 数据库迁移 | 0-30s |
| **总计** | **2-4 分钟** |

---

## 环境变量

### 部署脚本配置

```bash
REMOTE_HOST="123.207.14.67"      # 服务器 IP
REMOTE_USER="root"               # SSH 用户
REMOTE_PASSWORD="Pp123456"       # SSH 密码
REMOTE_APP_DIR="/opt/ruizhu-app/nestapi-dist"
```

### 服务器应用配置

位置: `/opt/ruizhu-app/nestapi-dist/.env`

关键变量:
- `NODE_ENV=production`
- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_PASSWORD=***`
- `WECHAT_APP_ID=***`
- `WECHAT_APP_SECRET=***`

---

## npm ci vs npm install

```bash
# ✅ 用于生产环境（部署脚本使用）
npm ci --legacy-peer-deps

# ❌ 不要用于生产环境
npm install

# ✅ 仅在本地开发时使用
npm install
```

---

## 版本管理

### 备份位置
```
/opt/ruizhu-app/backups/
├── nestapi-backup-20251030-172000.tar.gz
├── nestapi-backup-20251029-154530.tar.gz
└── ...
```

### 恢复备份
```bash
# 1. 停止应用
pm2 stop ruizhu-backend

# 2. 解压备份
cd /opt/ruizhu-app
tar -xzf backups/nestapi-backup-20251030-172000.tar.gz

# 3. 重启应用
pm2 restart ruizhu-backend
```

---

## 验证部署成功

```bash
# 1. 检查服务状态
pm2 list | grep ruizhu-backend

# 2. 检查依赖
npm list --depth=0

# 3. 测试 API
curl https://yunjie.online/api/docs

# 4. 查看日志
pm2 logs ruizhu-backend --lines 20
```

---

## 常见错误对照表

| 错误 | 原因 | 解决方案 |
|-----|------|---------|
| "npm: command not found" | npm 未安装 | SSH 到服务器运行部署脚本 |
| "EACCES: permission denied" | 文件权限 | 运行 `chmod 755 auto-deploy.sh` |
| "ERR! peer dep missing" | 依赖冲突 | 脚本已自动处理 `--legacy-peer-deps` |
| "Connection refused on 123.207.14.67" | SSH 连接失败 | 检查 IP、用户名、密码 |
| "tar: gzip: command not found" | gzip 缺失 | 安装: `apt-get install gzip` |

---

## 下一步

- [ ] 学习使用 `--skip-build` 加快部署
- [ ] 配置自动化告警邮件
- [ ] 准备 Docker 容器化方案
- [ ] 测试部署回滚流程

