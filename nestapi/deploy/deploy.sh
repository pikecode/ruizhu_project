#!/bin/bash

# NestAPI 部署脚本
# 用法: ./deploy/deploy.sh [release-file.tar.gz]

set -e

echo "═══════════════════════════════════════════════════"
echo "   🚀 NestAPI 远程部署脚本"
echo "═══════════════════════════════════════════════════"
echo ""

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 配置信息
REMOTE_HOST="123.207.14.67"
REMOTE_USER="root"
REMOTE_PASSWORD="Pp123456"
REMOTE_APP_DIR="/opt/ruizhu-app/nestapi-dist"
REMOTE_BACKUP_DIR="/opt/ruizhu-app/backups"

# 获取最新的发布文件
if [ -n "$1" ]; then
    RELEASE_FILE="$1"
else
    RELEASE_FILE=$(ls -t deploy/releases/nestapi-*.tar.gz 2>/dev/null | head -1)
fi

if [ -z "$RELEASE_FILE" ]; then
    echo "❌ 错误: 找不到发布文件"
    echo "请先运行以下命令:"
    echo "  1. ./deploy/build.sh"
    echo "  2. ./deploy/package.sh"
    exit 1
fi

if [ ! -f "$RELEASE_FILE" ]; then
    echo "❌ 错误: 文件不存在 - $RELEASE_FILE"
    exit 1
fi

RELEASE_NAME=$(basename "$RELEASE_FILE")
RELEASE_SIZE=$(du -sh "$RELEASE_FILE" | cut -f1)

echo "📍 项目目录: $PROJECT_ROOT"
echo "📦 发布文件: $RELEASE_FILE"
echo "📊 文件大小: $RELEASE_SIZE"
echo ""

# 确认部署
read -p "确认部署到 $REMOTE_HOST 吗? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 1
fi

echo ""
echo "🔑 连接到服务器..."
echo ""

# 使用 sshpass 和 SSH 部署
sshpass -p "$REMOTE_PASSWORD" ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST << DEPLOY_SCRIPT
set -e

echo "══════════════════════════════════════════════════════"
echo "   📦 服务器部署开始"
echo "══════════════════════════════════════════════════════"
echo ""

# 创建备份目录
mkdir -p $REMOTE_BACKUP_DIR

# 创建临时部署目录
DEPLOY_TEMP="/tmp/nestapi-deploy-\$(date +%s)"
mkdir -p \$DEPLOY_TEMP

echo "📋 传输文件..."

DEPLOY_SCRIPT

# 上传文件到服务器
echo "📤 上传发布文件到服务器..."
sshpass -p "$REMOTE_PASSWORD" scp -o StrictHostKeyChecking=no \
    "$RELEASE_FILE" "$REMOTE_USER@$REMOTE_HOST:/tmp/$RELEASE_NAME"

echo "✅ 文件上传完成"
echo ""

# 在服务器上执行部署
sshpass -p "$REMOTE_PASSWORD" ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST << 'DEPLOY_COMPLETE'
set -e

DEPLOY_TEMP="/tmp/nestapi-deploy-$(date +%s)"
RELEASE_NAME=$(basename $(ls -t /tmp/nestapi-*.tar.gz 2>/dev/null | head -1))
REMOTE_APP_DIR="/opt/ruizhu-app/nestapi-dist"
REMOTE_BACKUP_DIR="/opt/ruizhu-app/backups"
BACKUP_NAME="nestapi-backup-$(date +%Y%m%d-%H%M%S)"

echo "⏸️  停止当前应用..."
pm2 stop ruizhu-backend 2>/dev/null || true
sleep 2

echo "💾 创建备份..."
if [ -d "$REMOTE_APP_DIR/dist" ]; then
    tar -czf "$REMOTE_BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$REMOTE_APP_DIR" dist
    echo "✅ 备份完成: $BACKUP_NAME"
fi

echo ""
echo "📂 解压新版本..."
mkdir -p "$DEPLOY_TEMP"
tar -xzf "/tmp/$RELEASE_NAME" -C "$DEPLOY_TEMP"

# 保护生产环境配置
echo "🔐 保护生产环境配置..."
if [ -f "$REMOTE_APP_DIR/.env" ]; then
    cp "$REMOTE_APP_DIR/.env" "$DEPLOY_TEMP/.env"
    echo "✅ .env 文件已保留"
fi

echo ""
echo "🔄 更新应用文件..."
rm -rf "$REMOTE_APP_DIR/dist"
cp -r "$DEPLOY_TEMP/dist" "$REMOTE_APP_DIR/"

if [ -f "$DEPLOY_TEMP/package.json" ]; then
    cp "$DEPLOY_TEMP/package.json" "$REMOTE_APP_DIR/"
fi

if [ -f "$DEPLOY_TEMP/package-lock.json" ]; then
    cp "$DEPLOY_TEMP/package-lock.json" "$REMOTE_APP_DIR/"
fi

echo "✅ 文件更新完成"
echo ""

# 清理临时文件
rm -rf "$DEPLOY_TEMP"
rm -f "/tmp/$RELEASE_NAME"

echo "🚀 启动应用..."
sleep 2
pm2 start ruizhu-backend
sleep 3

echo ""
echo "═══════════════════════════════════════════════════════"
echo "   ✅ 部署完成"
echo "═══════════════════════════════════════════════════════"
echo ""

# 测试应用
echo "🧪 测试应用..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs)

if [ "$HEALTH_CHECK" == "200" ]; then
    echo "✅ 应用已启动并运行正常 (HTTP $HEALTH_CHECK)"
else
    echo "⚠️  应用启动，但健康检查返回 HTTP $HEALTH_CHECK"
fi

echo ""
echo "📊 部署信息:"
echo "   • 版本: $(cat /opt/ruizhu-app/nestapi-dist/VERSION 2>/dev/null || echo 'N/A')"
echo "   • 部署时间: $(date)"
echo "   • 备份位置: $REMOTE_BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo ""

# 显示PM2状态
echo "PM2 状态:"
pm2 status | grep ruizhu-backend || true

echo ""
echo "💾 最近备份:"
ls -lth "$REMOTE_BACKUP_DIR" | head -3 || true

DEPLOY_COMPLETE

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ✅ 远程部署完成"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 部署总结:"
echo "   • 发布文件: $RELEASE_NAME"
echo "   • 文件大小: $RELEASE_SIZE"
echo "   • 部署时间: $(date)"
echo "   • 服务器: $REMOTE_HOST"
echo "   • 应用目录: $REMOTE_APP_DIR"
echo ""
echo "💡 查看服务器日志: sshpass -p \"$REMOTE_PASSWORD\" ssh $REMOTE_USER@$REMOTE_HOST pm2 logs ruizhu-backend"
echo ""
