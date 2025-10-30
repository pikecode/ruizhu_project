<template>
  <view class="page">
    <!-- 自定义顶部导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <text class="brand-logo">RUIZHU</text>
      </view>
    </view>

    <!-- 轮播图区域（包含动画和其他banner） -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :indicator-color="indicatorColor"
        :indicator-active-color="indicatorActiveColor"
        :autoplay="true"
        :interval="5000"
        :circular="true"
        @change="onSwiperChange"
      >
        <!-- 第一个轮播项：动画展示 -->
        <swiper-item>
          <view class="banner-item video-item">
            <image
              class="banner-image"
              src="https://ompeak.com/banner-animation.webp"
              mode="aspectFill"
              :webp="true"
            ></image>
          </view>
        </swiper-item>

        <!-- 其他轮播项 -->
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <view class="banner-item">
            <image class="banner-image" :src="item.image" mode="aspectFill"></image>
            <view class="banner-overlay">
              <text class="banner-title">{{ item.title }}</text>
              <view class="banner-subtitle">
                <text class="subtitle-text">{{ item.subtitle }}</text>
                <view class="subtitle-line"></view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 会员礼遇区域 -->
    <view class="member-section">
      <text class="section-title">会员礼遇</text>
      <view class="member-cards">
        <view
          class="member-card"
          v-for="(card, index) in memberCards"
          :key="index"
          @tap="onCardTap(card)"
        >
          <image class="card-image" :src="card.image" mode="aspectFill"></image>
          <text class="card-label">{{ card.label }}</text>
        </view>
      </view>
    </view>

    <!-- 更多内容区域（可扩展） -->
    <view class="content-section">
      <text class="section-title">精选推荐</text>
      <view class="product-grid">
        <view
          class="product-item"
          v-for="(product, index) in products"
          :key="index"
          @tap="onProductTap(product)"
        >
          <image class="product-image" :src="product.image" mode="aspectFill"></image>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">¥{{ product.price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 视频相关
      videoUrl: '/static/video.mp4',
      showPlayBtn: true,

      indicatorColor: 'rgba(255, 255, 255, 0.5)',
      indicatorActiveColor: '#ffffff',
      currentBannerIndex: 0,
      bannerList: [
        {
          title: 'Ruizhu Collection',
          subtitle: '即刻探索',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
        },
        {
          title: '新品上市',
          subtitle: '限时优惠',
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
        },
        {
          title: '经典系列',
          subtitle: '永恒之选',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
        }
      ],
      memberCards: [
        {
          label: '会员专享',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80'
        },
        {
          label: '积分商城',
          image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80'
        }
      ],
      products: [
        {
          name: '经典手袋',
          price: '12800',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'
        },
        {
          name: '时尚背包',
          price: '8600',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'
        },
        {
          name: '优雅钱包',
          price: '3200',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80'
        },
        {
          name: '商务公文包',
          price: '15800',
          image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80'
        }
      ]
    }
  },
  onLoad() {
    console.log('Ruizhu 首页加载完成')
  },
  methods: {
    onVideoImageTap() {
      // 点击视频封面，可以打开视频播放器或跳转到视频详情
      uni.navigateTo({
        url: '/pages/video-player/video-player',  // 需要创建此页面
        fail: () => {
          // 如果页面不存在，显示提示
          uni.showToast({
            title: '视频播放器开发中',
            icon: 'none'
          })
        }
      })
    },

    onSwiperChange(e) {
      this.currentBannerIndex = e.detail.current
    },
    onCardTap(card) {
      uni.showToast({
        title: card.label,
        icon: 'none'
      })
    },
    onProductTap(product) {
      uni.showToast({
        title: product.name,
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);

  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 20rpx 40rpx;
    height: 88rpx;
  }

  .brand-logo {
    font-size: 48rpx;
    font-weight: 700;
    letter-spacing: 4rpx;
    color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 32rpx;

    text {
      font-size: 44rpx;
      color: #000000;
      font-weight: 300;
    }
  }
}

/* 轮播图区域 */
.banner-section {
  margin-top: calc(88rpx + constant(safe-area-inset-top));
  margin-top: calc(88rpx + env(safe-area-inset-top));
  width: 100%;
  height: 920rpx;

  .banner-swiper {
    width: 100%;
    height: 100%;
  }

  .banner-item {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .banner-image {
    width: 100%;
    height: 100%;
  }

  .banner-overlay {
    position: absolute;
    bottom: 100rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
  }

  .banner-title {
    font-size: 64rpx;
    font-weight: 500;
    color: #ffffff;
    letter-spacing: 2rpx;
    margin-bottom: 20rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  }

  .banner-subtitle {
    display: flex;
    flex-direction: column;
    align-items: center;

    .subtitle-text {
      font-size: 28rpx;
      color: #ffffff;
      letter-spacing: 1rpx;
      margin-bottom: 12rpx;
    }

    .subtitle-line {
      width: 120rpx;
      height: 2rpx;
      background: #ffffff;
    }
  }

  /* 视频项特殊样式 */
  .video-item {
    background: #000000;
  }
}

/* 会员礼遇区域 */
.member-section {
  padding: 80rpx 40rpx 60rpx;

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 60rpx;
    letter-spacing: 2rpx;
  }

  .member-cards {
    display: flex;
    gap: 24rpx;
  }

  .member-card {
    flex: 1;
    position: relative;
    height: 400rpx;
    border-radius: 8rpx;
    overflow: hidden;
    background: #f5f5f5;

    .card-image {
      width: 100%;
      height: 100%;
    }

    .card-label {
      position: absolute;
      bottom: 30rpx;
      left: 30rpx;
      right: 30rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #ffffff;
      text-align: center;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    }
  }
}

/* 内容区域 */
.content-section {
  padding: 60rpx 40rpx;

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 60rpx;
    letter-spacing: 2rpx;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }

  .product-item {
    background: #ffffff;
    border-radius: 8rpx;
    overflow: hidden;

    .product-image {
      width: 100%;
      height: 340rpx;
      background: #f5f5f5;
    }

    .product-info {
      padding: 24rpx;

      .product-name {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 12rpx;
        font-weight: 400;
      }

      .product-price {
        display: block;
        font-size: 32rpx;
        color: #000000;
        font-weight: 600;
      }
    }
  }
}
</style>
