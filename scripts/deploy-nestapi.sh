#!/bin/bash

##############################################################################
#                                                                            #
#  NestAPI 后端部署脚本（增量更新）                                            #
#                                                                            #
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务器配置
SERVER_IP="123.207.14.67"
SERVER_USER="root"
SERVER_PASSWORD="${DEPLOY_PASSWORD:-}"

# 检查密码
if [ -z "$SERVER_PASSWORD" ]; then
    read -sp "请输入服务器密码: " SERVER_PASSWORD
    echo ""
    if [ -z "$SERVER_PASSWORD" ]; then
        echo -e "${RED}错误: 密码不能为空${NC}"
        exit 1
    fi
fi

# 部署路径
NESTAPI_REMOTE_PATH="/opt/ruizhu-app/nestapi-dist"

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║         NestAPI 后端部署                                ║"
echo "║         $(date '+%Y-%m-%d %H:%M:%S')                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "服务器: $SERVER_IP"
echo "部署路径: $NESTAPI_REMOTE_PATH"
echo ""

# ============================================================================
# 阶段 1: 本地构建
# ============================================================================

echo -e "${YELLOW}[1/3] 本地构建 NestAPI...${NC}"
cd "$PROJECT_ROOT/nestapi"
npm run build
echo -e "${GREEN}✓ NestAPI 构建完成${NC}"
echo ""

# ============================================================================
# 阶段 2: 上传文件
# ============================================================================

echo -e "${YELLOW}[2/3] 上传 NestAPI 到服务器...${NC}"
sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no \
    "$PROJECT_ROOT/nestapi/dist/"* "$SERVER_USER@$SERVER_IP:$NESTAPI_REMOTE_PATH/dist/"
echo -e "${GREEN}✓ NestAPI 上传完成${NC}"
echo ""

# ============================================================================
# 阶段 3: 重启服务
# ============================================================================

echo -e "${YELLOW}[3/3] 重启 PM2 服务...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'RESTART'
# 重启 PM2
pm2 restart ruizhu-backend
sleep 3

echo "PM2 状态:"
pm2 list | grep ruizhu-backend

echo ""
echo "测试 API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs)
if [ "$HTTP_CODE" == "200" ]; then
    echo "✓ API 正常 (HTTP $HTTP_CODE)"
else
    echo "⚠ API 返回 HTTP $HTTP_CODE"
fi
RESTART

echo -e "${GREEN}✓ 服务重启完成${NC}"
echo ""

# ============================================================================
# 部署完成
# ============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          部署完成！                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "访问地址:"
echo "  API:   https://yunjie.online/api/"
echo ""
echo "验证部署:"
echo "  ./scripts/verify-deployment.sh"
echo ""
