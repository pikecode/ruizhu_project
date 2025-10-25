#!/bin/bash

# Ruizhu 项目 - 一键启动所有服务脚本
# 同时启动后端 API、前端小程序、管理后台

set -e

PROJECT_DIR="/Users/peak/work/pikecode/ruizhu_project"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Ruizhu Platform - Start All Services 🚀            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检查目录
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}✗ Project directory not found: $PROJECT_DIR${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting all services...${NC}"
echo ""

# 启动后端 API (背景运行)
echo -e "${GREEN}➜${NC} Starting NestAPI Backend (port 8888)..."
cd "$PROJECT_DIR/nestapi"
npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# 等待1秒
sleep 1

# 启动前端小程序 (背景运行)
echo -e "${GREEN}➜${NC} Starting Mini Program - H5 (port 8080)..."
cd "$PROJECT_DIR/miniprogram"
npm run dev:h5 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"

# 等待1秒
sleep 1

# 启动管理后台 (背景运行)
echo -e "${GREEN}➜${NC} Starting Admin Dashboard (port 5174)..."
cd "$PROJECT_DIR/admin"
npm run dev > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
echo -e "${GREEN}✓${NC} Admin started (PID: $ADMIN_PID)"

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ✅ All Services Started Successfully ✅          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📍 Available Services:${NC}"
echo -e "  🔷 Backend API       → ${GREEN}http://localhost:8888/api/v1${NC}"
echo -e "  📱 Mini Program      → ${GREEN}http://localhost:8080${NC}"
echo -e "  ⚙️  Admin Dashboard   → ${GREEN}http://localhost:5174${NC}"
echo ""

echo -e "${YELLOW}📋 Process IDs:${NC}"
echo -e "  Backend:  $BACKEND_PID"
echo -e "  Frontend: $FRONTEND_PID"
echo -e "  Admin:    $ADMIN_PID"
echo ""

echo -e "${YELLOW}📝 Log Files:${NC}"
echo -e "  Backend:  tail -f /tmp/backend.log"
echo -e "  Frontend: tail -f /tmp/frontend.log"
echo -e "  Admin:    tail -f /tmp/admin.log"
echo ""

echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID"
echo ""

# 保持脚本运行，并捕获退出信号
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping all services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill $ADMIN_PID 2>/dev/null || true
  echo -e "${GREEN}All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 等待所有进程
wait
