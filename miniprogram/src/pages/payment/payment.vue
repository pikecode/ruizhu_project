<template>
  <view class="page">
   
    <!-- 订单金额 -->
    <view class="payment-amount-section">
      <text class="amount-label">应付金额</text>
      <view class="amount-display">
        <text class="currency">¥</text>
        <text class="amount-value">{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 微信支付说明 -->
    <view class="payment-methods-section">
      <view class="section-title">支付方式</view>
      <view class="wechat-payment-info">
        <view class="method-icon">微</view>
        <view class="method-details">
          <text class="method-name">微信支付</text>
          <text class="method-desc">使用微信钱包安全快捷支付</text>
        </view>
      </view>
    </view>

    <!-- 订单信息预览 -->
    <view class="order-summary-section">
      <view class="section-title">订单信息</view>
      <view class="summary-item">
        <text class="label">订单号</text>
        <text class="value">{{ orderId }}</text>
      </view>
      <view class="summary-item">
        <text class="label">商品数量</text>
        <text class="value">{{ itemCount }} 件</text>
      </view>
      <view class="summary-item">
        <text class="label">配送地址</text>
        <text class="value">{{ address }}</text>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <view class="payment-footer">
      <view class="payment-btn" @tap="processPayment">
        <text>确认支付 ¥{{ totalAmount }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import wechatPaymentService from '../../services/wechatPayment'

export default {
  data() {
    return {
      totalAmount: '0',
      itemCount: 0,
      address: '',
      orderId: '',
      order: null,
      isLoading: false
    }
  },
  onLoad() {
    this.loadPaymentInfo()
  },
  methods: {
    loadPaymentInfo() {
      try {
        const order = uni.getStorageSync('currentOrder')
        console.log('📡 [Payment] 加载订单信息:', order)

        if (order) {
          this.order = order
          this.totalAmount = order.total.toString()
          this.itemCount = order.items ? order.items.length : 0

          // 安全地处理地址信息
          if (order.address && typeof order.address === 'object') {
            const city = order.address.city || ''
            const district = order.address.district || ''
            this.address = `${city} ${district}`.trim()
          } else {
            this.address = '地址待完善'
          }

          this.orderId = order.orderId
          console.log('✅ [Payment] 订单信息加载成功')
        } else {
          console.warn('⚠️ [Payment] 订单信息为空')
        }
      } catch (e) {
        console.error('❌ Failed to load payment info:', e)
        uni.showToast({
          title: '加载订单信息失败',
          icon: 'none'
        })
      }
    },
    async processPayment() {
      if (!this.order) {
        uni.showToast({
          title: '订单信息缺失',
          icon: 'none'
        })
        return
      }

      if (this.isLoading) return
      this.isLoading = true

      try {
        // 调用后端创建支付订单
        console.log('📡 [Payment] 正在请求支付订单...')
        const paymentOrder = await wechatPaymentService.createPaymentOrder({
          outTradeNo: this.order.orderId,
          totalFee: Math.round(parseFloat(this.order.total) * 100), // 转换为分
          body: `订单 ${this.order.orderId}`,
          metadata: {
            orderId: this.order.id,
            userId: this.order.userId
          }
        })

        if (!paymentOrder) {
          uni.showToast({
            title: '创建支付订单失败',
            icon: 'none'
          })
          return
        }

        console.log('📡 [Payment] 支付参数:', paymentOrder)

        // 调起微信支付
        this.requestWechatPayment(paymentOrder)
      } catch (error) {
        console.error('Failed to process payment:', error)
        uni.showToast({
          title: error.message || '支付失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },
    requestWechatPayment(paymentData) {
      console.log('📡 [Payment] 调起微信支付，参数:', {
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.prepayId ? `prepay_id=${paymentData.prepayId}` : 'prepay_id=mock',
        signType: paymentData.signType || 'MD5',
        paySign: '***'
      })

      wx.requestPayment({
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: `prepay_id=${paymentData.prepayId}`,
        signType: paymentData.signType || 'MD5',
        paySign: paymentData.paySign,
        success: async (res) => {
          console.log('✅ [Payment] 微信支付成功:', res)
          // 支付成功后查询订单状态确认
          await this.confirmPaymentSuccess(paymentData.outTradeNo)
        },
        fail: (err) => {
          console.error('❌ [Payment] 微信支付失败:', err)
          if (err.errMsg?.includes('cancel')) {
            uni.showToast({
              title: '已取消支付',
              icon: 'none'
            })
          } else {
            uni.showToast({
              title: '支付失败，请重试',
              icon: 'none'
            })
          }
        }
      })
    },
    async confirmPaymentSuccess(outTradeNo) {
      try {
        // 查询支付状态确认
        console.log('📡 [Payment] 查询支付状态...')
        const status = await wechatPaymentService.queryPaymentStatus(outTradeNo)

        if (status === 'success') {
          uni.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 1500
          })

          // 延迟后跳转到订单列表
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/orders/orders'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: '支付状态确认中，请稍候',
            icon: 'none'
          })
          // 重试查询
          setTimeout(() => {
            this.confirmPaymentSuccess(outTradeNo)
          }, 2000)
        }
      } catch (error) {
        console.error('Failed to confirm payment:', error)
        uni.showToast({
          title: '确认支付状态失败',
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

 

/* 订单金额 */
.payment-amount-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 32rpx;
  border-radius: 8rpx;
  text-align: center;

  .amount-label {
    display: block;
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 16rpx;
  }

  .amount-display {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 4rpx;

    .currency {
      font-size: 32rpx;
      color: #000000;
      font-weight: 600;
    }

    .amount-value {
      font-size: 56rpx;
      color: #000000;
      font-weight: 700;
    }
  }
}

/* 支付方式 */
.payment-methods-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
  }

  .wechat-payment-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx;
    border: 2px solid #000000;
    border-radius: 8rpx;
    background: #f9f9f9;

    .method-icon {
      width: 48rpx;
      height: 48rpx;
      background: #000000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: 600;
      color: #ffffff;
      flex-shrink: 0;
    }

    .method-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .method-name {
        display: block;
        font-size: 26rpx;
        font-weight: 600;
        color: #000000;
      }

      .method-desc {
        display: block;
        font-size: 22rpx;
        color: #999999;
      }
    }
  }
}

/* 订单信息 */
.order-summary-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 26rpx;
      color: #666666;
    }

    .value {
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
      text-align: right;
      flex: 1;
      margin-left: 16rpx;
    }
  }
}

/* 底部按钮 */
.payment-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 16rpx 20rpx;

  .payment-btn {
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
    cursor: pointer;

    &:active {
      background: #333333;
    }
  }
}
</style>
