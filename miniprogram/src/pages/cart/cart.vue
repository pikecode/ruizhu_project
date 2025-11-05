<template>
  <view class="page">
    <!-- 购物车非空状态 -->
    <view v-if="cartItems.length > 0" class="cart-content">
      <!-- 购物车列表 -->
      <view class="cart-list">
        <view
          v-for="(item, index) in cartItems"
          :key="index"
          class="cart-item"
        >
          <!-- checkbox -->
          <view class="item-checkbox" @tap="toggleItemSelect(index)">
            <view class="checkbox" :class="{ checked: item.selected }">
              <text v-if="item.selected" class="checkbox-icon">✔</text>
            </view>
          </view>

          <!-- 产品信息 -->
          <view class="item-container">
            <image class="item-image" :src="item.image" mode="aspectFill"></image>

            <view class="item-details">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-specs">颜色：{{ item.color }}</text>
              <text class="item-specs">尺码：{{ item.size }}</text>

              <view class="item-footer">
                <text class="item-price">¥{{ (item.price / 100).toFixed(2) }}</text>

                <view class="quantity-control">
                  <text class="qty-label">数量：</text>
                  <view class="qty-selector">
                    <view
                      class="qty-btn"
                      @tap="decreaseQuantity(index)"
                    >
                      <text>−</text>
                    </view>
                    <text class="qty-value">{{ item.quantity }}</text>
                    <view
                      class="qty-btn"
                      @tap="increaseQuantity(index)"
                    >
                      <text>+</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 删除按钮 -->
          <view
            class="remove-btn"
            @tap="removeItem(index)"
          >
            <text>×</text>
          </view>
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

    <!-- 底部固定栏 -->
    <view v-if="cartItems.length > 0" class="cart-footer">
      <view class="footer-left">
        <view class="select-all" @tap="toggleSelectAll">
          <view class="checkbox" :class="{ checked: isSelectAll }">
            <text v-if="isSelectAll" class="checkbox-icon">✔</text>
          </view>
          <text class="select-label">全选</text>
        </view>
        <view class="total-price-info">
          <text class="price-label">总计：</text>
          <text class="price-value">¥{{ selectedTotal }}</text>
        </view>
      </view>
      <view class="checkout-btn" @tap="handleCheckout">
        <text>立即结算({{ selectedCount }})</text>
      </view>
    </view>

    <!-- 空购物车状态 -->
    <view v-else class="cart-content">
      <view class="empty-cart-inner">
        <view class="empty-illustration">
          <text class="empty-icon">🛍️</text>
        </view>
        <text class="empty-title">购物袋为空</text>
        <text class="empty-description">快去选择您喜爱的商品吧</text>
        <view
          class="empty-action-btn"
          @tap="continueShopping"
        >
          <text>继续购物</text>
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
  </view>
</template>

<script>
import RecommendSection from '../../components/RecommendSection.vue'
import { cartService } from '../../services/cart'
import { collectionService } from '../../services/collection'
import wishlistService from '../../services/wishlist'

export default {
  components: {
    RecommendSection
  },
  data() {
    return {
      expressPrice: 0,
      discount: 0,
      cartItems: [],
      recommendProducts: [],
      isLoading: false
    }
  },
  computed: {
    selectedCount() {
      return this.cartItems.filter(item => item.selected).length
    },
    selectedTotal() {
      return this.cartItems
        .filter(item => item.selected)
        .reduce((sum, item) => {
          // 价格以分为单位，需要转换为元并乘以数量
          const price = typeof item.price === 'number' ? item.price : parseInt(item.price) || 0
          const total = (price / 100) * item.quantity
          return sum + total
        }, 0)
        .toFixed(2)
    },
    isSelectAll() {
      return this.cartItems.length > 0 && this.cartItems.every(item => item.selected)
    }
  },
  async onLoad() {
    await this.loadCartData()
  },
  async onShow() {
    // 检查是否有待合并的商品（来自其他页面的"即刻购买"）
    try {
      const pending = uni.getStorageSync('pendingCartItems')
      if (pending && pending.length > 0) {
        // 有待加入的商品，重新加载购物车
        await this.loadCartData()
        uni.removeStorageSync('pendingCartItems')
      }
    } catch (e) {
      console.error('Failed to process pending items:', e)
    }
  },
  methods: {
    /**
     * 加载购物车数据和推荐商品
     * API现在返回包含产品信息的完整购物车数据
     */
    async loadCartData() {
      this.isLoading = true
      try {
        // 并行加载购物车和推荐商品
        const [cartData, collectionData] = await Promise.all([
          cartService.getCart(),
          collectionService.getCollectionBySlug('guess-you-like')
        ])

        // 处理购物车数据（API已包含name, image, price等信息）
        if (cartData && Array.isArray(cartData)) {
          this.cartItems = cartData.map(item => ({
            ...item,
            selected: item.selected || false // 保留或初始化选中状态
          }))
        }

        // 处理推荐商品数据
        if (collectionData && collectionData.products) {
          this.recommendProducts = collectionData.products.map(product => ({
            id: product.id,
            name: product.name,
            image: product.coverImageUrl,
            price: product.currentPrice, // API返回的价格以分为单位
            originalPrice: product.originalPrice,
            discountRate: product.discountRate,
            isNew: product.isNew,
            isSaleOn: product.isSaleOn,
            imageCount: 1, // RecommendSection组件需要此字段
            isFavorite: false // 初始化收藏状态
          }))

          // 加载推荐商品的收藏状态
          await this.loadRecommendedProductsFavoriteStatus()
        }
      } catch (error) {
        console.error('Failed to load cart data:', error)
        uni.showToast({
          title: '加载购物车失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载推荐商品的收藏状态
     */
    async loadRecommendedProductsFavoriteStatus() {
      try {
        const productIds = this.recommendProducts.map(p => p.id)
        console.log('🔍 检查收藏状态 - 产品IDs:', productIds)
        if (productIds.length === 0) return

        const favoriteStatus = await wishlistService.checkMultipleWishlists(productIds)
        console.log('📡 API返回的收藏状态:', favoriteStatus)

        // 更新推荐商品的收藏状态
        this.recommendProducts.forEach((product, index) => {
          const isFavorite = favoriteStatus[product.id] || false
          console.log(`💖 产品 ${product.id} (${product.name}) 收藏状态: ${isFavorite}`)
          this.$set(this.recommendProducts[index], 'isFavorite', isFavorite)
        })

        console.log('✅ 最终推荐商品数据:', this.recommendProducts.map(p => ({ id: p.id, name: p.name, isFavorite: p.isFavorite })))
      } catch (error) {
        console.error('❌ 加载收藏状态失败:', error)
        // 加载失败，保持初始值（全部未收藏）
      }
    },

    /**
     * 格式化价格显示（分转元）
     */
    formatPrice(priceInFen) {
      const price = typeof priceInFen === 'number' ? priceInFen : parseInt(priceInFen) || 0
      return (price / 100).toFixed(2)
    },

    toggleItemSelect(index) {
      this.$set(this.cartItems[index], 'selected', !this.cartItems[index].selected)
    },
    toggleSelectAll() {
      const allSelected = this.isSelectAll
      this.cartItems.forEach((item, index) => {
        this.$set(this.cartItems[index], 'selected', !allSelected)
      })
    },
    async increaseQuantity(index) {
      const item = this.cartItems[index]
      const newQuantity = item.quantity + 1

      try {
        const result = await cartService.updateCartItem(item.id, newQuantity)
        if (result) {
          this.$set(this.cartItems[index], 'quantity', newQuantity)
        }
      } catch (error) {
        console.error('Failed to update quantity:', error)
        uni.showToast({
          title: '更新数量失败',
          icon: 'none'
        })
      }
    },
    async decreaseQuantity(index) {
      const item = this.cartItems[index]
      if (item.quantity <= 1) {
        return
      }

      const newQuantity = item.quantity - 1

      try {
        const result = await cartService.updateCartItem(item.id, newQuantity)
        if (result) {
          this.$set(this.cartItems[index], 'quantity', newQuantity)
        }
      } catch (error) {
        console.error('Failed to update quantity:', error)
        uni.showToast({
          title: '更新数量失败',
          icon: 'none'
        })
      }
    },
    removeItem(index) {
      uni.showModal({
        title: '确认删除',
        content: '是否确认删除此商品?',
        success: async (res) => {
          if (res.confirm) {
            try {
              const item = this.cartItems[index]
              const success = await cartService.removeFromCart(item.id)
              if (success) {
                this.cartItems.splice(index, 1)
                uni.showToast({
                  title: '已移出购物袋',
                  icon: 'none',
                  duration: 1500
                })
              }
            } catch (error) {
              console.error('Failed to remove item:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    continueShopping() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    handleCheckout() {
      // 获取选中的商品
      const selectedItems = this.cartItems.filter(item => item.selected)

      if (selectedItems.length === 0) {
        uni.showToast({
          title: '请选择至少一件商品',
          icon: 'none'
        })
        return
      }

      // 保存选中的商品到本地存储
      try {
        uni.setStorageSync('checkoutItems', selectedItems)
      } catch (e) {
        console.error('Failed to save checkout items:', e)
      }

      // 导航到结算页
      uni.navigateTo({
        url: '/pages/checkout/checkout'
      })
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
    }
  }
}
</script>

<style lang="scss">
.page {
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 购物车内容 */
.cart-content {
  display: flex;
  flex-direction: column;
  padding: 0;
  padding-bottom: 160rpx;
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 购物车列表 */
.cart-list {
  flex: 1;
  padding: 40rpx;

  .cart-item {
    display: flex;
    gap: 16rpx;
    padding: 24rpx;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 8rpx;
    margin-bottom: 16rpx;
    position: relative;

    .item-checkbox {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12rpx;
      flex-shrink: 0;

      .checkbox {
        width: 24rpx;
        height: 24rpx;
        border: 2px solid #d0d0d0;
        border-radius: 4rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        cursor: pointer;

        .checkbox-icon {
          font-size: 14rpx;
          font-weight: 600;
          color: transparent;
          transition: all 0.2s ease;
        }

        &.checked {
          background: #000000;
          border-color: #000000;

          .checkbox-icon {
            color: #ffffff;
          }
        }
      }
    }

    .item-container {
      flex: 1;
      display: flex;
      gap: 16rpx;

      .item-image {
        width: 120rpx;
        height: 120rpx;
        background: #f5f5f5;
        border-radius: 4rpx;
        flex-shrink: 0;
      }

      .item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .item-name {
          display: block;
          font-size: 26rpx;
          font-weight: 500;
          color: #000000;
          margin-bottom: 8rpx;
          line-height: 1.4;
        }

        .item-specs {
          display: block;
          font-size: 22rpx;
          color: #999999;
          margin-bottom: 4rpx;
        }

        .item-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 8rpx;

          .item-price {
            font-size: 28rpx;
            font-weight: 600;
            color: #000000;
          }

          .quantity-control {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .qty-label {
              font-size: 22rpx;
              color: #666666;
            }

            .qty-selector {
              display: flex;
              align-items: center;
              gap: 8rpx;
              border: 1px solid #d0d0d0;
              border-radius: 4rpx;
              padding: 4rpx;

              .qty-btn {
                width: 28rpx;
                height: 28rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18rpx;
                color: #999999;
                cursor: pointer;

                &:active {
                  color: #333333;
                }
              }

              .qty-value {
                width: 32rpx;
                text-align: center;
                font-size: 20rpx;
                color: #333333;
              }
            }
          }
        }
      }
    }

    .remove-btn {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      width: 32rpx;
      height: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #999999;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        color: #333333;
      }
    }
  }
}

/* 购物车底部固定栏 */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 16rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  z-index: 999;
  box-sizing: border-box;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .select-all {
      display: flex;
      align-items: center;
      gap: 8rpx;
      cursor: pointer;

      .checkbox {
        width: 24rpx;
        height: 24rpx;
        border: 2px solid #d0d0d0;
        border-radius: 4rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;

        .checkbox-icon {
          font-size: 14rpx;
          font-weight: 600;
          color: transparent;
          transition: all 0.2s ease;
        }

        &.checked {
          background: #000000;
          border-color: #000000;

          .checkbox-icon {
            color: #ffffff;
          }
        }
      }

      .select-label {
        font-size: 28rpx;
        color: #333333;
      }
    }

    .total-price-info {
      display: flex;
      align-items: baseline;
      gap: 8rpx;

      .price-label {
        font-size: 24rpx;
        color: #666666;
      }

      .price-value {
        font-size: 32rpx;
        font-weight: 600;
        color: #000000;
      }
    }
  }

  .checkout-btn {
    flex-shrink: 0;
    background: #000000;
    color: #ffffff;
    padding: 16rpx 32rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200rpx;
    text-align: center;

    &:active {
      background: #333333;
      transform: scale(0.98);
    }

    text {
      display: block;
    }
  }
}

/* 空购物车内容 */
.empty-cart-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40rpx;

  .empty-illustration {
    margin-bottom: 40rpx;

    .empty-icon {
      font-size: 120rpx;
      display: block;
    }
  }

  .empty-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
    text-align: center;
  }

  .empty-description {
    display: block;
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 60rpx;
    text-align: center;
  }

  .empty-action-btn {
    width: 100%;
    max-width: 400rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000000;
    color: #ffffff;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: 600;
    cursor: pointer;

    &:active {
      background: #333333;
    }
  }
}
</style>
