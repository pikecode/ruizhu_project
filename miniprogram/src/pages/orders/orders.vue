<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="orders-header">
      <text class="header-title">我的订单</text>
    </view>

    <!-- 订单标签页 -->
    <view class="order-tabs">
      <view
        v-for="(tab, index) in orderTabs"
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @tap="selectTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view v-if="filteredOrders.length > 0" class="orders-list">
      <view
        v-for="(order, index) in filteredOrders"
        :key="index"
        class="order-item"
        @tap="goToOrderDetail(order)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="order-info">
            <text class="order-id">订单号: {{ order.orderId }}</text>
            <text class="order-date">{{ formatTime(order.createdAt) }}</text>
          </view>
          <view class="order-status" :class="order.status">{{ order.statusText }}</view>
        </view>

        <!-- 订单商品 -->
        <view class="order-items">
          <view
            v-for="(item, itemIndex) in order.items.slice(0, 1)"
            :key="itemIndex"
            class="order-item-card"
          >
            <image class="item-image" :src="item.image" mode="aspectFill"></image>
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-color">{{ item.color }}</text>
            </view>
            <text class="item-quantity">x{{ item.quantity }}</text>
          </view>
          <view v-if="order.items.length > 1" class="more-items">
            还有 {{ order.items.length - 1 }} 件商品
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="order-total">
            <text class="total-label">共</text>
            <text class="total-items">{{ order.items.length }}</text>
            <text class="total-label">件，合计</text>
            <text class="total-amount">¥{{ order.total }}</text>
          </view>
          <view v-if="order.status === 'pending'" class="action-btns">
            <view class="action-btn primary" @tap.stop="goToPayment(order)">
              <text>立即支付</text>
            </view>
          </view>
          <view v-else class="action-btns">
            <view class="action-btn secondary" @tap.stop="viewOrder(order)">
              <text>查看详情</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-illustration">
        <text class="empty-icon">📦</text>
      </view>
      <text class="empty-title">
        {{
          activeTab === 'all'
            ? '还没有订单'
            : activeTab === 'pending'
            ? '没有待支付订单'
            : activeTab === 'completed'
            ? '没有已完成订单'
            : '没有已取消订单'
        }}
      </text>
      <text class="empty-description">去选购喜欢的商品吧</text>
      <view class="empty-action">
        <view class="action-btn primary" @tap="goToHome">
          <text>继续购物</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'all',
      orderTabs: [
        { label: '全部', value: 'all', count: 0 },
        { label: '待支付', value: 'pending', count: 0 },
        { label: '已完成', value: 'completed', count: 0 },
        { label: '已取消', value: 'cancelled', count: 0 }
      ],
      orders: []
    }
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === 'all') {
        return this.orders
      }
      return this.orders.filter((order) => order.status === this.activeTab)
    }
  },
  onLoad() {
    this.loadOrders()
  },
  methods: {
    loadOrders() {
      try {
        // 从存储加载订单历史
        const orders = uni.getStorageSync('orderHistory') || []

        // 如果没有订单，创建模拟数据
        if (orders.length === 0) {
          this.orders = [
            {
              id: 1,
              orderId: 'ORD20231025001',
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
              total: '17910',
              subtotal: '17900',
              expressPrice: '10',
              discount: '0',
              status: 'completed',
              statusText: '已完成',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              orderId: 'ORD20231024001',
              items: [
                {
                  id: 2,
                  name: 'Re-Nylon双肩背包',
                  color: '蓝色',
                  price: '21800',
                  quantity: 1,
                  image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'
                }
              ],
              total: '21810',
              subtotal: '21800',
              expressPrice: '10',
              discount: '0',
              status: 'pending',
              statusText: '待支付',
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 3,
              orderId: 'ORD20231023001',
              items: [
                {
                  id: 3,
                  name: 'Prada Bonnie 迷你牛皮革手袋',
                  color: '红色',
                  price: '12500',
                  quantity: 2,
                  image: 'https://images.unsplash.com/photo-1548062407-f961713e6786?w=400&q=80'
                },
                {
                  id: 4,
                  name: '亮面皮革乐福鞋',
                  color: '黑色',
                  price: '8900',
                  quantity: 1,
                  image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80'
                }
              ],
              total: '42410',
              subtotal: '42400',
              expressPrice: '10',
              discount: '0',
              status: 'completed',
              statusText: '已完成',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
          this.saveOrders()
        } else {
          this.orders = orders
        }

        // 更新标签页计数
        this.updateTabCounts()
      } catch (e) {
        console.error('Failed to load orders:', e)
      }
    },
    saveOrders() {
      try {
        uni.setStorageSync('orderHistory', this.orders)
      } catch (e) {
        console.error('Failed to save orders:', e)
      }
    },
    updateTabCounts() {
      const counts = {
        all: this.orders.length,
        pending: this.orders.filter((o) => o.status === 'pending').length,
        completed: this.orders.filter((o) => o.status === 'completed').length,
        cancelled: this.orders.filter((o) => o.status === 'cancelled').length
      }

      this.orderTabs.forEach((tab) => {
        tab.count = counts[tab.value]
      })
    },
    selectTab(value) {
      this.activeTab = value
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
    goToOrderDetail(order) {
      uni.navigateTo({
        url: `/pages/orders/detail?orderId=${order.id}`
      })
    },
    viewOrder(order) {
      uni.navigateTo({
        url: `/pages/orders/detail?orderId=${order.id}`
      })
    },
    goToPayment(order) {
      // 保存当前订单到存储，供支付页面使用
      try {
        uni.setStorageSync('currentOrder', order)
      } catch (e) {
        console.error('Failed to save order:', e)
      }

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
  padding-bottom: 20rpx;
}

/* 页面头部 */
.orders-header {
  background: #ffffff;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;

  .header-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    text-align: center;
  }
}

/* 订单标签页 */
.order-tabs {
  background: #ffffff;
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20rpx;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 20rpx 0;
    font-size: 26rpx;
    color: #999999;
    border-bottom: 3px solid transparent;
    position: relative;

    &.active {
      color: #000000;
      border-bottom-color: #000000;
      font-weight: 600;
    }

    .tab-badge {
      display: inline-block;
      min-width: 28rpx;
      height: 28rpx;
      padding: 0 6rpx;
      background: #ff4444;
      color: #ffffff;
      border-radius: 14rpx;
      font-size: 18rpx;
      font-weight: 600;
      text-align: center;
      line-height: 28rpx;
    }
  }
}

/* 订单列表 */
.orders-list {
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-item {
  background: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;

  .order-info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .order-id {
      display: block;
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
    }

    .order-date {
      display: block;
      font-size: 22rpx;
      color: #999999;
    }
  }

  .order-status {
    padding: 6rpx 12rpx;
    border-radius: 4rpx;
    font-size: 22rpx;
    font-weight: 500;
    background: #f0f0f0;
    color: #666666;

    &.pending {
      background: #fff3e0;
      color: #ff7a00;
    }

    &.completed {
      background: #e8f5e9;
      color: #00b26a;
    }

    &.cancelled {
      background: #ffebee;
      color: #cc0000;
    }
  }
}

.order-items {
  padding: 12rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;

  .order-item-card {
    display: flex;
    gap: 12rpx;
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

      .item-name {
        display: block;
        font-size: 26rpx;
        color: #000000;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-color {
        display: block;
        font-size: 22rpx;
        color: #999999;
      }
    }

    .item-quantity {
      display: block;
      font-size: 26rpx;
      color: #666666;
      flex-shrink: 0;
    }
  }

  .more-items {
    display: block;
    padding: 12rpx 0;
    font-size: 22rpx;
    color: #999999;
    text-align: center;
  }
}

.order-footer {
  padding: 16rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .order-total {
    display: flex;
    align-items: center;
    gap: 4rpx;

    .total-label {
      font-size: 24rpx;
      color: #666666;
    }

    .total-items {
      font-size: 28rpx;
      color: #000000;
      font-weight: 600;
    }

    .total-amount {
      font-size: 28rpx;
      color: #000000;
      font-weight: 700;
    }
  }

  .action-btns {
    display: flex;
    gap: 8rpx;

    .action-btn {
      padding: 8rpx 16rpx;
      border-radius: 4rpx;
      font-size: 22rpx;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;

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
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  text-align: center;

  .empty-illustration {
    margin-bottom: 24rpx;

    .empty-icon {
      font-size: 80rpx;
      display: block;
    }
  }

  .empty-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8rpx;
  }

  .empty-description {
    display: block;
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 40rpx;
  }

  .empty-action {
    width: 100%;

    .action-btn {
      width: 100%;
      padding: 20rpx 0;
      border-radius: 8rpx;
      font-size: 28rpx;
      font-weight: 600;
      cursor: pointer;

      &.primary {
        background: #000000;
        color: #ffffff;

        &:active {
          background: #333333;
        }
      }
    }
  }
}
</style>
