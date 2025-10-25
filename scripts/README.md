# Scripts Directory

项目启动和配置脚本目录。

## 📁 脚本文件说明

### 1. 项目启动脚本

#### `start-all.js` - Node.js 跨平台启动脚本（推荐）
- **用途**: 同时启动后端、前端、管理后台
- **平台**: Windows、macOS、Linux
- **用法**:
  ```bash
  node start-all.js
  # 或在项目根目录
  npm start
  ```
- **功能**:
  - 自动检测所有项目目录
  - 自动检查和安装依赖
  - 彩色输出日志
  - 进程管理

---

### 2. MySQL 安装脚本

#### `install-mysql-mac.sh` - macOS MySQL 安装脚本
- **用途**: 一键安装 MySQL（Homebrew 方式）
- **平台**: macOS
- **用法**:
  ```bash
  bash install-mysql-mac.sh
  # 或
  chmod +x install-mysql-mac.sh
  ./install-mysql-mac.sh
  ```
- **功能**:
  - 检查 Homebrew 安装
  - 自动安装 MySQL
  - 启动 MySQL 服务
  - 运行安全配置向导
  - 创建 Ruizhu 数据库

---

#### `install-mysql-windows.bat` - Windows MySQL 安装脚本
- **用途**: 一键安装 MySQL（Chocolatey 方式）
- **平台**: Windows
- **用法**:
  1. 右键点击 `install-mysql-windows.bat`
  2. 选择 "以管理员身份运行"

  或在 CMD/PowerShell 中：
  ```cmd
  cd scripts
  install-mysql-windows.bat
  ```
- **功能**:
  - 检查管理员权限
  - 检查 Chocolatey 安装
  - 自动安装 MySQL
  - 启动 MySQL 服务
  - 创建 Ruizhu 数据库

---

#### `install-mysql-linux.sh` - Linux MySQL 安装脚本
- **用途**: 一键安装 MySQL（支持 Ubuntu、Debian、CentOS 等）
- **平台**: Linux (Ubuntu, Debian, CentOS, RHEL, Fedora)
- **用法**:
  ```bash
  sudo bash install-mysql-linux.sh
  # 或
  chmod +x install-mysql-linux.sh
  sudo ./install-mysql-linux.sh
  ```
- **功能**:
  - 自动检测 Linux 发行版
  - 使用对应的包管理器安装
  - 启动 MySQL 服务
  - 设置开机自启
  - 运行安全配置向导
  - 创建 Ruizhu 数据库

---

### 3. 数据库配置脚本

#### `setup-database.js` - 数据库自动配置脚本（推荐）
- **用途**: 自动初始化数据库和配置环境变量
- **平台**: Windows、macOS、Linux
- **用法**:
  ```bash
  node setup-database.js
  # 或在项目根目录
  npm run setup-database  # 需要在 package.json 中添加
  ```
- **功能**:
  - 交互式输入 MySQL 配置
  - 测试数据库连接
  - 创建数据库
  - 初始化所有数据表
  - 插入默认数据（角色、权限）
  - 自动更新 `.env` 文件

---

#### `init-database.sql` - SQL 数据库初始化脚本
- **用途**: 创建数据库表结构和初始数据
- **文件格式**: SQL
- **用法**:
  ```bash
  # 方式 1: 使用 setup-database.js（推荐）
  node setup-database.js

  # 方式 2: 手动执行 SQL
  mysql -u root -p < init-database.sql

  # 方式 3: 在 MySQL 中导入
  mysql> source init-database.sql;
  ```
- **包含内容**:
  - `users` - 用户表
  - `roles` - 角色表
  - `permissions` - 权限表
  - `role_permissions` - 角色权限关系表
  - `products` - 商品表
  - `orders` - 订单表
  - `order_items` - 订单项目表
  - `user_addresses` - 用户地址表

---

## 🚀 快速开始步骤

### 第一步：安装 MySQL

选择你的操作系统运行对应的脚本：

**macOS**:
```bash
bash scripts/install-mysql-mac.sh
```

**Windows**:
```cmd
scripts\install-mysql-windows.bat
```

**Linux**:
```bash
sudo bash scripts/install-mysql-linux.sh
```

### 第二步：初始化数据库

```bash
# 进入项目根目录
cd /path/to/ruizhu_project

# 运行数据库配置脚本
node scripts/setup-database.js

# 按照提示输入 MySQL 连接信息
```

### 第三步：启动所有服务

```bash
# 方式 1: 使用根目录脚本
./start.sh           # macOS/Linux
start.bat            # Windows
npm start            # 跨平台

# 方式 2: 手动启动（分别启动）
cd nestapi && npm run start:dev     # 终端 1
cd miniprogram && npm run dev:h5    # 终端 2
cd admin && npm run dev             # 终端 3
```

---

## 📋 脚本依赖

### install-mysql-*.sh/bat
- **依赖**: 操作系统包管理器
  - macOS: Homebrew
  - Windows: Chocolatey (自动检查，若无会提示安装)
  - Linux: apt-get 或 yum

### setup-database.js
- **依赖**: `mysql2` npm 包
- **安装**:
  ```bash
  npm install mysql2
  ```

### start-all.js
- **依赖**: Node.js 内置模块
- **无额外依赖**

---

## 🔧 高级用法

### 重置数据库

```bash
# 1. 删除现有数据库
mysql -u root -p -e "DROP DATABASE ruizhu;"

# 2. 重新初始化
node scripts/setup-database.js

# 3. 重启后端
cd nestapi && npm run start:dev
```

### 备份数据库

```bash
# 备份到文件
mysqldump -u root -p ruizhu > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库

```bash
# 从备份恢复
mysql -u root -p ruizhu < backup_20240101_120000.sql
```

### 导入自定义 SQL 文件

```bash
# 方式 1: 直接导入
mysql -u root -p ruizhu < custom_data.sql

# 方式 2: 在 MySQL 中导入
mysql> USE ruizhu;
mysql> source custom_data.sql;
```

---

## ⚙️ 环境变量配置

脚本会自动更新以下文件的环境变量：

**`nestapi/.env`**:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ruizhu
```

手动编辑（如脚本更新失败）：
```bash
cd nestapi
cp .env.example .env
# 编辑 .env 文件，填入你的 MySQL 配置
```

---

## 🐛 故障排查

### 脚本权限问题

**macOS/Linux**:
```bash
# 添加执行权限
chmod +x scripts/*.sh scripts/*.js

# 或单个脚本
chmod +x scripts/install-mysql-mac.sh
```

### MySQL 连接失败

1. 确保 MySQL 服务正在运行
2. 检查 MySQL 凭证（用户名、密码）
3. 检查 MySQL 端口（默认 3306）
4. 查看详细错误信息

### 脚本卡住

按 `Ctrl+C` 中断脚本执行

### 需要重新运行脚本

某些脚本（如 `setup-database.js`）是幂等的，可以安全地重新运行。

---

## 📚 相关文档

- [MySQL 设置指南](../MYSQL_SETUP.md)
- [项目启动指南](../STARTUP.md)
- [项目 README](../README.md)

---

## 💡 最佳实践

1. **使用自动化脚本** - 减少手动错误
2. **定期备份** - 保护数据安全
3. **测试连接** - 在启动前验证配置
4. **检查日志** - 遇到问题时查看详细信息
5. **保存凭证** - 安全地保存 MySQL 密码

---

**最后更新**: 2024-10-26

**版本**: 1.0.0
