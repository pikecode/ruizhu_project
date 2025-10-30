# 🎬 动画快速开始

## 一行命令搞定

```bash
bash scripts/video-to-animation.sh -i src/static/video.mp4
```

**就这么简单！** ✅

---

## 会发生什么？

1. ✅ 自动转换 `video.mp4` 为 `animation.webp`
2. ✅ 压缩体积约 50%（2.3MB → 1.0MB）
3. ✅ 生成高质量 WebP 动画
4. ✅ 清理临时文件

---

## 然后呢？

### 选项 1: 用现成的动画（推荐）
首页已配置好，等转换完就直接能用：

```javascript
// src/pages/index/index.vue
animationUrl: '../../static/animation.webp' // ← 已配置好
```

### 选项 2: 使用 GIF 格式
```bash
bash scripts/video-to-animation.sh -i src/static/video.mp4 -f gif
```

然后改动画路径：
```javascript
animationUrl: '../../static/animation.gif'
```

---

## 体积对比

| 格式 | 大小 | 加载 |
|------|------|------|
| video.mp4 | 2.3 MB | 缓冲... |
| animation.webp | 1.0 MB | ⚡ 秒开 |
| animation.gif | 2.0 MB | ⚡ 秒开 |

---

## 常见参数

```bash
# 自定义输出文件名
bash scripts/video-to-animation.sh -i src/static/video.mp4 -o src/static/my-animation.webp

# 更高质量（但体积更大）
bash scripts/video-to-animation.sh -i src/static/video.mp4 -quality 90

# 更小体积（但流畅度降低）
bash scripts/video-to-animation.sh -i src/static/video.mp4 -fps 10 -quality 60

# 只转前 5 秒
bash scripts/video-to-animation.sh -i src/static/video.mp4 -duration 5

# 缩放到 480px 宽度
bash scripts/video-to-animation.sh -i src/static/video.mp4 -scale 480:-1
```

---

## ❓ 常见问题

**Q: 为什么用动画不用视频？**
A: 动画更轻、更快、更流畅，自动循环播放，无需用户交互

**Q: WebP 兼容性？**
A: 完全支持（iOS 14+, Android 5+, 小程序都支持）

**Q: 多久完成转换？**
A: 约 30-40 秒（取决于电脑性能）

**Q: 可以改回视频吗？**
A: 可以，见 ANIMATION_GUIDE.md 的"回滚"部分

---

## 🚀 下一步

转换完成后，直接在小程序中测试即可。动画会自动从 `src/static/animation.webp` 加载。

有问题？查看 `ANIMATION_GUIDE.md` 了解更多细节！
