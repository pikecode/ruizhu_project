<template>
  <view class="custom-navbar">
    <view class="navbar-content">
      <!-- 左侧：返回与首页 -->
      <view class="nav-pill nav-pill-left">
        <view class="nav-icon-button" @tap="handleGoBack">
          <image class="icon-arrow-left" src="/static/icons/arrow-left.svg" mode="widthFix"></image>
        </view>
        <view class="nav-divider"></view>
        <view class="nav-icon-button" @tap="handleGoHome">
          <image class="icon-home" src="/static/icons/home-outline.svg" mode="widthFix"></image>
        </view>
      </view>

      <!-- 中间：页面标题 -->
      <text class="nav-title">{{ title }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConsultationNavbar',
  props: {
    // 导航栏标题
    title: {
      type: String,
      default: 'Prada Natural系列'
    },
    // 是否启用返回按钮
    showBack: {
      type: Boolean,
      default: true
    },
    // 是否启用首页按钮
    showHome: {
      type: Boolean,
      default: true
    }
  },
  emits: ['back', 'home'],
  methods: {
    handleGoBack() {
      this.$emit('back')
      uni.navigateBack()
    },
    handleGoHome() {
      this.$emit('home')
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 自定义导航栏 */
.custom-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

  .navbar-content {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 20rpx 40rpx 24rpx;
    height: 140rpx;
    gap: 0;
    position: relative;
  }

  .nav-pill-left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    position: absolute;
    left: 24rpx;
    bottom: 24rpx;
  }

  .nav-title {
    display: block;
    text-align: center;
    font-size: 32rpx;
    color: #000000;
    font-weight: 600;
    letter-spacing: 1rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4rpx;
    max-width: 60%;
  }

  .nav-pill {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1rpx solid rgba(0, 0, 0, 0.12);
    border-radius: 999rpx;
    padding: 0 16rpx;
    height: 56rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  .nav-icon-button {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &:active {
      opacity: 0.7;
    }
  }

  .nav-divider {
    width: 2rpx;
    height: 32rpx;
    background: rgba(0, 0, 0, 0.12);
    margin: 0 12rpx;
  }

  .icon-arrow-left {
    width: 40rpx;
    height: 40rpx;
    display: block;
  }

  .icon-home {
    width: 40rpx;
    height: 40rpx;
    display: block;
  }
}
</style>
