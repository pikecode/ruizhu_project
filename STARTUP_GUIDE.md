# 项目启动指南

本项目包含三个独立的应用：后端 API、小程序、管理后台。本文档说明如何启动这些应用。

---

## 快速开始

### 选项 1: 一键启动所有服务（H5 版本小程序）

**最简单的方式，推荐用于开发测试：**

```bash
./start-all-services.sh
```

这会启动：
- ✅ 后端 API (端口 8888)
- ✅ 小程序 H5 版本 (端口 8080)
- ✅ 管理后台 (端口 5174)

---

## 启动脚本详细说明

### 脚本列表

| 脚本 | 说明 | 用途 |
|------|------|------|
| `start-all-services.sh` | 启动所有服务 (H5小程序) | 最常用，开发测试 |
| `start-all-services-weixin.sh` | 启动所有服务 (微信小程序) | 需要测试微信小程序功能 |
| `start-all-services-interactive.sh` | 交互式选择小程序类型 | 想要灵活选择 |
| `start-services.sh` | 参数化启动脚本 | 最灵活，支持自定义组合 |
| `start-backend.sh` | 仅启动后端 | 单独调试后端 |
| `start-frontend.sh` | 仅启动小程序 H5 | 单独调试前端 |
| `start-frontend-h5.sh` | 启动小程序 H5 版本 | 明确指定 H5 |
| `start-frontend-miniapp.sh` | 启动微信小程序 | 明确指定微信版本 |
| `start-admin.sh` | 仅启动管理后台 | 单独调试管理后台 |

---

## 使用示例

### 场景 1: 开发测试（最常见）

```bash
# 启动所有服务
./start-all-services.sh

# 或使用灵活脚本
./start-services.sh --all
```

访问：
- 管理后台: http://localhost:5174
- 小程序: http://localhost:8080
- 后端 API: http://localhost:8888/api/v1

### 场景 2: 需要测试微信小程序

```bash
# 方式 1: 使用专门的微信脚本
./start-all-services-weixin.sh

# 方式 2: 使用交互式脚本
./start-all-services-interactive.sh
# 选择: 2 (微信小程序)

# 方式 3: 使用灵活脚本
./start-services.sh --all --mini-weixin
```

然后：
1. 打开微信开发者工具
2. 打开 `miniprogram` 文件夹
3. 编译预览或上传发布

### 场景 3: 只需启动特定服务

```bash
# 仅启动后端
./start-services.sh --backend

# 仅启动小程序
./start-services.sh --frontend

# 仅启动管理后台
./start-services.sh --admin

# 启动后端和管理后台（不启动小程序）
./start-services.sh --backend --admin

# 启动小程序和管理后台（不启动后端）
./start-services.sh --frontend --admin
```

### 场景 4: 使用交互式脚本选择

```bash
# 启动交互式脚本
./start-all-services-interactive.sh

# 按提示选择小程序类型
# 1) H5 Web 版本（推荐用于开发）
# 2) 微信小程序 (WeChat Mini Program)
```

---

## start-services.sh 参数详解

最灵活的启动脚本 `start-services.sh` 支持以下参数：

```bash
./start-services.sh [选项]
```

### 启动组件选项

| 参数 | 说明 |
|------|------|
| `--all` | 启动所有服务（默认） |
| `--backend` | 仅启动后端 |
| `--frontend` | 仅启动小程序 |
| `--admin` | 仅启动管理后台 |
| `--no-backend` | 启动除后端外的所有服务 |
| `--no-frontend` | 启动除小程序外的所有服务 |
| `--no-admin` | 启动除管理后台外的所有服务 |

### 小程序类型选项

| 参数 | 说明 |
|------|------|
| `--mini-h5` | 使用 H5 Web 版本（默认） |
| `--mini-weixin` | 使用微信小程序版本 |

### 其他选项

| 参数 | 说明 |
|------|------|
| `--help` | 显示帮助信息 |

### 使用示例

```bash
# 启动所有服务，使用微信小程序
./start-services.sh --all --mini-weixin

# 启动后端和管理后台（不启动小程序）
./start-services.sh --backend --admin

# 启动小程序（H5），不启动其他服务
./start-services.sh --frontend --mini-h5

# 启动所有服务除了小程序
./start-services.sh --no-frontend

# 显示帮助
./start-services.sh --help
```

---

## 访问应用

启动后，可以访问以下地址：

| 应用 | 地址 | 说明 |
|------|------|------|
| 管理后台 | http://localhost:5174 | React 管理界面 |
| 小程序 H5 | http://localhost:8080 | Web 版本小程序 |
| 后端 API | http://localhost:8888/api/v1 | REST API 接口 |

---

## 日志和调试

### 查看服务日志

```bash
# 查看后端日志
tail -f /tmp/backend.log

# 查看小程序日志
tail -f /tmp/frontend.log

# 查看管理后台日志
tail -f /tmp/admin.log

# 实时查看所有日志（需要在不同终端）
# 终端 1
tail -f /tmp/backend.log

# 终端 2
tail -f /tmp/frontend.log

# 终端 3
tail -f /tmp/admin.log
```

### 查看进程 ID

启动脚本会输出每个服务的进程 ID (PID)，例如：

```
📋 进程 ID:
  后端:    12345
  小程序:  12346
  管理后台: 12347
```

### 手动停止服务

```bash
# 停止所有服务（按 Ctrl+C）
# 或手动 kill

kill 12345 12346 12347
```

---

## 停止服务

### 方式 1: 按 Ctrl+C（推荐）

直接在运行启动脚本的终端按 `Ctrl+C`，脚本会自动停止所有服务。

### 方式 2: 手动 kill

```bash
# 使用脚本显示的 PID
kill <BACKEND_PID> <FRONTEND_PID> <ADMIN_PID>

# 或者停止所有相关进程
killall npm
killall node
```

### 方式 3: pkill

```bash
# 杀死所有 node 进程
pkill -f node

# 杀死所有 npm 进程
pkill -f npm
```

---

## 常见问题

### Q: 脚本权限不足

**错误**: `Permission denied`

**解决**:
```bash
# 赋予执行权限
chmod +x *.sh

# 或具体脚本
chmod +x start-all-services.sh
```

### Q: 端口已被占用

**错误**: `EADDRINUSE: address already in use`

**解决**:
```bash
# 查看占用端口的进程
lsof -i :8888    # 后端
lsof -i :8080    # 小程序
lsof -i :5174    # 管理后台

# 杀死占用的进程
kill -9 <PID>

# 或停止所有 node 进程
killall -9 node
```

### Q: npm 命令找不到

**错误**: `npm: command not found`

**解决**:
```bash
# 确保已安装 Node.js 和 npm
node --version
npm --version

# 如果未安装，请先安装 Node.js
# macOS: brew install node
# Windows: 下载安装程序
# Linux: apt install nodejs npm (Ubuntu/Debian)
```

### Q: 依赖未安装

**错误**: `Cannot find module`

**解决**:
```bash
# 在各项目目录安装依赖
cd nestapi && npm install
cd miniprogram && npm install
cd admin && npm install
```

### Q: 微信小程序启动失败

**原因**: 微信小程序开发模式需要特殊配置

**解决**:
1. 在微信开发者工具中打开 `miniprogram` 文件夹
2. 配置正确的 AppID
3. 使用开发者工具编译预览
4. 脚本中的 `npm run dev:mp-weixin` 只是启动开发服务器

---

## 开发工作流

### 推荐工作流

1. **启动所有服务**（H5 版本）
   ```bash
   ./start-all-services.sh
   ```

2. **打开浏览器访问**
   - 管理后台: http://localhost:5174
   - 小程序: http://localhost:8080

3. **修改代码并保存**
   - 各应用会自动热重载（HMR）

4. **查看日志进行调试**
   ```bash
   tail -f /tmp/backend.log
   tail -f /tmp/frontend.log
   tail -f /tmp/admin.log
   ```

5. **停止服务**
   - 在运行脚本的终端按 `Ctrl+C`

### 微信小程序开发工作流

1. **启动微信小程序版本服务**
   ```bash
   ./start-all-services-weixin.sh
   ```

2. **打开微信开发者工具**
   - 导入 `miniprogram` 文件夹
   - 配置 AppID
   - 编译预览

3. **修改代码**
   - 代码会自动编译
   - 在微信开发者工具中刷新预览

4. **上传发布**
   - 测试完成后在开发者工具中上传
   - 提交审核发布

---

## 性能优化建议

- **H5 版本**: 推荐用于开发调试，性能较好
- **微信小程序**: 需要在开发者工具中进行真实体验
- **后端**: 注意监控内存使用，大量请求时可能需要优化
- **网络**: 如果 API 响应慢，检查数据库连接

---

## 相关文档

- [项目分析文档](./README.md)
- [快速开始指南](./QUICK_START.md)
- [MySQL 配置指南](./MYSQL_SETUP.md)
- [腾讯云 COS 集成](./COS_INTEGRATION.md)
- [文件管理使用指南](./FILES_USAGE_GUIDE.md)

---

**最后更新**: 2024-10-26
**版本**: 2.0.0
