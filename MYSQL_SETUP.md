# MySQL 安装和配置指南

本指南详细说明如何为 Ruizhu 项目安装和配置 MySQL 数据库。

## 📋 快速选择

选择你的操作系统：

- [macOS 用户 →](#macOS-快速安装)
- [Windows 用户 →](#Windows-快速安装)
- [Linux 用户 →](#Linux-快速安装)

---

## 🍎 macOS 快速安装

### 一键安装（推荐）

```bash
# 进入项目根目录
cd /Users/peak/work/pikecode/ruizhu_project

# 运行 MySQL 安装脚本
bash scripts/install-mysql-mac.sh
```

脚本会自动：
1. ✅ 检查 Homebrew 安装
2. ✅ 安装最新 MySQL
3. ✅ 启动 MySQL 服务
4. ✅ 运行安全配置向导
5. ✅ 创建 Ruizhu 数据库

### 手动安装（如果脚本有问题）

```bash
# 1. 使用 Homebrew 安装 MySQL
brew install mysql

# 2. 启动 MySQL 服务
brew services start mysql

# 3. 运行安全配置
mysql_secure_installation

# 4. 创建数据库
mysql -u root -p -e "CREATE DATABASE ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 验证安装

```bash
# 检查 MySQL 版本
mysql --version

# 检查 MySQL 服务状态
brew services list | grep mysql

# 连接测试
mysql -u root -p
# 输入密码后，看到 mysql> 提示符表示成功
# 退出：EXIT;
```

---

## 🪟 Windows 快速安装

### 一键安装（推荐）

1. **以管理员身份运行 PowerShell 或 CMD**
2. **执行脚本**：
   ```cmd
   cd C:\path\to\ruizhu_project
   scripts\install-mysql-windows.bat
   ```

或使用 PowerShell：
```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-mysql-windows.bat
```

脚本会自动：
1. ✅ 检查管理员权限
2. ✅ 检查 Chocolatey 包管理器
3. ✅ 安装 MySQL
4. ✅ 启动 MySQL 服务
5. ✅ 创建 Ruizhu 数据库

### 备选方案 1: 使用 Chocolatey

```powershell
# 以管理员身份运行 PowerShell
choco install mysql --yes

# 启动 MySQL 服务
net start MySQL80

# 安全配置
mysql_secure_installation
```

### 备选方案 2: 使用 XAMPP（最简单）

1. 下载 [XAMPP](https://www.apachefriends.org/)
2. 运行安装程序
3. 启动 XAMPP 控制面板
4. 点击 MySQL 的 **Start** 按钮
5. 点击 MySQL 的 **Admin** 按钮打开 phpMyAdmin
6. 在 SQL 标签中运行：
   ```sql
   CREATE DATABASE ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 验证安装

```cmd
# 检查 MySQL 版本
mysql --version

# 检查 MySQL 服务状态
net start MySQL80

# 连接测试
mysql -u root -p
```

---

## 🐧 Linux 快速安装

### 一键安装（推荐）

```bash
# 进入项目根目录
cd ~/work/pikecode/ruizhu_project

# 运行 MySQL 安装脚本（需要 sudo）
sudo bash scripts/install-mysql-linux.sh
```

脚本会自动：
1. ✅ 检查 Linux 发行版
2. ✅ 安装相应版本的 MySQL
3. ✅ 启动 MySQL 服务
4. ✅ 设置开机自启
5. ✅ 创建 Ruizhu 数据库

### Ubuntu/Debian 手动安装

```bash
# 更新包列表
sudo apt-get update

# 安装 MySQL Server
sudo apt-get install -y mysql-server

# 启动服务
sudo systemctl start mysql

# 设置开机自启
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation

# 创建数据库
mysql -u root -p -e "CREATE DATABASE ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### CentOS/RHEL 手动安装

```bash
# 安装 MySQL
sudo yum install -y mysql-server

# 启动服务
sudo systemctl start mysqld

# 设置开机自启
sudo systemctl enable mysqld

# 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 安全配置
mysql_secure_installation
```

### 验证安装

```bash
# 检查版本
mysql --version

# 检查服务状态
sudo systemctl status mysql

# 连接测试
mysql -u root -p
```

---

## 🗄️ 初始化数据库

安装 MySQL 后，需要初始化 Ruizhu 数据库结构。

### 自动初始化（推荐）

```bash
# 进入项目根目录
cd /path/to/ruizhu_project

# 运行数据库设置脚本
node scripts/setup-database.js
```

脚本会：
1. ✅ 提示输入 MySQL 连接信息
2. ✅ 测试数据库连接
3. ✅ 创建数据库（如果不存在）
4. ✅ 创建所有数据表
5. ✅ 插入默认数据（角色、权限）
6. ✅ 自动更新 `.env` 文件

### 手动初始化

1. **连接到 MySQL**：
   ```bash
   mysql -u root -p
   ```

2. **运行初始化脚本**：
   ```bash
   source /path/to/scripts/init-database.sql
   ```

   或者直接在 MySQL 中：
   ```bash
   mysql -u root -p < scripts/init-database.sql
   ```

3. **验证**：
   ```sql
   USE ruizhu;
   SHOW TABLES;
   SELECT * FROM roles;
   ```

---

## ⚙️ 配置后端环境

初始化数据库后，需要配置后端连接。

### 1. 创建 .env 文件

```bash
cd nestapi
cp .env.example .env
```

### 2. 编辑 .env 文件

编辑 `nestapi/.env`，填入你的 MySQL 配置：

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ruizhu

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. 安装依赖

```bash
npm install
```

### 4. 测试连接

```bash
npm run start:dev
```

查看控制台输出，确保数据库连接成功。

---

## ✅ 完整检查清单

在启动项目前，确保以下都已完成：

- [ ] MySQL 已安装
- [ ] MySQL 服务正在运行
- [ ] 可以通过命令行连接到 MySQL（`mysql -u root -p`）
- [ ] Ruizhu 数据库已创建
- [ ] 数据表已初始化
- [ ] `nestapi/.env` 文件已配置
- [ ] 数据库凭证正确

---

## 🔍 常见问题解决

### ❌ "MySQL command not found"

**macOS 解决方案**：
```bash
# 添加到 PATH
echo 'export PATH=/usr/local/mysql/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### ❌ "Access denied for user 'root'@'localhost'"

```bash
# 重置 root 密码
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';"
```

### ❌ "Can't connect to MySQL server on 'localhost'"

检查 MySQL 是否在运行：

**macOS**：
```bash
brew services list | grep mysql
brew services start mysql
```

**Windows**：
```cmd
net start MySQL80
```

**Linux**：
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### ❌ "Port 3306 is already in use"

```bash
# 查找占用进程
lsof -i :3306

# 杀死进程
kill -9 <PID>
```

### ❌ "Database initialization failed"

1. 确保 MySQL 服务正在运行
2. 确保你有正确的 MySQL 凭证
3. 尝试手动运行初始化脚本：
   ```bash
   mysql -u root -p < scripts/init-database.sql
   ```

---

## 🚀 启动项目

数据库配置完成后，启动 Ruizhu 项目：

### 启动所有服务

```bash
# 从项目根目录
./start.sh      # macOS/Linux
start.bat       # Windows
npm start       # 跨平台
```

### 单独启动后端

```bash
cd nestapi
npm run start:dev
```

### 验证后端

访问 http://localhost:3000，应该能看到 API 文档。

---

## 📚 相关命令

### 常用 MySQL 命令

```bash
# 启动 MySQL
# macOS
brew services start mysql

# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# 停止 MySQL
# macOS
brew services stop mysql

# Windows
net stop MySQL80

# Linux
sudo systemctl stop mysql

# 连接到 MySQL
mysql -u root -p

# 备份数据库
mysqldump -u root -p ruizhu > backup.sql

# 恢复数据库
mysql -u root -p ruizhu < backup.sql

# 查看所有数据库
mysql -u root -p -e "SHOW DATABASES;"

# 查看所有表
mysql -u root -p ruizhu -e "SHOW TABLES;"
```

---

## 💡 开发提示

### 在开发中重置数据库

```bash
# 1. 删除数据库
mysql -u root -p -e "DROP DATABASE ruizhu;"

# 2. 重新初始化
node scripts/setup-database.js

# 3. 重启后端
cd nestapi
npm run start:dev
```

### 备份数据库

```bash
# 定期备份
mysqldump -u root -p ruizhu > backups/ruizhu_$(date +%Y%m%d_%H%M%S).sql
```

### 导入示例数据

如果有示例数据文件：
```bash
mysql -u root -p ruizhu < samples/data.sql
```

---

## 📞 需要帮助？

如果遇到问题：

1. 查看本指南的常见问题部分
2. 查看各项目的 README 文件
3. 检查 MySQL 日志文件
4. 验证网络连接
5. 创建 Issue 或联系开发团队

---

**最后更新**: 2024-10-26

**相关文件**:
- [启动指南](./STARTUP.md)
- [项目 README](./README.md)
- [后端 README](./nestapi/README.md)
