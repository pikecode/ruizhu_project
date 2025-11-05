<template>
  <view class="page">
    <!-- 订单商品 -->
    <view class="section order-items-section">
      <view class="section-title">充值商品</view>
      <view class="order-items">
        <view v-for="(item, index) in cartItems" :key="index" class="order-item">
          <image v-if="item.image" class="item-image" :src="item.image" mode="aspectFill"></image>
          <view v-else class="item-image-placeholder"></view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-price">¥{{ (item.price / 100).toFixed(2) }}</text>
          </view>
          <text class="item-quantity">x{{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section fee-summary-section">
      <view class="fee-row">
        <text class="fee-label">充值金额</text>
        <text class="fee-value">¥{{ subtotal }}</text>
      </view>
      <view v-if="userDiscount < 1.0" class="fee-row discount">
        <text class="fee-label">当前VIP折扣 ({{ (userDiscount * 100).toFixed(0) }}%)</text>
        <text class="fee-value">-¥{{ discountAmount }}</text>
      </view>
      <view class="fee-row total">
        <text class="fee-label">应付金额</text>
        <text class="fee-value">¥{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 购买说明 -->
    <view class="section info-section">
      <view class="info-item">
        <text class="info-label">购买说明</text>
        <text class="info-text">购买此充值商品后，您将获得相应的VIP折扣权益</text>
      </view>
      <view class="info-item">
        <text class="info-label">折扣权益</text>
        <text v-if="productDiscount && productDiscount < 1.0" class="info-text">
          购买后将享受 {{ (productDiscount * 100).toFixed(0) }}折优惠
        </text>
        <text v-else class="info-text">购买后获得相应VIP权益</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="checkout-footer">
      <view class="submit-btn" @tap="confirmPay">
        <text>确认支付</text>
      </view>
    </view>

    <!-- 手机号授权弹窗 -->
    <PhoneAuthModal
      :visible="showPhoneAuthModal"
      @close="showPhoneAuthModal = false"
      :onSuccess="handlePhoneAuthSuccess"
    />
  </view>
</template>

<script>
import ordersService from '../../services/orders'
import { authService } from '../../services/auth'
import PhoneAuthModal from '../../components/PhoneAuthModal.vue'

export default {
  components: {
    PhoneAuthModal
  },
  data() {
    return {
      cartItems: [],
      userDiscount: 1.0,
      productDiscount: 1.0,
      showPhoneAuthModal: false
    }
  },
  computed: {
    subtotal() {
      const totalInFen = this.cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      return (totalInFen / 100).toFixed(2)
    },
    discountAmount() {
      if (this.userDiscount >= 1.0) {
        return '0.00'
      }
      const subtotalInFen = this.cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      const discountedInFen = Math.round(subtotalInFen * this.userDiscount)
      const saved = subtotalInFen - discountedInFen
      return (saved / 100).toFixed(2)
    },
    totalAmount() {
      const subtotalInFen = this.cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      const discountedInFen = Math.round(subtotalInFen * this.userDiscount)
      return (discountedInFen / 100).toFixed(2)
    }
  },
  onLoad() {
    this.loadCartItems()
    this.loadUserDiscount()
  },
  methods: {
    loadCartItems() {
      try {
        const buyNowOrder = uni.getStorageSync('buyNowOrder')
        if (buyNowOrder && Array.isArray(buyNowOrder.items)) {
          console.log('💳 [RechargeCheckout] 加载充值商品:', buyNowOrder)
          this.cartItems = buyNowOrder.items
          // 保存产品折扣
          if (buyNowOrder.items[0] && buyNowOrder.items[0].discount) {
            this.productDiscount = buyNowOrder.items[0].discount
          }
          return
        }

        console.warn('⚠️ [RechargeCheckout] 未找到充值商品')
        this.cartItems = []
      } catch (e) {
        console.error('Failed to load cart items:', e)
        this.cartItems = []
      }
    },
    loadUserDiscount() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.discount) {
          const discount = parseFloat(userInfo.discount)
          if (discount > 0 && discount <= 1.0) {
            this.userDiscount = discount
            console.log('💳 [RechargeCheckout] 用户VIP折扣:', this.userDiscount)
            return
          }
        }
        this.userDiscount = 1.0
        console.log('💳 [RechargeCheckout] 使用默认折扣倍数: 1.0（无折扣）')
      } catch (e) {
        console.warn('Failed to load user discount:', e)
        this.userDiscount = 1.0
      }
    },

    /**
     * 手机号授权成功回调
     * 授权完成后自动进行支付
     */
    handlePhoneAuthSuccess() {
      console.log('✅ [RechargeCheckout] 手机号授权成功，开始支付流程')
      this.showPhoneAuthModal = false

      // 短暂延迟确保 token 已保存到本地存储
      setTimeout(() => {
        this.proceedToPayment()
      }, 500)
    },
    async confirmPay() {
      if (this.cartItems.length === 0) {
        uni.showToast({
          title: '购物车为空',
          icon: 'none'
        })
        return
      }

      // 检查用户认证状态
      const token = uni.getStorageSync('accessToken')
      console.log('💳 [RechargeCheckout] Token 检查:', token ? '✅ 存在' : '❌ 不存在')
      if (!token) {
        console.log('💳 [RechargeCheckout] 需要进行手机号授权')
        // 显示手机号授权弹窗，而不是跳转到登录页
        this.showPhoneAuthModal = true
        return
      }

      // 如果有 token，直接进行支付
      this.proceedToPayment()
    },

    async proceedToPayment() {

      uni.showLoading({
        title: '正在生成订单...'
      })

      try {
        const totalAmountInFen = this.cartItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity)
        }, 0)

        const createOrderData = {
          items: this.cartItems.map(item => {
            const price = typeof item.price === 'string' ? parseInt(item.price) : item.price
            if (price < 0 || !Number.isInteger(price)) {
              throw new Error(`商品价格无效: ${item.price}，必须是正整数（分为单位）`)
            }
            return {
              productId: item.id || item.productId,
              quantity: item.quantity,
              price: price
            }
          }),
          // 充值订单不需要收货地址
          addressId: null,
          totalAmount: totalAmountInFen,
          finalAmount: totalAmountInFen,
          paymentMethod: 'wechat',
          isRecharge: true // 标记为充值订单
        }

        console.log('💳 [RechargeCheckout] 创建充值订单请求:', createOrderData)

        const createdOrder = await ordersService.createOrder(createOrderData)

        uni.hideLoading()

        if (!createdOrder) {
          uni.showToast({
            title: '创建订单失败，请重试',
            icon: 'none'
          })
          return
        }

        console.log('✅ [RechargeCheckout] 充值订单创建成功:', createdOrder)

        // 保存订单数据
        const orderData = {
          id: createdOrder.id,
          orderId: createdOrder.orderNo,
          items: this.cartItems,
          address: null, // 充值订单无地址
          total: parseFloat(this.totalAmount),
          status: createdOrder.status || 'pending',
          createdAt: createdOrder.createdAt || new Date().toISOString(),
          isRecharge: true, // 标记为充值订单
          productDiscount: this.productDiscount // 保存产品折扣
        }

        try {
          uni.setStorageSync('currentOrder', orderData)
          console.log('✅ [RechargeCheckout] 订单已保存到本地存储')
        } catch (e) {
          console.error('Failed to save order to storage:', e)
        }

        // 清除购买订单
        try {
          uni.removeStorageSync('buyNowOrder')
          console.log('✅ [RechargeCheckout] 购买订单已清除')
        } catch (e) {
          console.warn('Failed to clear buyNowOrder:', e)
        }

        // 跳转到支付页面
        uni.navigateTo({
          url: '/pages/order/confirmation',
          fail: () => {
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        uni.hideLoading()
        console.error('❌ [RechargeCheckout] 创建订单失败:', error)

        // 如果是登录过期（401或Token过期），清除 Token 并提示重新授权
        if (error.message && error.message.includes('登录过期')) {
          uni.removeStorageSync('accessToken')
          uni.removeStorageSync('refreshToken')
          uni.removeStorageSync('user')
          uni.removeStorageSync('userInfo')
          uni.showToast({
            title: '授权已过期，请重新授权',
            icon: 'none'
          })
          // 显示手机号授权弹窗，允许用户重新授权
          setTimeout(() => {
            this.showPhoneAuthModal = true
          }, 1500)
          return
        }

        uni.showToast({
          title: error.message || '创建订单失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #f9f9f9;
  padding-bottom: 120rpx;
}

/* 分组样式 */
.section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  border-radius: 8rpx;
  padding: 24rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
  }
}

/* 订单商品 */
.order-items-section {
  .order-items {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .order-item {
    display: flex;
    gap: 12rpx;
    padding: 12rpx;
    background: #f9f9f9;
    border-radius: 8rpx;
    align-items: center;

    .item-image {
      width: 80rpx;
      height: 80rpx;
      background: #f0f0f0;
      border-radius: 4rpx;
      flex-shrink: 0;
    }

    .item-image-placeholder {
      width: 80rpx;
      height: 80rpx;
      background: #f0f0f0;
      border-radius: 4rpx;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .item-name {
        display: block;
        font-size: 26rpx;
        color: #000000;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-price {
        display: block;
        font-size: 24rpx;
        font-weight: 600;
        color: #ff6b35;
      }
    }

    .item-quantity {
      display: block;
      font-size: 24rpx;
      color: #999999;
      min-width: 60rpx;
      text-align: right;
    }
  }
}

/* 费用明细 */
.fee-summary-section {
  .fee-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1px solid #f0f0f0;

    .fee-label {
      font-size: 26rpx;
      color: #666666;
    }

    .fee-value {
      font-size: 26rpx;
      font-weight: 600;
      color: #000000;
    }

    &.discount {
      .fee-value {
        color: #00b26a;
      }
    }

    &.total {
      border-bottom: none;
      padding: 16rpx 0 0;
      margin-top: 8rpx;

      .fee-label {
        font-size: 28rpx;
        font-weight: 600;
        color: #000000;
      }

      .fee-value {
        font-size: 32rpx;
        color: #ff6b35;
      }
    }
  }
}

/* 信息说明 */
.info-section {
  .info-item {
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      display: block;
      font-size: 24rpx;
      font-weight: 600;
      color: #000000;
      margin-bottom: 8rpx;
    }

    .info-text {
      display: block;
      font-size: 22rpx;
      color: #666666;
      line-height: 1.5;
    }
  }
}

/* 底部按钮 */
.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 16rpx 20rpx;

  .submit-btn {
    width: 100%;
    height: 80rpx;
    background: #000000;
    color: #ffffff;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;

    &:active {
      background: #333333;
    }
  }
}
</style>
