# 📦 Ruizhu 项目 - 依赖安装指南

本指南提供一键安装所有项目依赖的多种方式。

---

## 🚀 快速开始 - 一键安装

### 方式 1: 使用 npm 脚本（推荐）

```bash
npm run install:all
```

**优点**:
- ✅ 跨平台（Windows / macOS / Linux）
- ✅ 无需额外配置
- ✅ 支持 npm、yarn、pnpm
- ✅ 自动错误处理和提示

### 方式 2: 使用 Shell 脚本

#### macOS / Linux

```bash
./install-all.sh
```

#### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File install-all.ps1
```

#### Windows CMD

```cmd
install-all.bat
```

---

## 📋 安装流程说明

一键安装脚本会按以下顺序安装依赖：

```
1️⃣  根项目 (Root Project)
   └─ package.json 依赖

2️⃣  后端服务 (NestAPI Backend)
   └─ nestapi/package.json 依赖

3️⃣  小程序前端 (MiniProgram Frontend)
   └─ miniprogram/package.json 依赖

4️⃣  管理后台 (Admin Dashboard)
   └─ admin/package.json 依赖
```

**预计耗时**: 5-15 分钟（取决于网络速度）

---

## 🔧 单独安装各项目依赖

如果只需要安装某个项目的依赖：

### 安装后端依赖
```bash
npm run install:backend
# 或
cd nestapi && npm install
```

### 安装小程序依赖
```bash
npm run install:miniprogram
# 或
cd miniprogram && npm install
```

### 安装管理后台依赖
```bash
npm run install:admin
# 或
cd admin && npm install
```

---

## 📊 安装后文件结构

成功安装后，项目结构将如下所示：

```
ruizhu_project/
├── node_modules/              ✅ 根项目依赖
├── nestapi/
│   └── node_modules/          ✅ 后端依赖
├── miniprogram/
│   └── node_modules/          ✅ 小程序依赖
├── admin/
│   └── node_modules/          ✅ 管理后台依赖
└── ...
```

检查安装大小：
```bash
# 查看各项目依赖大小
du -sh ./*/node_modules

# 总依赖大小
du -sh node_modules ./*/node_modules
```

---

## ⚠️ 常见问题和解决方案

### 问题 1: 安装卡住或超时

**解决方案**：
```bash
# 清除 npm 缓存
npm cache clean --force

# 改用淘宝镜像（如果在中国）
npm config set registry https://registry.npmmirror.com

# 重新安装
npm run install:all
```

### 问题 2: 权限不足 (Linux/macOS)

**解决方案**：
```bash
# 确保脚本有执行权限
chmod +x install-all.sh

# 运行脚本
./install-all.sh
```

### 问题 3: 某个项目安装失败

**解决方案**：
```bash
# 删除所有 node_modules
rm -rf node_modules nestapi/node_modules miniprogram/node_modules admin/node_modules

# 删除锁文件（可选）
rm -f package-lock.json nestapi/package-lock.json miniprogram/package-lock.json admin/package-lock.json

# 重新安装
npm run install:all
```

### 问题 4: Python 或编译工具缺失

某些依赖需要本地编译，可能需要：

**macOS**:
```bash
# 安装开发工具
xcode-select --install
```

**Windows**:
```bash
# 安装 Visual Studio Build Tools
# 或安装 windows-build-tools
npm install --global windows-build-tools
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install build-essential python3
```

---

## ✅ 验证安装

安装完成后，验证所有依赖是否正确安装：

```bash
# 检查 package.json 是否存在
ls -la nestapi/package.json miniprogram/package.json admin/package.json

# 检查 node_modules 是否存在
ls -la nestapi/node_modules miniprogram/node_modules admin/node_modules

# 验证项目可以运行
npm run dev:backend     # 测试后端
npm run dev:miniprogram # 测试小程序
npm run dev:admin       # 测试管理后台
```

---

## 🔄 更新依赖

在安装完成后，如需更新依赖：

```bash
# 更新所有项目的依赖
npm update

# 更新特定项目
cd nestapi && npm update
cd ../miniprogram && npm update
cd ../admin && npm update
```

---

## 💡 高级选项

### 使用 Yarn 或 PNPM

如果希望使用 Yarn 或 PNPM：

**使用 Yarn**:
```bash
yarn install
cd nestapi && yarn install
cd ../miniprogram && yarn install
cd ../admin && yarn install
```

**使用 PNPM**:
```bash
pnpm install -r  # -r 表示递归安装所有项目
```

### 仅安装生产依赖

```bash
npm ci --only=production
```

### 查看依赖树

```bash
# 查看根项目依赖树
npm ls

# 查看后端依赖树
cd nestapi && npm ls
```

---

## 📱 下一步

安装依赖完成后，可以：

### 1. 初始化数据库

```bash
npm run setup:database
```

### 2. 启动所有服务

```bash
npm start
# 或
npm run start:all
```

### 3. 启动单个服务

```bash
# 启动后端
npm run dev:backend

# 启动小程序
npm run dev:miniprogram

# 启动管理后台
npm run dev:admin
```

### 4. 访问服务

- **后端 API**: http://localhost:3000
- **小程序**: http://localhost:5173
- **管理后台**: http://localhost:5174

---

## 🆘 获取帮助

如果遇到问题：

1. 查看 [QUICK_START.md](./QUICK_START.md) 快速开始指南
2. 查看 [MYSQL_SETUP.md](./MYSQL_SETUP.md) 数据库配置
3. 查看 [README.md](./README.md) 项目文档
4. 检查 npm 官方文档: https://docs.npmjs.com/
5. 提交 Issue: 提供错误日志和系统信息

---

## 📝 脚本说明

### install-all.js (Node.js 脚本)

主要的安装脚本，特性：

- ✅ 并行检查所有项目结构
- ✅ 依次安装各项目依赖
- ✅ 彩色输出和详细日志
- ✅ 自动错误处理和恢复建议
- ✅ 完成后显示使用提示

### install-all.sh (Shell 脚本)

Linux/macOS 启动脚本

### install-all.bat (Batch 脚本)

Windows CMD 启动脚本

### install-all.ps1 (PowerShell 脚本)

Windows PowerShell 启动脚本

---

## 🎯 总结

| 任务 | 命令 |
|------|------|
| 安装所有依赖 | `npm run install:all` |
| 安装后端依赖 | `npm run install:backend` |
| 安装小程序依赖 | `npm run install:miniprogram` |
| 安装管理后台依赖 | `npm run install:admin` |
| 启动所有服务 | `npm start` |
| 启动后端 | `npm run dev:backend` |
| 启动小程序 | `npm run dev:miniprogram` |
| 启动管理后台 | `npm run dev:admin` |
| 设置数据库 | `npm run setup:database` |

---

**祝你使用愉快！🎉**
