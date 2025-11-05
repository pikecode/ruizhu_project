#!/bin/bash

###############################################################################
# Ruizhu 配置文件更新脚本
# 功能：自动上传并更新服务器上的 .env 配置文件
# 用法：
#   ./config-update.sh nestapi          # 更新 NestAPI 配置
#   ./config-update.sh nestapi --restart  # 更新并重启服务
###############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 部署配置
SERVER_HOST="123.207.14.67"
SERVER_USER="root"
SERVER_PASS="Pp123456"
REMOTE_NESTAPI_PATH="/opt/ruizhu-app/nestapi-dist"

# 获取目标模块和选项
TARGET_MODULE="${1:-nestapi}"
AUTO_RESTART="${2:-}"

# ============================================================================
# 辅助函数
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# ============================================================================
# 主函数
# ============================================================================

main() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🔧 Ruizhu 配置文件更新脚本${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""

    # 验证目标模块
    case "$TARGET_MODULE" in
        nestapi)
            update_nestapi_config
            ;;
        *)
            log_error "不支持的模块: $TARGET_MODULE"
            echo ""
            echo "支持的模块:"
            echo "  - nestapi      NestAPI 后端"
            exit 1
            ;;
    esac

    echo ""
    log_success "配置文件更新完成！"
    echo ""
}

# ============================================================================
# NestAPI 配置更新
# ============================================================================

update_nestapi_config() {
    echo -e "${BLUE}─────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}  📝 更新 NestAPI 配置${NC}"
    echo -e "${BLUE}─────────────────────────────────────────────────────────${NC}"
    echo ""

    local LOCAL_ENV="$PROJECT_ROOT/nestapi/.env"
    local REMOTE_ENV="$REMOTE_NESTAPI_PATH/.env"

    # 检查本地 .env 文件
    if [ ! -f "$LOCAL_ENV" ]; then
        log_error "本地 .env 文件不存在: $LOCAL_ENV"
        exit 1
    fi

    log_info "源文件: $LOCAL_ENV"
    log_info "目标: $SERVER_USER@$SERVER_HOST:$REMOTE_ENV"
    echo ""

    # 显示要上传的配置项
    log_info "配置文件内容预览:"
    echo "───────────────────────────────────────────────────────────"
    cat "$LOCAL_ENV" | grep -v "^#" | grep -v "^$"
    echo "───────────────────────────────────────────────────────────"
    echo ""

    # 确认上传
    read -p "确认上传配置文件? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "已取消"
        exit 0
    fi
    echo ""

    # 创建备份
    log_info "创建远程备份..."
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'EOF'
        if [ -f "$REMOTE_ENV" ]; then
            cp "$REMOTE_ENV" "${REMOTE_ENV}.backup.$(date +%Y%m%d_%H%M%S)"
            echo "✓ 备份已创建"
        fi
EOF
    echo ""

    # 上传文件
    log_info "上传配置文件..."
    if sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$LOCAL_ENV" "$SERVER_USER@$SERVER_HOST:$REMOTE_ENV" > /tmp/scp-config.log 2>&1; then
        log_success "配置文件上传成功"
    else
        log_error "配置文件上传失败"
        cat /tmp/scp-config.log
        exit 1
    fi
    echo ""

    # 验证上传
    log_info "验证上传的配置..."
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'VERIFY'
        echo "远程 .env 文件最后5行:"
        echo "─────────────────────────────"
        tail -5 "$REMOTE_ENV"
        echo "─────────────────────────────"
VERIFY
    echo ""

    # 可选：重启服务
    if [ "$AUTO_RESTART" = "--restart" ]; then
        log_info "重启 NestAPI 服务..."
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'RESTART'
            pm2 restart ruizhu-backend
            sleep 2
            echo ""
            echo "服务重启后的状态:"
            pm2 list | grep ruizhu-backend
RESTART
        echo ""
        log_success "服务已重启，新配置已生效"
    else
        log_warning "配置已上传，但服务未重启"
        echo ""
        echo "要使配置生效，请手动重启服务:"
        echo "  sshpass -p 'Pp123456' ssh root@$SERVER_HOST 'pm2 restart ruizhu-backend'"
    fi
    echo ""
}

# ============================================================================
# 帮助信息
# ============================================================================

show_help() {
    cat << EOF
使用方法:
    $0 [module] [options]

参数:
    module          模块名称 (nestapi)
    options         选项:
                    --restart   更新后自动重启服务

示例:
    # 仅更新配置，不重启
    $0 nestapi

    # 更新配置并重启服务
    $0 nestapi --restart

    # 显示帮助
    $0 --help
EOF
}

# ============================================================================
# 脚本入口
# ============================================================================

case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    "")
        main
        ;;
    *)
        main
        ;;
esac
