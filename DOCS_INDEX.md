# 项目文档索引

本文档汇总了全部关键文档的位置和用途。删除了所有冗余文档后，项目只保留了 **8 个关键文档**，结构清晰，易于维护。

---

## 快速导航

### 入门必读
- **[README.md](./README.md)** - 项目总览和功能介绍
- **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南（本地开发）

### 部署相关
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 完整的部署架构和步骤
- **[DEPLOY_SCRIPT_README.md](./DEPLOY_SCRIPT_README.md)** - Admin 前端一键部署脚本使用说明
- **[nestapi/deploy/DEPLOY_GUIDE.md](./nestapi/deploy/DEPLOY_GUIDE.md)** - NestAPI 后端一键部署脚本使用说明

### 参考文档
- **[DATABASE_SCHEMA_DESIGN.md](./DATABASE_SCHEMA_DESIGN.md)** - 数据库设计和表结构参考

### 模块文档
- **[admin/README.md](./admin/README.md)** - Admin 前端项目文档
- **[nestapi/README.md](./nestapi/README.md)** - NestAPI 后端项目文档

---

## 部署流程概览

### 前端部署 (Admin)

```bash
# 编辑代码后，直接执行部署脚本
./deploy-admin.sh prod

# 脚本将自动执行：
# 1. npm install
# 2. npm run build
# 3. 上传到服务器
# 4. 重载 Nginx
# 5. 验证部署
```

更多详情见 [DEPLOY_SCRIPT_README.md](./DEPLOY_SCRIPT_README.md)

### 后端部署 (NestAPI)

```bash
# 编辑代码后，直接执行部署脚本
./nestapi/deploy/auto-deploy.sh

# 脚本将自动执行：
# 1. npm install
# 2. npm run build
# 3. 打包成发布文件
# 4. 上传到服务器
# 5. 运行数据库迁移
# 6. 验证部署
```

更多详情见 [nestapi/deploy/DEPLOY_GUIDE.md](./nestapi/deploy/DEPLOY_GUIDE.md)

---

## 项目结构

```
ruizhu_project/
├── README.md                    # 项目总览
├── QUICK_START.md              # 快速开始
├── DEPLOYMENT_GUIDE.md         # 部署指南
├── DEPLOY_SCRIPT_README.md     # Admin 部署脚本说明
├── DATABASE_SCHEMA_DESIGN.md   # 数据库设计
├── DOCS_INDEX.md               # 本文件
├── deploy-admin.sh             # Admin 前端部署脚本
│
├── admin/                      # React 前端项目
│   ├── README.md
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
│
├── nestapi/                    # NestJS 后端项目
│   ├── README.md
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── miniprogram/                # 微信小程序项目
    ├── README.md
    ├── src/
    └── package.json
```

---

## 关键概念说明

### Admin 和 NestAPI 的完全独立性

- **Admin (前端)** 是静态文件部署，通过 Nginx 提供服务
  - 更新只需运行 `deploy-admin.sh`
  - 不需要重启后端服务
  - 修改 Nginx 配置后需要 `nginx -s reload`

- **NestAPI (后端)** 是 Node.js 应用，由 PM2 管理
  - 更新需要 `npm run build` 和 `pm2 restart ruizhu-backend`
  - 独立运行在 `localhost:3000`
  - Nginx 通过 `/api/` 路径代理到后端

---

## 常用命令速查

### 本地开发

```bash
# Admin 前端
cd admin
npm install
npm run dev        # http://localhost:5173

# NestAPI 后端
cd nestapi
npm install
npm run start:dev  # http://localhost:3000
```

### 生产部署

```bash
# 部署 Admin 前端
./deploy-admin.sh prod

# 部署 NestAPI 后端
cd nestapi
npm run build
# 上传 dist/ 目录到服务器
# SSH 到服务器: pm2 restart ruizhu-backend
```

### 故障排查

```bash
# 查看 Admin 文件
ls -la /opt/ruizhu-app/admin/

# 查看后端进程
pm2 list

# 查看后端日志
pm2 logs ruizhu-backend --lines 100

# 验证 Nginx 配置
nginx -t

# 重载 Nginx
nginx -s reload
```

---

## 文档删除记录

为了保持项目简洁，已删除以下冗余文档：

### 删除的根目录文档 (24个)
- 诊断报告: DEPLOYMENT_HEALTH_CHECK.md, DETAILED_DEPLOYMENT_DIAGNOSIS.md 等
- 功能指南: BANNER_*.md (4个), PRODUCT_*.md (6个) 等
- 数据库配置: MYSQL_SETUP.md, DATABASE_VERIFICATION_REPORT.md 等
- 其他: ARCHITECTURE_INDEX.md, MIGRATION_GUIDE.md, STARTUP.md 等

### 删除的子目录文档 (7个)
- nestapi: WECHAT_MIGRATION_GUIDE.md, COLLECTIONS_*.md (2个), BANNER_PAGE_TYPE_FIX.md
- admin: MEDIA_UPLOAD_OPTIMIZATION.md

### 删除的完整目录
- miniprogram/ 及其全部 17 个文档

**原因**: 这些文档主要记录了特定功能的实现过程，代码已完成，文档已过时。核心文档已包含必要的参考信息。

---

## 文档维护规则

今后在添加文档前，请考虑：

1. **是否属于核心文档?**
   - 部署流程 ✅
   - 快速开始 ✅
   - 模块 README ✅

2. **是否可以合并到现有文档?**
   - 部署问题 → DEPLOYMENT_GUIDE.md
   - 脚本问题 → DEPLOY_SCRIPT_README.md
   - 模块细节 → admin/README.md 或 nestapi/README.md

3. **避免创建单一功能文档**
   - 功能文档应整合到模块 README
   - 临时诊断文档不应纳入版本控制

---

## 更新日期

- **创建**: 2025-10-30
- **文档清理**: 2025-10-30 (从 55 个文档清理至 8 个)
- **最后更新**: 2025-10-30

---

## 联系方式

项目相关问题，请参考对应文档或查看源代码注释。
