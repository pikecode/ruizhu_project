#!/bin/bash

# 服务器初始化脚本 - 在服务器上运行
# 配置环境变量、初始化数据库、启动服务

set -e

DEPLOY_PATH="/opt/ruizhu-app"
DB_HOST="gz-cdb-qtjza6az.sql.tencentcdb.com"
DB_PORT="27226"
DB_USER="root"
DB_NAME="mydb"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}服务器初始化脚本${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# ============================================
# Step 1: 检查部署文件
# ============================================
echo -e "${YELLOW}[1/5] 检查部署文件...${NC}"

if [ ! -d "$DEPLOY_PATH" ]; then
    echo -e "${RED}✗ 部署路径 $DEPLOY_PATH 不存在${NC}"
    exit 1
fi

cd $DEPLOY_PATH
echo -e "${GREEN}✓ 部署路径验证完成${NC}"

# ============================================
# Step 2: 配置环境变量
# ============================================
echo -e "${YELLOW}[2/5] 配置环境变量...${NC}"

# 创建后端生产环境配置
cat > .env.production << EOF
# Application
PORT=8888
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# Database URL Connection String (Cloud Database)
DB_URL=mysql://root:Pp123456@gz-cdb-qtjza6az.sql.tencentcdb.com:27226/mydb

# Legacy DB config (backup)
DB_HOST=gz-cdb-qtjza6az.sql.tencentcdb.com
DB_PORT=27226
DB_USER=root
DB_PASSWORD=Pp123456
DB_NAME=mydb

# Tencent COS Configuration
COS_SECRET_ID=AKIDiSyGOJzdDdrunW7Xp5A3lJkz51oQzMYZ
COS_SECRET_KEY=rW6VigP5bv1wgtvjMp581kGXaSwIQNlw
COS_REGION=ap-guangzhou
COS_BUCKET=ruizhu-1256655507
COS_UPLOAD_MAX_SIZE=52428800

# WeChat Mini Program Payment
WECHAT_APP_ID=your_mini_app_id
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key
EOF

echo -e "${GREEN}✓ 环境变量配置完成${NC}"

# ============================================
# Step 3: 初始化数据库
# ============================================
echo -e "${YELLOW}[3/5] 初始化数据库...${NC}"

if [ -f "database-init-corrected.sql" ]; then
    echo "连接云数据库并执行初始化脚本..."
    # 提示用户输入数据库密码
    read -s -p "请输入数据库密码 (或直接回车使用配置的密码): " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-"Pp123456"}

    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p"$DB_PASSWORD" < database-init-corrected.sql

    echo -e "${GREEN}✓ 数据库初始化完成${NC}"
else
    echo -e "${RED}✗ 未找到数据库初始化脚本${NC}"
fi

# ============================================
# Step 4: 启动后端服务
# ============================================
echo -e "${YELLOW}[4/5] 启动后端服务...${NC}"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

# 使用 PM2 启动后端服务
pm2 start nestapi-dist/main.js \
    --name "ruizhu-backend" \
    --env production \
    --env-file .env.production \
    --instances max \
    --exec-mode cluster \
    --max-memory-restart 500M \
    --error /var/log/ruizhu-backend-error.log \
    --out /var/log/ruizhu-backend-out.log

# 保存 PM2 进程
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ 后端服务启动完成${NC}"

# ============================================
# Step 5: 验证部署
# ============================================
echo -e "${YELLOW}[5/5] 验证部署...${NC}"

# 等待服务启动
sleep 5

# 检查后端服务
echo "检查后端服务状态..."
pm2 list

# 检查端口
if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ 后端服务运行正常 (端口 8888)${NC}"
else
    echo -e "${RED}✗ 后端服务未响应${NC}"
fi

# 检查 Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx 运行正常${NC}"
else
    echo -e "${RED}✗ Nginx 未运行${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}服务器初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 访问地址:"
echo "  API 服务: http://localhost:8888/api/v1"
echo "  管理后台: http://localhost/"
echo ""
echo "📌 服务管理:"
echo "  查看进程: pm2 list"
echo "  查看日志: pm2 logs ruizhu-backend"
echo "  重启服务: pm2 restart ruizhu-backend"
echo "  停止服务: pm2 stop ruizhu-backend"
echo ""
echo "🔍 检查日志:"
echo "  后端错误日志: tail -f /var/log/ruizhu-backend-error.log"
echo "  Nginx 错误日志: tail -f /var/log/nginx/ruizhu-error.log"
echo ""
