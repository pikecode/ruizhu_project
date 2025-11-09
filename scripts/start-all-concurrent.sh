#!/bin/bash

# 一键启动所有服务的 Shell 脚本
# 同时启动：NestAPI、Admin、MiniProgram

echo "
═══════════════════════════════════════════════════════════"
echo "  🚀 Yunjie 电商平台 - 本地开发环境启动"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 获取脚本所在的目录（项目根目录）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "📍 项目根目录: $PROJECT_ROOT"
echo ""

# 函数：显示菜单
show_menu() {
    echo "选择启动方案："
    echo ""
    echo "1️⃣  分别启动（推荐） - 手动在不同终端窗口启动"
    echo "2️⃣  使用 concurrently 并行启动"
    echo "3️⃣  仅启动 NestAPI 后端"
    echo "4️⃣  仅启动 Admin 后台"
    echo "5️⃣  仅启动 MiniProgram (H5)"
    echo ""
    echo "按 Ctrl+C 退出"
    echo ""
}

# 检查依赖
check_dependencies() {
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 Node.js"
        exit 1
    fi
}

# 方案 1: 分别启动（显示命令）
start_separate() {
    echo "✅ 分别启动方案"
    echo ""
    echo "请在不同的终端窗口运行以下命令："
    echo ""
    echo "🔵 终端 1 - 启动 NestAPI 后端（端口 3000）："
    echo "   cd $PROJECT_ROOT/nestapi"
    echo "   npm run start:dev"
    echo ""
    echo "🟢 终端 2 - 启动 Admin 管理后台（端口 5173）："
    echo "   cd $PROJECT_ROOT/admin"
    echo "   npm run dev"
    echo ""
    echo "🟡 终端 3 - 启动 MiniProgram 小程序（H5）："
    echo "   cd $PROJECT_ROOT/miniprogram"
    echo "   npm run dev:h5"
    echo ""
}

# 方案 2: 并行启动（需要 concurrently）
start_concurrent() {
    echo "⏳ 检查是否已安装 concurrently..."

    if ! npm list -g concurrently &> /dev/null; then
        echo "❌ 未全局安装 concurrently，正在安装..."
        npm install -g concurrently
    fi

    echo "✅ 开始并行启动所有服务..."
    echo ""

    cd "$PROJECT_ROOT"
    concurrently \
        --names "NestAPI,Admin,MiniProgram" \
        --colors "blue,green,yellow" \
        "cd nestapi && npm run start:dev" \
        "sleep 3 && cd admin && npm run dev" \
        "sleep 6 && cd miniprogram && npm run dev:h5"
}

# 启动单个服务
start_nestapi() {
    echo "🚀 启动 NestAPI 后端..."
    cd "$PROJECT_ROOT/nestapi"
    npm run start:dev
}

start_admin() {
    echo "⚙️  启动 Admin 管理后台..."
    cd "$PROJECT_ROOT/admin"
    npm run dev
}

start_miniprogram() {
    echo "📱 启动 MiniProgram 小程序..."
    cd "$PROJECT_ROOT/miniprogram"
    npm run dev:h5
}

# 主菜单
main() {
    check_dependencies
    show_menu

    read -p "请选择 (1-5): " choice

    case $choice in
        1)
            start_separate
            ;;
        2)
            start_concurrent
            ;;
        3)
            start_nestapi
            ;;
        4)
            start_admin
            ;;
        5)
            start_miniprogram
            ;;
        *)
            echo "❌ 无效选择"
            exit 1
            ;;
    esac
}

# 如果脚本被直接运行（非 source）
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi
