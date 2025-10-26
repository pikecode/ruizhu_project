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
FASTAPI=true
MINI_TYPE="weixin"  # h5 或 weixin（默认为微信小程序）

# 显示帮助信息
show_help() {
  echo -e "${BLUE}Ruizhu Platform Service Launcher${NC}"
  echo ""
  echo "使用方法: $0 [选项]"
  echo ""
  echo "选项:"
  echo "  (无选项)           启动所有服务 (默认配置：后端+小程序+管理后台+FastAPI)"
  echo "  --all              启动所有服务 (后端+小程序+管理后台+FastAPI)"
  echo "  --backend          仅启动后端 (NestAPI)"
  echo "  --frontend         仅启动小程序"
  echo "  --admin            仅启动管理后台"
  echo "  --fastapi          仅启动 FastAPI"
  echo "  --with-backend     添加后端到启动列表"
  echo "  --with-frontend    添加小程序到启动列表"
  echo "  --with-fastapi     添加 FastAPI 到启动列表"
  echo "  --no-backend       不启动后端"
  echo "  --no-frontend      不启动小程序"
  echo "  --no-admin         不启动管理后台"
  echo "  --mini-h5          小程序使用 H5 Web 版本"
  echo "  --mini-weixin      小程序使用微信版本 (默认)"
  echo "  --status           检查所有服务运行状态"
  echo "  --help             显示这个帮助信息"
  echo ""
  echo "示例:"
  echo "  $0                          # 启动全部 (默认：后端+小程序+管理后台+FastAPI)"
  echo "  $0 --backend                # 仅启动后端 (NestAPI)"
  echo "  $0 --frontend               # 仅启动小程序"
  echo "  $0 --admin                  # 仅启动管理后台"
  echo "  $0 --fastapi                # 仅启动 FastAPI"
  echo "  $0 --no-backend             # 启动小程序+管理后台+FastAPI (不启动后端)"
  echo ""
}

# 检查服务运行状态
check_service_status() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║           📊 服务运行状态检查                              ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  local any_running=false

  # 检查后端
  if pgrep -f "nestapi.*start:dev" > /dev/null; then
    local pid=$(pgrep -f "nestapi.*start:dev")
    echo -e "  ${GREEN}✓${NC} 后端 (NestAPI)        运行中 (PID: $pid) → ${GREEN}http://localhost:8888/api/v1${NC}"
    any_running=true
  else
    echo -e "  ${RED}✗${NC} 后端 (NestAPI)        未运行"
  fi

  # 检查小程序
  if pgrep -f "miniprogram.*dev" > /dev/null; then
    local pid=$(pgrep -f "miniprogram.*dev")
    echo -e "  ${GREEN}✓${NC} 小程序              运行中 (PID: $pid)"
    any_running=true
  else
    echo -e "  ${RED}✗${NC} 小程序              未运行"
  fi

  # 检查管理后台
  if pgrep -f "admin.*dev" > /dev/null; then
    local pid=$(pgrep -f "admin.*dev")
    echo -e "  ${GREEN}✓${NC} 管理后台            运行中 (PID: $pid) → ${GREEN}http://localhost:5174${NC}"
    any_running=true
  else
    echo -e "  ${RED}✗${NC} 管理后台            未运行"
  fi

  # 检查FastAPI (port 8000)
  if lsof -i :8000 > /dev/null 2>&1; then
    local pid=$(lsof -ti :8000 | head -1)
    echo -e "  ${GREEN}✓${NC} FastAPI             运行中 (PID: $pid) → ${GREEN}http://localhost:8000${NC}"
    any_running=true
  else
    echo -e "  ${RED}✗${NC} FastAPI             未运行"
  fi

  echo ""

  if [ "$any_running" = false ]; then
    echo -e "${YELLOW}⚠️  所有服务都未运行${NC}"
    echo "使用 '$0' 或 '$0 --help' 启动服务"
  fi

  echo ""
}

# 解析命令行参数
parse_args() {
  # 初始化为false，供with-*选项使用
  local has_explicit_service=false

  for arg in "$@"; do
    case $arg in
      --all)
        BACKEND=true
        FRONTEND=true
        ADMIN=true
        FASTAPI=true
        has_explicit_service=true
        ;;
      --backend)
        BACKEND=true
        FRONTEND=false
        ADMIN=false
        FASTAPI=false
        has_explicit_service=true
        ;;
      --frontend)
        BACKEND=false
        FRONTEND=true
        ADMIN=false
        FASTAPI=false
        has_explicit_service=true
        ;;
      --admin)
        BACKEND=false
        FRONTEND=false
        ADMIN=true
        FASTAPI=false
        has_explicit_service=true
        ;;
      --fastapi)
        BACKEND=false
        FRONTEND=false
        ADMIN=false
        FASTAPI=true
        has_explicit_service=true
        ;;
      --with-fastapi)
        FASTAPI=true
        ;;
      --with-backend)
        BACKEND=true
        ;;
      --with-frontend)
        FRONTEND=true
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
      --status)
        check_service_status
        exit 0
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

}

# 启动后端
start_backend() {
  local backend_dir="$PROJECT_DIR/nestapi"

  if [ ! -d "$backend_dir" ]; then
    echo -e "${RED}✗ 后端目录不存在: $backend_dir${NC}"
    return 1
  fi

  if [ ! -f "$backend_dir/package.json" ]; then
    echo -e "${RED}✗ 后端项目文件不完整${NC}"
    return 1
  fi

  echo -e "${GREEN}➜${NC} 启动后端 (NestAPI, 端口 8888)..."
  cd "$backend_dir"
  npm run start:dev > /tmp/backend.log 2>&1 &
  BACKEND_PID=$!

  sleep 2
  if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} 后端已启动 (PID: $BACKEND_PID)"
  else
    echo -e "${RED}✗ 后端启动失败，请查看日志: tail -f /tmp/backend.log${NC}"
    return 1
  fi
}

# 启动小程序
start_frontend() {
  local frontend_dir="$PROJECT_DIR/miniprogram"

  if [ ! -d "$frontend_dir" ]; then
    echo -e "${RED}✗ 小程序目录不存在: $frontend_dir${NC}"
    return 1
  fi

  if [ ! -f "$frontend_dir/package.json" ]; then
    echo -e "${RED}✗ 小程序项目文件不完整${NC}"
    return 1
  fi

  if [ "$MINI_TYPE" = "weixin" ]; then
    MINI_CMD="npm run dev:mp-weixin"
    MINI_NAME="微信小程序"
  else
    MINI_CMD="npm run dev:h5"
    MINI_NAME="H5 Web"
  fi

  echo -e "${GREEN}➜${NC} 启动小程序 ($MINI_NAME)..."
  cd "$frontend_dir"
  $MINI_CMD > /tmp/frontend.log 2>&1 &
  FRONTEND_PID=$!

  sleep 2
  if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} 小程序已启动 (PID: $FRONTEND_PID)"
  else
    echo -e "${RED}✗ 小程序启动失败，请查看日志: tail -f /tmp/frontend.log${NC}"
    return 1
  fi
}

# 启动管理后台
start_admin() {
  local admin_dir="$PROJECT_DIR/admin"

  if [ ! -d "$admin_dir" ]; then
    echo -e "${RED}✗ 管理后台目录不存在: $admin_dir${NC}"
    return 1
  fi

  if [ ! -f "$admin_dir/package.json" ]; then
    echo -e "${RED}✗ 管理后台项目文件不完整${NC}"
    return 1
  fi

  echo -e "${GREEN}➜${NC} 启动管理后台 (端口 5174)..."
  cd "$admin_dir"
  npm run dev > /tmp/admin.log 2>&1 &
  ADMIN_PID=$!

  sleep 2
  if ps -p $ADMIN_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} 管理后台已启动 (PID: $ADMIN_PID)"
  else
    echo -e "${RED}✗ 管理后台启动失败，请查看日志: tail -f /tmp/admin.log${NC}"
    return 1
  fi
}

# 启动 FastAPI
start_fastapi() {
  local fastapi_dir="$PROJECT_DIR/fastapi"

  if [ ! -d "$fastapi_dir" ]; then
    echo -e "${RED}✗ FastAPI目录不存在: $fastapi_dir${NC}"
    return 1
  fi

  if [ ! -f "$fastapi_dir/main.py" ]; then
    echo -e "${RED}✗ FastAPI项目文件不完整${NC}"
    return 1
  fi

  echo -e "${GREEN}➜${NC} 启动 FastAPI (端口 8000)..."
  cd "$fastapi_dir"

  # 检查虚拟环境
  if [ ! -d "venv" ]; then
    echo -e "${YELLOW}创建虚拟环境...${NC}"
    python3 -m venv venv 2>/dev/null || {
      echo -e "${RED}✗ 创建虚拟环境失败${NC}"
      return 1
    }
  fi

  # 激活虚拟环境并启动
  source venv/bin/activate 2>/dev/null
  pip install -r requirements.txt -q 2>/dev/null || {
    echo -e "${RED}✗ 依赖安装失败${NC}"
    return 1
  }

  nohup python main.py > /tmp/fastapi.log 2>&1 &
  FASTAPI_PID=$!

  # 等待 FastAPI 启动（检查端口而不是 PID）
  local max_attempts=10
  local attempt=0
  while [ $attempt -lt $max_attempts ]; do
    sleep 1
    if lsof -i :8000 > /dev/null 2>&1; then
      FASTAPI_PID=$(lsof -ti :8000 | head -1)
      echo -e "${GREEN}✓${NC} FastAPI 已启动 (PID: $FASTAPI_PID)"
      return 0
    fi
    ((attempt++))
  done

  echo -e "${RED}✗ FastAPI 启动失败，请查看日志: tail -f /tmp/fastapi.log${NC}"
  return 1
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
  if [ "$FASTAPI" = true ]; then
    echo -e "  🐍 FastAPI        → ${GREEN}http://localhost:8000${NC} (PID: $FASTAPI_PID)"
    echo -e "     API Docs      → ${GREEN}http://localhost:8000/docs${NC}"
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
  if [ "$FASTAPI" = true ]; then
    echo -e "  FastAPI: tail -f /tmp/fastapi.log"
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
  if [ "$FASTAPI" = true ]; then
    echo -n " $FASTAPI_PID"
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
  [ ! -z "$FASTAPI_PID" ] && kill $FASTAPI_PID 2>/dev/null || true
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
    # 没有参数时，启动所有服务（默认配置）
    BACKEND=true
    FRONTEND=true
    ADMIN=true
    FASTAPI=true
  else
    parse_args "$@"
  fi

  # 检查项目目录
  if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}✗ 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
  fi

  # 检查是否至少选择了一个服务
  if [ "$BACKEND" = false ] && [ "$FRONTEND" = false ] && [ "$ADMIN" = false ] && [ "$FASTAPI" = false ]; then
    echo -e "${RED}✗ 没有选择任何服务启动${NC}"
    echo ""
    show_help
    exit 1
  fi

  echo -e "${YELLOW}启动服务...${NC}"
  echo ""

  local startup_errors=0

  # 启动各个服务
  if [ "$BACKEND" = true ]; then
    start_backend || ((startup_errors++))
  fi
  if [ "$FRONTEND" = true ]; then
    start_frontend || ((startup_errors++))
  fi
  if [ "$ADMIN" = true ]; then
    start_admin || ((startup_errors++))
  fi
  if [ "$FASTAPI" = true ]; then
    start_fastapi || ((startup_errors++))
  fi

  # 显示状态
  show_status

  # 如果有启动错误，提示用户
  if [ $startup_errors -gt 0 ]; then
    echo -e "${YELLOW}⚠️  有 $startup_errors 个服务启动失败，请检查上面的错误信息${NC}"
    echo ""
  fi

  # 注册信号处理
  trap cleanup SIGINT SIGTERM

  # 等待所有进程
  wait
}

# 执行主程序
main "$@"
