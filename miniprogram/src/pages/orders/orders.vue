<template>
  <view class="page">
  

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
import ordersService from '../../services/orders'

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
      orders: [],
      isLoading: false,
      page: 1,
      pageSize: 20,
      hasMore: true
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
    /**
     * 加载订单数据
     */
    async loadOrders() {
      try {
        this.isLoading = true
        console.log('开始加载订单数据...')

        const response = await ordersService.getUserOrders(this.page, this.pageSize)
        console.log('📡 [Orders] API 返回的原始 response:', response)
        console.log('📡 [Orders] response.items:', response?.items)
        console.log('📡 [Orders] response.data:', response?.data)

        if (response && response.items) {
          console.log('获取订单列表成功:', response)
          console.log('第一个订单对象:', response.items[0])

          try {
            // 转换API返回的数据结构以适配前端显示
            this.orders = response.items.map((order, index) => {
              console.log(`映射第 ${index} 个订单:`, order)
              return {
                id: order.id,
                orderId: order.orderNumber,
                items: order.items ? order.items.map(item => ({
                  id: item.id,
                  name: item.product.name,
                  image: item.product.coverImageUrl || 'https://via.placeholder.com/400x400?text=No+Image',
                  quantity: item.quantity,
                  price: (item.unitPrice / 100).toFixed(2), // 转换为元
                  color: '默认' // 后端暂时没有颜色信息，使用默认值
                })) : [],
                total: (order.totalAmount / 100).toFixed(2), // 转换为元
                subtotal: (order.subtotalAmount / 100).toFixed(2),
                expressPrice: (order.shippingAmount / 100).toFixed(2),
                discount: (order.discountAmount / 100).toFixed(2),
                status: order.status,
                statusText: this.getStatusText(order.status),
                createdAt: order.createdAt
              }
            })
            console.log('✅ 订单列表映射成功，共', this.orders.length, '个订单')
          } catch (mapError) {
            console.error('❌ 订单映射出错:', mapError)
            this.orders = []
          }

          this.hasMore = response.page < response.totalPages
        } else {
          console.log('API 返回为空或无效:', response)
          this.orders = []
        }

        // 更新标签页计数
        this.updateTabCounts()
      } catch (error) {
        console.error('Failed to load orders:', error)
        uni.showToast({
          title: '加载订单失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 根据状态获取中文显示文本
     */
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

    /**
     * 切换标签页并加载对应数据
     */
    async selectTab(value) {
      if (this.activeTab === value) return

      this.activeTab = value
      this.page = 1
      this.orders = []

      if (value === 'all') {
        await this.loadOrders()
      } else {
        await this.loadOrdersByStatus(value)
      }
    },

    /**
     * 根据状态加载订单
     */
    async loadOrdersByStatus(status) {
      try {
        this.isLoading = true
        console.log(`加载${status}状态订单...`)

        const response = await ordersService.getOrdersByStatus(status, this.page, this.pageSize)

        if (response && response.items) {
          console.log(`获取${status}状态订单成功:`, response)

          // 转换数据结构
          this.orders = response.items.map(order => ({
            id: order.id,
            orderId: order.orderNumber,
            items: order.items.map(item => ({
              id: item.id,
              name: item.product.name,
              image: item.product.coverImageUrl || 'https://via.placeholder.com/400x400?text=No+Image',
              quantity: item.quantity,
              price: (item.unitPrice / 100).toFixed(2),
              color: '默认'
            })),
            total: (order.totalAmount / 100).toFixed(2),
            subtotal: (order.subtotalAmount / 100).toFixed(2),
            expressPrice: (order.shippingAmount / 100).toFixed(2),
            discount: (order.discountAmount / 100).toFixed(2),
            status: order.status,
            statusText: this.getStatusText(order.status),
            createdAt: order.createdAt
          }))

          this.hasMore = response.page < response.totalPages
        } else {
          this.orders = []
        }

        this.updateTabCounts()
      } catch (error) {
        console.error(`Failed to load ${status} orders:`, error)
        uni.showToast({
          title: '加载订单失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isLoading = false
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
