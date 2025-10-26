#!/bin/bash

# Ruizhu 项目 - 一键启动所有服务脚本 (微信小程序版本)
# 同时启动后端 API、微信小程序、管理后台

set -e

PROJECT_DIR="/Users/peak/work/pikecode/ruizhu_project"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Ruizhu Platform - WeChat Mini Program Version 🚀      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检查目录
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}✗ 项目目录不存在: $PROJECT_DIR${NC}"
  exit 1
fi

echo -e "${YELLOW}启动所有服务...${NC}"
echo ""

# 启动后端 API (背景运行)
echo -e "${GREEN}➜${NC} 启动 NestAPI 后端 (端口 8888)..."
cd "$PROJECT_DIR/nestapi"
npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} 后端已启动 (PID: $BACKEND_PID)"

# 等待1秒
sleep 1

# 启动微信小程序 (背景运行)
echo -e "${GREEN}➜${NC} 启动微信小程序 (WeChat Mini Program)..."
cd "$PROJECT_DIR/miniprogram"
npm run dev:mp-weixin > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} 微信小程序已启动 (PID: $FRONTEND_PID)"

# 等待1秒
sleep 1

# 启动管理后台 (背景运行)
echo -e "${GREEN}➜${NC} 启动管理后台 (端口 5174)..."
cd "$PROJECT_DIR/admin"
npm run dev > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
echo -e "${GREEN}✓${NC} 管理后台已启动 (PID: $ADMIN_PID)"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ✅ 所有服务启动成功 ✅                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📍 可用服务:${NC}"
echo -e "  🔷 后端 API           → ${GREEN}http://localhost:8888/api/v1${NC}"
echo -e "  📱 微信小程序         → ${GREEN}开发者工具中编译预览${NC}"
echo -e "  ⚙️  管理后台          → ${GREEN}http://localhost:5174${NC}"
echo ""

echo -e "${YELLOW}📋 进程 ID:${NC}"
echo -e "  后端:      $BACKEND_PID"
echo -e "  小程序:    $FRONTEND_PID"
echo -e "  管理后台:  $ADMIN_PID"
echo ""

echo -e "${YELLOW}📝 日志文件:${NC}"
echo -e "  后端:     tail -f /tmp/backend.log"
echo -e "  小程序:   tail -f /tmp/frontend.log"
echo -e "  管理后台: tail -f /tmp/admin.log"
echo ""

echo -e "${YELLOW}🛑 停止所有服务:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID"
echo ""

echo -e "${BLUE}💡 微信小程序开发说明:${NC}"
echo -e "  1. 使用微信开发者工具打开 miniprogram 文件夹"
echo -e "  2. 导入项目并配置 AppID"
echo -e "  3. 编译预览或上传发布"
echo ""

# 保持脚本运行，并捕获退出信号
cleanup() {
  echo ""
  echo -e "${YELLOW}正在停止所有服务...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill $ADMIN_PID 2>/dev/null || true
  echo -e "${GREEN}所有服务已停止${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 等待所有进程
wait
