<template>
  <view class="page">
    <!-- 收货地址 -->
    <view class="section address-section">
      <view class="section-title">收货地址</view>
      <view v-if="selectedAddress" class="address-card" @tap="navigateToAddresses">
        <view class="address-header">
          <text class="address-name">{{ selectedAddress.name }}</text>
          <text class="address-phone">{{ selectedAddress.phone }}</text>
        </view>
        <text class="address-detail">
          {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}
        </text>
        <view class="address-edit-icon">
          <text>›</text>
        </view>
      </view>
      <view v-else class="add-address-btn" @tap="navigateToAddresses">
        <text>+ 添加收货地址</text>
      </view>
    </view>

    <!-- 订单商品 -->
    <view class="section order-items-section">
      <view class="section-title">订单商品</view>
      <view class="order-items">
        <view v-for="(item, index) in cartItems" :key="index" class="order-item">
          <image class="item-image" :src="item.image" mode="aspectFill"></image>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-specs">{{ item.color }} · 数量：{{ item.quantity }}</text>
            <text class="item-price">¥{{ (item.price / 100).toFixed(2) }}</text>
          </view>
          <text class="item-subtotal">¥{{ ((item.price / 100) * item.quantity).toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section fee-summary-section">
      <view class="fee-row">
        <text class="fee-label">商品小计</text>
        <text class="fee-value">¥{{ subtotal }}</text>
      </view>
      <view v-if="userDiscount < 1.0" class="fee-row discount">
        <text class="fee-label">VIP折扣 ({{ (userDiscount * 100).toFixed(0) }}%)</text>
        <text class="fee-value">-¥{{ discountAmount }}</text>
      </view>
      <view class="fee-row total">
        <text class="fee-label">应付金额</text>
        <text class="fee-value">¥{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="checkout-footer">
      <view
        class="submit-btn"
        :class="{ disabled: !selectedAddress || cartItems.length === 0 }"
        @tap="confirmOrder"
      >
        <text>确认订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import ordersService from '../../services/orders'
import { api } from '../../services/api'

export default {
  data() {
    return {
      cartItems: [],
      selectedAddress: null,
      userDiscount: 1.0 // 用户VIP折扣倍数，默认1.0（无折扣）
    }
  },
  computed: {
    subtotal() {
      // 商品小计（分转元）
      const totalInFen = this.cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      return (totalInFen / 100).toFixed(2)
    },
    discountAmount() {
      // 折扣金额（分转元）
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
      // 应付金额（已应用VIP折扣）
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
        // 优先检查立即购买订单（来自商品详情页）
        const buyNowOrder = uni.getStorageSync('buyNowOrder')
        if (buyNowOrder && Array.isArray(buyNowOrder.items)) {
          console.log('📦 [Checkout] 加载立即购买订单:', buyNowOrder)
          this.cartItems = buyNowOrder.items
          return
        }

        // 其次检查购物车API数据（来自购物车页面）
        const cartItems = uni.getStorageSync('checkoutItems')
        if (cartItems && Array.isArray(cartItems)) {
          console.log('📦 [Checkout] 加载购物车数据:', cartItems)
          this.cartItems = cartItems
          return
        }

        // 都没有则为空购物车
        console.warn('⚠️ [Checkout] 未找到订单或购物车数据')
        this.cartItems = []
      } catch (e) {
        console.error('Failed to load cart items:', e)
        this.cartItems = []
      }
    },
    loadUserDiscount() {
      try {
        // 从本地存储获取用户信息中的折扣
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.discount) {
          const discount = parseFloat(userInfo.discount)
          if (discount > 0 && discount <= 1.0) {
            this.userDiscount = discount
            console.log('💳 [Checkout] 用户VIP折扣已加载:', this.userDiscount)
            return
          }
        }
        // 没有找到或无效，使用默认值
        this.userDiscount = 1.0
        console.log('💳 [Checkout] 使用默认折扣倍数: 1.0（无折扣）')
      } catch (e) {
        console.warn('Failed to load user discount:', e)
        this.userDiscount = 1.0
      }
    },
    navigateToAddresses() {
      uni.navigateTo({
        url: '/pages/addresses/addresses',
        success: (res) => {
          console.log('🏪 [Checkout] 成功打开地址页面')
          // 监听来自 addresses 页面的地址选择事件
          res.eventChannel.on('selectAddress', (data) => {
            console.log('🏪 [Checkout] 收到选中的地址:', data)
            this.selectedAddress = {
              id: data.id,
              name: data.name || data.receiverName,
              phone: data.phone || data.receiverPhone,
              province: data.province,
              city: data.city,
              district: data.district,
              detail: data.detail || data.addressDetail
            }
            console.log('🏪 [Checkout] selectedAddress 已更新:', this.selectedAddress)
          })
        },
        fail: (err) => {
          console.error('🏪 [Checkout] 打开地址页面失败:', err)
          uni.showToast({
            title: '打开地址页面失败',
            icon: 'none'
          })
        }
      })
    },
    async confirmOrder() {
      if (!this.selectedAddress) {
        uni.showToast({
          title: '请选择收货地址',
          icon: 'none'
        })
        return
      }

      if (this.cartItems.length === 0) {
        uni.showToast({
          title: '购物车为空',
          icon: 'none'
        })
        return
      }

      // 验证 addressId 是否有效
      const addressId = parseInt(this.selectedAddress.id)
      console.log('🏪 [Checkout] 调试信息:')
      console.log('  - selectedAddress:', this.selectedAddress)
      console.log('  - selectedAddress.id 原始值:', this.selectedAddress.id)
      console.log('  - selectedAddress.id 类型:', typeof this.selectedAddress.id)
      console.log('  - parseInt 结果:', addressId)
      console.log('  - isNaN 检查:', isNaN(addressId))

      if (!addressId || isNaN(addressId)) {
        uni.showToast({
          title: '地址ID无效，请重新选择',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '正在生成订单...'
      })

      try {
        // 从后端获取最新的用户信息（包括折扣）
        let userInfo = uni.getStorageSync('userInfo')
        let freshUserData = null
        let freshUserDiscount = 1.0  // 默认无折扣

        if (userInfo && userInfo.id) {
          try {
            console.log('💳 [Checkout] 正在从后端获取最新用户信息...')
            const response = await api.get(`/users/${userInfo.id}`)
            console.log('💳 [Checkout] 从后端获取的完整用户数据:', JSON.stringify(response))

            if (response) {
              freshUserData = response

              if (response.discount) {
                freshUserDiscount = parseFloat(response.discount)
                console.log('💳 [Checkout] 从后端获取的用户折扣:', freshUserDiscount, '(类型:', typeof response.discount, ')')

                // 验证折扣有效性
                if (freshUserDiscount < 0.01 || freshUserDiscount > 1.0) {
                  console.warn('⚠️ [Checkout] 用户折扣字段无效:', freshUserDiscount, '使用默认值 1.0')
                  freshUserDiscount = 1.0
                }
              } else {
                console.warn('⚠️ [Checkout] 后端返回的用户数据中没有 discount 字段')
              }
            }
          } catch (error) {
            console.warn('⚠️ [Checkout] 获取用户信息失败，使用缓存值:', error)
            // 失败时使用缓存的折扣值
            freshUserDiscount = this.userDiscount
          }
        }

        // 计算订单总金额（以分为单位）
        const totalAmountInFen = this.cartItems.reduce((sum, item) => {
          // item.price 应该已经是分（整数），直接计算
          return sum + (item.price * item.quantity)
        }, 0)

        // 计算折扣金额（以分为单位，使用后端获取的最新折扣）
        const discountedAmountInFen = Math.round(totalAmountInFen * freshUserDiscount)
        const discountAmountInFen = totalAmountInFen - discountedAmountInFen

        // 构造创建订单的请求数据
        const createOrderData = {
          items: this.cartItems.map(item => {
            // 确保 price 是整数（以分为单位）
            // item.price 应该已经是分了，如果是字符串则转换
            const price = typeof item.price === 'string' ? parseInt(item.price) : item.price
            if (price < 0 || !Number.isInteger(price)) {
              throw new Error(`商品价格无效: ${item.price}，必须是正整数（分为单位）`)
            }
            const itemData = {
              productId: item.id || item.productId,
              quantity: item.quantity,
              price: price  // 后端字段名是 price，以分为单位
            }

            // 如果有产品类型和折扣信息，添加到订单项中（用于识别会员产品）
            if (item.type || item.productType) {
              itemData.productType = item.type || item.productType
            }
            if (item.discount) {
              itemData.discount = item.discount
            }

            return itemData
          }),
          addressId: addressId,  // 使用 addressId 而不是 shippingAddressId
          totalAmount: totalAmountInFen,  // 添加总金额
          discountAmount: discountAmountInFen,  // 折扣金额（以分为单位）
          finalAmount: discountedAmountInFen,  // 最终支付金额（已应用VIP折扣）
          paymentMethod: 'wechat'
        }

        console.log('🏪 [Checkout] 选中的地址:', this.selectedAddress)
        console.log('🏪 [Checkout] addressId 类型:', typeof addressId, '值:', addressId)
        console.log('🏪 [Checkout] 创建订单请求数据:', createOrderData)
        console.log('🏪 [Checkout] 总金额（分）:', totalAmountInFen)

        // 调用后端 API 创建订单
        const createdOrder = await ordersService.createOrder(createOrderData)

        uni.hideLoading()

        if (!createdOrder) {
          uni.showToast({
            title: '创建订单失败，请重试',
            icon: 'none'
          })
          return
        }

        console.log('✅ [Checkout] 订单创建成功:', createdOrder)

        // 保存真实的订单数据到本地存储
        const orderData = {
          id: createdOrder.id,
          orderId: createdOrder.orderNo,  // 后端返回的是 orderNo，不是 orderNumber
          items: this.cartItems,
          address: this.selectedAddress,
          total: discountedAmountInFen / 100,  // 转换为元，使用实际计算的最终金额
          discount: discountAmountInFen,  // 保存折扣金额（分为单位）
          discountPercent: Math.round((discountAmountInFen / totalAmountInFen) * 100),  // 保存折扣百分比
          status: createdOrder.status || 'pending',  // Status can be: pending, paid, shipped, delivered
          createdAt: createdOrder.createdAt || new Date().toISOString(),
          isRecharge: false  // 标记这不是充值订单
        }

        console.log('💾 [Checkout] 准备保存订单数据到本地存储:', orderData)

        try {
          // 保存订单数据
          uni.setStorageSync('currentOrder', orderData)
          console.log('✅ [Checkout] 订单数据已保存到本地存储')

          // 同时保存用户信息，确保确认页面能读到
          // 优先使用从后端获取的完整用户数据，如果失败则使用缓存数据
          const userDataToSave = freshUserData || userInfo
          if (userDataToSave && userDataToSave.id) {
            try {
              uni.setStorageSync('user', userDataToSave)
              console.log('✅ [Checkout] 用户信息已保存到本地存储:', JSON.stringify(userDataToSave))
              console.log('✅ [Checkout] 保存的用户折扣:', userDataToSave.discount)
            } catch (e) {
              console.warn('⚠️ [Checkout] 保存用户信息失败:', e)
            }
          }

          // 验证保存是否成功
          const savedOrder = uni.getStorageSync('currentOrder')
          console.log('✓ [Checkout] 验证保存的订单:', savedOrder)

          // 清除立即购买订单（如果存在），防止下次购物混淆
          try {
            uni.removeStorageSync('buyNowOrder')
            console.log('✅ [Checkout] 立即购买订单已清除')
          } catch (e) {
            console.warn('Failed to clear buyNowOrder:', e)
          }
        } catch (e) {
          console.error('❌ [Checkout] 保存订单到本地存储失败:', e)
          uni.showToast({
            title: '保存订单失败，请重试',
            icon: 'none'
          })
          return
        }

        // 跳转到订单确认页
        uni.navigateTo({
          url: '/pages/order/confirmation',
          fail: () => {
            uni.showToast({
              title: '页面开发中',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to create order:', error)

        // 提取错误消息，优先使用后端返回的详细信息
        let errorMsg = '创建订单失败，请重试'

        // 后端返回的结构化错误
        if (error && typeof error === 'object') {
          if (error.message) {
            errorMsg = error.message
          } else if (error.data && error.data.message) {
            errorMsg = error.data.message
          }
        } else if (typeof error === 'string') {
          errorMsg = error
        }

        console.log('📡 [Checkout] 错误详情:', {
          errorMessage: errorMsg,
          fullError: error
        })

        uni.showToast({
          title: errorMsg,
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

/* 地址部分 */
.address-section {
  .address-card {
    border: 1px solid #f0f0f0;
    border-radius: 8rpx;
    padding: 16rpx;
    position: relative;

    .address-header {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 8rpx;

      .address-name {
        font-size: 26rpx;
        font-weight: 500;
        color: #000000;
      }

      .address-phone {
        font-size: 24rpx;
        color: #999999;
      }
    }

    .address-detail {
      display: block;
      font-size: 24rpx;
      color: #666666;
      line-height: 1.5;
      margin-bottom: 8rpx;
    }

    .address-edit-icon {
      position: absolute;
      top: 50%;
      right: 16rpx;
      transform: translateY(-50%);
      font-size: 32rpx;
      color: #999999;
    }
  }

  .add-address-btn {
    border: 2px dashed #d0d0d0;
    border-radius: 8rpx;
    padding: 40rpx;
    text-align: center;
    color: #999999;
    font-size: 28rpx;
  }
}

/* 订单商品 */
.order-items-section {
  .order-items {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .order-item {
    display: flex;
    gap: 12rpx;
    padding: 12rpx;
    background: #f9f9f9;
    border-radius: 8rpx;

    .item-image {
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

      .item-specs {
        display: block;
        font-size: 22rpx;
        color: #999999;
      }

      .item-price {
        display: block;
        font-size: 24rpx;
        font-weight: 600;
        color: #000000;
      }
    }

    .item-subtotal {
      display: block;
      font-size: 24rpx;
      font-weight: 600;
      color: #000000;
      min-width: 80rpx;
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
        color: #000000;
      }
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

    &.disabled {
      background: #d0d0d0;
      color: #999999;
    }
  }
}
</style>
