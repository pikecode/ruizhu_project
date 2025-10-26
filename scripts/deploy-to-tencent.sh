#!/bin/bash

# 腾讯云服务器部署脚本
# 部署 Ruizhu 电商平台完整项目

set -e

# ============================================
# 配置信息
# ============================================
SERVER_IP="123.207.14.67"
SERVER_USER="root"
SERVER_PASSWORD="Pp123456"
DEPLOY_PATH="/opt/ruizhu-app"
PROJECT_NAME="ruizhu_project"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}腾讯云服务器部署脚本${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "服务器 IP: $SERVER_IP"
echo "部署用户: $SERVER_USER"
echo "部署路径: $DEPLOY_PATH"
echo ""

# ============================================
# Step 1: 本地构建
# ============================================
echo -e "${YELLOW}[1/6] 构建本地项目...${NC}"

# 构建后端
echo "构建 NestJS 后端..."
cd nestapi
npm install --production --legacy-peer-deps
npm run build
cd ..

# 构建前端
echo "构建 React 管理后台..."
cd admin
npm install --production
npm run build
cd ..

echo -e "${GREEN}✓ 本地项目构建完成${NC}"

# ============================================
# Step 2: 生成部署包
# ============================================
echo -e "${YELLOW}[2/6] 生成部署包...${NC}"

mkdir -p deploy-package
cp -r nestapi/dist deploy-package/nestapi-dist
cp -r nestapi/node_modules deploy-package/nestapi-node_modules
cp nestapi/.env deploy-package/.env.backend
cp nestapi/package.json deploy-package/nestapi-package.json

cp -r admin/dist deploy-package/admin-dist
cp admin/.env deploy-package/.env.frontend

echo -e "${GREEN}✓ 部署包生成完成${NC}"

# ============================================
# Step 3: 上传到服务器
# ============================================
echo -e "${YELLOW}[3/6] 上传项目到服务器...${NC}"

# 使用 sshpass 进行密码认证上传
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}✗ 需要安装 sshpass${NC}"
    echo "运行: brew install sshpass (Mac) 或 apt-get install sshpass (Linux)"
    exit 1
fi

# 创建服务器部署目录
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP \
    "mkdir -p $DEPLOY_PATH && cd $DEPLOY_PATH && pwd"

# 上传部署包
echo "上传项目文件..."
sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no \
    deploy-package/* $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# 上传初始化脚本
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
    nestapi/db/database-init-corrected.sql $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# 上传服务器初始化脚本
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
    scripts/server-setup.sh $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# 上传 Nginx 配置
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
    scripts/nginx-config.conf $SERVER_USER@$SERVER_IP:/tmp/

echo -e "${GREEN}✓ 上传完成${NC}"

# ============================================
# Step 4: 服务器环境初始化
# ============================================
echo -e "${YELLOW}[4/6] 初始化服务器环境...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e

    # 更新系统
    apt-get update

    # 安装 Node.js 和 npm
    if ! command -v node &> /dev/null; then
        echo "安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    fi

    # 安装 PM2
    if ! command -v pm2 &> /dev/null; then
        echo "安装 PM2..."
        npm install -g pm2
    fi

    # 安装 Nginx
    if ! command -v nginx &> /dev/null; then
        echo "安装 Nginx..."
        apt-get install -y nginx
    fi

    # 安装 MySQL Client
    if ! command -v mysql &> /dev/null; then
        echo "安装 MySQL Client..."
        apt-get install -y mysql-client
    fi

    echo "✓ 服务器环境初始化完成"
ENDSSH

echo -e "${GREEN}✓ 环境初始化完成${NC}"

# ============================================
# Step 5: 启动后端服务
# ============================================
echo -e "${YELLOW}[5/6] 启动后端服务...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << ENDSSH
    cd $DEPLOY_PATH

    # 启动 NestJS 后端
    pm2 start nestapi-dist/main.js --name "ruizhu-backend" --env production

    # 启动前端静态服务 (使用 http-server 或直接用 Nginx)

    # 保存 PM2 进程
    pm2 save
    pm2 startup

    echo "✓ 后端服务启动完成"
ENDSSH

echo -e "${GREEN}✓ 后端服务启动完成${NC}"

# ============================================
# Step 6: 配置 Nginx
# ============================================
echo -e "${YELLOW}[6/6] 配置 Nginx 反向代理...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # 备份原始 Nginx 配置
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

    # 使用新配置替换
    cp /tmp/nginx-config.conf /etc/nginx/sites-available/default

    # 测试 Nginx 配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx

    echo "✓ Nginx 配置完成"
ENDSSH

echo -e "${GREEN}✓ Nginx 配置完成${NC}"

# ============================================
# 总结
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 访问地址:"
echo "  - 后端 API: http://$SERVER_IP:8888/api/v1"
echo "  - 管理后台: http://$SERVER_IP/"
echo ""
echo "📌 服务管理命令 (在服务器上运行):"
echo "  查看进程: pm2 list"
echo "  查看日志: pm2 logs ruizhu-backend"
echo "  重启服务: pm2 restart ruizhu-backend"
echo "  停止服务: pm2 stop ruizhu-backend"
echo ""
echo "🗄️ 数据库初始化 (需手动执行):"
echo "  ssh root@$SERVER_IP"
echo "  mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -u root -p < $DEPLOY_PATH/database-init-corrected.sql"
echo ""

# 清理本地部署包
rm -rf deploy-package

echo -e "${GREEN}✓ 部署脚本执行完成${NC}"
