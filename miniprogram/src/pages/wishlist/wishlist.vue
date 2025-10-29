<template>
  <view class="wishlist-page">
  

    <!-- 心愿单产品网格 -->
    <view class="wishlist-section">
      <view class="wishlist-grid">
        <view
          v-for="(item, index) in wishlistProducts"
          :key="index"
          class="wishlist-card"
        >
          <!-- 产品图片和收藏按钮 -->
          <view class="product-image-wrapper">
            <image :src="item.image" class="product-image" mode="aspectFill"></image>
            <text class="favorite-btn" @tap.stop="toggleFavorite(index)">♥</text>
            <view class="image-indicators">
              <text
                v-for="(dot, dotIndex) in item.imageCount"
                :key="dotIndex"
                class="indicator-dot"
                :class="{ active: dotIndex === 0 }"
              ></text>
            </view>
          </view>

          <!-- 产品信息 -->
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-price">¥{{ item.price }}</text>
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
export default {
  data() {
    return {
      wishlistProducts: [
        {
          id: 1,
          name: '【粉星同款】Prada Explore 中号Re-Nylon单肩包',
          price: '17,900',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
          imageCount: 2,
          isFavorite: true
        },
        {
          id: 2,
          name: '【特售】Prada Explore中号Nappa牛皮革单肩包',
          price: '26,400',
          image: 'https://images.unsplash.com/photo-1596736342875-ff5348bf9908?w=400&q=80',
          imageCount: 2,
          isFavorite: true
        },
        {
          id: 3,
          name: 'Re-Nylon双肩背包',
          price: '19,500',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
          imageCount: 2,
          isFavorite: true
        },
        {
          id: 4,
          name: '【特售】皮靴中筒靴',
          price: '8,900',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
          imageCount: 2,
          isFavorite: true
        },
        {
          id: 5,
          name: 'Prada Bonnie 迷你牛皮革手袋',
          price: '12,500',
          image: 'https://images.unsplash.com/photo-1548062407-f961713e6786?w=400&q=80',
          imageCount: 2,
          isFavorite: true
        },
        {
          id: 6,
          name: 'Prada Re-Edition 1978小号Re-Nylon手袋',
          price: '14,800',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
          imageCount: 2,
          isFavorite: true
        }
      ]
    }
  },
  onLoad() {
    console.log('心愿单页面加载完成')
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    toggleFavorite(index) {
      this.wishlistProducts[index].isFavorite = !this.wishlistProducts[index].isFavorite
      const status = this.wishlistProducts[index].isFavorite ? '已收藏' : '已移除'
      uni.showToast({
        title: status,
        icon: 'none',
        duration: 1000
      })
    },
    onViewDetail(item) {
      uni.showToast({
        title: item.name,
        icon: 'none',
        duration: 1500
      })
      // 可以导航到产品详情页
      // uni.navigateTo({
      //   url: `/pages/product/detail?id=${item.id}`
      // })
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
