#!/bin/bash

# Ruizhu 项目 - 灵活启动脚本
# 支持选择启动的组件和小程序类型

PROJECT_DIR="/Users/peak/work/pikecode/ruizhu_project"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认值
BACKEND=true
FRONTEND=true
ADMIN=true
MINI_TYPE="weixin"  # h5 或 weixin（默认为微信小程序）

# 显示帮助信息
show_help() {
  echo -e "${BLUE}Ruizhu Platform Service Launcher${NC}"
  echo ""
  echo "使用方法: $0 [选项]"
  echo ""
  echo "选项:"
  echo "  --all              启动所有服务 (默认，使用微信小程序)"
  echo "  --backend          仅启动后端"
  echo "  --frontend         仅启动小程序"
  echo "  --admin            仅启动管理后台"
  echo "  --no-backend       不启动后端"
  echo "  --no-frontend      不启动小程序"
  echo "  --no-admin         不启动管理后台"
  echo "  --mini-h5          小程序使用 H5 Web 版本"
  echo "  --mini-weixin      小程序使用微信版本 (默认)"
  echo "  --help             显示这个帮助信息"
  echo ""
  echo "示例:"
  echo "  $0 --all                    # 启动所有服务 (默认使用微信小程序)"
  echo "  $0 --all --mini-h5          # 启动所有服务，使用 H5 版本"
  echo "  $0 --backend --admin        # 仅启动后端和管理后台"
  echo "  $0 --frontend               # 仅启动微信小程序"
  echo ""
}

# 解析命令行参数
parse_args() {
  BACKEND=false
  FRONTEND=false
  ADMIN=false

  for arg in "$@"; do
    case $arg in
      --all)
        BACKEND=true
        FRONTEND=true
        ADMIN=true
        ;;
      --backend)
        BACKEND=true
        ;;
      --frontend)
        FRONTEND=true
        ;;
      --admin)
        ADMIN=true
        ;;
      --no-backend)
        BACKEND=false
        ;;
      --no-frontend)
        FRONTEND=false
        ;;
      --no-admin)
        ADMIN=false
        ;;
      --mini-h5)
        MINI_TYPE="h5"
        ;;
      --mini-weixin)
        MINI_TYPE="weixin"
        ;;
      --help)
        show_help
        exit 0
        ;;
      *)
        echo -e "${RED}未知选项: $arg${NC}"
        show_help
        exit 1
        ;;
    esac
  done

  # 如果没有指定任何服务，默认启动所有
  if [ "$BACKEND" = false ] && [ "$FRONTEND" = false ] && [ "$ADMIN" = false ]; then
    BACKEND=true
    FRONTEND=true
    ADMIN=true
  fi
}

# 启动后端
start_backend() {
  echo -e "${GREEN}➜${NC} 启动后端 (NestAPI, 端口 8888)..."
  cd "$PROJECT_DIR/nestapi"
  npm run start:dev > /tmp/backend.log 2>&1 &
  BACKEND_PID=$!
  echo -e "${GREEN}✓${NC} 后端已启动 (PID: $BACKEND_PID)"
  sleep 1
}

# 启动小程序
start_frontend() {
  if [ "$MINI_TYPE" = "weixin" ]; then
    MINI_CMD="npm run dev:mp-weixin"
    MINI_NAME="微信小程序"
  else
    MINI_CMD="npm run dev:h5"
    MINI_NAME="H5 Web"
  fi

  echo -e "${GREEN}➜${NC} 启动小程序 ($MINI_NAME)..."
  cd "$PROJECT_DIR/miniprogram"
  $MINI_CMD > /tmp/frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo -e "${GREEN}✓${NC} 小程序已启动 (PID: $FRONTEND_PID)"
  sleep 1
}

# 启动管理后台
start_admin() {
  echo -e "${GREEN}➜${NC} 启动管理后台 (端口 5174)..."
  cd "$PROJECT_DIR/admin"
  npm run dev > /tmp/admin.log 2>&1 &
  ADMIN_PID=$!
  echo -e "${GREEN}✓${NC} 管理后台已启动 (PID: $ADMIN_PID)"
  sleep 1
}

# 显示状态
show_status() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║           ✅ 服务启动完成 ✅                              ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  echo -e "${YELLOW}📍 启动的服务:${NC}"
  if [ "$BACKEND" = true ]; then
    echo -e "  🔷 后端 API        → ${GREEN}http://localhost:8888/api/v1${NC} (PID: $BACKEND_PID)"
  fi
  if [ "$FRONTEND" = true ]; then
    if [ "$MINI_TYPE" = "weixin" ]; then
      echo -e "  📱 微信小程序      → ${GREEN}开发者工具中编译预览${NC} (PID: $FRONTEND_PID)"
    else
      echo -e "  📱 小程序 (H5)     → ${GREEN}http://localhost:8080${NC} (PID: $FRONTEND_PID)"
    fi
  fi
  if [ "$ADMIN" = true ]; then
    echo -e "  ⚙️  管理后台       → ${GREEN}http://localhost:5174${NC} (PID: $ADMIN_PID)"
  fi
  echo ""

  echo -e "${YELLOW}📝 日志文件:${NC}"
  if [ "$BACKEND" = true ]; then
    echo -e "  后端:   tail -f /tmp/backend.log"
  fi
  if [ "$FRONTEND" = true ]; then
    echo -e "  小程序: tail -f /tmp/frontend.log"
  fi
  if [ "$ADMIN" = true ]; then
    echo -e "  管理后台: tail -f /tmp/admin.log"
  fi
  echo ""

  echo -e "${YELLOW}🛑 停止所有服务:${NC}"
  echo -ne "  kill"
  if [ "$BACKEND" = true ]; then
    echo -n " $BACKEND_PID"
  fi
  if [ "$FRONTEND" = true ]; then
    echo -n " $FRONTEND_PID"
  fi
  if [ "$ADMIN" = true ]; then
    echo -n " $ADMIN_PID"
  fi
  echo ""
  echo ""
}

# 清理函数
cleanup() {
  echo ""
  echo -e "${YELLOW}正在停止所有服务...${NC}"
  [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
  [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
  [ ! -z "$ADMIN_PID" ] && kill $ADMIN_PID 2>/dev/null || true
  echo -e "${GREEN}所有服务已停止${NC}"
  exit 0
}

# 主程序
main() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║   🚀 Ruizhu Platform - Service Launcher 🚀               ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  # 解析参数
  if [ $# -eq 0 ]; then
    # 没有参数时，启动所有服务
    BACKEND=true
    FRONTEND=true
    ADMIN=true
  else
    parse_args "$@"
  fi

  # 检查目录
  if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}✗ 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
  fi

  echo -e "${YELLOW}启动服务...${NC}"
  echo ""

  # 启动各个服务
  [ "$BACKEND" = true ] && start_backend
  [ "$FRONTEND" = true ] && start_frontend
  [ "$ADMIN" = true ] && start_admin

  # 显示状态
  show_status

  # 注册信号处理
  trap cleanup SIGINT SIGTERM

  # 等待所有进程
  wait
}

# 执行主程序
main "$@"
