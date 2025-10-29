<template>
  <view class="detail-page">
    <!-- 商品图片轮播 -->
    <swiper
      class="product-swiper"
      :indicator-dots="true"
      :indicator-color="indicatorColor"
      :indicator-active-color="indicatorActiveColor"
      @change="onImageChange"
    >
      <swiper-item v-for="(image, index) in productImages" :key="index">
        <image class="swiper-image" :src="image" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 图片指示器点 -->
    <view class="image-dots">
      <view
        v-for="(dot, index) in productImages"
        :key="index"
        class="dot"
        :class="{ active: index === currentImageIndex }"
      ></view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <!-- 标题和价格 -->
      <text class="product-name">{{ productData.name }}</text>
      <view class="price-section">
        <text class="current-price">¥{{ productData.price }}</text>
        <text class="sku-code">商品货号：{{ productData.skuCode }}</text>
      </view>

      <!-- 特殊标签 -->
      <text class="promotion-badge">尊享12期分期免息</text>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 商品描述 -->
      <view class="description-section">
        <text class="section-title">商品描述</text>
        <text class="description-text">{{ productData.description }}</text>
      </view>

      <!-- 规格选择 -->
      <view class="spec-section">
        <text class="section-title">选择颜色</text>
        <view class="spec-options">
          <view
            v-for="(color, index) in productData.colors"
            :key="index"
            class="spec-option"
            :class="{ active: selectedColor === index }"
            @tap="selectedColor = index"
          >
            <text>{{ color }}</text>
          </view>
        </view>
      </view>

      <!-- 数量选择 -->
      <view class="quantity-section">
        <text class="section-title">数量</text>
        <view class="quantity-control">
          <view class="qty-btn" @tap="decreaseQuantity">−</view>
          <text class="qty-value">{{ quantity }}</text>
          <view class="qty-btn" @tap="increaseQuantity">+</view>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 收藏和分享 -->
      <view class="action-section">
        <view class="action-item" @tap="toggleFavorite">
          <text class="action-icon" :class="{ active: isFavorite }">♡</text>
          <text class="action-label">{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-item" @tap="shareProduct">
          <text class="action-icon">⤵</text>
          <text class="action-label">分享</text>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-actions">
      <view class="action-btn add-cart" @tap="addToCart">
        <text>加入购物袋</text>
      </view>
      <view class="action-btn buy-now" @tap="buyNow">
        <text>立即购买</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      indicatorColor: 'rgba(0, 0, 0, 0.3)',
      indicatorActiveColor: '#000000',
      currentImageIndex: 0,
      selectedColor: 0,
      quantity: 1,
      isFavorite: false,
      productImages: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
        'https://images.unsplash.com/photo-1548062407-f961713e6786?w=600&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'
      ],
      productData: {
        name: 'Prada Dada 小号Nappa羊皮革手袋',
        price: '21,700',
        skuCode: '1BG586_2DX8_F073X_V_OOO',
        description: '这款优雅的Prada Dada手袋采用精选Nappa羊皮革制作，具有柔软的质感和精致的外观。手袋设计简洁而时尚，适合日常和正式场合使用。配备可调节的肩带，提供舒适的携带体验。',
        colors: ['灰色', '黑色', '棕色', '白色']
      }
    }
  },
  onLoad(options) {
    // 从路由参数获取商品ID或信息
    console.log('商品详情页加载', options)
  },
  methods: {
    onImageChange(e) {
      this.currentImageIndex = e.detail.current
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      const status = this.isFavorite ? '已收藏' : '已移除收藏'
      uni.showToast({
        title: status,
        icon: 'none',
        duration: 1000
      })
    },
    shareProduct() {
      uni.showToast({
        title: '分享成功',
        icon: 'none'
      })
    },
    increaseQuantity() {
      this.quantity++
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    addToCart() {
      // 构建购物车项
      const cartItem = {
        id: Date.now(),
        name: this.productData.name,
        color: this.productData.colors[this.selectedColor],
        price: this.productData.price.replace(/,/g, ''),
        quantity: this.quantity,
        image: this.productImages[0],
        selected: true
      }

      try {
        // 获取现有购物车
        let cartItems = uni.getStorageSync('cartItems') || []

        // 检查是否已存在相同商品
        const existingIndex = cartItems.findIndex(
          (item) => item.name === cartItem.name && item.color === cartItem.color
        )

        if (existingIndex !== -1) {
          // 更新数量
          cartItems[existingIndex].quantity += this.quantity
        } else {
          // 添加新商品
          cartItems.push(cartItem)
        }

        // 保存到存储
        uni.setStorageSync('cartItems', cartItems)

        uni.showToast({
          title: `已添加 ${this.quantity} 件到购物袋`,
          icon: 'success',
          duration: 1500
        })

        // 延迟后跳转到购物车
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/cart/cart'
          })
        }, 1500)
      } catch (e) {
        console.error('Failed to add to cart:', e)
        uni.showToast({
          title: '添加失败，请重试',
          icon: 'none'
        })
      }
    },
    buyNow() {
      // 直接生成订单并跳转到支付
      const cartItem = {
        id: Date.now(),
        name: this.productData.name,
        color: this.productData.colors[this.selectedColor],
        price: this.productData.price.replace(/,/g, ''),
        quantity: this.quantity,
        image: this.productImages[0],
        selected: true
      }

      try {
        // 保存为临时购物车（用于立即购买）
        uni.setStorageSync('checkoutItems', [cartItem])

        uni.showToast({
          title: '前往结算',
          icon: 'none',
          duration: 1000
        })

        // 延迟后跳转到结算页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/checkout/checkout'
          })
        }, 1000)
      } catch (e) {
        console.error('Failed to proceed with purchase:', e)
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 160rpx;
}

/* 商品图片轮播 */
.product-swiper {
  width: 100%;
  height: 800rpx;
  background: #f5f5f5;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片指示器 */
.image-dots {
  position: absolute;
  left: 24rpx;
  bottom: 220rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.3);

    &.active {
      background: #000000;
    }
  }
}

/* 商品信息 */
.product-info {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;

  .product-name {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 24rpx;
    line-height: 1.4;
  }

  .price-section {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-bottom: 24rpx;

    .current-price {
      display: block;
      font-size: 40rpx;
      font-weight: 700;
      color: #000000;
    }

    .sku-code {
      display: block;
      font-size: 22rpx;
      color: #999999;
    }
  }

  .promotion-badge {
    display: inline-block;
    padding: 8rpx 16rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    font-size: 22rpx;
    color: #333333;
    margin-bottom: 24rpx;
  }

  .divider {
    height: 1px;
    background: #f0f0f0;
    margin: 24rpx 0;
  }

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 20rpx;
  }

  .description-section {
    margin-bottom: 24rpx;

    .description-text {
      display: block;
      font-size: 26rpx;
      color: #666666;
      line-height: 1.6;
    }
  }

  .spec-section {
    margin-bottom: 24rpx;

    .spec-options {
      display: flex;
      gap: 16rpx;
      flex-wrap: wrap;

      .spec-option {
        padding: 12rpx 24rpx;
        border: 2px solid #e0e0e0;
        border-radius: 4rpx;
        font-size: 26rpx;
        color: #333333;
        cursor: pointer;

        &.active {
          border-color: #000000;
          background: #000000;
          color: #ffffff;
        }
      }
    }
  }

  .quantity-section {
    margin-bottom: 24rpx;

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 12rpx;
      width: fit-content;

      .qty-btn {
        width: 44rpx;
        height: 44rpx;
        border: 1px solid #e0e0e0;
        border-radius: 4rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #666666;
        cursor: pointer;

        &:active {
          opacity: 0.8;
        }
      }

      .qty-value {
        min-width: 60rpx;
        text-align: center;
        font-size: 26rpx;
        color: #000000;
      }
    }
  }

  .action-section {
    display: flex;
    gap: 40rpx;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      cursor: pointer;

      .action-icon {
        font-size: 40rpx;
        color: #999999;

        &.active {
          color: #000000;
        }
      }

      .action-label {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
}

/* 底部操作按钮 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  z-index: 99;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }
  }

  .add-cart {
    background: #f5f5f5;
    color: #000000;
  }

  .buy-now {
    background: #000000;
    color: #ffffff;
  }
}
</style>
