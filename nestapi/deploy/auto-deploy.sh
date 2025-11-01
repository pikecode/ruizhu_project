#!/bin/bash

##############################################################################
#                                                                            #
#  🚀 NestAPI 一键部署脚本                                                   #
#  自动执行：本地构建 → 打包 → 上传 → 服务器部署                                #
#                                                                            #
#  使用方法: ./deploy/auto-deploy.sh [选项]                                 #
#  选项:                                                                     #
#    --skip-build      跳过本地构建（仅重新打包和部署）                        #
#    --skip-pack       跳过打包（使用最新包部署）                             #
#    --skip-migration  跳过数据库迁移（数据库无更新时使用）                   #
#    --dry-run         测试运行（不实际部署）                                #
#                                                                            #
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置 (从环境变量读取)
REMOTE_HOST="${DEPLOY_HOST:-}"
REMOTE_USER="${DEPLOY_USER:-root}"
REMOTE_PASSWORD="${DEPLOY_PASS:-}"
REMOTE_APP_DIR="${NESTAPI_REMOTE_PATH:-/opt/ruizhu-app/nestapi-dist}"
REMOTE_BACKUP_DIR="${BACKUP_DIR:-/opt/ruizhu-app/backups}"
NESTAPI_PM2_NAME="${NESTAPI_PM2_NAME:-ruizhu-backend}"
NESTAPI_PORT="${NESTAPI_PORT:-8888}"

# 本地配置
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"  # 上升两级到项目根目录
RELEASE_DIR="$PROJECT_ROOT/nestapi/deploy/releases"  # 指向 nestapi/deploy/releases

# 解析选项
SKIP_BUILD=false
SKIP_PACK=false
SKIP_MIGRATION=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build) SKIP_BUILD=true; shift ;;
    --skip-pack) SKIP_PACK=true; shift ;;
    --skip-migration) SKIP_MIGRATION=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "未知选项: $1"; exit 1 ;;
  esac
done

# 日志函数
log_info() {
  echo -e "${BLUE}[ℹ️  INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[❌ ERROR]${NC} $1"
}

log_step() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

# 错误处理
handle_error() {
  log_error "部署失败！"
  exit 1
}

trap handle_error ERR

# 验证部署配置
validate_deployment_config() {
    log_step "验证部署配置"

    if [ -z "$REMOTE_HOST" ]; then
        log_error "服务器地址未设置"
        log_info "请设置环境变量: export DEPLOY_HOST='123.207.14.67'"
        exit 1
    fi

    if [ -z "$REMOTE_PASSWORD" ]; then
        log_warning "服务器密码未设置，需要交互输入"
        read -sp "请输入 $REMOTE_USER@$REMOTE_HOST 的密码: " REMOTE_PASSWORD
        echo ""
        if [ -z "$REMOTE_PASSWORD" ]; then
            log_error "密码不能为空"
            exit 1
        fi
    fi

    log_success "部署配置验证完成"
    log_info "服务器: $REMOTE_USER@$REMOTE_HOST"
    log_info "应用目录: $REMOTE_APP_DIR"
    log_info "PM2 应用名: $NESTAPI_PM2_NAME"
    log_info "应用端口: $NESTAPI_PORT"
}

# 开始部署
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║         🚀 NestAPI 一键部署脚本                        ║"
echo "║         $(date '+%Y-%m-%d %H:%M:%S')                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

if [ "$DRY_RUN" = true ]; then
  log_warning "运行于测试模式 - 不会执行实际部署"
fi

# 验证部署配置
validate_deployment_config

# ============================================================================
# 阶段 1: 本地构建
# ============================================================================

if [ "$SKIP_BUILD" = true ]; then
  log_warning "跳过本地构建"
else
  log_step "阶段 1️⃣ : 本地构建"

  log_info "执行: $PROJECT_ROOT/nestapi/deploy/build.sh"
  if [ "$DRY_RUN" = false ]; then
    "$PROJECT_ROOT/nestapi/deploy/build.sh" || handle_error
    log_success "本地构建完成"
  else
    log_warning "[测试模式] 跳过实际构建"
  fi
fi

# ============================================================================
# 阶段 2: 本地打包
# ============================================================================

if [ "$SKIP_PACK" = true ]; then
  log_warning "跳过打包，使用最新发布包"

  # 获取最新的发布包
  RELEASE_FILE=$(ls -t "$RELEASE_DIR"/nestapi-*.tar.gz 2>/dev/null | head -1)
  if [ -z "$RELEASE_FILE" ]; then
    log_error "找不到发布包！请先运行: $PROJECT_ROOT/nestapi/deploy/build.sh && $PROJECT_ROOT/nestapi/deploy/package.sh"
    exit 1
  fi
  RELEASE_NAME=$(basename "$RELEASE_FILE")
  log_info "使用发布包: $RELEASE_NAME"
else
  log_step "阶段 2️⃣ : 本地打包"

  log_info "执行: $PROJECT_ROOT/nestapi/deploy/package.sh"
  if [ "$DRY_RUN" = false ]; then
    "$PROJECT_ROOT/nestapi/deploy/package.sh" || handle_error

    # 获取刚生成的包
    RELEASE_FILE=$(ls -t "$RELEASE_DIR"/nestapi-*.tar.gz 2>/dev/null | head -1)
    RELEASE_NAME=$(basename "$RELEASE_FILE")
    log_success "打包完成: $RELEASE_NAME"
  else
    log_warning "[测试模式] 跳过实际打包"
    RELEASE_FILE=$(ls -t "$RELEASE_DIR"/nestapi-*.tar.gz 2>/dev/null | head -1)
    RELEASE_NAME=$(basename "$RELEASE_FILE")
    log_info "将使用发布包: $RELEASE_NAME"
  fi
fi

# ============================================================================
# 阶段 3: 部署前验证和确认
# ============================================================================

log_step "阶段 3️⃣ : 部署前检查"

# 验证 package-lock.json 存在
if [ ! -f "$PROJECT_ROOT/nestapi/package-lock.json" ]; then
  log_warning "⚠️  package-lock.json 不存在"
  log_info "这可能导致依赖版本不一致。建议先运行: cd nestapi && npm ci"
fi

RELEASE_SIZE=$(du -sh "$RELEASE_FILE" | cut -f1)
log_info "发布文件: $RELEASE_NAME"
log_info "文件大小: $RELEASE_SIZE"
log_info "部署目标: $REMOTE_HOST"
log_info "应用目录: $REMOTE_APP_DIR"
log_info "依赖安装: 将在服务器上执行 npm ci --legacy-peer-deps"

if [ "$DRY_RUN" = false ]; then
  echo -e "\n${YELLOW}请确认以下信息:${NC}"
  echo "  • 发布包: $RELEASE_NAME ($RELEASE_SIZE)"
  echo "  • 服务器: $REMOTE_HOST"
  echo "  • 这将替换: $REMOTE_APP_DIR/dist"
  echo "  • 并创建备份: $REMOTE_BACKUP_DIR"
  echo ""
  read -p "确认部署? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "部署已取消"
    exit 0
  fi
else
  log_warning "[测试模式] 跳过交互确认"
fi

# ============================================================================
# 阶段 4: 上传文件到服务器
# ============================================================================

log_step "阶段 4️⃣ : 上传发布包"

if [ "$DRY_RUN" = false ]; then
  log_info "上传文件到服务器..."
  sshpass -p "$REMOTE_PASSWORD" scp -o StrictHostKeyChecking=no \
    "$RELEASE_FILE" "$REMOTE_USER@$REMOTE_HOST:/tmp/$RELEASE_NAME" || handle_error
  log_success "文件上传完成"
else
  log_warning "[测试模式] 跳过实际上传"
fi

# ============================================================================
# 阶段 5: 服务器端部署
# ============================================================================

log_step "阶段 5️⃣ : 服务器端部署"

if [ "$DRY_RUN" = false ]; then
  log_info "连接到服务器执行部署..."

  sshpass -p "$REMOTE_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << DEPLOY_SCRIPT
set -e

echo "⏸️  停止应用..."
pm2 stop $NESTAPI_PM2_NAME 2>/dev/null || true
sleep 3

echo "💾 创建备份..."
mkdir -p $REMOTE_BACKUP_DIR
BACKUP_NAME="nestapi-backup-\$(date +%Y%m%d-%H%M%S)"
if [ -d "$REMOTE_APP_DIR/dist" ]; then
  tar -czf "$REMOTE_BACKUP_DIR/\$BACKUP_NAME.tar.gz" -C "$REMOTE_APP_DIR" dist
  echo "✅ 备份完成: \$BACKUP_NAME"
fi

echo "📂 解压新版本..."
DEPLOY_TEMP="/tmp/nestapi-deploy-\$(date +%s)"
mkdir -p \$DEPLOY_TEMP

# 验证 tar 文件存在
if [ ! -f "/tmp/$RELEASE_NAME" ]; then
  echo "❌ 错误: 部署文件未找到: /tmp/$RELEASE_NAME"
  exit 1
fi

# 使用 --strip-components 简化路径，直接提取到部署目录
echo "📝 检查 tar 文件内容..."
tar -tzf "/tmp/$RELEASE_NAME" | head -10

echo "解压文件..."
tar -xzf "/tmp/$RELEASE_NAME" -C \$DEPLOY_TEMP
if [ $? -ne 0 ]; then
  echo "❌ tar 解压失败"
  exit 1
fi

echo "📂 解压完成，文件内容："
ls -la \$DEPLOY_TEMP/ | head -20

echo "🔐 保护生产环境配置..."
if [ -f "$REMOTE_APP_DIR/.env" ]; then
  cp "$REMOTE_APP_DIR/.env" "\$DEPLOY_TEMP/.env"
  echo "✅ .env 文件已保留"
fi

echo "🔄 更新应用文件..."
# 确保目标目录存在
mkdir -p "$REMOTE_APP_DIR"

# 彻底删除旧的 dist 目录
if [ -d "$REMOTE_APP_DIR/dist" ]; then
  echo "删除旧的 dist 目录..."
  rm -rf "$REMOTE_APP_DIR/dist" || true
  sleep 1
fi

# 复制新的 dist 目录
echo "复制新的 dist 目录..."
if [ -d "\$DEPLOY_TEMP/dist" ]; then
  cp -r "\$DEPLOY_TEMP/dist" "$REMOTE_APP_DIR/"
  echo "✅ dist 目录已更新"
else
  echo "❌ 错误: 新的 dist 目录不存在"
  ls -la \$DEPLOY_TEMP/
  exit 1
fi

# 复制配置文件
cp "\$DEPLOY_TEMP/package.json" "$REMOTE_APP_DIR/" 2>/dev/null || true
cp "\$DEPLOY_TEMP/package-lock.json" "$REMOTE_APP_DIR/" 2>/dev/null || true
cp "\$DEPLOY_TEMP/VERSION" "$REMOTE_APP_DIR/" 2>/dev/null || true

# 验证部署文件
echo "✅ 验证部署文件..."
ls -lh "$REMOTE_APP_DIR/dist/auth/" | grep -E "auth.controller|auth.service" || echo "⚠️  警告: 未找到auth文件"

echo "🧹 清理临时文件..."
rm -rf \$DEPLOY_TEMP
rm -f "/tmp/$RELEASE_NAME"

echo "📦 安装 npm 依赖..."
cd $REMOTE_APP_DIR

# 检查 node_modules 是否存在
if [ -d "node_modules" ]; then
  echo "ℹ️  node_modules 已存在，检查依赖是否完整..."
  # 快速检查关键依赖是否存在
  if [ ! -d "node_modules/@nestjs/core" ]; then
    echo "⚠️  关键依赖缺失，重新安装..."
    rm -rf node_modules package-lock.json
    npm ci --legacy-peer-deps 2>&1 | tail -5
  else
    echo "✅ 依赖检查完成"
  fi
else
  echo "ℹ️  node_modules 不存在，开始安装..."
  npm ci --legacy-peer-deps 2>&1 | tail -5
fi

# 验证 npm 安装结果
if [ ! -d "node_modules" ]; then
  echo "❌ 错误: npm 依赖安装失败"
  echo "错误日志："
  npm ci --legacy-peer-deps
  exit 1
fi

echo "✅ npm 依赖安装/验证完成"
echo ""

echo "🚀 启动应用..."
sleep 2

# 重启应用以加载新的代码
echo "重启应用..."
pm2 restart $NESTAPI_PM2_NAME
sleep 5

echo "🧪 测试应用..."
HEALTH_CHECK=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$NESTAPI_PORT/api)
if [ "\$HEALTH_CHECK" == "200" ]; then
  echo "✅ 应用已启动并运行正常 (HTTP \$HEALTH_CHECK)"
else
  echo "⚠️  应用启动，但健康检查返回 HTTP \$HEALTH_CHECK"
  echo "可能原因："
  echo "  1. 依赖安装失败 - 查看: pm2 logs ruizhu-backend"
  echo "  2. 应用启动中 - 请稍候几秒后重试"
  echo "  3. 配置文件缺失 - 检查 .env 文件"
fi

echo ""
echo "PM2 状态:"
pm2 status | grep $NESTAPI_PM2_NAME || true

DEPLOY_SCRIPT

  log_success "服务器部署完成"
else
  log_warning "[测试模式] 跳过实际部署"
fi

# ============================================================================
# 阶段 6: 数据库迁移
# ============================================================================

if [ "$SKIP_MIGRATION" = true ]; then
  log_warning "跳过数据库迁移"
else
  log_step "阶段 6️⃣ : 数据库迁移"

  if [ "$DRY_RUN" = false ]; then
    log_info "运行数据库迁移..."

    sshpass -p "$REMOTE_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_HOST" << DB_MIGRATION
cd $REMOTE_APP_DIR

echo "📊 检查 TypeORM CLI..."
if [ -f "node_modules/.bin/typeorm" ]; then
  echo "ℹ️  运行数据库迁移..."
  npm run typeorm migration:run 2>&1 || {
    MIGRATION_CODE=\$?
    if [ \$MIGRATION_CODE -eq 0 ]; then
      echo "✅ 迁移完成"
    else
      echo "⚠️  迁移失败或无新迁移 (代码: \$MIGRATION_CODE)"
      echo "这通常是正常的，表示数据库已是最新状态"
    fi
  }
else
  echo "⚠️  TypeORM CLI 未找到，跳过迁移"
fi

DB_MIGRATION

    log_success "数据库迁移检查完成"
  else
    log_warning "[测试模式] 跳过迁移"
  fi
fi

# ============================================================================
# 部署完成
# ============================================================================

log_step "✨ 部署完成！"

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 部署成功！                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

echo ""
echo "📋 部署总结:"
echo "  • 发布包: $RELEASE_NAME ($RELEASE_SIZE)"
echo "  • 服务器: $REMOTE_HOST"
echo "  • 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "🔍 验证命令:"
echo "  • 查看应用状态: sshpass -p '\$DEPLOY_PASS' ssh root@$REMOTE_HOST pm2 status"
echo "  • 查看应用日志: sshpass -p '\$DEPLOY_PASS' ssh root@$REMOTE_HOST pm2 logs $NESTAPI_PM2_NAME"
echo "  • 测试API: curl http://localhost:$NESTAPI_PORT/api"
echo "  • 远程测试: sshpass -p '\$DEPLOY_PASS' ssh root@$REMOTE_HOST 'curl http://localhost:$NESTAPI_PORT/api'"
echo ""

echo "🆘 遇到问题?"
echo "  • 查看详细文档: cat WECHAT_MIGRATION_GUIDE.md"
echo "  • 回滚部署: 使用最新的备份文件恢复"
echo ""

exit 0
