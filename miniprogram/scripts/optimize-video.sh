#!/bin/bash

# 视频优化脚本
# 用于将视频转换为小程序优化格式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 ffmpeg 是否安装
check_ffmpeg() {
  if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ ffmpeg 未安装${NC}"
    echo "请安装 ffmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt-get install ffmpeg"
    echo "  CentOS: sudo yum install ffmpeg"
    exit 1
  fi
}

# 显示帮助信息
show_help() {
  cat << EOF
视频优化脚本

用法: bash scripts/optimize-video.sh [选项]

选项:
  -i, --input <file>      输入视频文件 (必需)
  -o, --output <file>     输出视频文件 (默认: video_optimized.mp4)
  -q, --quality <0-51>    质量等级 (0=最高, 51=最低, 默认: 28)
  -b, --bitrate <bitrate> 比特率 (默认: 600k)
  -f, --format <format>   输出格式: mp4|webm (默认: mp4)
  -h, --help              显示帮助信息

示例:
  # 默认优化 (质量28, 比特率600k)
  bash scripts/optimize-video.sh -i src/static/video.mp4

  # 高质量优化 (质量20, 比特率800k)
  bash scripts/optimize-video.sh -i src/static/video.mp4 -q 20 -b 800k

  # 转换为 WebM 格式 (更好的压缩)
  bash scripts/optimize-video.sh -i src/static/video.mp4 -f webm -b 500k

  # 指定输出文件
  bash scripts/optimize-video.sh -i src/static/video.mp4 -o dist/video.mp4
EOF
}

# 默认值
INPUT=""
OUTPUT="video_optimized.mp4"
QUALITY=28
BITRATE="600k"
FORMAT="mp4"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--input)
      INPUT="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT="$2"
      shift 2
      ;;
    -q|--quality)
      QUALITY="$2"
      shift 2
      ;;
    -b|--bitrate)
      BITRATE="$2"
      shift 2
      ;;
    -f|--format)
      FORMAT="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}❌ 未知选项: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# 验证输入
if [ -z "$INPUT" ]; then
  echo -e "${RED}❌ 错误: 必须指定输入文件${NC}"
  show_help
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo -e "${RED}❌ 错误: 输入文件不存在: $INPUT${NC}"
  exit 1
fi

# 检查 ffmpeg
check_ffmpeg

# 获取输入文件信息
INPUT_SIZE=$(du -h "$INPUT" | cut -f1)
echo -e "${YELLOW}📹 视频优化工具${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "输入文件: ${GREEN}$INPUT${NC}"
echo -e "输入大小: ${GREEN}$INPUT_SIZE${NC}"
echo -e "输出文件: ${GREEN}$OUTPUT${NC}"
echo -e "输出格式: ${GREEN}$FORMAT${NC}"
echo -e "视频质量: ${GREEN}$QUALITY${NC} (0=最高, 51=最低)"
echo -e "比特率: ${GREEN}$BITRATE${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 确认开始
read -p "确认开始优化? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

echo -e "${YELLOW}⏳ 正在优化视频...${NC}"

# 根据格式进行优化
if [ "$FORMAT" = "webm" ]; then
  # WebM 格式 (VP9编码)
  ffmpeg -i "$INPUT" \
    -c:v libvpx-vp9 \
    -crf "$QUALITY" \
    -b:v "$BITRATE" \
    -c:a libopus \
    -b:a 64k \
    -progress pipe:1 \
    "$OUTPUT" 2>&1 | grep -E "frame=|time=" | tail -1
else
  # MP4 格式 (H.264编码)
  ffmpeg -i "$INPUT" \
    -c:v libx264 \
    -preset medium \
    -crf "$QUALITY" \
    -b:v "$BITRATE" \
    -c:a aac \
    -b:a 64k \
    -movflags +faststart \
    -progress pipe:1 \
    "$OUTPUT" 2>&1 | grep -E "frame=|time=" | tail -1
fi

# 检查转换是否成功
if [ -f "$OUTPUT" ]; then
  OUTPUT_SIZE=$(du -h "$OUTPUT" | cut -f1)
  INPUT_SIZE_NUM=$(du -sk "$INPUT" | cut -f1)
  OUTPUT_SIZE_NUM=$(du -sk "$OUTPUT" | cut -f1)
  REDUCTION=$((100 - (OUTPUT_SIZE_NUM * 100 / INPUT_SIZE_NUM)))

  echo ""
  echo -e "${GREEN}✅ 优化完成!${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "输入文件大小: ${GREEN}$INPUT_SIZE${NC}"
  echo -e "输出文件大小: ${GREEN}$OUTPUT_SIZE${NC}"
  echo -e "压缩比例: ${GREEN}$REDUCTION%${NC}"
  echo -e "输出路径: ${GREEN}$(pwd)/$OUTPUT${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}💡 建议:${NC}"
  echo "1. 在不同设备上测试视频播放效果"
  echo "2. 如果质量不满意，可降低 --quality 参数值"
  echo "3. 如果需要更小体积，可降低 --bitrate 参数值"
else
  echo -e "${RED}❌ 错误: 视频优化失败${NC}"
  exit 1
fi
