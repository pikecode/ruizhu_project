# Ruizhu 小程序

基于 uniapp 框架开发的跨平台小程序项目。

## 技术栈

- **框架**: uniapp
- **Vue 版本**: Vue 3
- **构建工具**: Vite
- **语言**: JavaScript

## 项目结构

```
ruizhu-miniprogram/
├── src/                    # 源代码目录
│   ├── pages/             # 页面文件
│   │   ├── index/         # 首页（含轮播图、会员礼遇、商品推荐）
│   │   ├── category/      # 分类页
│   │   ├── gifts/         # VIP私人定制页
│   │   ├── cart/          # 购物袋页
│   │   └── profile/       # 个人中心页
│   ├── static/            # 静态资源
│   │   ├── images/       # 图片
│   │   └── fonts/        # 字体
│   ├── components/        # 组件
│   ├── uni_modules/       # uni_modules 插件
│   ├── utils/            # 工具函数
│   ├── App.vue           # 应用入口
│   ├── main.js           # 主入口文件
│   ├── manifest.json     # 应用配置
│   ├── pages.json        # 页面路由配置
│   └── uni.scss          # 全局样式变量
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 功能特性

### 首页
- ✅ 自定义顶部导航栏（品牌 Logo + 搜索 + 菜单 + 个人中心）
- ✅ 轮播图展示（支持自动播放、无限循环）
- ✅ 会员礼遇卡片区域
- ✅ 精选商品推荐（网格布局）
- ✅ 高端优雅的视觉设计（参考 PRADA 风格）

### 底部导航
- ✅ 首页
- ✅ 分类
- ✅ VIP私人定制
- ✅ 购物袋
- ✅ 我的

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

#### 微信小程序
```bash
npm run dev:mp-weixin
```

编译完成后，打开微信开发者工具，导入 `dist/dev/mp-weixin` 目录即可预览。

#### H5
```bash
npm run dev:h5
```

### 3. 生产构建

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 平台支持

- ✅ 微信小程序
- ✅ H5
- ✅ 支付宝小程序
- ✅ 百度小程序

## 开发说明

1. 页面文件放在 `pages/` 目录下
2. 组件文件放在 `components/` 目录下
3. 静态资源放在 `static/` 目录下
4. 全局样式变量在 `uni.scss` 中定义
5. 页面路由在 `pages.json` 中配置

## License

ISC