#!/bin/bash

##############################################################################
#                                                                            #
#  部署验证脚本                                                               #
#  用于验证服务器是否部署了最新代码                                            #
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

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}部署验证脚本${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# 1. 检查服务器文件时间戳
echo -e "${YELLOW}[1/4] 检查服务器文件更新时间...${NC}"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
echo "NestAPI 文件更新时间:"
ls -lh /opt/ruizhu-app/nestapi-dist/dist/modules/orders/services/orders.service.js | awk '{print $6, $7, $8}'

echo ""
echo "Admin 文件更新时间:"
ls -lh /opt/ruizhu-app/admin/index.html | awk '{print $6, $7, $8}'
EOF
echo ""

# 2. 检查 PM2 进程状态
echo -e "${YELLOW}[2/4] 检查 PM2 进程状态...${NC}"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
pm2 list | grep ruizhu-backend
EOF
echo ""

# 3. 检查 API 健康状态
echo -e "${YELLOW}[3/4] 检查 API 健康状态...${NC}"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs)
if [ "$HTTP_CODE" == "200" ]; then
    echo "✓ API 健康检查通过 (HTTP $HTTP_CODE)"
else
    echo "⚠ API 健康检查失败 (HTTP $HTTP_CODE)"
fi
EOF
echo ""

# 4. 检查关键代码特征（库存扣减逻辑）
echo -e "${YELLOW}[4/4] 验证关键代码是否部署...${NC}"
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
# 检查 orders.service.js 中是否包含新的库存扣减逻辑
if grep -q "支付成功后扣减库存" /opt/ruizhu-app/nestapi-dist/dist/modules/orders/services/orders.service.js 2>/dev/null; then
    echo "✓ 检测到新的库存扣减逻辑（支付成功后扣减）"
else
    echo "✗ 未检测到新的库存扣减逻辑，可能需要部署"
fi

# 检查是否还有旧的库存扣减逻辑
if grep -q "订单创建时立即扣减库存" /opt/ruizhu-app/nestapi-dist/dist/modules/orders/services/orders.service.js 2>/dev/null; then
    echo "⚠ 警告: 仍包含旧的库存扣减逻辑（订单创建时）"
else
    echo "✓ 已移除旧的库存扣减逻辑"
fi
EOF
echo ""

# 总结
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}验证完成${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo "如果检测到需要部署，请运行:"
echo "  ./scripts/deploy.sh"
echo ""
