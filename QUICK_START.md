# 🚀 快速开始 - 5 分钟启动 Ruizhu

完整的快速开始指南，从零到启动所有服务。

---

## ⚡ 最快的方式（自动化）

如果你有时间只有 5 分钟，跟着这个走：

### 1️⃣ 安装 MySQL（2 分钟）

根据你的操作系统选择一条命令运行：

**macOS**:
```bash
bash scripts/install-mysql-mac.sh
```

**Windows** (以管理员身份运行):
```cmd
scripts\install-mysql-windows.bat
```

**Linux**:
```bash
sudo bash scripts/install-mysql-linux.sh
```

### 2️⃣ 初始化数据库（1 分钟）

```bash
node scripts/setup-database.js
```

按照提示输入 MySQL 连接信息即可。

### 3️⃣ 启动所有服务（1 分钟）

```bash
npm start
```

或者根据你的系统：
```bash
./start.sh       # macOS/Linux
start.bat        # Windows
```

---

## ✅ 完成！

访问以下地址查看各个服务：

| 服务 | 地址 | 用途 |
|------|------|------|
| 📱 **前端** | http://localhost:5173 | 用户端应用 |
| ⚙️ **管理后台** | http://localhost:5174 | 管理员端 |
| 🔷 **后端 API** | http://localhost:3000 | API 服务 |
| 📚 **API 文档** | http://localhost:3000/api | Swagger 文档 |

---

## 📋 前置要求

确保你已经安装了：

- ✅ **Node.js 16+** ([下载](https://nodejs.org))
  ```bash
  node --version   # v16.0.0 或更高
  npm --version    # 8.0.0 或更高
  ```

- ✅ **Git** ([下载](https://git-scm.com)) - 可选但推荐

---

## 📂 项目文件结构

```
ruizhu_project/
├── nestapi/              # 后端 API
├── miniprogram/          # 前端小程序
├── admin/                # 管理后台
├── scripts/              # 自动化脚本
│   ├── install-mysql-*.sh/bat
│   ├── setup-database.js
│   └── init-database.sql
├── start.sh              # 启动脚本
├── start.bat
├── start.ps1
├── package.json
├── README.md
├── STARTUP.md            # 详细启动指南
├── MYSQL_SETUP.md        # MySQL 详细指南
└── QUICK_START.md        # 本文件
```

---

## 🔄 详细步骤（如果自动化有问题）

### 步骤 1: MySQL 安装和配置

#### macOS 手动安装
```bash
# 安装 MySQL
brew install mysql

# 启动 MySQL
brew services start mysql

# 安全配置
mysql_secure_installation

# 创建数据库
mysql -u root -p
# 在 MySQL 中执行：
# CREATE DATABASE ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# EXIT;
```

#### Windows 手动安装
1. 下载 [MySQL Installer](https://dev.mysql.com/downloads/windows/installer/)
2. 或使用 [XAMPP](https://www.apachefriends.org/)（最简单）
3. 启动 MySQL 服务
4. 创建数据库

#### Linux 手动安装
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl start mysql

# CentOS/RHEL
sudo yum install -y mysql-server
sudo systemctl start mysqld
```

### 步骤 2: 初始化数据库

```bash
# 进入项目目录
cd /path/to/ruizhu_project

# 运行自动配置脚本
node scripts/setup-database.js

# 或手动导入 SQL
mysql -u root -p < scripts/init-database.sql
```

### 步骤 3: 配置环境变量

#### 后端配置
```bash
cd nestapi
cp .env.example .env

# 编辑 .env，填入你的 MySQL 信息：
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=ruizhu
```

#### 前端配置（可选）
```bash
cd ../miniprogram
cp .env.example .env
```

#### 管理后台配置（可选）
```bash
cd ../admin
cp .env.example .env
```

### 步骤 4: 安装依赖

```bash
# 安装所有项目的依赖
npm run install:all

# 或分别安装
cd nestapi && npm install
cd ../miniprogram && npm install
cd ../admin && npm install
```

### 步骤 5: 启动服务

#### 方式 A: 使用启动脚本（推荐）

从项目根目录运行：

**macOS/Linux**:
```bash
./start.sh
```

**Windows**:
```cmd
start.bat
```

**跨平台**:
```bash
npm start
```

#### 方式 B: 手动启动（分别在不同终端启动）

**终端 1 - 后端 API**:
```bash
cd nestapi
npm run start:dev
```

**终端 2 - 前端小程序**:
```bash
cd miniprogram
npm run dev:h5
```

**终端 3 - 管理后台**:
```bash
cd admin
npm run dev
```

---

## 🌐 访问应用

启动完成后，在浏览器中访问：

### 后端 API
- **地址**: http://localhost:3000
- **API 文档**: http://localhost:3000/api
- **说明**: RESTful API 服务，处理用户认证、商品管理、订单处理等

### 前端小程序（H5 版本）
- **地址**: http://localhost:5173
- **说明**: 用户端应用，用于浏览商品、购物、下单等

### 管理后台
- **地址**: http://localhost:5174
- **说明**: 管理员端应用，用于管理商品、订单、用户等

---

## 🧪 测试连接

确保一切正常运行：

```bash
# 检查后端是否在线
curl http://localhost:3000/api

# 检查前端是否加载
# 在浏览器中打开 http://localhost:5173

# 检查 MySQL 连接
mysql -u root -p -e "USE ruizhu; SHOW TABLES;"
```

---

## 🐛 遇到问题？

### ❌ MySQL 连接失败

```bash
# 检查 MySQL 是否在运行
# macOS
brew services list | grep mysql

# Windows
net start MySQL80

# Linux
sudo systemctl status mysql

# 重启 MySQL
# macOS
brew services restart mysql

# Windows
net stop MySQL80 && net start MySQL80

# Linux
sudo systemctl restart mysql
```

### ❌ 端口被占用

```bash
# 查看哪个进程占用了端口
# macOS/Linux
lsof -i :3000
lsof -i :5173

# Windows
netstat -ano | findstr :3000

# 杀死进程
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

### ❌ npm 依赖问题

```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

### ❌ 其他问题

查看详细文档：
- [MySQL 设置指南](./MYSQL_SETUP.md) - MySQL 安装和配置
- [启动指南](./STARTUP.md) - 启动脚本详细说明
- [脚本说明](./scripts/README.md) - 各个脚本的用法

---

## 📚 项目文档

| 文档 | 描述 |
|------|------|
| [README.md](./README.md) | 项目总体介绍 |
| [STARTUP.md](./STARTUP.md) | 详细启动指南 |
| [MYSQL_SETUP.md](./MYSQL_SETUP.md) | MySQL 安装配置 |
| [scripts/README.md](./scripts/README.md) | 脚本使用说明 |
| [admin/README.md](./admin/README.md) | 管理后台文档 |
| [miniprogram/README.md](./miniprogram/README.md) | 前端文档 |
| [nestapi/README.md](./nestapi/README.md) | 后端文档 |

---

## 🎯 下一步

启动成功后，你可以：

1. **探索 API**
   - 访问 http://localhost:3000/api 查看 Swagger 文档
   - 测试各个 API 端点

2. **开发前端**
   - 编辑 `miniprogram/src` 中的文件
   - 实时热更新查看效果

3. **开发管理后台**
   - 编辑 `admin/src` 中的文件
   - 实时热更新查看效果

4. **开发后端**
   - 编辑 `nestapi/src` 中的文件
   - 自动重载查看效果

---

## 💡 开发提示

### 热重载

所有服务都支持热重载（修改代码后自动重启/更新）：
- 后端：NestJS 自动重载
- 前端：Vite 热更新
- 管理后台：Vite 热更新

### 停止服务

按 `Ctrl+C` 停止所有服务。

### 重新启动

```bash
# 重新启动所有服务
./start.sh  # 或 start.bat / npm start
```

---

## ⚡ 性能提示

- 首次启动会下载和安装依赖，可能需要 3-5 分钟
- 后续启动会快得多（10-30 秒）
- 如果网络慢，可以先运行 `npm run install:all` 提前安装所有依赖

---

## 🔐 安全提示

- ⚠️ 修改 MySQL root 密码（如果是生产环境）
- ⚠️ 不要在代码中提交敏感信息（密钥、密码等）
- ⚠️ 使用 `.env` 文件管理敏感配置
- ⚠️ 定期备份数据库

---

## 📞 获取帮助

如果你遇到问题：

1. 查看本文档的 [遇到问题？](#🐛-遇到问题) 部分
2. 查看详细的 [MYSQL_SETUP.md](./MYSQL_SETUP.md) 和 [STARTUP.md](./STARTUP.md)
3. 检查各项目的 README 文件
4. 创建 GitHub Issue
5. 联系开发团队

---

## 🎉 恭喜！

你已经成功启动了 Ruizhu 电商平台的完整开发环境！

现在你可以开始开发了。祝你编码愉快！🚀

---

**最后更新**: 2024-10-26

**需要帮助？** 查看 [完整文档](./README.md)
