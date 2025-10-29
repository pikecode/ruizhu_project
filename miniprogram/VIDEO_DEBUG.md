# 视频加载调试指南

## 问题诊断

如果视频一直在加载或显示为黑色：

### 可能的原因

1. **本地文件路径问题**
   - 小程序加载本地视频的路径需要特殊处理
   - 当前已修改为绝对路径：`/static/video.mp4`

2. **自动播放限制**
   - 某些浏览器/系统需要用户交互后才能自动播放
   - 已配置静音模式来规避此限制

3. **网络/缓存问题**
   - 本地开发时需要确保文件已构建到正确位置

## 当前配置

```vue
<video
  ref="headerVideo"
  :src="videoSrc"              <!-- videoSrc: '/static/video.mp4' -->
  :autoplay="isVideoReady"     <!-- 页面加载后启用 -->
  :muted="true"                <!-- 静音允许自动播放 -->
  :loop="true"                 <!-- 循环播放 -->
  :controls="false"            <!-- 隐藏控制条 -->
  @loadedmetadata="onVideoLoaded"
  @error="onVideoError"
></video>
```

## 测试步骤

### 1. 检查构建输出
```bash
# 确保静态文件已包含在构建中
ls -la src/static/video.mp4
```

### 2. 启用开发者工具
在微信小程序中：
- 点击右上角 `...`
- 选择 `开发者工具`
- 查看 Console 输出

### 3. 检查控制台日志
```
✅ 正常情况：
  - "Ruizhu 首页加载完成"
  - "视频开始播放"
  - "视频元数据已加载"

❌ 错误情况：
  - "视频加载错误"
  - "视频已暂停"（立即显示表示加载失败）
```

### 4. 检查网络标签
查看视频文件是否成功请求：
- 文件大小：2.3 MB
- 状态码：200
- 加载时间：应该很快（本地文件）

## 解决方案

### 方案 A: 检查文件路径
如果视频无法加载，尝试不同的路径：

```javascript
// 选项 1: 绝对路径（当前使用）
videoSrc: '/static/video.mp4'

// 选项 2: 相对路径
videoSrc: '../../static/video.mp4'

// 选项 3: 使用 require（如果支持）
videoSrc: require('../../static/video.mp4')
```

### 方案 B: 添加加载状态
如果需要显示加载状态：

```vue
<template>
  <view class="video-section">
    <video v-if="videoSrc" :src="videoSrc" ...></video>

    <!-- 加载中提示 -->
    <view v-if="!isVideoPlaying" class="loading-hint">
      <text>视频加载中...</text>
    </view>
  </view>
</template>

<style>
.loading-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}
</style>
```

### 方案 C: 手动触发播放
如果自动播放不工作，可以添加点击播放：

```vue
<view class="video-section" @tap="playVideo">
  <video ref="headerVideo" :src="videoSrc" ...></video>

  <!-- 播放按钮 -->
  <view v-if="!isVideoPlaying" class="play-button">
    ▶️ 点击播放
  </view>
</view>

<script>
methods: {
  playVideo() {
    this.$refs.headerVideo?.play?.()
  }
}
</script>
```

## 常见错误

### 错误 1: "找不到文件"
```
错误: ENOENT: no such file or directory
原因: 路径不正确
解决: 检查 src/static/ 中是否存在 video.mp4
```

### 错误 2: "格式不支持"
```
错误: Video format not supported
原因: 视频编码或格式问题
解决: 使用预先编码的视频文件（src/static/video_optimized.mp4）
```

### 错误 3: "自动播放被阻止"
```
现象: 视频加载了但不自动播放
原因: 小程序限制或浏览器策略
解决: 已配置 muted=true，应该可以自动播放
```

## 快速修复

如果视频仍有问题，按以下顺序尝试：

1. **清除缓存**
   - 小程序开发者工具：清除所有缓存数据

2. **重新构建**
   ```bash
   npm run build  # 或项目的构建命令
   ```

3. **检查文件**
   ```bash
   file src/static/video.mp4
   du -h src/static/video.mp4
   ```

4. **使用备用视频**
   ```javascript
   videoSrc: '/static/video_optimized.mp4'  // 尝试优化版本
   ```

5. **禁用自动播放**
   ```javascript
   // 改为手动播放
   :autoplay="false"
   <!-- 添加播放按钮 -->
   <button @tap="playVideo">播放视频</button>
   ```

## 生产部署检查清单

- [ ] 视频文件已包含在构建输出中
- [ ] 路径在所有环境（开发/生产）中都正确
- [ ] 视频编码与小程序兼容（H.264）
- [ ] 文件大小在可接受范围内（< 10MB）
- [ ] 在真实设备上测试过
- [ ] iOS 和 Android 都测试过
- [ ] 网络环境 (WiFi/4G/5G) 都测试过

## 相关文件

- `src/pages/index/index.vue` - 首页文件
- `src/static/video.mp4` - 原始视频（2.3 MB）
- `src/static/video_optimized.mp4` - 优化版本（2.9 MB）
- `VIDEO_OPTIMIZATION.md` - 视频优化指南
