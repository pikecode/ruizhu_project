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
export default {
  data() {
    return {
      cartItems: [],
      selectedAddress: null
    }
  },
  computed: {
    totalAmount() {
      // 价格单位为分，需要转换为元
      const totalInFen = this.cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      return (totalInFen / 100).toFixed(2)
    }
  },
  onLoad() {
    this.loadCartItems()
    this.loadAddresses()
  },
  methods: {
    loadCartItems() {
      // 从购物车页面传递或从本地存储获取
      try {
        const pending = uni.getStorageSync('checkoutItems')
        if (pending && Array.isArray(pending)) {
          this.cartItems = pending
        }
      } catch (e) {
        console.error('Failed to load cart items:', e)
      }
    },
    loadAddresses() {
      // 模拟加载地址（实际应从后端或本地存储获取）
      try {
        const addresses = uni.getStorageSync('userAddresses') || []
        if (addresses.length > 0) {
          this.selectedAddress = addresses[0] // 选择第一个地址为默认
        }
      } catch (e) {
        console.error('Failed to load addresses:', e)
      }
    },
    navigateToAddresses() {
      uni.navigateTo({
        url: '/pages/addresses/addresses',
        success: (res) => {
          // 监听来自 addresses 页面的地址选择事件
          res.eventChannel.on('selectAddress', (data) => {
            console.log('选中的地址:', data)
            this.selectedAddress = {
              id: data.id,
              name: data.name || data.receiverName,
              phone: data.phone || data.receiverPhone,
              province: data.province,
              city: data.city,
              district: data.district,
              detail: data.detail || data.addressDetail
            }
          })
        }
      })
    },
    confirmOrder() {
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

      // 生成订单号
      const orderId = 'ORD' + Date.now()

      // 保存订单信息
      const order = {
        orderId,
        items: this.cartItems,
        address: this.selectedAddress,
        total: parseFloat(this.totalAmount),
        status: '待支付',
        createdAt: new Date().toISOString()
      }

      try {
        uni.setStorageSync('currentOrder', order)
      } catch (e) {
        console.error('Failed to save order:', e)
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
