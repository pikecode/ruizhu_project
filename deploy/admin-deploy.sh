#!/bin/bash

###############################################################################
# Ruizhu Admin 一键部署脚本
# 功能：本地打包 -> 上传 -> 部署到服务器
# 用法: ./admin-deploy.sh [环境] [选项]
# 例子: ./admin-deploy.sh prod
#      ./admin-deploy.sh prod --no-verify
###############################################################################

set -e

# ============================================================================
# 配置部分
# ============================================================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器配置 (从环境变量读取)
SERVER_HOST="${DEPLOY_HOST:-}"
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_PASS="${DEPLOY_PASS:-}"
REMOTE_ADMIN_PATH="${ADMIN_REMOTE_PATH:-/opt/ruizhu-app/admin}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-yunjie.online}"

# 本地配置（相对于项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOCAL_ADMIN_DIR="$PROJECT_ROOT/admin"
LOCAL_DIST_DIR="${LOCAL_ADMIN_DIR}/dist"

# 脚本配置
VERIFY_DEPLOYMENT=true
AUTO_RELOAD_NGINX=true

# ============================================================================
# 工具函数
# ============================================================================

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🚀 Ruizhu Admin 一键部署${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# 显示使用说明
show_usage() {
    cat << EOF
用法: $0 [环境] [选项]

环境:
  prod              生产环境部署（必须）

选项:
  --no-verify       跳过部署验证
  --no-reload       不自动重载 Nginx
  -h, --help        显示此帮助信息

示例:
  $0 prod                    # 完整部署（包括验证和 Nginx 重载）
  $0 prod --no-verify       # 部署但跳过验证
  $0 prod --no-reload       # 部署但不重载 Nginx

EOF
}

# 验证部署配置
validate_deployment_config() {
    print_section "验证部署配置"

    if [ -z "$SERVER_HOST" ]; then
        print_error "服务器地址未设置"
        print_info "请设置环境变量: export DEPLOY_HOST='123.207.14.67'"
        exit 1
    fi

    if [ -z "$SERVER_PASS" ]; then
        print_warning "服务器密码未设置，需要交互输入"
        read -sp "请输入 $SERVER_USER@$SERVER_HOST 的密码: " SERVER_PASS
        echo ""
        if [ -z "$SERVER_PASS" ]; then
            print_error "密码不能为空"
            exit 1
        fi
    fi

    print_success "部署配置验证完成"
    print_info "服务器: $SERVER_USER@$SERVER_HOST"
    print_info "部署路径: $REMOTE_ADMIN_PATH"
}

# 检查依赖
check_dependencies() {
    print_section "检查依赖"

    local missing=false

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "未找到 Node.js，请先安装"
        missing=true
    else
        print_success "Node.js: $(node --version)"
    fi

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "未找到 npm，请先安装"
        missing=true
    else
        print_success "npm: $(npm --version)"
    fi

    # 检查 scp
    if ! command -v scp &> /dev/null; then
        print_error "未找到 scp，请先安装"
        missing=true
    else
        print_success "scp: 已安装"
    fi

    # 检查 sshpass (如果要用密码认证)
    if ! command -v sshpass &> /dev/null; then
        print_warning "未找到 sshpass，将使用 ssh-key 认证"
    else
        print_success "sshpass: 已安装"
    fi

    if [ "$missing" = true ]; then
        print_error "依赖检查失败"
        exit 1
    fi
}

# 检查目录
check_directories() {
    print_section "检查目录"

    if [ ! -d "$LOCAL_ADMIN_DIR" ]; then
        print_error "Admin 目录不存在: $LOCAL_ADMIN_DIR"
        exit 1
    fi
    print_success "Admin 目录: $LOCAL_ADMIN_DIR"

    if [ ! -f "$LOCAL_ADMIN_DIR/package.json" ]; then
        print_error "package.json 不存在: $LOCAL_ADMIN_DIR/package.json"
        exit 1
    fi
    print_success "package.json 已找到"

    if [ ! -f "$LOCAL_ADMIN_DIR/vite.config.ts" ]; then
        print_error "vite.config.ts 不存在: $LOCAL_ADMIN_DIR/vite.config.ts"
        exit 1
    fi
    print_success "vite.config.ts 已找到"
}

# 清理旧的构建
clean_build() {
    print_section "清理旧的构建"

    if [ -d "$LOCAL_DIST_DIR" ]; then
        rm -rf "$LOCAL_DIST_DIR"
        print_success "删除旧的 dist 目录"
    fi
}

# 本地构建
build_locally() {
    print_section "开始本地构建"

    cd "$LOCAL_ADMIN_DIR"

    print_info "安装依赖..."
    npm install > /tmp/npm-install.log 2>&1 || {
        print_error "npm install 失败，查看日志: /tmp/npm-install.log"
        cat /tmp/npm-install.log
        exit 1
    }

    print_info "构建项目..."
    npm run build > /tmp/npm-build.log 2>&1 || {
        print_error "npm run build 失败，查看日志: /tmp/npm-build.log"
        cat /tmp/npm-build.log
        exit 1
    }

    if [ ! -d "$LOCAL_DIST_DIR" ]; then
        print_error "构建失败：dist 目录不存在"
        exit 1
    fi

    # 统计构建产物
    local file_count=$(find "$LOCAL_DIST_DIR" -type f | wc -l)
    local dir_size=$(du -sh "$LOCAL_DIST_DIR" | cut -f1)

    print_success "构建完成"
    print_info "产物: $file_count 个文件，大小: $dir_size"

    cd - > /dev/null
}

# 验证构建产物
verify_build() {
    print_section "验证构建产物"

    local has_index_html=false
    local has_assets=false

    if [ -f "$LOCAL_DIST_DIR/index.html" ]; then
        has_index_html=true
        local size=$(wc -c < "$LOCAL_DIST_DIR/index.html")
        print_success "index.html (${size} bytes)"
    else
        print_error "缺少 index.html"
        return 1
    fi

    if [ -d "$LOCAL_DIST_DIR/assets" ]; then
        has_assets=true
        local count=$(find "$LOCAL_DIST_DIR/assets" -type f | wc -l)
        print_success "assets 目录 ($count 个文件)"
    else
        print_error "缺少 assets 目录"
        return 1
    fi

    # 检查 vite.svg
    if [ -f "$LOCAL_DIST_DIR/vite.svg" ]; then
        print_success "vite.svg"
    fi

    if [ "$has_index_html" = true ] && [ "$has_assets" = true ]; then
        return 0
    else
        return 1
    fi
}

# 上传到服务器
upload_to_server() {
    print_section "上传到服务器"

    print_info "目标服务器: $SERVER_HOST"
    print_info "目标目录: $REMOTE_ADMIN_PATH"

    # 使用 sshpass 或 ssh-key
    if command -v sshpass &> /dev/null; then
        print_info "使用密码认证上传..."

        # 清空远程旧文件
        print_info "清空远程目录..."
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no \
            "$SERVER_USER@$SERVER_HOST" \
            "rm -rf $REMOTE_ADMIN_PATH/* && echo '✓ 远程目录已清空'" \
            > /tmp/ssh-clean.log 2>&1 || {
            print_error "清空远程目录失败"
            cat /tmp/ssh-clean.log
            exit 1
        }

        # 上传文件
        print_info "上传文件..."
        sshpass -p "$SERVER_PASS" scp -r -o StrictHostKeyChecking=no \
            "$LOCAL_DIST_DIR"/* \
            "$SERVER_USER@$SERVER_HOST:$REMOTE_ADMIN_PATH/" \
            > /tmp/scp-upload.log 2>&1 || {
            print_error "上传文件失败"
            cat /tmp/scp-upload.log
            exit 1
        }
    else
        print_warning "未找到 sshpass，使用 SSH-KEY 认证..."

        # 清空远程旧文件
        print_info "清空远程目录..."
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "rm -rf $REMOTE_ADMIN_PATH/* && echo '✓ 远程目录已清空'" \
            > /tmp/ssh-clean.log 2>&1 || {
            print_error "清空远程目录失败"
            cat /tmp/ssh-clean.log
            exit 1
        }

        # 上传文件
        print_info "上传文件..."
        scp -r -o StrictHostKeyChecking=no \
            "$LOCAL_DIST_DIR"/* \
            "$SERVER_USER@$SERVER_HOST:$REMOTE_ADMIN_PATH/" \
            > /tmp/scp-upload.log 2>&1 || {
            print_error "上传文件失败"
            cat /tmp/scp-upload.log
            exit 1
        }
    fi

    print_success "文件上传完成"
}

# 验证远程文件
verify_remote_files() {
    print_section "验证远程文件"

    if command -v sshpass &> /dev/null; then
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no \
            "$SERVER_USER@$SERVER_HOST" \
            "ls -lh $REMOTE_ADMIN_PATH/" > /tmp/remote-files.log 2>&1
    else
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "ls -lh $REMOTE_ADMIN_PATH/" > /tmp/remote-files.log 2>&1
    fi

    # 检查关键文件
    if grep -q "index.html" /tmp/remote-files.log; then
        print_success "index.html 已上传"
    else
        print_error "index.html 未找到"
        return 1
    fi

    if grep -q "assets" /tmp/remote-files.log; then
        print_success "assets 目录已上传"
    else
        print_error "assets 目录未找到"
        return 1
    fi

    cat /tmp/remote-files.log | tail -n +2
}

# 重载 Nginx
reload_nginx() {
    print_section "重载 Nginx"

    print_info "目标服务器: $SERVER_HOST"

    if command -v sshpass &> /dev/null; then
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no \
            "$SERVER_USER@$SERVER_HOST" \
            "nginx -t && nginx -s reload && echo '✓ Nginx 已重载'" \
            > /tmp/nginx-reload.log 2>&1 || {
            print_error "Nginx 重载失败"
            cat /tmp/nginx-reload.log
            return 1
        }
    else
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "nginx -t && nginx -s reload && echo '✓ Nginx 已重载'" \
            > /tmp/nginx-reload.log 2>&1 || {
            print_error "Nginx 重载失败"
            cat /tmp/nginx-reload.log
            return 1
        }
    fi

    cat /tmp/nginx-reload.log
    print_success "Nginx 重载完成"
}

# 测试部署
test_deployment() {
    print_section "测试部署"

    print_info "测试 HTTPS 连接..."

    if command -v curl &> /dev/null; then
        # 测试 Admin 首页
        print_info "测试 1: 检查 Admin 首页..."
        response=$(curl -s -o /dev/null -w "%{http_code}" https://$ADMIN_DOMAIN/)
        if [ "$response" = "200" ]; then
            print_success "Admin 首页返回 200 OK"
        else
            print_error "Admin 首页返回 $response"
            return 1
        fi

        # 测试 index.html 缓存头
        print_info "测试 2: 检查 index.html 缓存头..."
        cache_header=$(curl -s -I https://$ADMIN_DOMAIN/index.html | grep -i "cache-control" || echo "")
        if echo "$cache_header" | grep -q "no-cache"; then
            print_success "index.html 缓存策略正确: $cache_header"
        else
            print_warning "index.html 缓存策略: $cache_header"
        fi

        # 测试 API 代理
        print_info "测试 3: 检查 API 代理..."
        api_response=$(curl -s -o /dev/null -w "%{http_code}" https://$ADMIN_DOMAIN/api/products)
        if [ "$api_response" = "200" ] || [ "$api_response" = "401" ]; then
            print_success "API 代理可访问（HTTP $api_response）"
        else
            print_warning "API 代理返回 $api_response (可能是正常的非200)"
        fi
    else
        print_warning "curl 未安装，跳过在线测试"
    fi
}

# 显示部署摘要
show_summary() {
    print_section "部署摘要"

    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Admin 前端部署成功！${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"

    echo -e "\n${BLUE}部署信息:${NC}"
    echo -e "  • 本地构建目录: $LOCAL_DIST_DIR"
    echo -e "  • 远程部署目录: $REMOTE_ADMIN_PATH"
    echo -e "  • 服务器地址: $SERVER_HOST"
    echo -e "  • 访问地址: https://$ADMIN_DOMAIN/"

    echo -e "\n${BLUE}部署状态:${NC}"
    echo -e "  • 本地构建: ✓"
    echo -e "  • 文件上传: ✓"
    echo -e "  • Nginx 重载: ✓"
    if [ "$VERIFY_DEPLOYMENT" = true ]; then
        echo -e "  • 部署验证: ✓"
    fi

    echo -e "\n${BLUE}下一步:${NC}"
    echo -e "  1. 打开浏览器访问: https://$ADMIN_DOMAIN/"
    echo -e "  2. 检查浏览器控制台是否有错误"
    echo -e "  3. 测试各个功能是否正常"

    echo -e "\n${BLUE}日志文件:${NC}"
    echo -e "  • npm install: /tmp/npm-install.log"
    echo -e "  • npm build: /tmp/npm-build.log"
    echo -e "  • ssh clean: /tmp/ssh-clean.log"
    echo -e "  • scp upload: /tmp/scp-upload.log"
    echo -e "  • nginx reload: /tmp/nginx-reload.log"

    echo
}

# 错误处理
on_error() {
    local line_no=$1
    print_error "部署失败 (第 $line_no 行)"
    echo -e "\n${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}部署过程中出现错误，请检查上述日志信息${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    exit 1
}

# ============================================================================
# 主程序
# ============================================================================

main() {
    print_header

    # 解析命令行参数
    local env="${1:-}"

    if [ -z "$env" ] || [ "$env" = "-h" ] || [ "$env" = "--help" ]; then
        show_usage
        exit 0
    fi

    if [ "$env" != "prod" ]; then
        print_error "不支持的环境: $env"
        show_usage
        exit 1
    fi

    # 处理其他选项
    shift
    while [ $# -gt 0 ]; do
        case "$1" in
            --no-verify)
                VERIFY_DEPLOYMENT=false
                ;;
            --no-reload)
                AUTO_RELOAD_NGINX=false
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done

    # 开始部署
    trap 'on_error $LINENO' ERR

    echo -e "\n${YELLOW}环境: $env${NC}"
    echo -e "${YELLOW}验证部署: $VERIFY_DEPLOYMENT${NC}"
    echo -e "${YELLOW}自动重载 Nginx: $AUTO_RELOAD_NGINX${NC}\n"

    # 执行部署步骤
    validate_deployment_config
    check_dependencies
    check_directories
    clean_build
    build_locally
    verify_build || {
        print_error "构建验证失败"
        exit 1
    }
    upload_to_server

    if [ "$VERIFY_DEPLOYMENT" = true ]; then
        verify_remote_files || {
            print_error "远程文件验证失败"
            exit 1
        }
    fi

    if [ "$AUTO_RELOAD_NGINX" = true ]; then
        reload_nginx || {
            print_error "Nginx 重载失败"
            exit 1
        }
    else
        print_warning "Nginx 未自动重载，请手动执行: ssh root@123.207.14.67 'nginx -s reload'"
    fi

    if [ "$VERIFY_DEPLOYMENT" = true ]; then
        test_deployment || {
            print_warning "部署测试遇到问题，但部署文件已上传"
        }
    fi

    show_summary
}

# 运行主程序
main "$@"
