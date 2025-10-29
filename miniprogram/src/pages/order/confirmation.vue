<template>
  <view class="page">
    <!-- 成功状态 -->
    <view class="success-section">
      <view class="success-icon">✓</view>
      <text class="success-title">订单已生成</text>
      <text class="success-subtitle">感谢您的购买</text>
    </view>

    <!-- 订单信息 -->
    <view class="section order-info-section">
      <view class="info-row">
        <text class="info-label">订单号</text>
        <view class="info-value-wrapper">
          <text class="info-value">{{ order.orderId }}</text>
          <text class="copy-btn" @tap="copyOrderId">复制</text>
        </view>
      </view>
      <view class="info-row">
        <text class="info-label">订单金额</text>
        <text class="info-value">¥{{ order.total }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">订单状态</text>
        <text class="info-value status-waiting">{{ order.status }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ formatTime(order.createdAt) }}</text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="section address-info-section">
      <text class="section-title">收货地址</text>
      <view class="address-info">
        <view class="address-header">
          <text class="address-name">{{ order.address.name }}</text>
          <text class="address-phone">{{ order.address.phone }}</text>
        </view>
        <text class="address-detail">
          {{ order.address.province }} {{ order.address.city }} {{ order.address.district }}
        </text>
        <text class="address-detail">
          {{ order.address.detail }}
        </text>
      </view>
    </view>

    <!-- 商品清单 -->
    <view class="section items-section">
      <text class="section-title">商品清单</text>
      <view class="items-list">
        <view v-for="(item, index) in order.items" :key="index" class="item">
          <image class="item-image" :src="item.image" mode="aspectFill"></image>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-specs">{{ item.color }} · 数量：{{ item.quantity }}</text>
          </view>
          <text class="item-price">¥{{ parseInt(item.price) * item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section fee-section">
      <view class="fee-row">
        <text class="fee-label">商品小计</text>
        <text class="fee-value">¥{{ order.subtotal }}</text>
      </view>
      <view class="fee-row">
        <text class="fee-label">运费</text>
        <text class="fee-value">¥{{ order.expressPrice }}</text>
      </view>
      <view v-if="order.discount > 0" class="fee-row discount">
        <text class="fee-label">优惠</text>
        <text class="fee-value">-¥{{ order.discount }}</text>
      </view>
      <view class="fee-row total">
        <text class="fee-label">应付金额</text>
        <text class="fee-value">¥{{ order.total }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-btn primary" @tap="goToPayment">
        <text>前往支付</text>
      </view>
      <view class="action-btn secondary" @tap="goToHome">
        <text>返回首页</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      order: {
        orderId: '',
        items: [],
        address: {},
        subtotal: 0,
        expressPrice: 0,
        discount: 0,
        total: 0,
        status: '待支付',
        createdAt: ''
      }
    }
  },
  onLoad() {
    this.loadOrder()
  },
  methods: {
    loadOrder() {
      try {
        const order = uni.getStorageSync('currentOrder')
        if (order) {
          this.order = order
        } else {
          // 模拟订单数据（用于测试）
          this.order = {
            orderId: 'ORD1234567890',
            items: [
              {
                id: 1,
                name: '【明星同款】Prada Explore 中号Re-Nylon单肩包',
                color: '黑色',
                price: '17900',
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80'
              }
            ],
            address: {
              name: '张三',
              phone: '18912345678',
              province: '广东省',
              city: '深圳市',
              district: '福田区',
              detail: '中心广场写字楼A座2501室'
            },
            subtotal: 17900,
            expressPrice: 10,
            discount: 0,
            total: 17910,
            status: '待支付',
            createdAt: new Date().toISOString()
          }
        }
      } catch (e) {
        console.error('Failed to load order:', e)
      }
    },
    formatTime(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    copyOrderId() {
      uni.setClipboardData({
        data: this.order.orderId,
        success: () => {
          uni.showToast({
            title: '订单号已复制',
            icon: 'success'
          })
        }
      })
    },
    goToPayment() {
      uni.navigateTo({
        url: '/pages/payment/payment'
      })
    },
    goToHome() {
      uni.switchTab({
        url: '/pages/index/index'
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

/* 成功状态 */
.success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  text-align: center;

  .success-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #00b26a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80rpx;
    color: #ffffff;
    margin-bottom: 24rpx;
  }

  .success-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8rpx;
  }

  .success-subtitle {
    display: block;
    font-size: 28rpx;
    color: #999999;
  }
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

/* 订单信息 */
.order-info-section {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 26rpx;
      color: #666666;
    }

    .info-value-wrapper {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .info-value {
        font-size: 26rpx;
        color: #000000;
        font-weight: 500;
      }

      .copy-btn {
        padding: 6rpx 12rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        font-size: 20rpx;
        color: #666666;
      }
    }

    .info-value {
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;

      &.status-waiting {
        color: #ff7a00;
      }
    }
  }
}

/* 地址信息 */
.address-info-section {
  .address-info {
    background: #f9f9f9;
    padding: 16rpx;
    border-radius: 8rpx;

    .address-header {
      display: flex;
      gap: 12rpx;
      margin-bottom: 8rpx;

      .address-name {
        font-size: 26rpx;
        font-weight: 500;
        color: #000000;
      }

      .address-phone {
        font-size: 26rpx;
        color: #999999;
      }
    }

    .address-detail {
      display: block;
      font-size: 24rpx;
      color: #666666;
      line-height: 1.6;
    }
  }
}

/* 商品清单 */
.items-section {
  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .item {
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
      }

      .item-price {
        display: block;
        font-size: 26rpx;
        font-weight: 600;
        color: #000000;
        min-width: 80rpx;
        text-align: right;
      }
    }
  }
}

/* 费用明细 */
.fee-section {
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

/* 操作按钮 */
.action-section {
  padding: 0 20rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .action-btn {
    height: 80rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;

    &.primary {
      background: #000000;
      color: #ffffff;

      &:active {
        background: #333333;
      }
    }

    &.secondary {
      background: #f0f0f0;
      color: #333333;

      &:active {
        background: #d0d0d0;
      }
    }
  }
}
</style>
