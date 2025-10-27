#!/bin/bash

# 快速部署脚本 - 跳过本地构建，直接上传和部署

set -e

# ============================================
# 配置信息
# ============================================
SERVER_IP="123.207.14.67"
SERVER_USER="root"
SERVER_PASSWORD="Pp123456"
DEPLOY_PATH="/opt/ruizhu-app"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}快速部署脚本 (Tencent Cloud)${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "服务器 IP: $SERVER_IP"
echo "部署用户: $SERVER_USER"
echo "部署路径: $DEPLOY_PATH"
echo ""

# ============================================
# Step 1: 验证构建产物
# ============================================
echo -e "${YELLOW}[1/5] 验证构建产物...${NC}"

if [ ! -d "nestapi/dist" ]; then
    echo -e "${RED}✗ NestJS 后端未构建 (缺少 nestapi/dist)${NC}"
    exit 1
fi

if [ ! -d "admin/dist" ]; then
    echo -e "${RED}✗ React 前端未构建 (缺少 admin/dist)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 构建产物验证完成${NC}"

# ============================================
# Step 2: 创建部署包
# ============================================
echo -e "${YELLOW}[2/5] 准备部署文件...${NC}"

mkdir -p deploy-quick
cp -r nestapi/dist deploy-quick/nestapi-dist
cp -r admin/dist deploy-quick/admin-dist
cp nestapi/.env deploy-quick/.env.backend
cp nestapi/package.json deploy-quick/nestapi-package.json
cp nestapi/db/database-init-corrected.sql deploy-quick/
cp scripts/server-setup.sh deploy-quick/
cp scripts/nginx-config.conf deploy-quick/

echo -e "${GREEN}✓ 部署文件准备完成${NC}"

# ============================================
# Step 3: 创建服务器部署目录
# ============================================
echo -e "${YELLOW}[3/5] 连接服务器...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP \
    "mkdir -p $DEPLOY_PATH && echo '✓ 服务器目录已准备'"

echo -e "${GREEN}✓ 服务器连接成功${NC}"

# ============================================
# Step 4: 上传部署文件
# ============================================
echo -e "${YELLOW}[4/5] 上传部署文件到服务器...${NC}"

sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no \
    deploy-quick/* $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

echo -e "${GREEN}✓ 文件上传完成${NC}"

# ============================================
# Step 5: 服务器初始化和启动
# ============================================
echo -e "${YELLOW}[5/5] 服务器初始化和启动服务...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e

    DEPLOY_PATH="/opt/ruizhu-app"

    # 进入部署目录
    cd $DEPLOY_PATH

    # 安装系统依赖
    echo "安装系统依赖..."
    apt-get update > /dev/null 2>&1
    apt-get install -y curl wget > /dev/null 2>&1

    # 安装 Node.js (如果未安装)
    if ! command -v node &> /dev/null; then
        echo "安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs > /dev/null 2>&1
    fi

    # 安装 PM2 (全局)
    if ! command -v pm2 &> /dev/null; then
        echo "安装 PM2..."
        npm install -g pm2 > /dev/null 2>&1
    fi

    # 安装 Nginx (如果未安装)
    if ! command -v nginx &> /dev/null; then
        echo "安装 Nginx..."
        apt-get install -y nginx > /dev/null 2>&1
    fi

    # 安装 MySQL Client (如果未安装)
    if ! command -v mysql &> /dev/null; then
        echo "安装 MySQL Client..."
        apt-get install -y mysql-client > /dev/null 2>&1
    fi

    # 配置环境变量
    echo "配置环境变量..."
    cat > .env.production << 'EOF'
PORT=8888
NODE_ENV=production
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
DB_URL=mysql://root:Pp123456@gz-cdb-qtjza6az.sql.tencentcdb.com:27226/mydb
DB_HOST=gz-cdb-qtjza6az.sql.tencentcdb.com
DB_PORT=27226
DB_USER=root
DB_PASSWORD=Pp123456
DB_NAME=mydb
COS_SECRET_ID=your-secret-id-here
COS_SECRET_KEY=your-secret-key-here
COS_REGION=ap-guangzhou
COS_BUCKET=ruizhu-1256655507
COS_UPLOAD_MAX_SIZE=52428800
WECHAT_APP_ID=your_mini_app_id
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key
EOF

    # 启动后端服务
    echo "启动后端服务..."
    pm2 delete ruizhu-backend 2>/dev/null || true
    pm2 start nestapi-dist/main.js \
        --name "ruizhu-backend" \
        --env production \
        --env-file .env.production \
        --instances max \
        --exec-mode cluster \
        --max-memory-restart 500M \
        --error /var/log/ruizhu-backend-error.log \
        --out /var/log/ruizhu-backend-out.log

    pm2 save
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true

    # 配置 Nginx
    echo "配置 Nginx..."
    cp /tmp/nginx-config.conf /etc/nginx/sites-available/default 2>/dev/null || \
    cp nginx-config.conf /etc/nginx/sites-available/default

    nginx -t > /dev/null 2>&1
    systemctl restart nginx

    # 等待服务启动
    sleep 3

    echo ""
    echo "✓ 服务启动成功！"
    echo ""
    echo "📍 访问地址:"
    echo "  管理后台: http://123.207.14.67"
    echo "  API: http://123.207.14.67/api/v1"
    echo ""
    echo "📌 服务管理:"
    echo "  pm2 list - 查看进程"
    echo "  pm2 logs - 查看日志"
    echo "  pm2 restart ruizhu-backend - 重启服务"

ENDSSH

echo -e "${GREEN}✓ 服务器部署完成${NC}"

# ============================================
# 总结
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 访问地址:"
echo "  🌐 管理后台: http://123.207.14.67"
echo "  🔌 API: http://123.207.14.67/api/v1"
echo ""
echo "📌 后续步骤:"
echo "  1. SSH 连接服务器: ssh root@123.207.14.67"
echo "  2. 初始化数据库:"
echo "     mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p < /opt/ruizhu-app/database-init-corrected.sql"
echo "  3. 输入数据库密码: Pp123456"
echo ""
echo "📊 服务管理:"
echo "  pm2 list              # 查看进程状态"
echo "  pm2 logs              # 查看实时日志"
echo "  pm2 restart all       # 重启所有服务"
echo ""

# 清理本地临时文件
rm -rf deploy-quick

echo -e "${GREEN}✓ 部署脚本执行完成${NC}"
