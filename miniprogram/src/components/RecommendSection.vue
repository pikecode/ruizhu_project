<template>
  <view class="recommend-section">
    <text class="recommend-title">{{ title }}</text>
    <view class="recommend-grid" :class="{ 'columns-3': columns === 3 }">
      <view
        v-for="(item, index) in items"
        :key="index"
        class="recommend-card"
        @tap="$emit('product-tap', item)"
      >
        <view class="recommend-image-wrapper">
          <image :src="item.image" class="recommend-image" mode="aspectFill"></image>
          <text class="favorite-btn" @tap.stop="toggleFavorite(index)">{{ item.isFavorite ? '♥' : '♡' }}</text>
          <view class="image-indicators">
            <text
              v-for="(dot, dotIndex) in item.imageCount"
              :key="dotIndex"
              class="indicator-dot"
              :class="{ active: dotIndex === 0 }"
            ></text>
          </view>
        </view>
        <view class="recommend-info">
          <text class="recommend-product-name">{{ item.name }}</text>
          <text class="recommend-price">¥{{ (item.price / 100).toFixed(2) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { wishlistService } from '../services/wishlist'

export default {
  name: 'RecommendSection',
  props: {
    title: {
      type: String,
      default: '猜你喜欢'
    },
    items: {
      type: Array,
      required: true,
      validator: (arr) => arr.every(item => item.name && item.price && item.image && item.imageCount)
    },
    columns: {
      type: Number,
      default: 2,
      validator: (val) => [2, 3].includes(val)
    }
  },
  data() {
    return {
      loadingFavorite: {} // Track loading state for each product: { productId: true/false }
    }
  },
  methods: {
    /**
     * 切换收藏状态
     * 同时更新本地状态和远程API
     */
    async toggleFavorite(index) {
      const item = this.items[index]
      const productId = item.id

      // 防止重复点击
      if (this.loadingFavorite[productId]) {
        return
      }

      try {
        this.loadingFavorite[productId] = true
        const currentFavorite = item.isFavorite

        // 立即更新UI（乐观更新）
        item.isFavorite = !currentFavorite

        // 调用API更新远程状态
        await wishlistService.toggleWishlist(productId, currentFavorite)

        // 触发事件通知父组件
        this.$emit('favorite-change', {
          index: index,
          item: item,
          isFavorite: item.isFavorite
        })

        console.log(`Product ${productId} favorite toggled to ${item.isFavorite}`)
      } catch (error) {
        // API调用失败，回滚UI状态
        const item = this.items[index]
        item.isFavorite = !item.isFavorite

        console.error('Failed to toggle favorite:', error)
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'error',
          duration: 2000
        })

        // 触发失败事件
        this.$emit('favorite-change', {
          index: index,
          item: item,
          isFavorite: item.isFavorite,
          error: error
        })
      } finally {
        this.loadingFavorite[productId] = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 猜你喜欢推荐 */
.recommend-section {
  padding: 40rpx;
  background: #ffffff;

  .recommend-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 32rpx;
  }

  .recommend-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    &.columns-3 {
      grid-template-columns: repeat(3, 1fr);
      gap: 16rpx;
    }

    .recommend-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;

      &:active {
        opacity: 0.9;
      }

      .recommend-image-wrapper {
        position: relative;
        width: 100%;
        height: 320rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        overflow: hidden;
        margin-bottom: 16rpx;

        .recommend-image {
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
          z-index: 5;

          &:active {
            opacity: 0.7;
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

            &.active {
              background: #ffffff;
              width: 24rpx;
              border-radius: 4rpx;
            }
          }
        }
      }

      .recommend-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .recommend-product-name {
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

        .recommend-price {
          display: block;
          font-size: 28rpx;
          color: #000000;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
