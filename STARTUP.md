# 🚀 Ruizhu 项目启动指南

快速启动 Ruizhu 电商平台的三个核心服务。

## 前置条件

1. **Node.js 16+** 和 **npm 8+**
   ```bash
   node --version  # v16.0.0 或更高
   npm --version   # 8.0.0 或更高
   ```

2. **MySQL 5.7+** 运行中
   ```bash
   # macOS (使用 Homebrew)
   brew services start mysql

   # Windows (使用 XAMPP 或 MySQL Installer)
   # 确保 MySQL 服务正在运行

   # Linux
   sudo service mysql start
   ```

3. **Git** 版本控制（可选）

## ⚡ 一键启动

### 方式 1️⃣: Shell 脚本 (macOS / Linux)

```bash
# 给脚本添加可执行权限（首次运行）
chmod +x start.sh

# 运行启动脚本
./start.sh
```

**功能**:
- ✅ 自动检查项目目录
- ✅ 自动检查和安装依赖
- ✅ 启动三个服务
- ✅ 显示彩色输出和日志

---

### 方式 2️⃣: Batch 脚本 (Windows CMD)

```cmd
# 直接运行
start.bat
```

**功能**:
- ✅ 在三个独立的终端窗口中启动服务
- ✅ 自动安装缺失的依赖
- ✅ 清晰的启动信息

---

### 方式 3️⃣: PowerShell 脚本 (Windows)

```powershell
# 以管理员身份运行 PowerShell，然后执行：
powershell -ExecutionPolicy Bypass -File start.ps1
```

或者直接右键点击 `start.ps1` → 使用 PowerShell 运行

---

### 方式 4️⃣: Node.js 脚本 (跨平台)

```bash
# 使用 npm start 命令
npm start

# 或者
npm run start:all
```

**优点**: 自动检测操作系统，最好的跨平台方案

---

### 方式 5️⃣: 手动启动

如果自动脚本有问题，可以手动在三个不同的终端启动：

```bash
# 终端 1 - 后端 API (端口 3000)
cd nestapi
npm install
npm run start:dev

# 终端 2 - 前端小程序 (端口 5173)
cd miniprogram
npm install
npm run dev:h5

# 终端 3 - 管理后台 (端口 5174)
cd admin
npm install
npm run dev
```

---

## 🌐 访问服务

启动完成后，可以访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| **后端 API** | http://localhost:3000 | RESTful API 服务 |
| **API 文档** | http://localhost:3000/api | Swagger 文档 |
| **前端小程序** | http://localhost:5173 | 用户端应用（H5） |
| **管理后台** | http://localhost:5174 | 管理员端应用 |

---

## 📝 首次使用步骤

1. **数据库设置** (可选，如果需要持久化数据)

   ```bash
   # 连接 MySQL
   mysql -u root -p

   # 创建数据库
   CREATE DATABASE ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   # 退出
   exit
   ```

2. **配置环境变量** (可选)

   ```bash
   # 后端配置
   cd nestapi
   cp .env.example .env
   # 编辑 .env，设置数据库连接信息

   # 前端配置
   cd ../miniprogram
   cp .env.example .env

   # 管理后台配置
   cd ../admin
   cp .env.example .env
   ```

3. **启动服务**

   ```bash
   # 回到项目根目录
   cd ..

   # 使用推荐的启动方式
   ./start.sh    # macOS/Linux
   # 或
   start.bat     # Windows
   # 或
   npm start     # 跨平台
   ```

4. **测试服务**

   - 访问 http://localhost:3000 检查后端
   - 访问 http://localhost:5173 检查前端
   - 访问 http://localhost:5174 检查管理后台

---

## 🛑 停止服务

### 方式 1: Ctrl + C

在启动脚本运行的终端中按 `Ctrl + C` 可以优雅地关闭所有服务。

### 方式 2: 关闭单个服务窗口

如果使用了 `start.bat` 或 `start.ps1`，可以直接关闭相应的终端窗口。

### 方式 3: 手动杀死进程

```bash
# macOS/Linux
lsof -i :3000    # 查看占用 3000 端口的进程
lsof -i :5173    # 查看占用 5173 端口的进程
kill -9 <PID>    # 杀死进程

# Windows CMD
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🐛 常见问题

### ❌ "Permission denied" 错误 (macOS/Linux)

**原因**: 脚本没有可执行权限

**解决方案**:
```bash
chmod +x start.sh
```

---

### ❌ "npm: command not found"

**原因**: Node.js 或 npm 未安装

**解决方案**:
1. 访问 https://nodejs.org
2. 下载并安装 Node.js LTS 版本
3. 验证安装: `node --version` 和 `npm --version`

---

### ❌ "Port 3000 is already in use"

**原因**: 端口被其他应用占用

**解决方案**:
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

或者修改 `.env` 中的端口配置。

---

### ❌ "MySQL connection failed"

**原因**: MySQL 未启动或配置错误

**解决方案**:
1. 启动 MySQL 服务
2. 验证数据库凭证（用户名、密码）
3. 检查 `.env` 中的数据库配置
4. 创建数据库: `CREATE DATABASE ruizhu;`

---

### ❌ "ENOENT: no such file or directory"

**原因**: 项目文件丢失

**解决方案**:
```bash
# 确保在项目根目录
pwd

# 检查项目结构
ls -la

# 如果缺少目录，需要运行
npm run install:all
```

---

## 🔄 重新安装依赖

如果遇到依赖问题，可以重新安装：

```bash
# 安装所有项目的依赖
npm run install:all

# 或者单个项目
cd nestapi && npm install
cd ../miniprogram && npm install
cd ../admin && npm install
```

---

## 📊 项目架构

```
┌─────────────────────────────────────────┐
│     Ruizhu E-Commerce Platform          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Backend  │  │ Frontend │  │ Admin  ││
│  │ NestJS   │  │ UniApp   │  │ React  ││
│  │ Port 3000│  │ Port 5173│  │ Port..││
│  └──────────┘  └──────────┘  └────────┘│
│        │            │            │     │
│        └────────────┼────────────┘     │
│                     │                   │
│                  MySQL                  │
│                  Port 3306              │
└─────────────────────────────────────────┘
```

---

## 📚 更多信息

- 详见项目根目录的 [README.md](./README.md)
- 查看各项目的具体文档：
  - [后端 (NestAPI)](./nestapi/README.md)
  - [前端 (MiniProgram)](./miniprogram/README.md)
  - [管理后台 (Admin)](./admin/README.md)

---

## 💡 开发提示

### 热重载

所有服务都支持热重载（修改代码后自动重启）：
- **后端**: NestJS 自动重载
- **前端**: Vite 热更新
- **管理后台**: Vite 热更新

### 调试

各项目都支持 VS Code 调试：
1. 在 VS Code 中打开项目
2. 安装 Debugger 扩展
3. 在代码中设置断点
4. 按 F5 启动调试

### Git 提交

```bash
# 提交更改（从项目根目录）
git add .
git commit -m "describe your changes"
git push
```

---

## 🆘 需要帮助？

如果遇到问题：

1. 检查 [常见问题](#🐛-常见问题) 部分
2. 查看各项目的日志输出
3. 检查网络连接和防火墙设置
4. 查看各项目的 README.md 文件
5. 创建 Issue 或联系开发团队

---

**祝你开发愉快！** 🎉

最后更新: 2024-10-26
