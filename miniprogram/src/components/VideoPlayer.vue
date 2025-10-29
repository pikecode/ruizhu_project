<template>
  <view class="video-player">
    <view class="video-container">
      <video
        ref="videoRef"
        :src="src"
        :controls="controls"
        :autoplay="autoplay"
        :muted="muted"
        :show-progress="true"
        :show-fullscreen-btn="true"
        :show-play-btn="true"
        :show-center-play-btn="true"
        :enable-progress-gesture="true"
        :play-btn-position="playBtnPosition"
        :poster="poster"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @error="handleError"
        @timeupdate="handleTimeUpdate"
      ></video>

      <!-- 加载中状态 -->
      <view v-if="isLoading" class="loading-mask">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 错误状态 -->
      <view v-if="errorMessage" class="error-mask">
        <text class="error-text">{{ errorMessage }}</text>
        <button @tap="handleRetry" class="retry-btn">重试</button>
      </view>
    </view>

    <!-- 播放统计（开发环境） -->
    <view v-if="showStats" class="video-stats">
      <text>{{ playbackInfo }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      required: true
    },
    poster: {
      type: String,
      default: ''
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    controls: {
      type: Boolean,
      default: true
    },
    playBtnPosition: {
      type: String,
      default: 'center'
    },
    showStats: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPlaying: false,
      isLoading: false,
      errorMessage: '',
      duration: 0,
      currentTime: 0,
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    playbackInfo() {
      const minutes = Math.floor(this.currentTime / 60)
      const seconds = Math.floor(this.currentTime % 60)
      const totalMinutes = Math.floor(this.duration / 60)
      const totalSeconds = Math.floor(this.duration % 60)
      return `${minutes}:${String(seconds).padStart(2, '0')} / ${totalMinutes}:${String(totalSeconds).padStart(2, '0')}`
    }
  },
  methods: {
    handlePlay() {
      this.isPlaying = true
      this.isLoading = false
      this.errorMessage = ''
      this.$emit('play')
      console.log('视频开始播放')
    },
    handlePause() {
      this.isPlaying = false
      this.$emit('pause')
      console.log('视频暂停')
    },
    handleEnded() {
      this.isPlaying = false
      this.$emit('ended')
      console.log('视频播放完成')
    },
    handleError(e) {
      this.isLoading = false
      this.errorMessage = '视频加载失败，请检查网络'
      console.error('视频加载错误:', e)
      this.$emit('error', e)
    },
    handleTimeUpdate(e) {
      this.currentTime = e.detail.currentTime
      this.duration = e.detail.duration
      this.$emit('timeupdate', e.detail)
    },
    handleRetry() {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        this.errorMessage = ''
        this.$refs.videoRef?.load?.()
      } else {
        this.errorMessage = '重试次数过多，请稍后再试'
      }
    },
    play() {
      this.$refs.videoRef?.play?.()
    },
    pause() {
      this.$refs.videoRef?.pause?.()
    },
    stop() {
      this.$refs.videoRef?.stop?.()
    },
    seek(time) {
      if (this.$refs.videoRef) {
        // 注意：seek 方法可能因平台而异
        this.currentTime = time
      }
    }
  },
  mounted() {
    console.log('VideoPlayer 组件已挂载')
  }
}
</script>

<style lang="scss" scoped>
.video-player {
  width: 100%;
  background: #000;

  .video-container {
    position: relative;
    width: 100%;
    height: 550rpx;
    background: #000;
    overflow: hidden;

    video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      will-change: transform;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    .loading-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10;

      .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20rpx;
      }

      .loading-text {
        color: #fff;
        font-size: 28rpx;
      }
    }

    .error-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10;

      .error-text {
        color: #ff6b6b;
        font-size: 28rpx;
        margin-bottom: 30rpx;
        text-align: center;
        padding: 0 40rpx;
      }

      .retry-btn {
        background: #fff;
        color: #000;
        border: none;
        padding: 16rpx 40rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        font-weight: 500;

        &:active {
          opacity: 0.8;
        }
      }
    }
  }

  .video-stats {
    padding: 16rpx;
    background: #f5f5f5;
    font-size: 24rpx;
    color: #666;
    text-align: center;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
