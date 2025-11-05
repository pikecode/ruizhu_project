# NestAPI 部署策略 - 方案 A

**选择时间**: 2025-10-31
**推荐方案**: 方案 A（服务器上 npm install）
**状态**: 生产环境已验证

## 概述

Ruizhu 项目采用**方案 A** 的 NestAPI 部署策略，该方案已在生产环境成功验证。

---

## 方案 A: 服务器上 npm install

### 架构图

```
本地开发环境（macOS）
│
├─ npm run build
│  └─ TypeScript → dist/
│
└─ 打包为 tar.gz
   ├─ dist/
   ├─ package.json
   └─ package-lock.json
   (不包含 node_modules)
   │
   └─> 上传到服务器
       │
       ├─ 解包 tar.gz
       ├─ npm install --production --legacy-peer-deps
       │  └─ 在 Linux 上编译本地二进制文件
       │     (bcrypt, sqlite3, node-gyp 等)
       │
       ├─ PM2 启动应用
       │  └─ ecosystem.config.js
       │     - 入口: ./dist/main.js
       │     - cwd: /opt/ruizhu-app/nestapi-dist
       │
       └─ Nginx 反向代理
          └─ 监听 127.0.0.1:3000
```

### 工作流

```
步骤 1️⃣  本地构建（npm run build）
         时间: ~30秒
         输出: dist/ (~9.4MB)

步骤 2️⃣  打包为 tar.gz
         包含: dist/ + package.json + package-lock.json
         大小: ~50-100MB
         (node_modules 不包含)

步骤 3️⃣  上传到服务器
         目标: /opt/ruizhu-app/nestapi-20251031-134017.tar.gz

步骤 4️⃣  服务器上解包
         $ tar -xzf nestapi-20251031-134017.tar.gz -C nestapi-dist/

步骤 5️⃣  服务器上 npm install
         $ cd /opt/ruizhu-app/nestapi-dist
         $ npm install --production --legacy-peer-deps

         时间: ~2-3分钟
         输出: node_modules/ (~500MB)

         关键: 本地二进制文件在 Linux 上编译
         例如:
         - bcrypt: 需要 node-gyp
         - sqlite3: 需要 build-essential
         - 其他 native modules

步骤 6️⃣  PM2 启动应用
         $ pm2 start ecosystem.config.js

         配置:
         - script: ./dist/main.js
         - cwd: /opt/ruizhu-app/nestapi-dist
         - exec_mode: fork
         - instances: 1
         - max_memory_restart: 512M

步骤 7️⃣  验证部署
         $ pm2 list              # 检查进程状态 → online
         $ ss -tlnp | grep 3000  # 检查端口监听
         $ curl http://localhost:3000/api/docs  # 测试 API
```

---

## 为什么选择方案 A?

### ✅ 优点

| 优点 | 解释 |
|------|------|
| **OS 兼容性** | 本地二进制文件在目标 OS（Linux）编译，避免平台差异问题 |
| **包体积小** | 50-100MB vs 500MB+（无需上传 node_modules） |
| **更新快速** | 仅需上传 dist/ 更新，不涉及 node_modules |
| **安全性高** | 避免在开发机上编译的二进制被用在生产环境 |
| **已验证** | 生产环境已成功运行，包括 WeChat 支付模块 |
| **标准做法** | Node.js 生产部署的业界推荐方案 |
| **容易回滚** | 备份旧版本，快速恢复 |

### ❌ 其他方案的问题

**方案 B（包含 node_modules）**:
- ❌ 包体积巨大（500MB+）
- ❌ 上传时间长（取决于网络）
- ❌ macOS 二进制无法在 Linux 运行
- ❌ 需要在 Docker 中编译才能保证兼容性
- ❌ 每次部署都要上传 node_modules

---

## 生产环境验证

### 已部署的功能模块

```
✅ 13 个模块已部署:
├─ products        ✅ 产品管理
├─ categories      ✅ 分类管理
├─ checkout        ✅ 结账流程（含 @Optional() 装饰器）
├─ orders          ✅ 订单管理
├─ wechat          ✅ WeChat 集成（支付、认证）
├─ auth            ✅ 身份认证
├─ cart            ✅ 购物车
├─ addresses       ✅ 地址管理
├─ banners         ✅ 横幅管理
├─ users           ✅ 用户管理
├─ media           ✅ 媒体处理（新增）
├─ config          ✅ 配置模块
└─ health          ✅ 健康检查
```

### 验证结果（2025-10-31）

```
PM2 进程状态
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ id │ name           │ status  │ memory    │
├────┼────────────────┼─────────┼───────────┤
│ 0  │ ruizhu-backend │ online  │ 11.9 MB   │
└────┴────────────────┴─────────┴───────────┘

✅ 端口监听: 127.0.0.1:3000
✅ API 响应: /api/docs (Swagger UI)
✅ npm 包: 324 packages installed
✅ 构建大小: dist/ 9.4MB
✅ 运行时内存: 11.9MB
```

### Checkout 模块验证

```javascript
// src/modules/checkout/services/checkout.service.ts
import { Optional } from '@nestjs/common';

export class CheckoutService {
  constructor(
    @Optional() private readonly wechatPaymentService: WechatPaymentService,
    // ... other dependencies
  ) {}

  async checkout(userId: number, checkoutDto: CheckoutDto) {
    // 完整的结账流程已实现
    // - 验证地址
    // - 创建订单
    // - 初始化 WeChat 支付
    // - 清空购物车
  }
}
```

✅ **已验证**: @Optional() 装饰器正确编译并在生产环境中运行

---

## 部署步骤

### 快速部署

```bash
# 从项目根目录执行
./deploy/nestapi-deploy.sh
```

实际脚本流程:
```bash
# 调用 nestapi/deploy/auto-deploy.sh
# 该脚本会:
# 1. npm run build (本地)
# 2. 打包为 tar.gz
# 3. 上传到服务器
# 4. 服务器上运行:
#    - tar -xzf
#    - npm install --production --legacy-peer-deps
#    - pm2 restart
```

### 配置要求

**本地环境（macOS）**:
```bash
node --version  # v14+
npm --version   # v6+
```

**生产服务器（Linux）**:
```bash
node --version  # v18+ 推荐
npm --version   # v6+
pm2 -v          # 必需
```

---

## 关键配置文件

### 1. ecosystem.config.js

**位置**: `/opt/ruizhu-app/ecosystem.config.js`
**作用**: PM2 应用启动配置

```javascript
module.exports = {
  apps: [{
    name: 'ruizhu-backend',
    script: './dist/main.js',           // ⚠️ 必须是 dist/main.js
    cwd: '/opt/ruizhu-app/nestapi-dist', // ⚠️ 工作目录
    exec_mode: 'fork',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '512M',
    autorestart: true,
    watch: false,
  }]
};
```

### 2. package.json 构建配置

**位置**: 项目根目录
**关键脚本**:

```json
{
  "scripts": {
    "build": "nest build",  // TypeScript → dist/
    "start": "node dist/main.js",
    "start:dev": "nest start --watch"
  },
  "dependencies": {
    "@nestjs/common": "^11.1.7",
    "@nestjs/core": "^11.1.7",
    "@nestjs/typeorm": "^10.0.2",
    // ... 其他依赖
  }
}
```

### 3. .env 配置

**位置**: `/opt/ruizhu-app/nestapi-dist/.env`
**更新方式**: 使用 config-update.sh

```bash
./deploy/config-update.sh nestapi --restart
```

---

## 常见问题

### Q: 为什么 npm install 必须在服务器上运行?

**A**: 因为某些 npm 包含有本地二进制代码（native modules）：

```
native modules 例子:
├─ bcrypt          # 密码加密（使用 C++）
├─ sqlite3         # 数据库（使用 C++）
├─ node-gyp        # 构建工具（需要编译）
└─ 其他 binding modules

在 macOS 上编译 → macOS 二进制文件
在 Linux 上编译 → Linux 二进制文件

❌ macOS 二进制 ≠ Linux 二进制
✅ 在目标 OS 上编译是必需的
```

### Q: 部署失败，如何调试?

**A**: 检查这些关键步骤：

```bash
# 1. 检查 npm 安装日志
ssh root@123.207.14.67 "cd /opt/ruizhu-app/nestapi-dist && npm list"

# 2. 检查 PM2 进程状态
ssh root@123.207.14.67 "pm2 show ruizhu-backend"

# 3. 检查启动日志
ssh root@123.207.14.67 "pm2 logs ruizhu-backend --lines 50"

# 4. 检查端口监听
ssh root@123.207.14.67 "ss -tlnp | grep 3000"

# 5. 测试 API
curl http://123.207.14.67:3000/api/docs
```

### Q: 如何快速回滚到上一个版本?

**A**: PM2 自动备份：

```bash
# 1. 查看可用备份
ssh root@123.207.14.67 "ls -lh /opt/ruizhu-app/nestapi-dist-backup-*"

# 2. 恢复备份
ssh root@123.207.14.67 << 'EOF'
  pm2 stop ruizhu-backend
  rm -rf /opt/ruizhu-app/nestapi-dist/dist
  cp -r /opt/ruizhu-app/nestapi-dist-backup-YYYYMMDD/dist \
        /opt/ruizhu-app/nestapi-dist/
  pm2 restart ruizhu-backend
EOF
```

### Q: 为什么选择 --legacy-peer-deps?

**A**: 处理 npm 版本不匹配的最安全方式：

```bash
npm install --production --legacy-peer-deps

原因:
- @nestjs/typeorm@10.0.2 需要 @nestjs/common@^8.0.0 || ^9.0.0 || ^10.0.0
- 但我们安装的是 @nestjs/common@^11.1.7
- --legacy-peer-deps 允许不同版本共存（通常是安全的）
```

---

## 性能指标

### 部署时间分布

```
本地构建:          ~30 秒
上传文件:          ~10 秒（50-100MB）
服务器 npm 安装:   ~2-3 分钟
PM2 重启:          ~5 秒
总计:              ~3-4 分钟
```

### 运行时资源

```
内存占用:   ~12 MB (稳定)
CPU 使用:   < 1% (空闲)
启动时间:   ~2 秒
```

---

## 下一步建议

### 1. 监控与告警

```bash
# 设置 PM2 监控
pm2 monitor

# 设置内存溢出重启
pm2 restart ruizhu-backend --max-memory-restart 512M
```

### 2. 日志管理

```bash
# 定期清理 PM2 日志
pm2 flush

# 持久化日志
pm2 install pm2-logrotate
```

### 3. 自动备份

```bash
# 设置 cron 定期备份
0 2 * * * tar -czf /backup/nestapi-$(date +\%Y\%m\%d).tar.gz \
           /opt/ruizhu-app/nestapi-dist-backup-*/
```

---

## 相关文档

- [deploy/README.md](deploy/README.md) - 部署脚本使用指南
- [nestapi/deploy/DEPLOY_GUIDE.md](nestapi/deploy/DEPLOY_GUIDE.md) - NestAPI 详细部署指南
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 完整部署指南
- [README.md](README.md) - 项目总览

---

**最后更新**: 2025-10-31
**验证状态**: ✅ 生产环境已验证
**推荐度**: ⭐⭐⭐⭐⭐
