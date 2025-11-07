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

    <!-- 商品信息 -->
    <view class="product-info">
      <!-- 标题和价格 -->
      <text class="product-name">{{ productData.name }}</text>
      <view class="price-section">
        <text class="current-price">¥{{ productData.price }}</text>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 商品描述 -->
      <view class="description-section">
        <text class="section-title">商品描述</text>
        <text class="description-text">{{ productData.description }}</text>
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
import { getProductDetail } from '../../services/products'
import { cartService } from '../../services/cart'
import { authService } from '../../services/auth'
import { api } from '../../services/api'
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
      quantity: 1,
      isLoading: true,
      productImages: [],
      productData: {
        id: 0,
        name: '加载中...',
        price: '0',
        description: '加载中...'
      },
      showPhoneAuthModal: false,
      pendingAction: null
    }
  },
  async onLoad(options) {
    try {
      // 从URL参数获取产品ID
      const productId = options?.id || 1
      console.log('商品详情页加载，商品ID:', productId)

      // 从API获取商品详情
      const productDetail = await getProductDetail(parseInt(productId))

      console.log('getProductDetail返回的数据:', productDetail)

      if (productDetail) {
        // 绑定产品数据
        this.productImages = productDetail.images || []
        this.productData = {
          id: productDetail.id,
          name: productDetail.name,
          price: productDetail.price,
          description: productDetail.description,
          productType: productDetail.productType  // 需要传递productType以便支付时检测VIP产品
        }

        console.log('绑定到页面的productData:', this.productData)
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
    async proceedAddToCart() {
      try {
        uni.showLoading({
          title: '添加中...'
        })

        // 调用API添加到购物车
        const result = await cartService.addToCart(
          this.productData.id,
          this.quantity
        )

        uni.hideLoading()

        if (result) {
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
        } else {
          uni.showToast({
            title: '添加失败，请重试',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to add to cart:', error)

        // 检查是否是登录过期错误
        const errorMsg = error.message || ''
        if (errorMsg.includes('登录过期') || errorMsg.includes('401')) {
          // 显示手机号授权弹窗
          this.pendingAction = 'addToCart'
          this.showPhoneAuthModal = true
        } else {
          uni.showToast({
            title: errorMsg || '添加失败，请重试',
            icon: 'none'
          })
        }
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
     * 执行立即购买操作 - 直接生成订单，不涉及购物车
     * 购物车是独立的功能，与立即购买流程无关
     */
    async proceedBuyNow() {
      try {
        uni.showLoading({
          title: '正在跳转...'
        })

        // 直接生成订单对象，仅包含当前商品
        const buyNowOrder = {
          items: [
            {
              id: this.productData.id,
              name: this.productData.name,
              price: Math.round(parseFloat(this.productData.price) * 100),  // 从productData获取元，转换为分（乘以100后四舍五入）
              quantity: this.quantity,
              image: this.productImages[0] || '',
              color: '默认',
              productType: this.productData.productType  // 添加productType以便支付时检测VIP产品
            }
          ],
          source: 'buyNow'  // 标记为立即购买来源
        }

        // 保存到本地存储供结账页面使用
        uni.setStorageSync('buyNowOrder', buyNowOrder)
        console.log('✅ [BuyNow] 订单已生成并保存:', buyNowOrder)

        uni.hideLoading()

        // 直接跳转到结算页面，不显示toast
        uni.navigateTo({
          url: '/pages/checkout/checkout'
        })
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to proceed with purchase:', error)

        // 检查是否是登录过期错误
        const errorMsg = error.message || ''
        if (errorMsg.includes('登录过期') || errorMsg.includes('401')) {
          // 显示手机号授权弹窗
          this.pendingAction = 'buyNow'
          this.showPhoneAuthModal = true
        } else {
          uni.showToast({
            title: errorMsg || '操作失败，请重试',
            icon: 'none'
          })
        }
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
        const responseData = await api.post('/checkout', {
          items: [
            {
              productId: 1,
              quantity: 1,
              price: 0.01  // 测试金额：0.01 元 (1分)
            }
          ],
          addressId: 1,
          paymentMethod: 'wechat'
        })

        uni.hideLoading()

        console.log('API 响应:', responseData)

        if (responseData) {
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
            title: '创建订单失败',
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
        const result = await api.get(`/checkout/payment-status?orderNumber=${orderNumber}`)

        console.log('支付状态查询结果:', result)

        if (result) {
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
          console.warn('支付状态查询失败')
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
    min-width: 0;

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
