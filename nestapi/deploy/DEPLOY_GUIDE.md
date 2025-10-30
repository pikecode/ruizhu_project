# 🚀 NestAPI 一键部署指南

## 快速开始

### 最简单的部署方式（推荐）

```bash
# 一键执行：本地构建 → 打包 → 上传 → 服务器部署 → 数据库迁移
./deploy/auto-deploy.sh
```

就这么简单！脚本会自动完成所有步骤。

---

## 详细使用说明

### 1️⃣ 完整部署（最常用）

```bash
./deploy/auto-deploy.sh
```

**执行流程：**
- ✅ 本地构建 TypeScript 代码
- ✅ 打包成发布文件
- ✅ 上传到服务器
- ✅ 服务器端部署（停止应用 → 备份 → 更新 → 启动）
- ✅ 运行数据库迁移
- ✅ 自动验证

**输出示例：**
```
╔════════════════════════════════════════════════════════╗
║         🚀 NestAPI 一键部署脚本                        ║
║         2025-10-29 20:15:30                          ║
╚════════════════════════════════════════════════════════╝

[ℹ️  INFO] 执行: ./deploy/build.sh
[ℹ️  INFO] Node.js 版本: v22.18.0
[ℹ️  INFO] npm 版本: 10.9.3
[✅ SUCCESS] 本地构建完成

[ℹ️  INFO] 执行: ./deploy/package.sh
[✅ SUCCESS] 打包完成: nestapi-20251029-201530.tar.gz

[ℹ️  INFO] 发布文件: nestapi-20251029-201530.tar.gz (324K)
[ℹ️  INFO] 部署目标: 123.207.14.67
```

---

### 2️⃣ 跳过本地构建（只更新已编译代码）

如果你已经运行过构建，只想重新打包和部署：

```bash
./deploy/auto-deploy.sh --skip-build
```

**执行流程：**
- ⏭️ 跳过本地构建
- ✅ 打包成发布文件
- ✅ 上传到服务器
- ✅ 服务器端部署
- ✅ 运行数据库迁移

**使用场景：**
- 代码没有改变，只想部署一个新版本
- 减少部署时间

---

### 3️⃣ 跳过打包（使用最新的发布包）

如果你有现成的发布包，直接部署：

```bash
./deploy/auto-deploy.sh --skip-pack
```

**执行流程：**
- ⏭️ 跳过本地构建
- ⏭️ 跳过打包（使用 deploy/releases/ 中最新的包）
- ✅ 上传到服务器
- ✅ 服务器端部署
- ✅ 运行数据库迁移

**使用场景：**
- 部署多次相同的版本
- 紧急重新部署（问题回滚）

---

### 4️⃣ 测试模式（演练部署流程但不实际部署）

```bash
./deploy/auto-deploy.sh --dry-run
```

**执行流程：**
- 显示所有步骤
- ⏭️ 不执行实际的构建、打包、上传
- 用于检查部署流程是否正确

**使用场景：**
- 验证配置是否正确
- 学习部署流程
- 测试权限和连接

---

## 分步部署（高级用法）

如果你想分步执行，可以逐个运行脚本：

### 步骤 1: 本地构建

```bash
./deploy/build.sh
```

输出：`dist/` 文件夹（1.5M，包含编译后的代码）

### 步骤 2: 打包

```bash
./deploy/package.sh
```

输出：`deploy/releases/nestapi-YYYYMMDD-HHMMSS.tar.gz`

### 步骤 3: 部署

```bash
./deploy/deploy.sh
```

**然后在服务器上运行：**

```bash
ssh root@123.207.14.67

cd /opt/ruizhu-app/nestapi-dist

npm run typeorm migration:run
```

---

## 部署配置

编辑 `deploy/auto-deploy.sh` 中的配置：

```bash
# 第 26-30 行
REMOTE_HOST="123.207.14.67"           # 服务器 IP
REMOTE_USER="root"                    # SSH 用户
REMOTE_PASSWORD="Pp123456"            # SSH 密码
REMOTE_APP_DIR="/opt/ruizhu-app/nestapi-dist"  # 应用目录
REMOTE_BACKUP_DIR="/opt/ruizhu-app/backups"    # 备份目录
```

---

## 实时监控部署

### 查看部署进度

```bash
# 实时查看部署日志
sshpass -p "Pp123456" ssh root@123.207.14.67 pm2 logs ruizhu-backend
```

### 检查部署状态

```bash
# 查看应用是否运行
sshpass -p "Pp123456" ssh root@123.207.14.67 pm2 list

# 测试 API 是否可访问
curl https://yunjie.online/api/docs

# 查看数据库迁移状态
sshpass -p "Pp123456" ssh root@123.207.14.67 \
  "cd /opt/ruizhu-app/nestapi-dist && npm run typeorm migration:show"
```

---

## 常见问题

### Q: 部署失败了怎么办？

**A:** 使用最新的备份恢复：

```bash
ssh root@123.207.14.67

# 查看备份
ls -lh /opt/ruizhu-app/backups/

# 恢复最新备份
cd /opt/ruizhu-app/backups
LATEST_BACKUP=$(ls -t nestapi-backup-*.tar.gz | head -1)
tar -xzf $LATEST_BACKUP -C /opt/ruizhu-app/nestapi-dist

# 重启应用
pm2 restart ruizhu-backend
```

### Q: 如何跳过迁移只部署代码？

**A:** 修改 `auto-deploy.sh`，注释掉阶段 6:

```bash
# 注释掉以下代码块（约第 280 行）
# log_step "阶段 6️⃣ : 数据库迁移"
# ...
```

### Q: 如何查看部署的版本？

**A:**

```bash
ssh root@123.207.14.67

# 查看版本信息
cat /opt/ruizhu-app/nestapi-dist/VERSION

# 查看部署时间
ls -l /opt/ruizhu-app/backups/ | head -5
```

### Q: 部署时间需要多久？

**A:**
- 完整部署：5-10 分钟（取决于网络和服务器性能）
- 跳过构建：2-3 分钟
- 跳过打包：1-2 分钟

---

## 部署前检查清单

在运行部署前，确保：

- [ ] 本地代码已提交到 git
- [ ] `.env` 文件已正确配置（包含 `WECHAT_MCH_ID` 等）
- [ ] 可以通过 SSH 连接到服务器
- [ ] 服务器上有足够的磁盘空间
- [ ] 数据库连接正常
- [ ] PM2 在服务器上已安装

---

## 部署后验证

```bash
# 1. 检查应用状态
sshpass -p "Pp123456" ssh root@123.207.14.67 pm2 status

# 2. 检查数据库表
sshpass -p "Pp123456" ssh root@123.207.14.67 \
  "mysql -h localhost -u root -p your_password your_database -e 'SHOW TABLES LIKE \"wechat_%\";'"

# 3. 测试 WeChat 支付 API
curl -X POST https://yunjie.online/api/wechat/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"openid": "test", "totalFee": 100}'

# 4. 测试 WeChat 通知 API
curl -X POST https://yunjie.online/api/wechat/notification/send-subscribe \
  -H "Content-Type: application/json" \
  -d '{"openid": "test", "templateId": "xxx"}'
```

---

## 部署流程图

```
┌─────────────────────────────────────────┐
│   运行 auto-deploy.sh                   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   阶段 1: 本地构建                      │
│   (build.sh - npm run build)            │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   阶段 2: 本地打包                      │
│   (package.sh - tar -czf)               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   阶段 3: 部署前检查                    │
│   确认发布文件、大小、目标              │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   阶段 4: 上传发布包                    │
│   (scp 上传到 /tmp/)                    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   阶段 5: 服务器端部署                  │
│   停止 → 备份 → 解压 → 更新 → 启动     │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   阶段 6: 数据库迁移                    │
│   (npm run typeorm migration:run)       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   ✨ 部署完成！                          │
└─────────────────────────────────────────┘
```

---

## 快速命令参考

```bash
# 完整部署
./deploy/auto-deploy.sh

# 跳过构建（只打包和部署）
./deploy/auto-deploy.sh --skip-build

# 跳过打包（使用现有包）
./deploy/auto-deploy.sh --skip-pack

# 测试部署流程（不实际执行）
./deploy/auto-deploy.sh --dry-run

# 查看部署日志
sshpass -p "Pp123456" ssh root@123.207.14.67 pm2 logs ruizhu-backend

# 重启应用
sshpass -p "Pp123456" ssh root@123.207.14.67 pm2 restart ruizhu-backend

# 回滚备份
sshpass -p "Pp123456" ssh root@123.207.14.67 \
  "tar -xzf /opt/ruizhu-app/backups/nestapi-backup-*.tar.gz \
   -C /opt/ruizhu-app/nestapi-dist && pm2 restart ruizhu-backend"
```

---

## 需要帮助？

如果部署出现问题，参考以下文档：

- `WECHAT_MIGRATION_GUIDE.md` - 数据库迁移详细说明
- `deploy/build.sh` - 本地构建脚本详情
- `deploy/package.sh` - 打包脚本详情
- `deploy/deploy.sh` - 部署脚本详情

---

**最后更新：2025-10-29**
**作者：Claude Code**
