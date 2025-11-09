<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="header-title">会员充值</text>
      <text class="header-subtitle">购买充值套餐享受VIP折扣优惠</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- 充值商品列表 -->
    <view v-else-if="rechargeProducts.length > 0" class="products-grid">
      <view v-for="product in rechargeProducts" :key="product.id" class="product-item" @tap="selectProduct(product)">
        <!-- 商品图片 -->
        <view class="product-image-wrapper">
          <image v-if="product.image" class="product-image" :src="product.image" mode="aspectFill"></image>
          <view v-else class="product-image-placeholder">
            <text class="placeholder-text">¥</text>
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="product-info">
          <!-- 标题 -->
          <text class="product-name">{{ product.name }}</text>

          <!-- 价格 -->
          <text class="product-price">¥{{ (product.price / 100).toFixed(2) }}</text>

          <!-- 折扣标签 -->
          <view v-if="product.discount && product.discount < 1.0" class="discount-badge">
            <text class="discount-text">{{ (product.discount * 10).toFixed(0) }}折</text>
          </view>
        </view>

        <!-- 购买按钮 -->
        <view class="product-action">
          <view class="buy-btn" @tap.stop="buyProduct(product)">
            <text>购买</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-text">暂无充值商品</text>
    </view>
  </view>
</template>

<script>
import { api } from '../../services/api'

export default {
  data() {
    return {
      loading: true,
      rechargeProducts: []
    }
  },
  onLoad() {
    this.loadRechargeProducts()
  },
  methods: {
    async loadRechargeProducts() {
      try {
        this.loading = true
        console.log('📦 [MemberRecharge] 开始加载充值商品')

        // 获取专门的会员充值产品列表
        const response = await api.get('/products/recharge')

        console.log('📦 [MemberRecharge] API 响应:', response)

        if (!response || !response.data) {
          console.warn('⚠️ [MemberRecharge] 产品列表为空')
          this.rechargeProducts = []
          this.loading = false
          return
        }

        // 直接使用返回的数据（已经是充值产品）
        const products = Array.isArray(response.data) ? response.data : []

        console.log('📦 [MemberRecharge] 充值商品总数:', products.length)
        console.log('📦 [MemberRecharge] 充值商品数据:', products)

        // 映射到前端格式
        const mapped = products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.currentPrice || 0, // 以分为单位
          image: p.coverImageUrl,
          description: p.subtitle,
          discount: parseFloat(p.discount) || 1.0,
          productType: p.productType
        }))

        console.log('✅ [MemberRecharge] 加载充值商品成功:', mapped)
        this.rechargeProducts = mapped || []

        if (mapped.length === 0) {
          console.warn('⚠️ [MemberRecharge] 未找到充值产品')
          uni.showToast({
            title: '暂无充值产品',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('❌ [MemberRecharge] 加载充值商品失败:', error)
        uni.showToast({
          title: error.message || '加载商品失败，请重试',
          icon: 'none'
        })
        this.rechargeProducts = []
      } finally {
        this.loading = false
      }
    },
    selectProduct(product) {
      console.log('📦 [MemberRecharge] 选择商品:', product)
      // 跳转到结算页面
      this.checkoutProduct(product)
    },
    buyProduct(product) {
      console.log('📦 [MemberRecharge] 购买商品:', product)
      this.checkoutProduct(product)
    },
    checkoutProduct(product) {
      // 保存要购买的充值产品到本地存储
      const rechargeOrder = {
        items: [
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price, // 已经是分
            quantity: 1,
            image: product.image,
            discount: product.discount
          }
        ],
        isRecharge: true // 标记为充值订单
      }

      try {
        uni.setStorageSync('buyNowOrder', rechargeOrder)
        console.log('✅ [MemberRecharge] 充值订单已保存到本地存储')
      } catch (e) {
        console.error('❌ [MemberRecharge] 保存充值订单失败:', e)
        uni.showToast({
          title: '保存订单失败，请重试',
          icon: 'none'
        })
        return
      }

      // 跳转到结算页面
      uni.navigateTo({
        url: '/pages/member-recharge/checkout',
        fail: () => {
          uni.showToast({
            title: '页面跳转失败',
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
  padding-bottom: 20rpx;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  background: #ffffff;
  padding: 32rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16rpx;

  .header-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 24rpx;
    color: #999999;
  }
}

/* 商品网格 - 一行两个 */
.products-grid {
  padding: 16rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

/* 商品项 */
.product-item {
  background: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:active {
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
    transform: scale(0.98);
  }
}

/* 商品图片容器 */
.product-image-wrapper {
  width: 100%;
  height: 180rpx;
  background: #f5f5f5;
  overflow: hidden;

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;

    .placeholder-text {
      color: #cccccc;
      font-size: 64rpx;
      font-weight: 300;
    }
  }
}

/* 商品信息 */
.product-info {
  padding: 12rpx 12rpx 8rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;

  .product-name {
    font-size: 24rpx;
    font-weight: 600;
    color: #000000;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    font-size: 28rpx;
    font-weight: 600;
    color: #ff6b35;
    margin: 4rpx 0;
  }

  .discount-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 4rpx 8rpx;
    background: #fff3e0;
    border-radius: 4rpx;

    .discount-text {
      font-size: 18rpx;
      font-weight: 600;
      color: #ff6b35;
    }
  }
}

/* 购买按钮容器 */
.product-action {
  padding: 10rpx 12rpx 12rpx;
}

.buy-btn {
  width: 100%;
  padding: 12rpx;
  background: #000000;
  color: #ffffff;
  border-radius: 4rpx;
  text-align: center;
  font-size: 22rpx;
  font-weight: 600;
  transition: background 0.2s ease;

  &:active {
    background: #333333;
  }
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  color: #999999;
  font-size: 28rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;

  .empty-text {
    color: #999999;
    font-size: 28rpx;
  }
}
</style>
