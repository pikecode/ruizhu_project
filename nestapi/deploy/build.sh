#!/bin/bash

# NestAPI 本地构建脚本
# 用法: ./deploy/build.sh

set -e

echo "═══════════════════════════════════════════════════"
echo "   📦 NestAPI 本地构建脚本"
echo "═══════════════════════════════════════════════════"
echo ""

# 获取项目根目录（上升两级：deploy → nestapi → 项目根目录）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT/nestapi"  # 进入 nestapi 目录执行构建

echo "📍 项目目录: $PROJECT_ROOT"
echo ""

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm 未安装"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✅ Node.js 版本: $NODE_VERSION"
echo "✅ npm 版本: $NPM_VERSION"
echo ""

# 清理旧的构建文件
if [ -d "dist" ]; then
    echo "🧹 清理旧的构建文件..."
    rm -rf dist
fi
echo ""

# 安装依赖 (仅在 node_modules 不存在时)
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖..."
    npm install --legacy-peer-deps
    echo ""
fi

# 构建项目
echo "🔨 构建 NestAPI 项目..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ 构建失败: dist 目录不存在"
    exit 1
fi

BUILD_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ✅ 构建完成"
echo "═══════════════════════════════════════════════════"
echo "📊 构建结果:"
echo "   • 输出目录: dist"
echo "   • 大小: $BUILD_SIZE"
echo "   • 文件数: $FILE_COUNT"
echo ""
echo "📋 下一步:"
echo "   1. 检查 dist 目录中的构建文件"
echo "   2. 运行: ./deploy/package.sh 打包文件"
echo "   3. 运行: ./deploy/deploy.sh 上传到服务器"
echo ""
