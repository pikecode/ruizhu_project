<template>
  <view class="page">
    <!-- 手机号授权弹窗 -->
    <PhoneAuthModal
      :visible="showAuthModal"
      @close="showAuthModal = false"
      :onSuccess="handleAuthSuccess"
      :onCancel="handleAuthCancel"
    />

    <!-- 购物车非空状态 -->
    <view v-if="cartItems.length > 0" class="cart-content">
      <!-- 购物车列表 -->
      <view class="cart-list">
        <view class="list-header">
          <text class="header-title">您的购物袋</text>
          <text class="item-count">({{ cartItems.length }} 件商品)</text>
        </view>

        <view
          v-for="(item, index) in cartItems"
          :key="index"
          class="cart-item"
        >
          <image class="item-image" :src="item.image" mode="aspectFill"></image>

          <view class="item-details">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-category">{{ item.category }}</text>

            <view class="item-footer">
              <text class="item-price">¥{{ item.price }}</text>

              <view class="quantity-control">
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

          <view
            class="remove-btn"
            @tap="removeItem(index)"
          >
            <text>×</text>
          </view>
        </view>
      </view>

      <!-- 总价信息 -->
      <view class="price-summary">
        <view class="summary-row">
          <text class="summary-label">商品总额：</text>
          <text class="summary-value">¥{{ productTotal }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">运费：</text>
          <text class="summary-value" :class="{ free: expressPrice === 0 }">
            {{ expressPrice === 0 ? '免费' : '¥' + expressPrice }}
          </text>
        </view>
        <view class="summary-row discount-row">
          <text class="summary-label">优惠：</text>
          <text class="summary-value discount">-¥{{ discount }}</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-row total-row">
          <text class="summary-label">应付金额：</text>
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="cart-actions">
        <view
          class="action-btn continue-shopping"
          @tap="continueShopping"
        >
          <text>继续购物</text>
        </view>
        <view
          class="action-btn checkout-btn"
          @tap="handleCheckout"
        >
          <text>结算</text>
        </view>
      </view>
    </view>

    <!-- 空购物车状态 -->
    <view v-else class="empty-cart">
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
  </view>
</template>

<script>
import PhoneAuthModal from '@/components/PhoneAuthModal.vue';
import { authService } from '@/services/auth';

export default {
  components: {
    PhoneAuthModal,
  },
  data() {
    return {
      showAuthModal: false,
      expressPrice: 0,
      discount: 0,
      cartItems: [
        {
          id: 1,
          name: '经典皮质手袋',
          category: '手袋',
          price: '12800',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
          quantity: 1
        },
        {
          id: 4,
          name: '高端旅行背包',
          category: '背包',
          price: '8600',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
          quantity: 2
        },
        {
          id: 7,
          name: '优雅钱包',
          category: '钱包',
          price: '3200',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
          quantity: 1
        }
      ]
    }
  },
  computed: {
    productTotal() {
      return this.cartItems
        .reduce((sum, item) => sum + parseInt(item.price) * item.quantity, 0)
        .toString()
    },
    totalPrice() {
      const total =
        parseInt(this.productTotal) + this.expressPrice - this.discount
      return total.toString()
    }
  },
  onLoad() {
    console.log('购物袋页面加载完成')
  },
  methods: {
    increaseQuantity(index) {
      this.cartItems[index].quantity++
      this.$forceUpdate()
    },
    decreaseQuantity(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--
        this.$forceUpdate()
      }
    },
    removeItem(index) {
      uni.showModal({
        title: '确认删除',
        content: '是否确认删除此商品?',
        success: (res) => {
          if (res.confirm) {
            this.cartItems.splice(index, 1)
            this.$forceUpdate()
            uni.showToast({
              title: '已移出购物袋',
              icon: 'none',
              duration: 1500
            })
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
      // 检查用户是否已授权手机号
      if (!authService.isPhoneAuthorized()) {
        // 未授权，显示授权弹窗
        this.showAuthModal = true
      } else {
        // 已授权，继续结算
        this.proceedToCheckout()
      }
    },
    handleAuthSuccess() {
      // 用户成功授权手机号后的回调
      this.showAuthModal = false
      // 继续结算流程
      this.proceedToCheckout()
    },
    handleAuthCancel() {
      // 用户取消授权的回调
      this.showAuthModal = false
      // 保持购物车打开，用户可以继续购物或重新授权
    },
    proceedToCheckout() {
      // 原始结算逻辑
      uni.showToast({
        title: '前往支付',
        icon: 'none',
        duration: 1500
      })
      // 可以导航到订单确认页或支付页
      // uni.navigateTo({
      //   url: '/pages/checkout/checkout'
      // })
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

/* 购物车内容 */
.cart-content {
  display: flex;
  flex-direction: column;
  padding: 40rpx 0;
}

/* 购物车列表 */
.cart-list {
  flex: 1;
  padding: 0 40rpx;

  .list-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 40rpx;

    .header-title {
      font-size: 48rpx;
      font-weight: 500;
      color: #000000;
    }

    .item-count {
      margin-left: 16rpx;
      font-size: 28rpx;
      color: #999999;
    }
  }

  .cart-item {
    display: flex;
    gap: 24rpx;
    padding: 24rpx;
    background: #f9f9f9;
    border-radius: 8rpx;
    margin-bottom: 16rpx;
    position: relative;

    .item-image {
      width: 160rpx;
      height: 160rpx;
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
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 8rpx;
      }

      .item-category {
        display: block;
        font-size: 24rpx;
        color: #999999;
        margin-bottom: 16rpx;
      }

      .item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .item-price {
          font-size: 32rpx;
          font-weight: 600;
          color: #000000;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 12rpx;
          background: #ffffff;
          border-radius: 4rpx;
          padding: 4rpx 8rpx;

          .qty-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32rpx;
            height: 32rpx;
            font-size: 24rpx;
            color: #999999;
            cursor: pointer;
            user-select: none;

            &:active {
              color: #333333;
            }
          }

          .qty-value {
            width: 40rpx;
            text-align: center;
            font-size: 24rpx;
            color: #333333;
          }
        }
      }
    }

    .remove-btn {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      color: #cccccc;
      cursor: pointer;

      &:active {
        color: #999999;
      }
    }
  }
}

/* 价格摘要 */
.price-summary {
  padding: 40rpx;
  background: #f9f9f9;
  margin: 0 40rpx;
  border-radius: 8rpx;
  margin-bottom: 24rpx;

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 28rpx;

    .summary-label {
      color: #666666;
    }

    .summary-value {
      color: #333333;
      font-weight: 500;

      &.free {
        color: #ff6b6b;
      }

      &.discount {
        color: #ff6b6b;
      }
    }
  }

  .summary-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: 20rpx 0;
  }

  .total-row {
    margin-bottom: 0;
    margin-top: 12rpx;

    .summary-label {
      font-weight: 500;
      color: #000000;
    }

    .total-price {
      font-size: 40rpx;
      font-weight: 700;
      color: #000000;
    }
  }
}

/* 购物车操作按钮 */
.cart-actions {
  display: flex;
  gap: 16rpx;
  padding: 0 40rpx 40rpx;
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  z-index: 100;

  .action-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    text {
      display: block;
    }
  }

  .continue-shopping {
    background: #f5f5f5;
    color: #000000;
    border: 1px solid #e0e0e0;

    &:active {
      background: #e8e8e8;
    }
  }

  .checkout-btn {
    background: #000000;
    color: #ffffff;

    &:active {
      background: #333333;
    }
  }
}

/* 空购物车状态 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
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
