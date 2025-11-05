# 部署脚本分析报告

生成时间: 2025-11-01

## 📋 执行摘要

分析了现有的部署脚本（`deploy/admin-deploy.sh`、`deploy/nestapi-deploy.sh`、`nestapi/deploy/auto-deploy.sh`），发现**多个安全问题和配置不匹配**。

### 关键问题

| 问题 | 严重性 | 位置 | 修复状态 |
|------|--------|------|---------|
| 密码硬编码在脚本中 | 🔴 高 | 所有脚本 | ⚠️ 需修复 |
| NestAPI 端口配置错误（3000 vs 8888） | 🟡 中 | auto-deploy.sh | ⚠️ 需修复 |
| 缺少 .env 配置验证 | 🟡 中 | 所有脚本 | ⚠️ 需修复 |
| 健康检查端口错误 | 🟡 中 | auto-deploy.sh | ⚠️ 需修复 |
| 部署后 Nginx 配置检查缺失 | 🟡 中 | admin-deploy.sh | ⚠️ 需修复 |

---

## 🔍 详细分析

### 问题 1: 密码硬编码（🔴 高风险）

**文件**:
- `deploy/admin-deploy.sh` (第27行)
- `nestapi/deploy/auto-deploy.sh` (第29行)

**现状**:
```bash
SERVER_PASS="Pp123456"
```

**问题**:
- 密码明文存储在代码中
- 可能被意外提交到版本控制系统
- 增加了安全泄露风险

**修复方案**:
应从环境变量读取：
```bash
SERVER_PASS="${DEPLOY_PASS:-}"
if [ -z "$SERVER_PASS" ]; then
    read -sp "请输入服务器密码: " SERVER_PASS
    echo ""
fi
```

使用方法：
```bash
export DEPLOY_PASS="Pp123456"
./deploy/admin-deploy.sh prod
```

---

### 问题 2: NestAPI 端口配置错误（🟡 中风险）

**文件**: `nestapi/deploy/auto-deploy.sh`

**现状**:
```bash
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs)
```

**问题**:
- 脚本健康检查使用的是 `3000` 端口
- 实际应用配置在 `.env` 中 `PORT=8888`
- 会导致健康检查失败的误报

**修复方案**:
应该从应用配置读取端口：
```bash
APP_PORT=$(grep "^PORT=" "$REMOTE_APP_DIR/.env" | cut -d'=' -f2 | tr -d '\r')
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT:-8888}/api/docs)
```

---

### 问题 3: 缺少 .env 配置验证（🟡 中风险）

**文件**: 所有部署脚本

**问题**:
- 部署前未检查本地 `.env` 文件是否存在和完整
- 部署后未验证远程 `.env` 文件是否正确

**修复方案**:
在部署前添加验证：
```bash
verify_local_env() {
    local env_file="$1"
    if [ ! -f "$env_file" ]; then
        print_error ".env 文件不存在: $env_file"
        exit 1
    fi

    # 检查关键变量
    if ! grep -q "^DB_URL=" "$env_file"; then
        print_error ".env 文件缺少 DB_URL"
        exit 1
    fi
}
```

---

### 问题 4: 健康检查 URL 不匹配（🟡 中风险）

**文件**: `nestapi/deploy/auto-deploy.sh` (第328行)

**现状**:
```bash
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs)
```

**问题**:
- 检查的是 `/api/docs` （Swagger 文档端点）
- 但根本问题是端口错误

**修复方案**:
使用应用的实际端口：
```bash
# 获取应用端口
APP_PORT=$(grep "^PORT=" "$REMOTE_APP_DIR/.env" | cut -d'=' -f2 | tr -d '\r')
APP_PORT=${APP_PORT:-8888}

# 检查基础 API
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT/api)
```

---

### 问题 5: Admin 部署后缺少 Nginx 验证（🟡 中风险）

**文件**: `deploy/admin-deploy.sh`

**问题**:
- 部署 HTML 文件后，未检查 Nginx 配置
- 未验证 HTTPS 重定向是否工作正常

**修复方案**:
添加部署后验证：
```bash
verify_nginx_config() {
    print_info "验证 Nginx 配置..."

    if command -v sshpass &> /dev/null; then
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no \
            "$SERVER_USER@$SERVER_HOST" \
            "nginx -t" > /tmp/nginx-test.log 2>&1 || {
            print_error "Nginx 配置检查失败"
            cat /tmp/nginx-test.log
            return 1
        }
    fi
}
```

---

## ✅ 修复方案总结

### 1. 环境变量配置

创建 `deploy/.env.local` 文件（git 忽略）：
```bash
# 部署服务器配置
DEPLOY_HOST="123.207.14.67"
DEPLOY_USER="root"
DEPLOY_PASS="Pp123456"

# Admin 部署配置
ADMIN_REMOTE_PATH="/opt/ruizhu-app/admin"
ADMIN_DOMAIN="yunjie.online"

# NestAPI 部署配置
NESTAPI_REMOTE_PATH="/opt/ruizhu-app/nestapi-dist"
NESTAPI_PORT="8888"
NESTAPI_PM2_NAME="ruizhu-backend"
```

### 2. 更新脚本流程

**Admin 部署脚本**:
- ✅ 从环境变量读取服务器信息
- ✅ 验证本地 `.env.production` 文件
- ✅ 部署前检查 Nginx 配置
- ✅ 部署后验证 HTTPS 访问

**NestAPI 部署脚本**:
- ✅ 从环境变量读取服务器信息
- ✅ 从远程 `.env` 读取应用端口
- ✅ 正确的健康检查（使用实际端口）
- ✅ 验证 PM2 进程运行状态

### 3. 保留远程 .env 文件

脚本已正确实现了保留远程 `.env` 文件的逻辑：
```bash
if [ -f "$REMOTE_APP_DIR/.env" ]; then
  cp "$REMOTE_APP_DIR/.env" "$DEPLOY_TEMP/.env"
  echo "✅ .env 文件已保留"
fi
```

✅ **这一点不需要修改，已经正确处理**

---

## 🚀 建议的部署流程

### Admin 部署步骤

```bash
# 1. 设置环境变量
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="Pp123456"
export ADMIN_REMOTE_PATH="/opt/ruizhu-app/admin"

# 2. 执行部署
./deploy/admin-deploy.sh prod

# 3. 验证
curl https://yunjie.online/
```

### NestAPI 部署步骤

```bash
# 1. 设置环境变量
export DEPLOY_HOST="123.207.14.67"
export DEPLOY_USER="root"
export DEPLOY_PASS="Pp123456"
export NESTAPI_REMOTE_PATH="/opt/ruizhu-app/nestapi-dist"

# 2. 执行部署
./deploy/nestapi-deploy.sh

# 3. 验证
curl https://yunjie.online/api/docs
```

---

## 📊 当前部署配置与实际云服务器对比

| 配置项 | 部署脚本 | 云服务器 | 本地.env | 状态 |
|--------|---------|---------|---------|------|
| 数据库 URL | 云数据库 | 云数据库 | ✅ 云数据库 | ✅ 匹配 |
| 数据库密码 | - | 云数据库 | ✅ Pp123456 | ✅ 匹配 |
| Admin 路径 | /opt/ruizhu-app/admin | ? | - | ⚠️ 待确认 |
| NestAPI 路径 | /opt/ruizhu-app/nestapi-dist | ? | - | ⚠️ 待确认 |
| NestAPI 端口 | 3000 (错误) | 实际:8888 | ✅ 8888 | 🔴 不匹配 |
| PM2 应用名 | ruizhu-backend | ? | - | ⚠️ 待确认 |
| Nginx 域名 | yunjie.online | yunjie.online | - | ✅ 匹配 |

---

## 🔐 安全建议

### 短期（必须）
1. ✅ 移除脚本中的硬编码密码
2. ✅ 使用环境变量或 SSH Key 认证

### 中期（建议）
1. 使用 SSH Key 替代密码认证
2. 为部署脚本添加日志审计
3. 限制部署脚本的文件权限（`chmod 700`）

### 长期（规划）
1. 实现 CI/CD 流程（GitHub Actions/GitLab CI）
2. 使用密钥管理系统（如 HashiCorp Vault）
3. 配置部署前的自动化测试

---

## 📝 修复检查清单

- [ ] 1. 从脚本中移除硬编码密码
- [ ] 2. 添加环境变量读取逻辑
- [ ] 3. 修复 NestAPI 端口配置（3000 → 8888）
- [ ] 4. 添加 .env 文件验证
- [ ] 5. 更新健康检查逻辑
- [ ] 6. 添加 Nginx 配置验证
- [ ] 7. 测试 Admin 部署
- [ ] 8. 测试 NestAPI 部署
- [ ] 9. 验证远程应用运行状态
- [ ] 10. 更新部署文档

---

## 🔗 相关文件

- 本地 Admin .env: `/Users/peak/work/pikecode/ruizhu_project/admin/.env`
- 本地 NestAPI .env: `/Users/peak/work/pikecode/ruizhu_project/nestapi/.env`
- Admin 部署脚本: `/Users/peak/work/pikecode/ruizhu_project/deploy/admin-deploy.sh`
- NestAPI 部署脚本: `/Users/peak/work/pikecode/ruizhu_project/nestapi/deploy/auto-deploy.sh`

---

**报告完成时间**: 2025-11-01 17:54:00
**建议行动**: 开始修复脚本中的安全问题
