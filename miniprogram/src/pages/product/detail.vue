<template>
  <view class="detail-page">
    <!-- 手机号授权弹窗 -->
    <phone-auth-modal
      :visible="showPhoneAuthModal"
      :on-success="handlePhoneAuthSuccess"
      :on-cancel="handlePhoneAuthCancel"
      @close="showPhoneAuthModal = false"
    ></phone-auth-modal>

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
      <view class="action-btn payment-test" @tap="testPayment">
        <text>测试支付 ¥0.01</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from '../../services/products'
import { authService } from '../../services/auth'
import PhoneAuthModal from '../../components/PhoneAuthModal.vue'

export default {
  components: {
    PhoneAuthModal
  },
  data() {
    return {
      indicatorColor: 'rgba(0, 0, 0, 0.3)',
      indicatorActiveColor: '#000000',
      currentImageIndex: 0,
      selectedColor: 0,
      quantity: 1,
      isFavorite: false,
      isLoading: true,
      productImages: [],
      productData: {
        name: '加载中...',
        price: '0',
        skuCode: '加载中',
        description: '加载中...',
        colors: ['颜色选项']
      },
      // 授权相关
      showPhoneAuthModal: false,
      pendingAction: null // 'addToCart' or 'buyNow'
    }
  },
  async onLoad(options) {
    try {
      // 从路由参数获取商品ID
      const productId = options?.id || 1

      console.log('商品详情页加载，商品ID:', productId)

      // 获取商品详情
      const productDetail = await getProductDetail(parseInt(productId))

      if (productDetail) {
        // 绑定产品数据
        this.productImages = productDetail.images || []
        this.productData = {
          name: productDetail.name,
          price: productDetail.price,
          skuCode: productDetail.skuCode,
          description: productDetail.description,
          colors: productDetail.colors || ['颜色选项']
        }
      } else {
        // 获取失败，显示错误提示
        uni.showToast({
          title: '商品加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('Failed to load product detail:', error)
      uni.showToast({
        title: '商品加载失败',
        icon: 'none'
      })
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    /**
     * 检查用户是否已授权
     * 如果未授权，显示手机号授权弹窗
     * @param action 待执行的操作 ('addToCart' 或 'buyNow')
     * @returns 如果已授权返回 true，否则显示弹窗并返回 false
     */
    checkUserAuthorization(action) {
      if (authService.isLoggedIn()) {
        return true
      }

      // 用户未登录，显示手机号授权弹窗
      this.pendingAction = action
      this.showPhoneAuthModal = true
      return false
    },

    /**
     * 手机号授权成功回调
     */
    handlePhoneAuthSuccess() {
      // 调试：确认回调被执行
      console.log('🔐 handlePhoneAuthSuccess 被调用')
      console.log('当前登录状态 (isLoggedIn):', authService.isLoggedIn())
      console.log('accessToken 值:', uni.getStorageSync('accessToken') ? '存在' : '不存在')

      // 授权成功，继续执行之前的操作
      const action = this.pendingAction
      this.pendingAction = null

      console.log('待执行的操作:', action)

      if (action === 'addToCart') {
        this.proceedAddToCart()
      } else if (action === 'buyNow') {
        this.proceedBuyNow()
      } else if (action === 'testPayment') {
        console.log('✓ 执行 proceedTestPayment')
        this.proceedTestPayment()
      }
    },

    /**
     * 手机号授权取消回调
     */
    handlePhoneAuthCancel() {
      this.pendingAction = null
      uni.showToast({
        title: '已取消授权',
        icon: 'none',
        duration: 1500
      })
    },

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
      // 检查用户是否已授权
      if (!this.checkUserAuthorization('addToCart')) {
        return
      }

      // 用户已授权，执行添加购物车操作
      this.proceedAddToCart()
    },

    /**
     * 执行添加购物车操作
     */
    proceedAddToCart() {
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
      // 检查用户是否已授权
      if (!this.checkUserAuthorization('buyNow')) {
        return
      }

      // 用户已授权，执行立即购买操作
      this.proceedBuyNow()
    },

    /**
     * 执行立即购买操作
     */
    proceedBuyNow() {
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
    },

    /**
     * 测试支付 - 检查授权
     */
    testPayment() {
      // 检查用户是否已授权
      if (!this.checkUserAuthorization('testPayment')) {
        return
      }
      // 授权通过，继续执行实际的支付流程
      this.proceedTestPayment()
    },

    /**
     * 执行测试支付 - 使用 0.01 元金额测试 WeChat 支付流程
     */
    async proceedTestPayment() {
      uni.showLoading({
        title: '正在初始化支付...'
      })

      try {
        // 获取用户信息用于API调用
        const userInfo = uni.getStorageSync('userInfo') || {}
        // 获取令牌 - 使用正确的键名 'accessToken'
        const token = uni.getStorageSync('accessToken')

        // 调试：检查token是否存在
        console.log('proceedTestPayment - 获取的token:', token ? '存在' : '不存在')
        console.log('当前登录状态 (isLoggedIn):', authService.isLoggedIn())

        if (!token) {
          uni.hideLoading()
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        // 调用后端 API 创建支付订单
        // 使用 0.01 元作为测试金额
        const createOrderResponse = await uni.request({
          url: 'https://yunjie.online/api/checkout',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: {
            items: [
              {
                productId: 1,
                quantity: 1,
                price: 0.01  // 测试金额：0.01 元 (1分)
              }
            ],
            addressId: 1,
            paymentMethod: 'wechat'
          }
        })

        uni.hideLoading()

        console.log('API 响应:', createOrderResponse)

        if (createOrderResponse && (createOrderResponse.statusCode === 200 || createOrderResponse.statusCode === 201)) {
          const responseData = createOrderResponse.data
          const orderData = responseData.order
          const paymentData = responseData.payment

          console.log('订单创建成功:', orderData)
          console.log('支付参数获取成功:', paymentData)

          // 调用微信支付（使用后端直接返回的支付参数）
          wx.requestPayment({
            timeStamp: paymentData.timeStamp,
            nonceStr: paymentData.nonceStr,
            package: `prepay_id=${paymentData.prepayId}`,
            signType: paymentData.signType || 'MD5',
            paySign: paymentData.paySign,
            success: (res) => {
              console.log('支付成功:', res)
              uni.showToast({
                title: '支付成功！',
                icon: 'success',
                duration: 2000
              })

              // 查询支付状态 - 使用订单号（orderNo）而不是 ID
              setTimeout(() => {
                this.queryPaymentStatus(orderData.orderNo, token)
              }, 500)
            },
            fail: (err) => {
              console.log('支付失败:', err)
              uni.showToast({
                title: '支付已取消',
                icon: 'none',
                duration: 1500
              })
            }
          })
        } else {
          uni.showToast({
            title: `创建订单失败: ${createOrderResponse?.statusCode || '未知错误'}`,
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('支付测试出错:', error)
        uni.showToast({
          title: '支付测试出错，请检查网络',
          icon: 'none'
        })
      }
    },

    /**
     * 查询支付状态 - 使用订单号查询
     */
    async queryPaymentStatus(orderNumber, token) {
      try {
        const response = await uni.request({
          url: `https://yunjie.online/api/checkout/payment-status?orderNumber=${orderNumber}`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('支付状态查询响应:', response)

        if (response && response.statusCode === 200) {
          const result = response.data
          console.log('支付状态查询结果:', result)

          if (result.status === 'paid' || result.paymentStatus === 'completed') {
            uni.showToast({
              title: '订单已支付',
              icon: 'success',
              duration: 1500
            })
          } else {
            uni.showToast({
              title: `订单状态: ${result.status}`,
              icon: 'none'
            })
          }
        } else {
          console.warn('支付状态查询失败:', response?.statusCode)
        }
      } catch (error) {
        console.error('查询支付状态异常:', error)
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
    font-size: 28rpx;
    font-weight: 600;
    cursor: pointer;
    min-width: 0;  // 允许按钮缩小

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

  .payment-test {
    background: #ff6b35;
    color: #ffffff;
    font-size: 24rpx;
  }
}
</style>
