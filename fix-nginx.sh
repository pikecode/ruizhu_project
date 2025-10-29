#!/bin/bash

# ====================================================================
# Ruizhu 平台 - Nginx 自动修复脚本
# 用途：将 yunjie.online 的 Nginx 配置从错误的指向修复到 NestAPI
# 用法：在远程服务器上运行: bash fix-nginx.sh
# ====================================================================

set -e  # 任何命令失败都停止脚本

echo "=============================================================="
echo "🔧 Ruizhu 平台 Nginx 自动修复脚本"
echo "=============================================================="
echo ""

# 检查是否是 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 错误：此脚本需要 root 权限"
    echo "请使用: sudo bash fix-nginx.sh"
    exit 1
fi

# ============================================================
# 第 1 步：检查 Nginx 是否安装
# ============================================================
echo "📋 第 1 步：检查 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "❌ 错误：Nginx 未安装"
    echo "请先安装 Nginx: apt-get install nginx"
    exit 1
fi
echo "✅ Nginx 已安装"
echo ""

# ============================================================
# 第 2 步：查找 Nginx 配置文件
# ============================================================
echo "📋 第 2 步：查找 Nginx 配置文件..."
CONFIG_FILE=""

if [ -f "/etc/nginx/sites-available/yunjie.online" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/yunjie.online"
    echo "✅ 找到配置文件: $CONFIG_FILE"
elif [ -f "/etc/nginx/conf.d/yunjie.online.conf" ]; then
    CONFIG_FILE="/etc/nginx/conf.d/yunjie.online.conf"
    echo "✅ 找到配置文件: $CONFIG_FILE"
elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
    CONFIG_FILE="/etc/nginx/conf.d/default.conf"
    echo "⚠️  使用默认配置文件: $CONFIG_FILE"
else
    echo "❌ 错误：无法找到 yunjie.online 的 Nginx 配置文件"
    echo "请检查以下位置："
    echo "  - /etc/nginx/sites-available/yunjie.online"
    echo "  - /etc/nginx/conf.d/yunjie.online.conf"
    echo "  - /etc/nginx/conf.d/default.conf"
    exit 1
fi
echo ""

# ============================================================
# 第 3 步：备份原配置
# ============================================================
echo "📋 第 3 步：备份原配置..."
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "✅ 备份文件: $BACKUP_FILE"
echo ""

# ============================================================
# 第 4 步：显示当前配置
# ============================================================
echo "📋 第 4 步：当前配置内容..."
echo "================================"
cat "$CONFIG_FILE"
echo "================================"
echo ""

# ============================================================
# 第 5 步：生成新的正确配置
# ============================================================
echo "📋 第 5 步：生成新的正确配置..."

cat > "$CONFIG_FILE" << 'NGINX_CONFIG'
# Ruizhu Platform - NestAPI 服务
# 配置日期: 2025-10-29
# 用途: 反向代理到 NestAPI (localhost:3000)

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name yunjie.online;

    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/yunjie.online.crt;
    ssl_certificate_key /etc/ssl/private/yunjie.online.key;

    # SSL 安全设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/yunjie.online-access.log combined;
    error_log /var/log/nginx/yunjie.online-error.log warn;

    # ✅ 反向代理到 NestAPI
    location / {
        proxy_pass http://localhost:3000;

        # 重要的代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yunjie.online;
    return 301 https://$server_name$request_uri;
}
NGINX_CONFIG

echo "✅ 新配置已生成"
echo ""

# ============================================================
# 第 6 步：显示新配置
# ============================================================
echo "📋 第 6 步：新配置内容..."
echo "================================"
cat "$CONFIG_FILE"
echo "================================"
echo ""

# ============================================================
# 第 7 步：测试 Nginx 配置
# ============================================================
echo "📋 第 7 步：测试 Nginx 配置语法..."
if nginx -t > /tmp/nginx_test.log 2>&1; then
    echo "✅ Nginx 配置正确"
    cat /tmp/nginx_test.log
else
    echo "❌ Nginx 配置错误，恢复备份"
    cat /tmp/nginx_test.log
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi
echo ""

# ============================================================
# 第 8 步：重启 Nginx
# ============================================================
echo "📋 第 8 步：重启 Nginx 服务..."
if systemctl restart nginx; then
    echo "✅ Nginx 重启成功"
else
    echo "❌ Nginx 重启失败，恢复备份"
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    systemctl restart nginx
    exit 1
fi
echo ""

# ============================================================
# 第 9 步：验证 Nginx 状态
# ============================================================
echo "📋 第 9 步：验证 Nginx 运行状态..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx 运行正常"
else
    echo "❌ Nginx 未运行"
    systemctl start nginx
fi
echo ""

# ============================================================
# 第 10 步：检查 NestAPI 是否运行
# ============================================================
echo "📋 第 10 步：检查 NestAPI 服务..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ NestAPI 运行在端口 3000"
else
    echo "⚠️  警告：NestAPI 似乎未在运行"
    echo "请确保 NestAPI 已启动："
    echo "  pm2 start nestapi"
    echo "  或"
    echo "  npm run start (在 /path/to/nestapi 目录)"
fi
echo ""

# ============================================================
# 第 11 步：测试本地连接
# ============================================================
echo "📋 第 11 步：测试本地连接..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ NestAPI 本地连接正常"
else
    echo "⚠️  警告：无法连接到 NestAPI (localhost:3000)"
fi
echo ""

# ============================================================
# 第 12 步：测试 HTTPS 连接
# ============================================================
echo "📋 第 12 步：测试 HTTPS 连接..."
if curl -k https://localhost/health 2>/dev/null | grep -q "ok\|success\|error" 2>/dev/null; then
    echo "✅ HTTPS 连接正常"
else
    echo "⚠️  可能需要等待一会儿让服务完全启动"
fi
echo ""

# ============================================================
# 最终总结
# ============================================================
echo "=============================================================="
echo "✅ 修复完成！"
echo "=============================================================="
echo ""
echo "📝 修复摘要："
echo "  ✅ Nginx 配置已更新"
echo "  ✅ yunjie.online 现在指向 localhost:3000 (NestAPI)"
echo "  ✅ Nginx 已重启"
echo "  ✅ 备份文件: $BACKUP_FILE"
echo ""
echo "🔍 下一步验证："
echo "  1. 在本地运行测试脚本："
echo "     cd /Users/peakom/work/ruizhu_project"
echo "     bash test-deployment.sh"
echo ""
echo "  2. 或在远程服务器上手动测试："
echo "     curl -I https://yunjie.online/banners"
echo "     curl http://localhost:3000/banners"
echo ""
echo "📊 日志位置："
echo "  - Access Log: /var/log/nginx/yunjie.online-access.log"
echo "  - Error Log: /var/log/nginx/yunjie.online-error.log"
echo ""
echo "🔄 回滚（如果需要）："
echo "  cp $BACKUP_FILE $CONFIG_FILE"
echo "  systemctl restart nginx"
echo ""
echo "=============================================================="
