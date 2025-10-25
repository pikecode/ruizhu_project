# Ruizhu E-Commerce Platform

现代化的全栈电商平台，采用微服务架构。包含前端小程序、后端 API 服务和管理后台。

## 📦 项目结构

```
ruizhu_project/
├── miniprogram/          # 前端小程序应用 (UniApp + Vue 3)
│   ├── src/
│   ├── package.json
│   └── README.md
├── nestapi/              # 后端 API 服务 (NestJS + TypeScript)
│   ├── src/
│   ├── package.json
│   └── README.md
├── admin/                # 管理后台 (React + TypeScript)
│   ├── src/
│   ├── package.json
│   └── README.md
├── scripts/              # 启动脚本
│   └── start-all.js
├── start.sh              # macOS/Linux 启动脚本
├── start.bat             # Windows 启动脚本
├── start.ps1             # Windows PowerShell 启动脚本
├── package.json          # 根项目配置
└── README.md             # 本文件
```

## 🚀 快速开始

### 前置要求

- **Node.js 16+** - JavaScript 运行时
- **npm 8+** - Node.js 包管理器
- **MySQL 5.7+** - 数据库服务
- **Git** - 版本控制

### 一键启动

根据你的操作系统，选择对应的启动脚本：

#### macOS / Linux

```bash
./start.sh
```

#### Windows (Batch)

```cmd
start.bat
```

#### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

#### 跨平台 (Node.js)

```bash
npm start
```

### 手动启动

如果你需要分别启动各个服务：

```bash
# Terminal 1 - 后端 API
cd nestapi
npm install
npm run start:dev

# Terminal 2 - 前端小程序
cd miniprogram
npm install
npm run dev:h5

# Terminal 3 - 管理后台
cd admin
npm install
npm run dev
```

## 📋 各项目详情

### 1. NestAPI 后端服务

**路径**: `./nestapi`

**技术栈**:
- NestJS 11
- TypeScript 5.7
- MySQL + TypeORM
- JWT 认证
- Passport.js

**端口**: 3000

**启动**:
```bash
cd nestapi
npm install
npm run start:dev
```

**关键功能**:
- 用户认证和授权
- 用户管理（CRUD）
- 角色和权限管理
- RESTful API 接口

**文档**: 访问 `http://localhost:3000/api` 查看 API 文档

详见: [NestAPI README](./nestapi/README.md)

---

### 2. MiniProgram 前端小程序

**路径**: `./miniprogram`

**技术栈**:
- UniApp 3.0
- Vue 3
- Vite 5
- Sass/SCSS
- 多平台支持（微信小程序、H5、支付宝）

**端口**: 5173 (H5 开发)

**启动**:
```bash
cd miniprogram
npm install
npm run dev:h5        # H5 开发版本
npm run build:h5      # H5 生产版本
npm run dev:mp-weixin # 微信小程序
```

**关键功能**:
- 首页展示和商品推荐
- 商品分类浏览
- 购物袋管理
- 完整的购物流程
- 订单管理
- 用户中心
- 多平台编译

**文档**: 访问 `http://localhost:5173` 查看前端应用

详见: [MiniProgram README](./miniprogram/README.md)

---

### 3. Admin 管理后台

**路径**: `./admin`

**技术栈**:
- React 18
- TypeScript 5.3
- Vite 5
- Zustand 状态管理
- Ant Design 5
- Axios

**端口**: 5173 (需要修改 Vite 配置使用不同端口)

**启动**:
```bash
cd admin
npm install
npm run dev
```

**关键功能**:
- 仪表板（Dashboard）
- 商品管理
- 订单管理
- 用户管理
- 系统设置
- 认证和授权

**文档**: 访问 `http://localhost:5173` 查看管理后台

详见: [Admin README](./admin/README.md)

---

## 🔧 配置指南

### 环境变量设置

#### NestAPI (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ruizhu

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

#### MiniProgram (.env)

```bash
# API URL (used for API calls)
VITE_API_URL=http://localhost:3000/api/v1
```

#### Admin (.env)

```bash
# API URL
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Ruizhu Admin
```

### 数据库设置

1. **创建数据库**:

```sql
CREATE DATABASE ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **运行迁移**（在 nestapi 中）:

```bash
cd nestapi
npm run typeorm migration:run
```

---

## 📊 API 端点概览

### 认证相关
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/profile` - 获取用户资料

### 用户管理
- `GET /api/v1/users` - 获取用户列表
- `GET /api/v1/users/:id` - 获取单个用户
- `POST /api/v1/users` - 创建用户
- `PATCH /api/v1/users/:id` - 更新用户
- `DELETE /api/v1/users/:id` - 删除用户

### 商品管理
- `GET /api/v1/products` - 获取产品列表
- `GET /api/v1/products/:id` - 获取单个产品
- `POST /api/v1/products` - 创建产品
- `PATCH /api/v1/products/:id` - 更新产品
- `DELETE /api/v1/products/:id` - 删除产品

### 订单管理
- `GET /api/v1/orders` - 获取订单列表
- `GET /api/v1/orders/:id` - 获取单个订单
- `POST /api/v1/orders` - 创建订单
- `PATCH /api/v1/orders/:id` - 更新订单状态

---

## 🛠 开发命令

### 全局命令

```bash
# 安装所有项目的依赖
npm run install:all

# 启动所有服务
npm start
npm run start:all

# 构建所有项目
npm run build:backend
npm run build:miniprogram
npm run build:admin

# 代码检查
npm run lint:all
```

### 单个项目命令

```bash
# NestAPI
npm run dev:backend

# MiniProgram
npm run dev:miniprogram

# Admin
npm run dev:admin
```

---

## 🔐 认证和授权

系统使用 **JWT (JSON Web Token)** 进行认证：

1. **登录**: 用户通过 `/auth/login` 获取 token
2. **存储**: Token 保存在 localStorage 中
3. **发送**: 每个 API 请求都在 Authorization header 中携带 token
4. **验证**: 后端使用 Passport.js 验证 token
5. **刷新**: Token 过期时自动刷新

详见各项目的认证实现。

---

## 📱 前端多平台支持

### MiniProgram (UniApp)

支持以下平台编译：

| 平台 | 命令 | 说明 |
|------|------|------|
| H5/Web | `npm run dev:h5` | Web 浏览器版本 |
| 微信小程序 | `npm run dev:mp-weixin` | 微信小程序 |
| 支付宝小程序 | `npm run dev:mp-alipay` | 支付宝小程序 |
| 百度小程序 | `npm run dev:mp-baidu` | 百度小程序 |

---

## 🐛 故障排查

### 端口占用

如果端口已被占用：

```bash
# macOS/Linux - 查看占用进程
lsof -i :3000
lsof -i :5173

# Windows - 查看占用进程
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# 杀死进程
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows
```

### 依赖问题

```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 数据库连接失败

1. 检查 MySQL 是否运行
2. 验证 `.env` 中的数据库配置
3. 检查用户名和密码是否正确
4. 确保数据库已创建

---

## 📚 项目文档

- [NestAPI 后端文档](./nestapi/README.md)
- [MiniProgram 前端文档](./miniprogram/README.md)
- [Admin 管理后台文档](./admin/README.md)

---

## 🔗 相关链接

- [NestJS 官方文档](https://docs.nestjs.com)
- [Vue 3 官方文档](https://vuejs.org)
- [React 官方文档](https://react.dev)
- [UniApp 官方文档](https://uniapp.dcloud.net.cn)

---

## 📝 许可证

MIT License

---

## 👥 贡献者

- Project Team

---

## 📞 支持

如有任何问题，请创建 Issue 或联系开发团队。

---

**最后更新**: 2024-10-26

**版本**: 1.0.0
