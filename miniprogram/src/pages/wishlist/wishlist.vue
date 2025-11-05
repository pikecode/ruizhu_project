<template>
  <view class="wishlist-page">
    <!-- 空状态 -->
    <view v-if="wishlistProducts.length === 0 && !isLoading" class="empty-state">
      <view class="empty-illustration">
        <text class="empty-icon">♡</text>
      </view>
      <text class="empty-title">还没有收藏商品</text>
      <text class="empty-description">点击商品上的♡图标即可收藏喜欢的商品</text>
      <view class="empty-action-btn" @tap="continueShopping">
        <text>继续购物</text>
      </view>
    </view>

    <!-- 加载中状态 -->
    <view v-if="isLoading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- 心愿单产品网格 -->
    <view v-if="wishlistProducts.length > 0" class="wishlist-section">
      <view class="wishlist-grid">
        <view
          v-for="(item, index) in wishlistProducts"
          :key="item.id"
          class="wishlist-card"
        >
          <!-- 产品图片和收藏按钮 -->
          <view class="product-image-wrapper">
            <image :src="item.image" class="product-image" mode="aspectFill"></image>
            <text class="favorite-btn" @tap.stop="removeFromWishlist(index)">♥</text>
            <view class="image-indicators">
              <text class="indicator-dot active"></text>
            </view>
          </view>

          <!-- 产品信息 -->
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-price">¥{{ (item.price / 100).toFixed(2) }}</text>
          </view>

          <!-- 查看详情按钮 -->
          <view class="detail-btn" @tap="onViewDetail(item)">
            <text>查看详情</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import wishlistService from '../../services/wishlist'

export default {
  data() {
    return {
      wishlistProducts: [],
      isLoading: false,
      page: 1,
      pageSize: 20,
      userId: null
    }
  },
  onLoad() {
    console.log('心愿单页面 onLoad 执行')
    // 延迟加载，确保组件完全初始化
    setTimeout(() => {
      this.loadWishlistData()
    }, 100)
  },
  onShow() {
    // 页面显示时刷新数据
    console.log('心愿单页面 onShow 执行')
    if (this.wishlistProducts.length === 0 && !this.isLoading) {
      this.loadWishlistData()
    }
  },
  mounted() {
    console.log('心愿单页面 mounted 执行')
    this.loadWishlistData()
  },
  methods: {
    /**
     * 加载心愿单数据
     */
    async loadWishlistData() {
      try {
        console.log('开始加载心愿单数据...')
        this.isLoading = true
        console.log('调用 wishlistService.getWishlist:', this.page, this.pageSize)
        const response = await wishlistService.getWishlist(this.page, this.pageSize)

        console.log('获取心愿单 API 响应:', response)

        if (response && response.items && Array.isArray(response.items)) {
          console.log('心愿单项数:', response.items.length)
          // 转换API返回的数据结构
          this.wishlistProducts = response.items.map(item => {
            const product = {
              id: item.productId || item.product?.id,
              name: item.product?.name || '',
              image: item.product?.coverImageUrl || '',
              price: item.product?.currentPrice || 0,
              isFavorite: true
            }
            console.log('映射产品数据:', item, '->', product)
            return product
          })
          console.log('最终 wishlistProducts:', this.wishlistProducts)
        } else {
          console.log('API 返回为空或无效:', response)
          this.wishlistProducts = []
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error)
        uni.showToast({
          title: '加载心愿单失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 从心愿单中移除产品
     */
    async removeFromWishlist(index) {
      if (index < 0 || index >= this.wishlistProducts.length) {
        return
      }

      const item = this.wishlistProducts[index]

      try {
        // 先执行乐观更新
        const removedItem = this.wishlistProducts.splice(index, 1)[0]

        uni.showToast({
          title: '已移除',
          icon: 'none',
          duration: 1000
        })

        // 调用API删除
        await wishlistService.removeFromWishlist(item.id)
      } catch (error) {
        console.error('Failed to remove from wishlist:', error)

        // 恢复数据
        this.wishlistProducts.splice(index, 0, item)

        uni.showToast({
          title: '移除失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    },

    /**
     * 查看产品详情
     */
    onViewDetail(item) {
      // 导航到产品详情页
      uni.navigateTo({
        url: `/pages/product/detail?id=${item.id}`,
        fail: () => {
          uni.showToast({
            title: '页面不存在',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },

    /**
     * 继续购物 - 返回商城
     */
    continueShopping() {
      uni.switchTab({
        url: '/pages/index/index',
        fail: () => {
          uni.navigateBack()
        }
      })
    }
  }
}
</script>

<style lang="scss">
.wishlist-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40rpx;

  .empty-illustration {
    margin-bottom: 40rpx;

    .empty-icon {
      display: block;
      font-size: 120rpx;
      line-height: 1;
      color: #cccccc;
    }
  }

  .empty-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16rpx;
    text-align: center;
  }

  .empty-description {
    display: block;
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 40rpx;
    text-align: center;
    line-height: 1.5;
  }

  .empty-action-btn {
    width: 300rpx;
    padding: 16rpx 0;
    background: #000000;
    color: #ffffff;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;
    transition: all 0.2s ease;

    &:active {
      background: #333333;
      transform: scale(0.98);
    }

    text {
      display: block;
    }
  }
}

/* 加载中状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  padding: 40rpx;

  text {
    font-size: 28rpx;
    color: #999999;
  }
}

/* 顶部返回和标题 */
.wishlist-header {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;

    .back-btn {
      font-size: 40rpx;
      color: #000000;
      font-weight: 300;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.9);
      }
    }

    .header-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #000000;
      flex: 1;
      text-align: center;
    }

    .header-right {
      width: 40rpx;
    }
  }
}

/* 心愿单网格 */
.wishlist-section {
  padding: 40rpx;
  background: #ffffff;

  .wishlist-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .wishlist-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;

      .product-image-wrapper {
        position: relative;
        width: 100%;
        height: 320rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        overflow: hidden;
        margin-bottom: 16rpx;

        .product-image {
          width: 100%;
          height: 100%;
          display: block;
        }

        .favorite-btn {
          position: absolute;
          top: 12rpx;
          right: 12rpx;
          font-size: 32rpx;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 5;

          &:active {
            transform: scale(1.1);
          }
        }

        .image-indicators {
          position: absolute;
          bottom: 12rpx;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6rpx;

          .indicator-dot {
            display: block;
            width: 8rpx;
            height: 8rpx;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transition: all 0.3s ease;

            &.active {
              background: #ffffff;
              width: 24rpx;
              border-radius: 4rpx;
            }
          }
        }
      }

      .product-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        margin-bottom: 16rpx;

        .product-name {
          display: block;
          font-size: 24rpx;
          color: #333333;
          font-weight: 400;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-price {
          display: block;
          font-size: 28rpx;
          color: #000000;
          font-weight: 600;
        }
      }

      .detail-btn {
        width: 100%;
        padding: 16rpx 0;
        background: #000000;
        color: #ffffff;
        border-radius: 6rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;

        &:active {
          background: #333333;
          transform: scale(0.98);
        }
      }
    }
  }
}
</style>
