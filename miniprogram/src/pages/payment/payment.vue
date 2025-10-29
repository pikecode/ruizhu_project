<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="payment-header">
      <text class="header-title">支付方式</text>
    </view>

    <!-- 订单金额 -->
    <view class="payment-amount-section">
      <text class="amount-label">应付金额</text>
      <view class="amount-display">
        <text class="currency">¥</text>
        <text class="amount-value">{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-methods-section">
      <view class="section-title">选择支付方式</view>

      <!-- 微信支付 -->
      <view
        class="payment-method-item"
        :class="{ selected: selectedMethod === 'wechat' }"
        @tap="selectPaymentMethod('wechat')"
      >
        <view class="method-icon">微</view>
        <view class="method-info">
          <text class="method-name">微信支付</text>
          <text class="method-desc">使用微信钱包付款</text>
        </view>
        <view class="method-radio">
          <view class="radio" :class="{ checked: selectedMethod === 'wechat' }">
            <text v-if="selectedMethod === 'wechat'">✓</text>
          </view>
        </view>
      </view>

      <!-- 支付宝（可选） -->
      <view
        class="payment-method-item"
        :class="{ selected: selectedMethod === 'alipay', disabled: true }"
        @tap="showDisabledTip"
      >
        <view class="method-icon">支</view>
        <view class="method-info">
          <text class="method-name">支付宝支付</text>
          <text class="method-desc">使用支付宝付款（开发中）</text>
        </view>
        <view class="method-radio">
          <view class="radio" :class="{ checked: selectedMethod === 'alipay' }">
            <text v-if="selectedMethod === 'alipay'">✓</text>
          </view>
        </view>
      </view>

      <!-- 银行卡（可选） -->
      <view
        class="payment-method-item"
        :class="{ selected: selectedMethod === 'card', disabled: true }"
        @tap="showDisabledTip"
      >
        <view class="method-icon">卡</view>
        <view class="method-info">
          <text class="method-name">银行卡支付</text>
          <text class="method-desc">使用银行卡付款（开发中）</text>
        </view>
        <view class="method-radio">
          <view class="radio" :class="{ checked: selectedMethod === 'card' }">
            <text v-if="selectedMethod === 'card'">✓</text>
          </view>
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
export default {
  data() {
    return {
      totalAmount: '0',
      itemCount: 0,
      address: '',
      orderId: '',
      selectedMethod: 'wechat'
    }
  },
  onLoad() {
    this.loadPaymentInfo()
  },
  methods: {
    loadPaymentInfo() {
      try {
        const order = uni.getStorageSync('currentOrder')
        if (order) {
          this.totalAmount = order.total.toString()
          this.itemCount = order.items.length
          this.address = `${order.address.city} ${order.address.district}`
          this.orderId = order.orderId
        }
      } catch (e) {
        console.error('Failed to load payment info:', e)
      }
    },
    selectPaymentMethod(method) {
      if (method === 'wechat') {
        this.selectedMethod = method
      }
    },
    showDisabledTip() {
      uni.showToast({
        title: '此支付方式开发中',
        icon: 'none'
      })
    },
    processPayment() {
      if (!this.selectedMethod) {
        uni.showToast({
          title: '请选择支付方式',
          icon: 'none'
        })
        return
      }

      if (this.selectedMethod === 'wechat') {
        this.requestWechatPayment()
      }
    },
    requestWechatPayment() {
      // 模拟支付流程
      uni.showLoading({
        title: '正在处理支付...'
      })

      // 模拟延迟，实际应该调用后端接口获取支付参数
      setTimeout(() => {
        uni.hideLoading()

        // 模拟支付成功
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500
        })

        // 延迟后跳转到订单确认页或订单列表
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }, 1500)
      }, 2000)

      // 实际微信支付调用（需要后端支持）：
      // wx.requestPayment({
      //   timeStamp: data.timeStamp,
      //   nonceStr: data.nonceStr,
      //   package: data.package,
      //   signType: 'MD5',
      //   paySign: data.paySign,
      //   success: (res) => {
      //     // 支付成功
      //   },
      //   fail: (err) => {
      //     // 支付失败
      //   }
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #f9f9f9;
  padding-bottom: 120rpx;
}

/* 页面头部 */
.payment-header {
  background: #ffffff;
  padding: 16rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;

  .header-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    text-align: center;
  }
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

  .payment-method-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx;
    margin-bottom: 12rpx;
    border: 2px solid #f0f0f0;
    border-radius: 8rpx;
    cursor: pointer;

    &.selected {
      border-color: #000000;
      background: #f9f9f9;
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .method-icon {
      width: 48rpx;
      height: 48rpx;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: 600;
      color: #666666;
      flex-shrink: 0;
    }

    .method-info {
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

    .method-radio {
      flex-shrink: 0;

      .radio {
        width: 24rpx;
        height: 24rpx;
        border: 2px solid #d0d0d0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          font-size: 14rpx;
          color: transparent;
          font-weight: 600;
        }

        &.checked {
          background: #000000;
          border-color: #000000;

          text {
            color: #ffffff;
          }
        }
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
