#!/bin/bash

###############################################################################
# Ruizhu NestAPI 一键部署脚本（包装器）
# 功能：调用 nestapi/deploy/auto-deploy.sh 进行后端部署
# 用法: ./nestapi-deploy.sh
###############################################################################

# 脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NESTAPI_DEPLOY_SCRIPT="$PROJECT_ROOT/nestapi/deploy/auto-deploy.sh"

# 颜色输出
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 检查脚本是否存在
if [ ! -f "$NESTAPI_DEPLOY_SCRIPT" ]; then
    echo -e "${RED}✗ 错误: 未找到 NestAPI 部署脚本${NC}"
    echo -e "${RED}  预期位置: $NESTAPI_DEPLOY_SCRIPT${NC}"
    exit 1
fi

# 使脚本可执行
chmod +x "$NESTAPI_DEPLOY_SCRIPT"

# 显示提示
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 Ruizhu NestAPI 一键部署${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}调用部署脚本:${NC} $NESTAPI_DEPLOY_SCRIPT"
echo ""

# 调用实际的部署脚本并传递所有参数
exec "$NESTAPI_DEPLOY_SCRIPT" "$@"
