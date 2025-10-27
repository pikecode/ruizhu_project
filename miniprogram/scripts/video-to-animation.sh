#!/bin/bash

# 视频转动画脚本
# 支持转换为 WebP 动画或 GIF 格式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查工具
check_tools() {
  if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ ffmpeg 未安装${NC}"
    exit 1
  fi
}

# 显示帮助
show_help() {
  cat << EOF
视频转动画脚本

用法: bash scripts/video-to-animation.sh [选项]

选项:
  -i, --input <file>      输入视频文件 (必需)
  -o, --output <file>     输出动画文件 (默认: animation.webp)
  -f, --format <format>   输出格式: webp|gif (默认: webp)
  -fps <fps>              帧率 (默认: 20)
  -duration <sec>         只转换前N秒 (默认: 全部)
  -scale <scale>          缩放 (默认: 720:-1, 保持宽高比)
  -quality <0-100>        WebP质量 (默认: 80)
  -h, --help              显示帮助

示例:
  # 转为 WebP 动画 (最优)
  bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp

  # 转为 GIF 动画
  bash scripts/video-to-animation.sh -i src/static/video.mp4 -f gif

  # 只转前 5 秒，更小体积
  bash scripts/video-to-animation.sh -i src/static/video.mp4 -duration 5 -fps 15

  # 自定义输出路径和尺寸
  bash scripts/video-to-animation.sh -i src/static/video.mp4 -o src/static/animation.webp -scale 540:-1
EOF
}

# 默认值
INPUT=""
OUTPUT="animation.webp"
FORMAT="webp"
FPS=20
DURATION=""
SCALE="720:-1"
QUALITY=80

# 解析参数
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
    -f|--format)
      FORMAT="$2"
      shift 2
      ;;
    -fps)
      FPS="$2"
      shift 2
      ;;
    -duration)
      DURATION="-t $2"
      shift 2
      ;;
    -scale)
      SCALE="$2"
      shift 2
      ;;
    -quality)
      QUALITY="$2"
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

check_tools

# 显示信息
INPUT_SIZE=$(du -h "$INPUT" | cut -f1)
echo -e "${BLUE}🎬 视频转动画转换工具${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "输入文件: ${GREEN}$INPUT${NC} (${GREEN}$INPUT_SIZE${NC})"
echo -e "输出文件: ${GREEN}$OUTPUT${NC}"
echo -e "输出格式: ${GREEN}$FORMAT${NC}"
echo -e "帧率: ${GREEN}$FPS${NC} fps"
echo -e "缩放: ${GREEN}$SCALE${NC}"
if [ -n "$DURATION" ]; then
  echo -e "时长: ${GREEN}${DURATION#-t }${NC} 秒"
fi
if [ "$FORMAT" = "webp" ]; then
  echo -e "质量: ${GREEN}$QUALITY${NC}/100"
fi
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 确认
read -p "确认开始转换? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

echo -e "${YELLOW}⏳ 正在转换...${NC}"
echo ""

# 创建临时目录存储帧
TEMP_DIR="/tmp/video-frames-$$"
mkdir -p "$TEMP_DIR"

# 第一步：提取帧
echo -e "${BLUE}步骤 1/2: 提取视频帧...${NC}"
ffmpeg -i "$INPUT" \
  $DURATION \
  -vf "fps=$FPS,scale=$SCALE:flags=lanczos" \
  -q:v 2 \
  "$TEMP_DIR/frame_%04d.png" \
  -progress pipe:1 2>&1 | grep -E "frame=|time=" | tail -1

# 第二步：生成动画
echo -e "${BLUE}步骤 2/2: 生成 ${FORMAT^^} 动画...${NC}"

if [ "$FORMAT" = "webp" ]; then
  # WebP 动画
  ffmpeg -framerate $FPS \
    -i "$TEMP_DIR/frame_%04d.png" \
    -c:v libwebp \
    -quality $QUALITY \
    -loop 0 \
    "$OUTPUT" \
    -progress pipe:1 2>&1 | tail -5
elif [ "$FORMAT" = "gif" ]; then
  # GIF 动画
  ffmpeg -framerate $FPS \
    -i "$TEMP_DIR/frame_%04d.png" \
    -c:v gif \
    -vf "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
    "$OUTPUT" \
    -progress pipe:1 2>&1 | tail -5
else
  echo -e "${RED}❌ 不支持的格式: $FORMAT${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# 清理临时文件
rm -rf "$TEMP_DIR"

# 检查结果
if [ -f "$OUTPUT" ]; then
  OUTPUT_SIZE=$(du -h "$OUTPUT" | cut -f1)
  INPUT_SIZE_NUM=$(du -sk "$INPUT" | cut -f1)
  OUTPUT_SIZE_NUM=$(du -sk "$OUTPUT" | cut -f1)
  REDUCTION=$((100 - (OUTPUT_SIZE_NUM * 100 / INPUT_SIZE_NUM)))

  echo ""
  echo -e "${GREEN}✅ 转换成功!${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "原始文件: ${GREEN}$INPUT_SIZE${NC}"
  echo -e "动画文件: ${GREEN}$OUTPUT_SIZE${NC}"
  echo -e "压缩比例: ${GREEN}$REDUCTION%${NC}"
  echo -e "完整路径: ${GREEN}$(cd "$(dirname "$OUTPUT")" && pwd)/$(basename "$OUTPUT")${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}💡 建议:${NC}"
  echo "1. WebP 动画体积最小，兼容性好 (推荐)"
  echo "2. GIF 兼容性更好但体积更大"
  echo "3. 在小程序中直接用 <image> 标签显示"
  echo ""
  echo -e "${YELLOW}使用示例:${NC}"
  echo -e "  <image src=\"$(basename "$OUTPUT")\" mode=\"aspectFill\"></image>"
else
  echo -e "${RED}❌ 转换失败${NC}"
  exit 1
fi
