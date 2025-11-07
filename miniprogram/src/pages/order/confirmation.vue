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
        <text class="info-value">¥{{ formatPrice(order.total) }}</text>
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

    <!-- 收货地址（非充值订单） -->
    <view v-if="!order.isRecharge" class="section address-info-section">
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
      <view v-if="!order.items || order.items.length === 0" class="empty-items">
        <text>暂无商品信息</text>
      </view>
      <view class="items-list" v-else>
        <view v-for="(item, index) in order.items" :key="index" class="item">
          <!-- 支持两种数据格式：本地购物车格式和后端 OrderItem 格式 -->
          <image v-if="item.image" class="item-image" :src="item.image" mode="aspectFill"></image>
          <view class="item-info">
            <!-- 后端 OrderItem 格式使用 productName，本地格式使用 name -->
            <text class="item-name">{{ item.productName || item.name }}</text>
            <text class="item-specs">
              <!-- 显示数量和 SKU（如果有） -->
              数量：{{ item.quantity }}
              <text v-if="item.sku">· SKU: {{ item.sku }}</text>
            </text>
            <!-- 显示产品类型（如果有，用于识别会员产品） -->
            <text v-if="item.selectedAttributes && item.selectedAttributes.productType" class="item-type">
              类型: {{ item.selectedAttributes.productType }}
            </text>
            <text v-if="item.selectedAttributes && item.selectedAttributes.discount" class="item-discount">
              折扣: {{ (item.selectedAttributes.discount * 100).toFixed(0) }}%
            </text>
          </view>
          <!-- 价格计算支持两种格式 -->
          <text class="item-price">
            ¥{{ (((item.priceSnapshot || item.price) / 100) * item.quantity).toFixed(2) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section fee-section">
      <view class="fee-row">
        <text class="fee-label">商品小计</text>
        <text class="fee-value">¥{{ calculateSubtotal() }}</text>
      </view>
      <view v-if="userDiscount < 1.0" class="fee-row discount">
        <text class="fee-label">VIP折扣 ({{ Math.round((1 - userDiscount) * 100) }}%)</text>
        <text class="fee-value">-¥{{ calculateDiscountAmount() }}</text>
      </view>
      <view class="fee-row total">
        <text class="fee-label">应付金额</text>
        <text class="fee-value">¥{{ calculateFinalAmount() }}</text>
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
import { api } from '../../services/api'

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
        discountPercent: 0,
        total: 0,
        status: '待支付',
        createdAt: '',
        isRecharge: false
      },
      userDiscount: 1.0  // 用户折扣倍数，从 user.discount 读取
    }
  },
  onLoad() {
    console.log('🎯 [Confirmation] onLoad() 被调用')
    this.loadOrder()
  },
  methods: {
    async loadOrder() {
      try {
        console.log('🔍 [Confirmation] 开始加载订单数据...')
        const order = uni.getStorageSync('currentOrder')
        console.log('📦 [Confirmation] 从本地存储获取的订单:', JSON.stringify(order))

        if (!order) {
          console.warn('⚠️ [Confirmation] 未找到订单数据，请返回重新下单')
          uni.showToast({
            title: '订单数据不存在',
            icon: 'none'
          })
          return
        }

        console.log('✅ [Confirmation] 找到订单数据')

        // 从后端获取完整的订单信息（包括 OrderItem 数据）
        if (order.id) {
          try {
            console.log('📡 [Confirmation] 从后端获取完整订单信息，订单ID:', order.id)
            const fullOrder = await api.get(`/orders/${order.id}`)

            if (fullOrder) {
              console.log('✅ [Confirmation] 后端订单数据:', JSON.stringify(fullOrder))
              console.log('✅ [Confirmation] 后端订单项数据:', fullOrder.items)

              // 使用后端返回的完整订单数据（包括 items）
              this.order = {
                ...order,
                ...fullOrder,
                // 保留本地数据中的某些字段
                items: fullOrder.items && fullOrder.items.length > 0 ? fullOrder.items : order.items
              }

              console.log('✅ [Confirmation] 订单已从后端刷新，订单项数量:', this.order.items?.length)
            } else {
              console.warn('⚠️ [Confirmation] 后端返回空数据，使用本地订单')
              this.order = order
            }
          } catch (err) {
            console.warn('⚠️ [Confirmation] 从后端获取订单失败，使用本地数据:', err)
            this.order = order
          }
        } else {
          console.log('📝 [Confirmation] 订单没有ID，使用本地数据')
          this.order = order
        }

        // 从本地存储读取用户折扣信息
        console.log('👤 [Confirmation] 从本地存储读取用户信息...')
        let userInfo = uni.getStorageSync('user')
        console.log('👤 [Confirmation] 原始用户信息:', userInfo)
        console.log('👤 [Confirmation] 原始用户信息类型:', typeof userInfo)

        // 处理可能被存储为字符串的 JSON 数据
        if (typeof userInfo === 'string') {
          console.warn('⚠️ [Confirmation] 用户信息被存储为字符串，需要解析')
          try {
            userInfo = JSON.parse(userInfo)
            console.log('✅ [Confirmation] 用户信息已解析为对象:', JSON.stringify(userInfo))
          } catch (e) {
            console.error('❌ [Confirmation] 解析用户信息失败:', e)
            userInfo = {}
          }
        }

        console.log('👤 [Confirmation] 解析后的用户信息:', JSON.stringify(userInfo))
        console.log('👤 [Confirmation] userInfo 存在:', !!userInfo)
        console.log('👤 [Confirmation] userInfo.discount 值:', userInfo?.discount)
        console.log('👤 [Confirmation] userInfo.discount 类型:', typeof userInfo?.discount)

        if (userInfo && userInfo.discount) {
          this.userDiscount = parseFloat(userInfo.discount)
          console.log('💳 [Confirmation] 用户折扣（已转换）:', this.userDiscount)
          console.log('💳 [Confirmation] 用户折扣类型:', typeof this.userDiscount)
        } else {
          console.warn('⚠️ [Confirmation] 条件判断失败 - userInfo:', !!userInfo, ', discount:', userInfo?.discount)
          this.userDiscount = 1.0  // 默认无折扣
          console.warn('⚠️ [Confirmation] 用户没有折扣，使用默认值 1.0')
        }

        console.log('✅ [Confirmation] 订单数据加载完成')

      } catch (e) {
        console.error('❌ [Confirmation] loadOrder() 捕获异常:', e)
      }
    },
    // 计算商品小计（元）
    calculateSubtotal() {
      console.log('📊 [calculateSubtotal] 开始计算商品小计')
      if (!this.order.items || this.order.items.length === 0) {
        console.warn('⚠️ [calculateSubtotal] 没有订单项目')
        return '0.00'
      }
      let subtotalInFen = 0
      console.log('📊 [calculateSubtotal] 订单项目数:', this.order.items.length)
      for (let i = 0; i < this.order.items.length; i++) {
        const item = this.order.items[i]
        // 支持两种格式：本地购物车 (price) 和后端 OrderItem (priceSnapshot)
        const priceField = item.priceSnapshot !== undefined ? item.priceSnapshot : item.price
        const price = typeof priceField === 'string' ? parseInt(priceField) : priceField
        const quantity = item.quantity || 1
        const itemTotal = price * quantity
        subtotalInFen += itemTotal
        console.log(`📊 [calculateSubtotal] 项目${i}: 价格=${priceField}(字段:${item.priceSnapshot !== undefined ? 'priceSnapshot' : 'price'}) → 解析后=${price}, 数量=${quantity}, 小计=${itemTotal}fen`)
      }
      const result = (subtotalInFen / 100).toFixed(2)
      console.log('✅ [calculateSubtotal] 最终小计 (fen):', subtotalInFen, ', (yuan):', result)
      return result
    },

    // 计算折扣金额（元）
    calculateDiscountAmount() {
      const subtotal = parseFloat(this.calculateSubtotal())
      const discountAmount = subtotal * (1 - this.userDiscount)
      console.log('💰 [calculateDiscountAmount] 小计:', subtotal, ', 用户折扣倍数:', this.userDiscount, ', 折扣百分比:', (1 - this.userDiscount) * 100 + '%', ', 折扣金额:', discountAmount)
      return discountAmount.toFixed(2)
    },

    // 计算最终应付金额（元）
    calculateFinalAmount() {
      const subtotal = parseFloat(this.calculateSubtotal())
      const finalAmount = subtotal * this.userDiscount
      console.log('💳 [calculateFinalAmount] 小计:', subtotal, ', 用户折扣倍数:', this.userDiscount, ', 最终应付:', finalAmount)
      return finalAmount.toFixed(2)
    },
    formatPrice(price) {
      // 处理价格单位转换
      // 如果 price 是数字且大于 100，认为是分，需要除以 100
      // 否则认为已经是元
      if (typeof price === 'number' && price > 100) {
        return (price / 100).toFixed(2)
      } else if (typeof price === 'number') {
        return price.toFixed(2)
      } else if (typeof price === 'string') {
        return parseFloat(price).toFixed(2)
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

        .item-type {
          display: block;
          font-size: 20rpx;
          color: #ff6b35;
          font-weight: 500;
          margin-top: 4rpx;
        }

        .item-discount {
          display: block;
          font-size: 20rpx;
          color: #00b26a;
          font-weight: 500;
          margin-top: 2rpx;
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
      .fee-label {
        color: #ff6b6b;
      }

      .fee-value {
        color: #ff6b6b;
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
