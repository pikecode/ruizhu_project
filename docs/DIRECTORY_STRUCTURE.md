# 韵界电商平台 - 文件目录说明文档

## 1. 项目根目录结构

```
ruizhu_project/
├── nestapi/                    # NestJS 后端 API 服务
├── miniprogram/                # UniApp 前端小程序
├── admin/                      # React 管理后台
├── fastapi/                    # FastAPI 后端 (辅助)
├── scripts/                    # 项目脚本
├── deploy/                     # 部署配置
├── docs/                       # 项目文档
├── .spec-workflow/             # 工作流配置
├── package.json                # 根项目配置
├── ecosystem.config.js         # PM2 进程管理配置
├── nginx-yunjie.conf           # Nginx 配置示例
├── README.md                   # 项目说明
└── .gitignore                  # Git 忽略配置
```

---

## 2. 后端服务 (nestapi/)

```
nestapi/
├── src/                        # 源代码目录
│   ├── main.ts                 # 应用入口文件
│   ├── app.module.ts           # 应用主模块
│   │
│   ├── modules/                # 业务模块目录
│   │   ├── products/           # 商品模块
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── dto/            # 数据传输对象
│   │   │
│   │   ├── orders/             # 订单模块
│   │   │   ├── orders.module.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── cart/               # 购物车模块
│   │   ├── checkout/           # 结账模块
│   │   ├── addresses/          # 地址管理模块
│   │   ├── wechat/             # 微信集成模块 (登录/支付)
│   │   ├── banners/            # Banner 管理模块
│   │   ├── collections/        # 商品集合模块
│   │   ├── array-collections/  # 数组集合模块
│   │   ├── categories/         # 分类管理模块
│   │   ├── news/               # 资讯管理模块
│   │   ├── media/              # 媒体文件模块
│   │   ├── consultations/      # 咨询管理模块
│   │   ├── memberships/        # 会员管理模块
│   │   ├── member-benefits/    # 会员礼遇模块
│   │   ├── wishlists/          # 心愿单模块
│   │   ├── authorizations/     # 个人信息授权模块
│   │   ├── regions/            # 地区管理模块
│   │   └── admin-users/        # 管理员用户模块
│   │
│   ├── auth/                   # 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts     # JWT 策略
│   │   └── guards/             # 守卫
│   │
│   ├── users/                  # 用户模块
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── entities/               # TypeORM 实体定义
│   │   ├── user.entity.ts
│   │   ├── product.entity.ts
│   │   ├── order.entity.ts
│   │   ├── cart.entity.ts
│   │   └── ...
│   │
│   ├── database/               # 数据库配置
│   │   └── database.module.ts
│   │
│   ├── common/                 # 公共模块
│   │   ├── decorators/         # 自定义装饰器
│   │   ├── filters/            # 异常过滤器
│   │   ├── interceptors/       # 拦截器
│   │   └── pipes/              # 管道
│   │
│   ├── constants/              # 常量定义
│   │   └── index.ts
│   │
│   └── scripts/                # 脚本工具
│       └── import-regions.ts   # 地区数据导入
│
├── dist/                       # 编译输出目录
├── test/                       # 测试文件
├── migrations/                 # 数据库迁移文件
├── db/                         # 数据库相关
├── data/                       # 数据文件
├── scripts/                    # 部署脚本
├── logs/                       # 日志目录
│
├── .env                        # 环境变量配置
├── .env.example                # 环境变量示例
├── package.json                # 依赖配置
├── package-lock.json           # 依赖锁定
├── tsconfig.json               # TypeScript 配置
├── tsconfig.build.json         # 构建 TS 配置
├── nest-cli.json               # NestJS CLI 配置
└── ormconfig.js                # TypeORM 配置
```

### 2.1 模块说明

| 模块 | 路径 | 功能描述 |
|------|------|----------|
| products | `modules/products/` | 商品 CRUD、库存管理、商品搜索 |
| orders | `modules/orders/` | 订单创建、状态管理、订单查询 |
| cart | `modules/cart/` | 购物车增删改查 |
| checkout | `modules/checkout/` | 结账流程处理 |
| addresses | `modules/addresses/` | 收货地址管理 |
| wechat | `modules/wechat/` | 微信登录、微信支付 |
| banners | `modules/banners/` | 首页轮播图管理 |
| collections | `modules/collections/` | 商品集合管理 |
| categories | `modules/categories/` | 商品分类管理 |
| news | `modules/news/` | 资讯内容管理 |
| media | `modules/media/` | 文件上传、COS 集成 |
| memberships | `modules/memberships/` | 会员信息管理 |
| member-benefits | `modules/member-benefits/` | 会员权益管理 |
| wishlists | `modules/wishlists/` | 收藏/心愿单功能 |
| consultations | `modules/consultations/` | 客户咨询管理 |
| regions | `modules/regions/` | 省市区数据管理 |
| admin-users | `modules/admin-users/` | 后台管理员管理 |

---

## 3. 前端小程序 (miniprogram/)

```
miniprogram/
├── src/                        # 源代码目录
│   ├── main.js                 # 应用入口
│   ├── App.vue                 # 应用根组件
│   ├── pages.json              # 页面配置
│   ├── manifest.json           # 应用配置
│   ├── uni.scss                # 全局样式变量
│   │
│   ├── pages/                  # 页面目录
│   │   ├── index/              # 首页
│   │   │   └── index.vue
│   │   ├── category/           # 分类页
│   │   │   └── index.vue
│   │   ├── cart/               # 购物车页
│   │   │   └── index.vue
│   │   ├── profile/            # 个人中心
│   │   │   └── index.vue
│   │   ├── product/            # 商品详情
│   │   │   └── index.vue
│   │   ├── collection/         # 集合页
│   │   │   └── index.vue
│   │   ├── checkout/           # 结账页
│   │   │   └── index.vue
│   │   ├── orders/             # 订单列表
│   │   │   └── index.vue
│   │   ├── order/              # 订单详情
│   │   │   └── index.vue
│   │   ├── wishlist/           # 心愿单
│   │   │   └── index.vue
│   │   ├── addresses/          # 地址管理
│   │   │   ├── index.vue       # 地址列表
│   │   │   └── edit.vue        # 地址编辑
│   │   ├── consultation/       # 咨询页
│   │   │   └── index.vue
│   │   ├── gifts/              # VIP 私人定制
│   │   │   └── index.vue
│   │   ├── membership/         # 会员页
│   │   │   └── index.vue
│   │   ├── member-recharge/    # 会员充值
│   │   │   └── index.vue
│   │   ├── news/               # 资讯页
│   │   │   ├── index.vue       # 资讯列表
│   │   │   └── detail.vue      # 资讯详情
│   │   ├── payment/            # 支付页
│   │   │   └── index.vue
│   │   ├── auth/               # 认证页
│   │   │   └── index.vue
│   │   ├── legal/              # 法律条款
│   │   │   ├── privacy.vue     # 隐私政策
│   │   │   └── terms.vue       # 用户协议
│   │   └── video-player/       # 视频播放器
│   │       └── index.vue
│   │
│   ├── components/             # 公共组件
│   │   ├── ProductCard.vue     # 商品卡片
│   │   ├── CartItem.vue        # 购物车项
│   │   ├── OrderCard.vue       # 订单卡片
│   │   ├── AddressCard.vue     # 地址卡片
│   │   ├── Banner.vue          # 轮播图
│   │   ├── TabBar.vue          # 底部导航
│   │   └── ...
│   │
│   ├── services/               # API 服务层
│   │   ├── api.ts              # API 基础配置
│   │   ├── auth.ts             # 认证服务
│   │   ├── products.ts         # 商品服务
│   │   ├── cart.ts             # 购物车服务
│   │   ├── orders.ts           # 订单服务
│   │   ├── addresses.ts        # 地址服务
│   │   ├── wechatPayment.ts    # 微信支付服务
│   │   ├── banners.ts          # Banner 服务
│   │   ├── collections.ts      # 集合服务
│   │   ├── news.ts             # 资讯服务
│   │   ├── memberships.ts      # 会员服务
│   │   ├── wishlists.ts        # 心愿单服务
│   │   └── consultations.ts    # 咨询服务
│   │
│   ├── static/                 # 静态资源
│   │   ├── images/             # 图片资源
│   │   ├── icons/              # 图标资源
│   │   └── fonts/              # 字体资源
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── product.d.ts
│   │   ├── order.d.ts
│   │   ├── user.d.ts
│   │   └── ...
│   │
│   └── utils/                  # 工具函数
│       ├── request.ts          # 请求封装
│       ├── storage.ts          # 存储封装
│       └── format.ts           # 格式化工具
│
├── dist/                       # 编译输出
│   └── build/
│       ├── mp-weixin/          # 微信小程序
│       ├── h5/                 # H5 版本
│       └── mp-alipay/          # 支付宝小程序
│
├── docs/                       # 文档
├── scripts/                    # 脚本
│
├── package.json                # 依赖配置
├── package-lock.json           # 依赖锁定
├── yarn.lock                   # Yarn 锁定
├── vite.config.js              # Vite 配置
└── tsconfig.json               # TypeScript 配置
```

### 3.1 页面说明

| 页面 | 路径 | 功能描述 |
|------|------|----------|
| index | `pages/index/` | 首页，展示 Banner、推荐商品 |
| category | `pages/category/` | 商品分类浏览 |
| cart | `pages/cart/` | 购物车管理 |
| profile | `pages/profile/` | 个人中心 |
| product | `pages/product/` | 商品详情展示 |
| checkout | `pages/checkout/` | 订单结算 |
| orders | `pages/orders/` | 订单列表 |
| order | `pages/order/` | 订单详情 |
| addresses | `pages/addresses/` | 收货地址管理 |
| membership | `pages/membership/` | 会员中心 |
| wishlist | `pages/wishlist/` | 收藏列表 |

---

## 4. 管理后台 (admin/)

```
admin/
├── src/                        # 源代码目录
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 应用根组件
│   ├── routes.tsx              # 路由配置
│   ├── vite-env.d.ts           # Vite 类型声明
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Login.tsx           # 登录页
│   │   ├── Dashboard.tsx       # 仪表板
│   │   ├── Products.tsx        # 商品管理
│   │   ├── Orders.tsx          # 订单管理
│   │   ├── Collections.tsx     # 集合管理
│   │   ├── ArrayCollections.tsx # 数组集合管理
│   │   ├── Banners.tsx         # Banner 管理
│   │   ├── News.tsx            # 资讯管理
│   │   ├── Consultations.tsx   # 咨询管理
│   │   ├── MemberBenefits.tsx  # 会员礼遇管理
│   │   ├── Users.tsx           # 管理员用户管理
│   │   ├── ConsumerUsers.tsx   # 消费者用户管理
│   │   ├── Regions.tsx         # 地区管理
│   │   ├── FileManager.tsx     # 文件管理
│   │   └── Settings.tsx        # 系统设置
│   │
│   ├── components/             # 公共组件
│   │   ├── Layout/             # 布局组件
│   │   │   ├── MainLayout.tsx  # 主布局
│   │   │   ├── Sidebar.tsx     # 侧边栏
│   │   │   └── Header.tsx      # 头部
│   │   ├── ProductForm.tsx     # 商品表单
│   │   ├── OrderDetail.tsx     # 订单详情
│   │   ├── ImageUpload.tsx     # 图片上传
│   │   └── ...
│   │
│   ├── services/               # API 服务层
│   │   ├── api.ts              # API 基础配置
│   │   ├── auth.ts             # 认证服务
│   │   ├── products.ts         # 商品服务
│   │   ├── orders.ts           # 订单服务
│   │   ├── banners.ts          # Banner 服务
│   │   ├── collections.ts      # 集合服务
│   │   ├── news.ts             # 资讯服务
│   │   ├── users.ts            # 用户服务
│   │   └── media.ts            # 媒体服务
│   │
│   ├── store/                  # Zustand 状态管理
│   │   ├── authStore.ts        # 认证状态
│   │   └── appStore.ts         # 应用状态
│   │
│   ├── styles/                 # 样式文件
│   │   ├── global.scss         # 全局样式
│   │   ├── variables.scss      # 样式变量
│   │   └── components/         # 组件样式
│   │
│   ├── types/                  # TypeScript 类型
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── utils/                  # 工具函数
│   │   ├── request.ts          # 请求封装
│   │   ├── auth.ts             # 认证工具
│   │   └── format.ts           # 格式化工具
│   │
│   └── constants/              # 常量定义
│       ├── menu.ts             # 菜单配置
│       └── status.ts           # 状态常量
│
├── dist/                       # 编译输出
├── public/                     # 公共资源
│   └── favicon.ico
├── deploy/                     # 部署脚本
│
├── .env                        # 环境变量
├── .env.example                # 环境变量示例
├── .env.production             # 生产环境变量
├── package.json                # 依赖配置
├── package-lock.json           # 依赖锁定
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node TS 配置
└── vite.config.ts              # Vite 配置
```

### 4.1 页面说明

| 页面 | 文件 | 功能描述 |
|------|------|----------|
| Login | `Login.tsx` | 管理员登录 |
| Dashboard | `Dashboard.tsx` | 数据概览仪表板 |
| Products | `Products.tsx` | 商品列表、新增、编辑、删除 |
| Orders | `Orders.tsx` | 订单列表、状态管理 |
| Collections | `Collections.tsx` | 商品集合管理 |
| Banners | `Banners.tsx` | 轮播图管理 |
| News | `News.tsx` | 资讯内容管理 |
| Consultations | `Consultations.tsx` | 客户咨询处理 |
| MemberBenefits | `MemberBenefits.tsx` | 会员权益配置 |
| Users | `Users.tsx` | 管理员账号管理 |
| ConsumerUsers | `ConsumerUsers.tsx` | 消费者用户管理 |
| FileManager | `FileManager.tsx` | 文件/图片管理 |

---

## 5. 脚本目录 (scripts/)

```
scripts/
├── start-all.js                # 启动所有服务
├── setup-database.js           # 数据库初始化
├── deploy-nestapi.sh           # 后端部署脚本
├── install-mysql-ubuntu.sh     # Ubuntu MySQL 安装
├── install-mysql-centos.sh     # CentOS MySQL 安装
└── verify-deployment.sh        # 部署验证脚本
```

---

## 6. 部署目录 (deploy/)

```
deploy/
├── admin-deploy.sh             # 管理后台部署脚本
├── nestapi-deploy.sh           # 后端部署脚本
└── config-update.sh            # 配置更新脚本
```

---

## 7. 文档目录 (docs/)

```
docs/
├── ARCHITECTURE.md             # 系统架构说明
├── DEPLOYMENT.md               # 部署文档
├── DIRECTORY_STRUCTURE.md      # 文件目录说明 (本文档)
├── QUICK_START.md              # 快速开始指南
├── API_DEVELOPMENT_GUIDE.md    # API 开发指南
├── DATABASE_SCHEMA_DESIGN.md   # 数据库设计文档
├── COS_INTEGRATION.md          # 腾讯云 COS 集成
├── WECHAT_PAY_INTEGRATION.md   # 微信支付集成
├── SSL_HTTPS_GUIDE.md          # SSL/HTTPS 配置指南
├── DEPLOY.md                   # 部署说明
└── ADMIN_FRONTEND_GUIDE.md     # 管理后台开发指南
```

---

## 8. 配置文件说明

### 8.1 根目录配置

| 文件 | 用途 |
|------|------|
| `package.json` | 根项目依赖和脚本 |
| `ecosystem.config.js` | PM2 进程管理配置 |
| `nginx-yunjie.conf` | Nginx 配置示例 |
| `.gitignore` | Git 忽略规则 |

### 8.2 后端配置 (nestapi/)

| 文件 | 用途 |
|------|------|
| `.env` | 环境变量 (数据库、密钥等) |
| `package.json` | 依赖和脚本 |
| `tsconfig.json` | TypeScript 编译配置 |
| `nest-cli.json` | NestJS CLI 配置 |
| `ormconfig.js` | TypeORM 数据库配置 |

### 8.3 小程序配置 (miniprogram/)

| 文件 | 用途 |
|------|------|
| `manifest.json` | 应用配置 (AppID、权限等) |
| `pages.json` | 页面路由和导航配置 |
| `package.json` | 依赖和脚本 |
| `vite.config.js` | Vite 构建配置 |
| `uni.scss` | 全局样式变量 |

### 8.4 管理后台配置 (admin/)

| 文件 | 用途 |
|------|------|
| `.env` | 开发环境变量 |
| `.env.production` | 生产环境变量 |
| `package.json` | 依赖和脚本 |
| `tsconfig.json` | TypeScript 配置 |
| `vite.config.ts` | Vite 构建配置 |

---

## 9. 命名规范

### 9.1 文件命名

- **组件文件**: PascalCase (如 `ProductCard.vue`, `OrderDetail.tsx`)
- **服务文件**: camelCase (如 `products.ts`, `auth.ts`)
- **样式文件**: kebab-case (如 `global.scss`, `product-card.scss`)
- **配置文件**: kebab-case (如 `vite.config.ts`, `tsconfig.json`)

### 9.2 目录命名

- **模块目录**: kebab-case (如 `member-benefits/`, `admin-users/`)
- **页面目录**: kebab-case (如 `video-player/`, `member-recharge/`)
- **组件目录**: PascalCase (如 `Layout/`, `ProductForm/`)
