<template>
  <view class="profile-page">
    <!-- 轮播图区域（包含动画和其他banner） -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :indicator-color="indicatorColor"
        :indicator-active-color="indicatorActiveColor"
        :autoplay="false"
        :circular="false"
        @change="onSwiperChange"
      >
        <!-- 轮播项 -->
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <view class="banner-item">
            <image :src="banner.image" class="banner-image" mode="aspectFill"></image>
            <view class="banner-text-overlay">
              <text class="banner-brand">RUIZHU</text>
              <view class="banner-welcome">
              <view class="welcome-desc-row">
                <text class="welcome-desc">{{ userGreeting }}先生，您好</text>
                <view class="welcome-actions">
                  <view class="action-icon edit" @tap="onEditProfile">
                    <text>✎</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 我的订单 -->
    <view class="orders-card">
      <view class="orders-header" @tap="goToOrders('all')">
        <text class="orders-title">我的订单</text>
        <text class="orders-arrow">→</text>
      </view>
      <view class="order-status-grid">
        <view
          v-for="(status, index) in orderStatuses"
          :key="index"
          class="order-status-item"
          @tap="onOrderStatusTap(status)"
        >
          <view class="status-icon-wrapper">
            <image class="status-icon" :src="status.icon" mode="aspectFit"></image>
          </view>
          <text class="status-label">{{ status.label }}</text>
        </view>
      </view>
    </view>

    <!-- 快速访问 -->
    <view class="quick-access-section">
      <view class="quick-access-item" @tap="onQuickAccessTap('wishlist')">
        <image class="quick-access-icon" src="/static/icons/quick-wishlist.svg" mode="aspectFit"></image>
        <text class="quick-access-label">我的心愿单</text>
      </view>
      <view class="quick-access-item" @tap="onQuickAccessTap('addresses')">
        <image class="quick-access-icon" src="/static/icons/quick-address.svg" mode="aspectFit"></image>
        <text class="quick-access-label">我的地址簿</text>
      </view>
    </view>

    <!-- 法律和授权 -->
    <view class="legal-access-section">
      <view class="legal-item" @tap="onLegalTap('terms')">
        <image class="legal-icon" src="/static/icons/legal-terms.svg" mode="aspectFit"></image>
        <text class="legal-label">法律条款</text>
      </view>
      <view class="legal-item" @tap="onLegalTap('privacy')">
        <image class="legal-icon" src="/static/icons/legal-privacy.svg" mode="aspectFit"></image>
        <text class="legal-label">个人信息授权</text>
      </view>
    </view>

    <!-- 猜你喜欢推荐 -->
    <RecommendSection
      :items="recommendProducts"
      :columns="2"
      @product-tap="onProductTap"
      @favorite-change="onFavoriteChange"
    />
  </view>
</template>

<script>
import RecommendSection from '../../components/RecommendSection.vue'

export default {
  components: {
    RecommendSection
  },
  data() {
    return {
      appVersion: '1.0.0',
      userGreeting: '张**',
      indicatorColor: 'rgba(255, 255, 255, 0.5)',
      indicatorActiveColor: '#ffffff',
      currentBannerIndex: 0,
      banners: [
        {
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
        },
        {
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'
        },
        {
          image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
        }
      ],
      orderStatuses: [
        { id: 'pending-payment', label: '待支付', icon: '/static/icons/order-pending-payment.svg' },
        { id: 'pending-shipment', label: '待发货', icon: '/static/icons/order-pending-shipment.svg' },
        { id: 'shipped', label: '已发货', icon: '/static/icons/order-shipped.svg' },
        { id: 'aftersales', label: '售后', icon: '/static/icons/order-aftersales.svg' }
      ],
      recommendProducts: [
        {
          id: 1,
          name: '【粉星同款】Prada Explore 中号Re-Nylon单肩包',
          price: '17,900',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80',
          imageCount: 2,
          isFavorite: false
        },
        {
          id: 2,
          name: '【特售】Prada Explore中号Nappa牛皮革单肩包',
          price: '26,400',
          image: 'https://images.unsplash.com/photo-1596736342875-ff5348bf9908?w=300&q=80',
          imageCount: 2,
          isFavorite: false
        },
        {
          id: 3,
          name: 'Re-Nylon双肩背包',
          price: '19,500',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80',
          imageCount: 2,
          isFavorite: false
        },
        {
          id: 4,
          name: '【特售】皮靴中筒靴',
          price: '8,900',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80',
          imageCount: 2,
          isFavorite: false
        }
      ]
    }
  },
  onLoad() {
    console.log('我的页面加载完成')
  },
  methods: {
    onSwiperChange(e) {
      this.currentBannerIndex = e.detail.current
    },
    onOrderStatusTap(status) {
      uni.navigateTo({
        url: `/pages/orders/orders?status=${status.id}`
      })
    },
    goToOrders(type) {
      uni.navigateTo({
        url: `/pages/orders/orders?status=${type}`
      })
    },
    onQuickAccessTap(type) {
      if (type === 'wishlist') {
        uni.navigateTo({
          url: '/pages/wishlist/wishlist'
        })
      } else if (type === 'addresses') {
        uni.navigateTo({
          url: '/pages/addresses/addresses'
        })
      }
    },
    onLegalTap(type) {
      if (type === 'terms') {
        uni.navigateTo({
          url: '/pages/legal/legal'
        })
      } else if (type === 'privacy') {
        uni.navigateTo({
          url: '/pages/legal/authorization'
        })
      }
    },
    onProductTap(item) {
      // 保存推荐商品信息用于详情页
      try {
        uni.setStorageSync('selectedProduct', item)
      } catch (e) {
        console.error('Failed to save product:', e)
      }

      uni.navigateTo({
        url: '/pages/product/detail'
      })
    },
    onFavoriteChange({ index, isFavorite }) {
      const status = isFavorite ? '已收藏' : '已移除'
      uni.showToast({
        title: status,
        icon: 'none',
        duration: 1000
      })
    },
    onEditProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    }
  }
}
</script>

<style lang="scss">
.profile-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
}

/* 轮播图区域 */
.banner-section {
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

  .banner-text-overlay {
    position: absolute;
    bottom: 100rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;

    .banner-brand {
      display: block;
      font-size: 56rpx;
      font-weight: 500;
      color: #ffffff;
      letter-spacing: 2rpx;
      margin-bottom: 20rpx;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    }

    .banner-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;

      .welcome-desc-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12rpx;

        .welcome-desc {
          display: block;
          font-size: 28rpx;
          color: #ffffff;
          letter-spacing: 1rpx;
        }
        .welcome-actions {
          display: flex;
          align-items: center;

          .action-icon {
            width: 44rpx;
            height: 44rpx;
            border-radius: 50%;
            border: 1rpx solid rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 12rpx;
            transition: opacity 0.2s;

            text {
              color: #ffffff;
              font-size: 24rpx;
            }

            &:active {
              opacity: 0.8;
            }
          }
        }

      }
    }
  }
}

/* 我的订单卡片 */
.orders-card {
  margin: 0 40rpx;
  margin-top: -80rpx;
  background: #ffffff; 
  padding: 32rpx 24rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1px solid #f0f0f0;

    .orders-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #000000;
    }

    .orders-arrow {
      display: block;
      font-size: 32rpx;
      color: #000000;
      font-weight: 300;
    }
  }

  .order-status-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;

    .order-status-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rpx;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }

      .status-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 88rpx;
        height: 88rpx;

        .status-icon {
          width: 56rpx;
          height: 56rpx;
          display: block;
        }
      }

      .status-label {
        display: block;
        font-size: 22rpx;
        color: #333333;
        text-align: center;
        font-weight: 400;
      }

      &:active .status-icon-wrapper {
        opacity: 0.8;
      }
    }
  }
}

/* 快速访问区域 */
.quick-access-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 40rpx 40rpx 0;
  margin-top: 32rpx;

  .quick-access-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 24rpx;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 8rpx;
    cursor: pointer;

    &:active {
      background: #f9f9f9;
      border-color: #000000;
    }

    .quick-access-icon {
      width: 72rpx;
      height: 72rpx;
      display: block;
      margin-bottom: 16rpx;
    }

    .quick-access-label {
      display: block;
      font-size: 26rpx;
      color: #333333;
      font-weight: 400;
      text-align: center;
    }
  }
}

/* 法律授权区域 */
.legal-access-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 0 40rpx;
  margin-top: 20rpx;
  margin-bottom: 40rpx;

  .legal-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 24rpx;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 8rpx;
    cursor: pointer;

    &:active {
      background: #f9f9f9;
      border-color: #000000;
    }

    .legal-icon {
      width: 72rpx;
      height: 72rpx;
      display: block;
      margin-bottom: 16rpx;
    }

    .legal-label {
      display: block;
      font-size: 26rpx;
      color: #333333;
      font-weight: 400;
      text-align: center;
    }
  }
}

</style>
