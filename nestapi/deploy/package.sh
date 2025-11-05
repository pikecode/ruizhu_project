#!/bin/bash

# NestAPI 打包脚本
# 用法: ./deploy/package.sh

set -e

echo "═══════════════════════════════════════════════════"
echo "   📦 NestAPI 打包脚本"
echo "═══════════════════════════════════════════════════"
echo ""

# 获取项目根目录（上升两级：deploy → nestapi → 项目根目录）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT/nestapi"  # 进入 nestapi 目录以便找到 dist

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 错误: dist 目录不存在"
    echo "请先运行: ./deploy/build.sh"
    exit 1
fi

echo "📍 项目目录: $PROJECT_ROOT"
echo ""

# 创建 deploy 目录（如果不存在）
mkdir -p "$PROJECT_ROOT/nestapi/deploy/releases"

# 生成版本号 (YYYYMMDD-HHMMSS)
RELEASE_VERSION=$(date +%Y%m%d-%H%M%S)
RELEASE_NAME="nestapi-${RELEASE_VERSION}"
RELEASE_TAR="${RELEASE_NAME}.tar.gz"
RELEASE_PATH="$PROJECT_ROOT/nestapi/deploy/releases/$RELEASE_TAR"

echo "📦 打包配置:"
echo "   • 版本号: $RELEASE_VERSION"
echo "   • 打包名称: $RELEASE_NAME"
echo "   • 输出文件: $RELEASE_PATH"
echo ""

# 清理旧的打包文件（保留最近5个）
echo "🧹 清理旧的发布文件..."
cd "$PROJECT_ROOT/nestapi/deploy/releases"
ls -t nestapi-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
echo "✅ 旧文件清理完成"
echo ""

# 回到 nestapi 目录
cd "$PROJECT_ROOT/nestapi"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "📋 准备文件..."

# 复制 dist 目录到临时目录（保留dist文件夹结构）
cp -r dist "$TEMP_DIR/"

# 复制 package.json 和 package-lock.json
if [ -f "package.json" ]; then
    cp package.json "$TEMP_DIR/"
fi

if [ -f "package-lock.json" ]; then
    cp package-lock.json "$TEMP_DIR/"
fi

# 复制 .env 文件（如果存在，用于参考）
if [ -f ".env" ]; then
    cp .env "$TEMP_DIR/.env.example"
    echo "   • .env 已复制为 .env.example（用于参考）"
fi

# 创建版本信息文件
cat > "$TEMP_DIR/VERSION" << EOF
Version: $RELEASE_VERSION
Build Date: $(date)
Release Name: $RELEASE_NAME
EOF
echo "   • 版本信息文件已创建"
echo ""

# 打包
echo "🗜️  压缩文件..."
cd "$TEMP_DIR"
tar -czf "$RELEASE_PATH" .
cd "$PROJECT_ROOT"

# 显示打包结果
PACKAGE_SIZE=$(du -sh "$RELEASE_PATH" | cut -f1)
PACKAGE_TIME=$(date)

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ✅ 打包完成"
echo "═══════════════════════════════════════════════════"
echo "📊 打包结果:"
echo "   • 文件路径: $RELEASE_PATH"
echo "   • 文件大小: $PACKAGE_SIZE"
echo "   • 打包时间: $PACKAGE_TIME"
echo ""
echo "📋 下一步:"
echo "   1. 验证打包文件: ls -lh deploy/releases/"
echo "   2. 运行: ./deploy/deploy.sh 上传到服务器"
echo ""
echo "💡 提示: 可以使用以下命令查看打包内容"
echo "   tar -tzf $RELEASE_PATH | head -20"
echo ""
