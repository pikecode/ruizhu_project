<template>
  <view class="custom-navbar">
    <view class="navbar-content">
      <!-- 左侧内容插槽 -->
      <slot name="left">
        <text class="brand-logo">{{ title }}</text>
      </slot>

      <!-- 中间内容插槽 -->
      <slot name="center"></slot>

      <!-- 右侧内容插槽 -->
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomNavbar',
  props: {
    // 品牌名称/标题
    title: {
      type: String,
      default: 'RUIZHU'
    },
    // 是否显示底部边框
    showBorder: {
      type: Boolean,
      default: true
    },
    // 是否启用毛玻璃效果
    enableBlur: {
      type: Boolean,
      default: true
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    // z-index层级
    zIndex: {
      type: Number,
      default: 1000
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.06);
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  .navbar-content {
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 20rpx 40rpx;
    height: 140rpx;
    gap: 16rpx;
  }

  .brand-logo {
    font-size: 48rpx;
    font-weight: 700;
    letter-spacing: 4rpx;
    color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    flex: 1;
  }
}
</style>
