<template>
  <view class="page">
  

    <!-- 订单状态 -->
    <view class="status-section">
      <view class="status-icon" :class="order.status">
        <text v-if="order.status === 'completed'">✓</text>
        <text v-else-if="order.status === 'pending'">!</text>
      </view>
      <text class="status-text">{{ order.statusText }}</text>
      <text class="status-time">{{ formatTime(order.createdAt) }}</text>
    </view>

    <!-- 订单信息 -->
    <view class="section order-info-section">
      <view class="info-row">
        <text class="label">订单号</text>
        <view class="value-wrapper">
          <text class="value">{{ order.orderId }}</text>
          <text class="copy-btn" @tap="copyOrderId">复制</text>
        </view>
      </view>
      <view class="info-row">
        <text class="label">订单状态</text>
        <text class="value">{{ order.statusText }}</text>
      </view>
      <view class="info-row">
        <text class="label">下单时间</text>
        <text class="value">{{ formatTime(order.createdAt) }}</text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="section address-section">
      <text class="section-title">收货地址</text>
      <view class="address-card">
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
        <view v-for="(item, index) in order.items" :key="index" class="item-card">
          <image class="item-image" :src="item.image" mode="aspectFill"></image>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-specs">{{ item.color }} · 数量：{{ item.quantity }}</text>
          </view>
          <text class="item-price">¥{{ ((item.price / 100) * item.quantity).toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section fee-section">
      <view class="fee-row">
        <text class="fee-label">商品小计</text>
        <text class="fee-value">¥{{ formatPrice(order.subtotal) }}</text>
      </view>
      <view class="fee-row">
        <text class="fee-label">运费</text>
        <text class="fee-value">¥{{ formatPrice(order.expressPrice) }}</text>
      </view>
      <view v-if="order.discount > 0" class="fee-row discount">
        <text class="fee-label">优惠</text>
        <text class="fee-value">-¥{{ formatPrice(order.discount) }}</text>
      </view>
      <view class="fee-row total">
        <text class="fee-label">应付金额</text>
        <text class="fee-value">¥{{ formatPrice(order.total) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view v-if="order.status === 'pending'" class="action-btn primary" @tap="goToPayment">
        <text>立即支付</text>
      </view>
      <view v-else class="action-btn secondary" @tap="goToHome">
        <text>返回首页</text>
      </view>
    </view>
  </view>
</template>

<script>
import ordersService from '../../services/orders'

export default {
  data() {
    return {
      order: {
        orderId: '',
        items: [],
        address: {
          name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          detail: ''
        },
        subtotal: 0,
        expressPrice: 0,
        discount: 0,
        total: 0,
        status: 'pending',
        statusText: '加载中...',
        createdAt: ''
      },
      isLoading: false
    }
  },
  onLoad(options) {
    if (options.orderId) {
      this.loadOrderDetail(parseInt(options.orderId))
    }
  },
  methods: {
    async loadOrderDetail(orderId) {
      try {
        this.isLoading = true
        console.log('加载订单详情，订单ID:', orderId)

        const orderData = await ordersService.getOrderDetail(orderId)

        if (orderData) {
          console.log('获取订单详情成功:', orderData)

          // 转换API返回的数据结构以适配前端显示
          this.order = {
            id: orderData.id,
            orderId: orderData.orderNumber,
            items: orderData.items ? orderData.items.map(item => ({
              id: item.id,
              name: item.product?.name || item.productName || '未知商品',
              image: item.product?.coverImageUrl || 'https://via.placeholder.com/400x400?text=No+Image',
              quantity: item.quantity,
              price: item.priceSnapshot || item.unitPrice || 0, // 分为单位，在模板中除以100转换
              color: '默认'
            })) : [],
            address: orderData.shippingAddress ? {
              name: orderData.receiverName || orderData.shippingAddress.receiverName || '',
              phone: orderData.receiverPhone || orderData.shippingAddress.receiverPhone || '',
              province: orderData.shippingAddress.province || '',
              city: orderData.shippingAddress.city || '',
              district: orderData.shippingAddress.district || '',
              detail: orderData.shippingAddress.addressDetail || ''
            } : {
              name: orderData.receiverName || '',
              phone: orderData.receiverPhone || '',
              province: '',
              city: '',
              district: '',
              detail: ''
            },
            subtotal: orderData.subtotal || orderData.subtotalAmount || 0,
            expressPrice: orderData.shippingCost || orderData.shippingAmount || 0,
            discount: orderData.discountAmount || 0,
            total: orderData.totalAmount || 0,
            status: orderData.status,
            statusText: this.getStatusText(orderData.status),
            trackingNumber: orderData.trackingNumber || null,
            createdAt: orderData.createdAt
          }
        } else {
          uni.showToast({
            title: '订单不存在',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('Failed to load order detail:', error)
        uni.showToast({
          title: '加载订单详情失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    getStatusText(status) {
      const statusMap = {
        'pending': '待支付',
        'paid': '已支付',
        'shipped': '已发货',
        'delivered': '已送达',
        'completed': '已完成',
        'cancelled': '已取消',
        'refunded': '已退款'
      }
      return statusMap[status] || status
    },
    formatPrice(price) {
      // 费用明细中的价格都是分为单位，需要除以100转为元
      if (typeof price === 'number') {
        return (price / 100).toFixed(2)
      } else if (typeof price === 'string') {
        return (parseFloat(price) / 100).toFixed(2)
      }
      return '0.00'
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
      try {
        uni.setStorageSync('currentOrder', this.order)
      } catch (e) {
        console.error('Failed to save order:', e)
      }

      uni.navigateTo({
        url: '/pages/payment/payment'
      })
    },
    goBack() {
      uni.navigateBack()
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
  padding-bottom: 20rpx;
}

/* 页面头部 */
.header {
  background: #ffffff;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1px solid #f0f0f0;

  .header-back {
    display: block;
    font-size: 26rpx;
    color: #000000;
    cursor: pointer;
  }

  .header-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
  }
}

/* 状态显示 */
.status-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 32rpx;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12rpx;

  .status-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    margin-bottom: 8rpx;

    &.completed {
      background: #e8f5e9;
      color: #00b26a;
    }

    &.pending {
      background: #fff3e0;
      color: #ff7a00;
    }

    &.cancelled {
      background: #ffebee;
      color: #cc0000;
    }
  }

  .status-text {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
  }

  .status-time {
    display: block;
    font-size: 24rpx;
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

    .label {
      font-size: 26rpx;
      color: #666666;
    }

    .value-wrapper {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .value {
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
        cursor: pointer;

        &:active {
          background: #d0d0d0;
        }
      }
    }

    .value {
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
    }
  }
}

/* 收货地址 */
.address-section {
  .address-card {
    background: #f9f9f9;
    padding: 16rpx;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .address-header {
      display: flex;
      gap: 12rpx;
      margin-bottom: 4rpx;

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

    .item-card {
      display: flex;
      gap: 12rpx;
      padding: 12rpx;
      background: #f9f9f9;
      border-radius: 8rpx;
      align-items: flex-start;

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
        min-width: 0;

        .item-name {
          display: block;
          font-size: 26rpx;
          color: #000000;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          word-break: break-word;
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
        flex-shrink: 0;
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

  .action-btn {
    height: 80rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;
    cursor: pointer;

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
