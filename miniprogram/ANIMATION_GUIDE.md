# 视频转动画使用指南

## 概述
已将头部从视频标签改为图片标签，支持 WebP 和 GIF 动画格式展示。这样做的好处：

✅ **性能优化**
- 加载速度快
- 流畅播放，无需等待缓冲
- 自动循环播放

✅ **兼容性**
- 小程序完全支持
- 类似图片一样快速加载
- 节省网络流量

✅ **体积优化**
- WebP 格式压缩率最高（可减少 30-50%）
- GIF 格式兼容性最好

---

## 快速开始

### 步骤 1: 转换视频为动画

#### 方案 A: 转为 WebP 动画（推荐，最小体积）
```bash
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -o src/static/animation.webp
```

**参数说明：**
- `-i`: 输入视频文件
- `-f webp`: 输出格式（WebP）
- `-o`: 输出文件路径

**输出示例：**
```
✅ 转换成功!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
原始文件: 2.3M
动画文件: 1.2M  ← WebP 体积约为原来的 50%
压缩比例: 48%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 方案 B: 转为 GIF 动画（兼容性最好）
```bash
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f gif -o src/static/animation.gif
```

#### 方案 C: 优化参数（更小体积）
如果想要更小的文件：

```bash
# 降低帧率 + 减少时长 = 更小体积
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -o src/static/animation.webp -fps 15 -duration 10
```

**参数说明：**
- `-fps 15`: 降低帧率（默认20），流畅度与体积的平衡
- `-duration 10`: 只转换前10秒（可选）
- `-scale 540:-1`: 缩放宽度为540px（可选，保持宽高比）
- `-quality 80`: WebP 质量 0-100（默认80）

---

## 当前配置

首页已修改为使用动画展示：

```vue
<!-- src/pages/index/index.vue -->
<view class="animation-section">
  <image
    class="header-animation"
    :src="animationUrl"
    mode="aspectFill"
  ></image>
</view>

<script>
data() {
  return {
    animationUrl: '../../static/animation.webp', // ← 改这里
  }
}
</script>
```

---

## 如何切换动画格式

### 使用 WebP 动画（推荐）
```javascript
animationUrl: '../../static/animation.webp'
```

### 使用 GIF 动画
```javascript
animationUrl: '../../static/animation.gif'
```

---

## 常见问题

### Q1: WebP 兼容性怎么样？
**A:**
- ✅ iOS 14+: 完全支持
- ✅ Android 5.0+: 完全支持
- ✅ 微信小程序: 完全支持
- ✅ 现代浏览器: 完全支持

### Q2: 动画不循环播放？
**A:** 使用图片标签时，WebP/GIF 动画会自动循环播放，无需额外配置。

### Q3: 如何提高动画质量？
**A:** 转换时调整 `-quality` 参数：
```bash
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -quality 90  # 更高质量，更大体积
```

### Q4: 如何减少动画体积？
**A:** 多种方案：
```bash
# 方案1: 降低帧率
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -fps 10

# 方案2: 缩放宽度
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -scale 480:-1

# 方案3: 降低质量
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -quality 60

# 方案4: 组合优化
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f webp -fps 12 -scale 480:-1 -quality 70
```

### Q5: WebP vs GIF，该选哪个？
**A:**
| 格式 | 体积 | 质量 | 兼容性 | 推荐场景 |
|------|------|------|--------|---------|
| WebP | ⭐⭐⭐⭐⭐ 最小 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 好 | **优先选择** |
| GIF | ⭐⭐ 较大 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 最好 | 兼容性要求高时 |

---

## 性能对比

### 原始视频 vs 动画

| 类型 | 文件大小 | 加载方式 | 性能 | 支持播放控制 |
|------|---------|---------|------|-----------|
| MP4 视频 | 2.3 MB | 流式加载 | 需缓冲 | ✅ 有 |
| WebP 动画 | ~1.0 MB | 完整加载 | 流畅 | ✗ 无 |
| GIF 动画 | ~2.0 MB | 完整加载 | 流畅 | ✗ 无 |

**结论：** 动画格式虽然不支持播放控制，但加载速度和流畅度更好，适合自动播放的宣传素材。

---

## 转换过程详解

### 内部工作流程

```
输入视频 (video.mp4)
    ↓
[第一步] ffmpeg 提取帧
    ↓
临时目录 (/tmp/video-frames-PID)
    ├── frame_0001.png
    ├── frame_0002.png
    └── frame_XXXX.png
    ↓
[第二步] 合成动画
    ├── libwebp 编码器 → animation.webp (推荐)
    └── gif 编码器 → animation.gif (备选)
    ↓
输出动画 (animation.webp 或 animation.gif)
    ↓
清理临时文件
```

### 转换时间预估

| 视频时长 | 转换时间 |
|---------|---------|
| 5 秒 | ~10 秒 |
| 10 秒 | ~20 秒 |
| 18 秒 (当前) | ~35 秒 |
| 30 秒 | ~50 秒 |

---

## 批量转换示例

如果有多个视频要转换：

```bash
# 为所有 mp4 视频转换
for video in src/static/*.mp4; do
  name=$(basename "$video" .mp4)
  bash scripts/video-to-animation.sh -i "$video" -o "src/static/${name}_animation.webp" -f webp
done
```

---

## 回滚到视频标签

如果需要回到原来的视频标签方式：

```vue
<!-- 改回视频标签 -->
<view class="animation-section">
  <video
    class="header-video"
    src="../../static/video.mp4"
    controls
    :autoplay="false"
  ></video>
</view>
```

---

## 建议

1. **优先使用 WebP 动画**：体积小，质量高，兼容性好
2. **定期优化**：如果用户反馈加载慢，可尝试降低帧率或缩放
3. **CDN 加速**：如果动画文件还是较大，可上传到 CDN 加速（改为外链）
4. **监控性能**：在生产环境测试，确保在 3G/4G 网络下流畅

---

## 命令速查

```bash
# 快速转换为 WebP（推荐）
bash scripts/video-to-animation.sh -i src/static/video.mp4

# 转为 GIF
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f gif

# 帮助
bash scripts/video-to-animation.sh --help
```

---

## 相关文件

- `scripts/video-to-animation.sh` - 转换脚本
- `src/pages/index/index.vue` - 首页文件
- `src/static/video.mp4` - 原始视频
- `src/static/animation.webp` - 转换后的 WebP 动画（需手动生成）
- `src/static/animation.gif` - 转换后的 GIF 动画（需手动生成）
