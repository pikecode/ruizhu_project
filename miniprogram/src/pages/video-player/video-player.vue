<template>
  <view class="video-player-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <text class="back-btn" @tap="goBack">< 返回</text>
      <text class="title">视频播放</text>
      <view style="width: 80rpx;"></view>
    </view>

    <!-- 视频播放器 -->
    <view class="player-container">
      <video
        class="player"
        src="/static/video.mp4"
        :autoplay="true"
        :controls="true"
        :muted="false"
        :show-fullscreen-btn="true"
        @play="onPlay"
        @pause="onPause"
        @error="onError"
      ></video>
    </view>

    <!-- 视频信息 -->
    <view class="video-info">
      <view class="info-section">
        <text class="info-title">视频信息</text>
        <view class="info-item">
          <text class="label">时长:</text>
          <text class="value">18 秒</text>
        </view>
        <view class="info-item">
          <text class="label">分辨率:</text>
          <text class="value">720x1088</text>
        </view>
        <view class="info-item">
          <text class="label">格式:</text>
          <text class="value">MP4 (H.264)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isPlaying: false
    }
  },
  onLoad() {
    console.log('视频播放器页面加载')
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    onPlay() {
      this.isPlaying = true
      console.log('视频开始播放')
    },
    onPause() {
      this.isPlaying = false
      console.log('视频暂停')
    },
    onError(e) {
      console.error('视频加载错误:', e)
      uni.showToast({
        title: '视频加载失败',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.video-player-page {
  min-height: 100vh;
  background: #ffffff;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding-top: calc(16rpx + constant(safe-area-inset-top));
  padding-top: calc(16rpx + env(safe-area-inset-top));

  .back-btn {
    font-size: 32rpx;
    color: #000000;
    font-weight: 500;
  }

  .title {
    font-size: 32rpx;
    color: #000000;
    font-weight: 600;
  }
}

.player-container {
  width: 100%;
  height: 600rpx;
  background: #000000;
  position: relative;

  .player {
    width: 100%;
    height: 100%;
  }
}

.video-info {
  padding: 32rpx 24rpx;

  .info-section {
    .info-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #000000;
      margin-bottom: 24rpx;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1px solid #f0f0f0;

      .label {
        font-size: 28rpx;
        color: #666666;
      }

      .value {
        font-size: 28rpx;
        color: #000000;
        font-weight: 500;
      }
    }
  }
}
</style>
