# 视频播放性能优化指南

## 当前视频信息
- **文件名**: video.mp4
- **文件大小**: 2.3MB
- **分辨率**: 720x1088 (竖屏格式)
- **编码**: H.264/AVC (High Profile)
- **帧率**: 30fps
- **时长**: ~18 秒
- **比特率**: ~1Mbps

## 已应用的优化

### 1. 组件配置优化 ✓
```vue
<video
  ref="headerVideo"
  class="header-video"
  :src="videoUrl"
  :controls="true"                    # 显示播放控制条
  :autoplay="false"                   # 不自动播放，节省流量
  :muted="false"                      # 允许音频（用户可选）
  :show-progress="true"               # 显示进度条
  :show-fullscreen-btn="true"         # 支持全屏
  :show-play-btn="true"               # 显示播放按钮
  :show-center-play-btn="true"        # 中央播放按钮
  :enable-progress-gesture="true"     # 手势快进
  :play-btn-position="'center'"       # 播放按钮位置
  :poster="videoPoster"               # 视频封面
  @play="onVideoPlay"
  @pause="onVideoPause"
></video>
```

### 2. CSS 性能优化 ✓
```scss
.header-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  will-change: transform;              # GPU加速
  backface-visibility: hidden;         # 3D加速
  -webkit-backface-visibility: hidden; # Safari兼容
}
```

### 3. 播放行为管理 ✓
- 不自动播放（用户主动触发）
- 支持全屏播放
- 手势控制进度
- 播放/暂停事件监听

## 进一步优化建议

### 方案 A: 视频文件优化（推荐）
如果视频仍需优化，可考虑：

```bash
# 减少比特率 (从1Mbps降至600Kbps左右)
ffmpeg -i video.mp4 -c:v libx264 -preset medium -crf 28 -b:v 600k -c:a aac -b:a 64k video_optimized.mp4

# 转换为WebM格式 (更优的压缩)
ffmpeg -i video.mp4 -c:v libvpx-vp9 -crf 30 -b:v 500k -c:a libopus -b:a 64k video.webm
```

### 方案 B: 小程序特定优化

**在 pages.json 中配置资源优化**:
```json
{
  "navigationStyle": "custom",
  "enablePullDownRefresh": false,
  "backgroundTextStyle": "light"
}
```

**在页面中添加预加载**:
```javascript
onLoad() {
  // 预加载视频 (可选)
  if (uni.getSystemInfoSync().platform === 'android') {
    this.$refs.headerVideo?.load?.()
  }
}
```

### 方案 C: 网络优化

如果视频需上传到CDN（云存储）：

```javascript
// 使用 CDN 地址替代本地路径
data() {
  return {
    // videoUrl: '../../static/video.mp4',  // 本地
    videoUrl: 'https://your-cdn.com/video.mp4', // CDN (推荐用于大文件)
  }
}
```

## 微信小程序特定注意事项

1. **支持格式**: MP4 (H.264) 推荐
2. **最大文件**: 无硬性限制，但建议 < 10MB
3. **网络环境**: 会自动选择合适码率
4. **缓存机制**: 小程序会自动缓存已播放视频

## 性能检查清单

- [x] 使用H.264编码 (兼容性最好)
- [x] 30fps帧率（平衡质量和性能）
- [x] 不自动播放（用户主动触发）
- [x] GPU加速启用
- [x] 支持手势控制
- [x] 响应式播放器尺寸
- [ ] 可选：添加加载中状态
- [ ] 可选：添加错误处理
- [ ] 可选：上传CDN加速

## 测试建议

1. **iOS 测试**: 在 iPhone 上测试视频流畅度
2. **Android 测试**: 在不同机型测试兼容性
3. **网络测试**: 在 3G/4G/5G 环境测试加载速度
4. **内存监控**: 使用开发者工具检查内存占用

## 常见问题

**Q: 视频在小程序中卡顿？**
A: 检查是否为网络问题、尝试降低视频比特率或使用CDN加速

**Q: iOS/Android 表现不一致？**
A: 不同系统对视频编码支持不同，建议多平台测试

**Q: 如何获取更好的压缩？**
A: 使用 VP9 编码可获得更好压缩，但兼容性不如 H.264
