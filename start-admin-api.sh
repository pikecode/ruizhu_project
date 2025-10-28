#!/bin/bash

# Ruizhu 项目 - NestAPI + Admin 一键启动脚本
# 专门用于测试产品管理功能

set -e

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # 无颜色

# 项目目录
NESTAPI_DIR="$SCRIPT_DIR/nestapi"
ADMIN_DIR="$SCRIPT_DIR/admin"

# 清空之前的 Node 进程
cleanup_old_processes() {
  echo -e "${YELLOW}清理旧的 Node 进程...${NC}"
  pkill -f "npm run start:dev" 2>/dev/null || true
  pkill -f "npm run dev" 2>/dev/null || true
  sleep 1
}

# 检查目录
check_directories() {
  echo -e "${BLUE}检查项目目录...${NC}"

  if [ ! -d "$NESTAPI_DIR" ]; then
    echo -e "${RED}✗ NestAPI 目录不存在: $NESTAPI_DIR${NC}"
    exit 1
  fi

  if [ ! -d "$ADMIN_DIR" ]; then
    echo -e "${RED}✗ Admin 目录不存在: $ADMIN_DIR${NC}"
    exit 1
  fi

  echo -e "${GREEN}✓ 所有目录检查完毕${NC}"
}

# 检查依赖
check_dependencies() {
  echo -e "${BLUE}检查项目依赖...${NC}"

  if [ ! -d "$NESTAPI_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠ NestAPI 依赖未安装，正在安装...${NC}"
    cd "$NESTAPI_DIR" && npm install
  fi

  if [ ! -d "$ADMIN_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠ Admin 依赖未安装，正在安装...${NC}"
    cd "$ADMIN_DIR" && npm install
  fi

  echo -e "${GREEN}✓ 所有依赖检查完毕${NC}"
}

# 清屏
clear

# 打印启动横幅
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 Ruizhu E-Commerce 产品管理系统启动 🚀                ║${NC}"
echo -e "${BLUE}║            NestAPI + Admin Dashboard                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 执行检查
cleanup_old_processes
check_directories
check_dependencies

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}正在启动服务...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 启动 NestAPI Backend
echo -e "${MAGENTA}➜${NC} 启动 NestAPI Backend (端口 3000)..."
cd "$NESTAPI_DIR"
npm run start:dev > /tmp/nestapi.log 2>&1 &
NESTAPI_PID=$!
sleep 3

if ps -p $NESTAPI_PID > /dev/null 2>&1; then
  echo -e "${GREEN}✓ NestAPI Backend 已启动 (PID: $NESTAPI_PID)${NC}"
else
  echo -e "${RED}✗ NestAPI Backend 启动失败${NC}"
  echo -e "${YELLOW}错误日志：${NC}"
  cat /tmp/nestapi.log
  exit 1
fi

# 启动 Admin Dashboard
echo -e "${MAGENTA}➜${NC} 启动 Admin Dashboard (端口 5174)..."
cd "$ADMIN_DIR"
npm run dev > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
sleep 3

if ps -p $ADMIN_PID > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Admin Dashboard 已启动 (PID: $ADMIN_PID)${NC}"
else
  echo -e "${RED}✗ Admin Dashboard 启动失败${NC}"
  echo -e "${YELLOW}错误日志：${NC}"
  cat /tmp/admin.log
  kill $NESTAPI_PID 2>/dev/null || true
  exit 1
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   ✅ 所有服务启动成功 ✅                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📍 可访问的服务：${NC}"
echo -e "  ${MAGENTA}🔷 NestAPI Backend${NC}"
echo -e "     API 地址: ${GREEN}http://localhost:3000/api/v1${NC}"
echo -e "     API 文档: ${GREEN}http://localhost:3000/api${NC}"
echo ""
echo -e "  ${MAGENTA}⚙️  Admin Dashboard${NC}"
echo -e "     管理面板: ${GREEN}http://localhost:5174${NC}"
echo -e "     产品管理: ${GREEN}http://localhost:5174/products${NC}"
echo ""

echo -e "${CYAN}📋 进程信息：${NC}"
echo -e "  NestAPI Backend : PID $NESTAPI_PID"
echo -e "  Admin Dashboard : PID $ADMIN_PID"
echo ""

echo -e "${CYAN}📝 日志文件：${NC}"
echo -e "  NestAPI Backend : ${YELLOW}tail -f /tmp/nestapi.log${NC}"
echo -e "  Admin Dashboard : ${YELLOW}tail -f /tmp/admin.log${NC}"
echo ""

echo -e "${CYAN}🛑 停止所有服务：${NC}"
echo -e "  ${YELLOW}kill $NESTAPI_PID $ADMIN_PID${NC}"
echo ""

echo -e "${CYAN}⚡ 快速测试命令：${NC}"
echo -e "  获取产品列表: ${YELLOW}curl http://localhost:3000/api/v1/products${NC}"
echo -e "  获取分类列表: ${YELLOW}curl http://localhost:3000/api/v1/categories${NC}"
echo ""

# 清理信号处理
cleanup() {
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}正在停止所有服务...${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  kill $NESTAPI_PID 2>/dev/null || true
  kill $ADMIN_PID 2>/dev/null || true

  sleep 2

  echo -e "${GREEN}✓ 所有服务已停止${NC}"
  exit 0
}

# 捕获 Ctrl+C 和其他信号
trap cleanup SIGINT SIGTERM

# 保持脚本运行
wait
