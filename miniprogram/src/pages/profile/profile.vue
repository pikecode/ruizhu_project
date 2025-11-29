<template>
  <view class="profile-page">
    <!-- 手机号授权弹窗 -->
    <phone-auth-modal
      :visible="showPhoneAuthModal"
      :on-success="handlePhoneAuthSuccess"
      :on-cancel="handlePhoneAuthCancel"
      @close="showPhoneAuthModal = false"
    ></phone-auth-modal>

    <!-- 轮播图区域（包含动画和其他banner） -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :indicator-color="indicatorColor"
        :indicator-active-color="indicatorActiveColor"
        :autoplay="false"
        :circular="false"
        @change="onSwiperChange"
      >
        <!-- 轮播项 -->
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <view class="banner-item">
            <!-- 视频类型的 banner -->
            <video
              v-if="banner.type === 'video' && banner.videoUrl"
              :src="banner.videoUrl"
              class="banner-video"
              controls="false"
              autoplay
              muted
              loop
            ></video>
            <!-- 图片类型的 banner （默认） -->
            <image
              v-else
              :src="banner.image"
              class="banner-image"
              mode="aspectFill"
            ></image>
            <view class="banner-text-overlay">
              <text class="banner-brand">YUNJIE</text>
              <view class="banner-welcome" v-if="userNickname">
              <view class="welcome-desc-row">
                <text class="welcome-desc">{{ userNickname }}{{ genderText }}，您好</text>
                <view class="welcome-actions">
                  <view class="action-icon edit" @tap="onEditProfile">
                    <text>✎</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 我的订单 -->
    <view class="orders-card">
      <view class="orders-header" >
        <text class="orders-title">我的订单</text>
        <!-- <text class="orders-arrow">→</text> -->
      </view>
      <view class="order-status-grid">
        <view
          v-for="(status, index) in orderStatuses"
          :key="index"
          class="order-status-item"
          @tap="onOrderStatusTap(status)"
        >
          <view class="status-icon-wrapper">
            <image class="status-icon" :src="status.icon" mode="aspectFit"></image>
          </view>
          <text class="status-label">{{ status.label }}</text>
        </view>
      </view>
    </view>

    <!-- 快速访问 -->
    <view class="quick-access-section">
      <view class="quick-access-item" @tap="onQuickAccessTap('wishlist')">
        <image class="quick-access-icon" src="/static/icons/quick-wishlist.svg" mode="aspectFit"></image>
        <text class="quick-access-label">我的心愿单</text>
      </view>
      <view class="quick-access-item" @tap="onQuickAccessTap('addresses')">
        <image class="quick-access-icon" src="/static/icons/quick-address.svg" mode="aspectFit"></image>
        <text class="quick-access-label">我的地址簿</text>
      </view>
    </view>

    <!-- 法律和授权 -->
    <view class="legal-access-section">
      <view class="legal-item" @tap="onLegalTap('terms')">
        <image class="legal-icon" src="/static/icons/legal-terms.svg" mode="aspectFit"></image>
        <text class="legal-label">法律条款</text>
      </view>
      <view class="legal-item" @tap="onLegalTap('privacy')">
        <image class="legal-icon" src="/static/icons/legal-privacy.svg" mode="aspectFit"></image>
        <text class="legal-label">个人信息授权</text>
      </view>
    </view>

    <!-- 账户操作 -->
    <view class="account-actions-section">
      <button
        :class="['account-button', authService.isLoggedIn() ? 'logout-mode' : 'login-mode']"
        @tap="handleAccountAction"
      >
        <text class="account-text">{{ authService.isLoggedIn() ? '退出登录' : '点击登陆' }}</text>
      </button>
    </view>

    <!-- 猜你喜欢推荐 -->
    <RecommendSection
      :items="recommendProducts"
      :columns="2"
      @product-tap="onProductTap"
      @favorite-change="onFavoriteChange"
      @favorite-need-auth="onFavoriteNeedAuth"
    />
  </view>
</template>

<script>
import RecommendSection from '../../components/RecommendSection.vue'
import PhoneAuthModal from '../../components/PhoneAuthModal.vue'
import { authService } from '../../services/auth'
import { collectionService } from '../../services/collection'
import wishlistService from '../../services/wishlist'
import { bannerService } from '../../services/banner'

export default {
  components: {
    RecommendSection,
    PhoneAuthModal
  },
  data() {
    return {
      authService, // 暴露 authService 给模板使用
      appVersion: '1.0.0',
      userGreeting: '',
      showPhoneAuthModal: false,
      pendingAction: null,
      userNickname: '',
      genderText: '',
      indicatorColor: 'rgba(255, 255, 255, 0.5)',
      indicatorActiveColor: '#ffffff',
      currentBannerIndex: 0,
      banners: [
      ],
      orderStatuses: [
        { id: 'pending', label: '待支付', icon: '/static/icons/order-pending-payment.svg' },
        { id: 'paid', label: '已支付', icon: '/static/icons/order-pending-shipment.svg' },
        { id: 'shipped', label: '已发货', icon: '/static/icons/order-shipped.svg' },
        { id: 'cancelled', label: '已取消', icon: '/static/icons/order-cancelled.svg' }
      ],
      recommendProducts: []
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadProfileBanners()
    this.loadRecommendedProducts()
  },
  onShow() {
    // 每次显示页面时重新加载用户信息、推荐商品和轮播图
    this.loadUserInfo()
    this.loadProfileBanners()
    this.loadRecommendedProducts()
  },
  methods: {
    /**
     * 加载用户信息（从localStorage）
     * 更新显示用户昵称和性别的数据
     */
    loadUserInfo() {
      try {
        const userStr = uni.getStorageSync('user')
        if (userStr) {
          const user = typeof userStr === 'string' ? JSON.parse(userStr) : userStr

          // 只有当有昵称时才设置，否则保持空字符串以隐藏问候语
          if (user.nickname) {
            this.userNickname = user.nickname

            // 将性别枚举值转换为中文文本
            const genderMap = {
              'male': '先生',
              'female': '女士',
              'unknown': '先生'
            }
            this.genderText = genderMap[user.gender] || '先生'

            console.log(`👤 [Profile] 已加载用户信息: ${this.userNickname}${this.genderText}`)
          } else {
            // 没有昵称时清空数据，隐藏问候语
            this.userNickname = ''
            this.genderText = ''
            console.log('ℹ️ [Profile] 用户未设置昵称，隐藏问候语')
          }
        } else {
          // 未登陆时清空数据
          this.userNickname = ''
          this.genderText = ''
          console.log('ℹ️ [Profile] 未找到用户信息，隐藏问候语')
        }
      } catch (error) {
        console.error('❌ [Profile] 加载用户信息失败:', error)
        // 加载失败时清空数据，隐藏问候语
        this.userNickname = ''
        this.genderText = ''
      }
    },
    /**
     * 加载个人页面的轮播图数据（从admin维护的profile-banners）
     */
    async loadProfileBanners() {
      try {
        console.log('📊 [Profile] 开始加载 profile banners...')
        console.log('📊 [Profile] 当前默认 banners 数量:', this.banners.length)

        const response = await bannerService.getBanners(1, 100, 'profile')
        console.log('📊 [Profile] API 返回响应:', response)

        if (response && response.items && Array.isArray(response.items) && response.items.length > 0) {
          console.log('📊 [Profile] API 返回了', response.items.length, '条 banner 数据')

          // 筛选启用的 banner，并按 sortOrder 排序
          const activeBanners = response.items
            .filter(banner => banner.isActive === true)
            .sort((a, b) => a.sortOrder - b.sortOrder)

          console.log('📊 [Profile] 筛选后的活跃 banner 数量:', activeBanners.length)

          // 将 banner 数据映射到 swiper 格式 - 完全替换原有数据
          const newBanners = activeBanners.map(banner => ({
            id: banner.id,
            image: bannerService.getDisplayUrl(banner),
            title: banner.mainTitle,
            subtitle: banner.subtitle,
            type: banner.type,
            videoUrl: banner.videoUrl,
            linkType: banner.linkType,
            linkValue: banner.linkValue
          }))

          // 使用 this.$set 确保数据完全替换
          this.$set(this, 'banners', newBanners)

          console.log('✅ [Profile] 已加载 profile banners:', this.banners.length, '条')
          console.log('✅ [Profile] 最终 banners 数据:', this.banners)
        } else {
          console.warn('⚠️ [Profile] API 返回数据不可用，保留默认数据')
          console.log('📊 [Profile] response:', response)
          console.log('📊 [Profile] response.items:', response?.items)
          console.log('📊 [Profile] response.items length:', response?.items?.length)
        }
      } catch (error) {
        console.error('❌ [Profile] 加载 profile banners 失败:', error)
        console.error('❌ [Profile] 错误堆栈:', error.stack)
        // 加载失败时保持原有的默认数据
      }
    },

    /**
     * 加载推荐商品（与购物车页面相同）
     */
    async loadRecommendedProducts() {
      try {
        console.log('📦 [Profile] 开始加载推荐商品...')
        const collectionData = await collectionService.getCollectionBySlug('guess-you-like')

        console.log('📦 [Profile] API 返回的 collectionData:', collectionData)
        console.log('📦 [Profile] collectionData.products:', collectionData?.products)
        console.log('📦 [Profile] products 数量:', collectionData?.products?.length)

        if (collectionData && collectionData.products && collectionData.products.length > 0) {
          console.log('📦 [Profile] 开始映射 products，共', collectionData.products.length, '个')

          this.recommendProducts = collectionData.products.map(product => ({
            id: product.id,
            name: product.name,
            image: product.coverImageUrl,
            price: product.currentPrice, // API返回的价格以分为单位
            originalPrice: product.originalPrice,
            discountRate: product.discountRate,
            isNew: product.isNew,
            isSaleOn: product.isSaleOn,
            imageCount: 1, // RecommendSection组件需要此字段
            isFavorite: false, // 初始化收藏状态
            stockQuantity: product.stockQuantity || 0,
            isSold: product.stockQuantity <= 0
          }))

          console.log('✅ [Profile] 映射完成，推荐商品数量:', this.recommendProducts.length)
          console.log('✅ [Profile] 第一个推荐商品:', this.recommendProducts[0])

          // 加载推荐商品的收藏状态
          await this.loadRecommendedProductsFavoriteStatus()
        } else {
          console.warn('⚠️ [Profile] collectionData 为空或没有 products:', collectionData)
          this.recommendProducts = []
        }
      } catch (error) {
        console.error('❌ [Profile] 加载推荐商品失败:', error)
        console.error('❌ [Profile] 错误堆栈:', error.stack)
        this.recommendProducts = []
      }
    },

    /**
     * 加载推荐商品的收藏状态
     */
    async loadRecommendedProductsFavoriteStatus() {
      try {
        // 只有已登陆的用户才能加载收藏状态
        if (!authService.isLoggedIn()) {
          console.log('ℹ️ [Profile] 未登陆，跳过加载收藏状态')
          return
        }

        const productIds = this.recommendProducts.map(p => p.id)
        console.log('🔍 [Profile] 检查收藏状态 - 产品IDs:', productIds)
        if (productIds.length === 0) return

        const favoriteStatus = await wishlistService.checkMultipleWishlists(productIds)
        console.log('📡 [Profile] API返回的收藏状态:', favoriteStatus)

        // 更新推荐商品的收藏状态
        this.recommendProducts.forEach((product, index) => {
          const isFavorite = favoriteStatus[product.id] || false
          console.log(`💖 [Profile] 产品 ${product.id} (${product.name}) 收藏状态: ${isFavorite}`)
          this.$set(this.recommendProducts[index], 'isFavorite', isFavorite)
        })

        console.log('✅ [Profile] 最终推荐商品数据:', this.recommendProducts.map(p => ({ id: p.id, name: p.name, isFavorite: p.isFavorite })))
      } catch (error) {
        console.error('❌ [Profile] 加载收藏状态失败:', error)
        // 加载失败，保持初始值（全部未收藏）
      }
    },
    onSwiperChange(e) {
      this.currentBannerIndex = e.detail.current
    },
    onOrderStatusTap(status) {
      // 检查是否已登陆
      if (!authService.isLoggedIn()) {
        this.pendingAction = { type: 'statusTab', status: status.id }
        this.showPhoneAuthModal = true
        return
      }
      uni.navigateTo({
        url: `/pages/orders/orders?status=${status.id}`
      })
    },
    goToOrders(type) {
      // 检查是否已登陆
      if (!authService.isLoggedIn()) {
        this.pendingAction = { type: 'allOrders', status: type }
        this.showPhoneAuthModal = true
        return
      }
      uni.navigateTo({
        url: `/pages/orders/orders?status=${type}`
      })
    },
    /**
     * 手机号授权成功回调
     */
    handlePhoneAuthSuccess() {
      console.log('📱 [Profile] 手机号授权成功')

      // 刷新页面信息：重新加载用户信息、轮播图和推荐商品
      this.loadUserInfo()
      this.loadProfileBanners()
      this.loadRecommendedProducts()

      // 执行待执行的操作
      const action = this.pendingAction
      this.pendingAction = null

      if (action?.type === 'statusTab') {
        uni.navigateTo({
          url: `/pages/orders/orders?status=${action.status}`
        })
      } else if (action?.type === 'allOrders') {
        uni.navigateTo({
          url: `/pages/orders/orders?status=${action.status}`
        })
      } else if (action?.type === 'wishlist') {
        uni.navigateTo({
          url: '/pages/wishlist/wishlist'
        })
      } else if (action?.type === 'addresses') {
        uni.navigateTo({
          url: '/pages/addresses/addresses'
        })
      } else if (action?.type === 'authorization') {
        uni.navigateTo({
          url: '/pages/legal/authorization'
        })
      } else if (action?.type === 'favorite') {
        // 收藏操作：重新加载推荐商品后，自动收藏
        // 由于 loadRecommendedProducts 已在上面调用，收藏状态会自动更新
        console.log('💖 [Profile] 用户登陆成功，推荐商品已重新加载并更新收藏状态')
      } else {
        // 如果没有待执行的操作，说明是直接点击登陆按钮
        // 保持在当前页面，页面已经刷新显示已登陆状态
        console.log('📱 [Profile] 用户已成功登陆，页面信息已刷新')
      }
    },
    /**
     * 手机号授权取消回调
     */
    handlePhoneAuthCancel() {
      console.log('📱 [Profile] 用户取消了手机号授权')
      this.pendingAction = null
    },
    onQuickAccessTap(type) {
      // 检查是否已登陆
      if (!authService.isLoggedIn()) {
        // 未登陆时根据类型设置待执行操作
        if (type === 'wishlist') {
          this.pendingAction = { type: 'wishlist' }
        } else if (type === 'addresses') {
          this.pendingAction = { type: 'addresses' }
        }
        this.showPhoneAuthModal = true
        return
      }

      // 已登陆时直接导航
      if (type === 'wishlist') {
        uni.navigateTo({
          url: '/pages/wishlist/wishlist'
        })
      } else if (type === 'addresses') {
        uni.navigateTo({
          url: '/pages/addresses/addresses'
        })
      }
    },
    onLegalTap(type) {
      // 检查是否已登陆（个人信息授权需要登陆）
      if (type === 'privacy' && !authService.isLoggedIn()) {
        this.pendingAction = { type: 'authorization' }
        this.showPhoneAuthModal = true
        return
      }

      // 法律条款不需要登陆，直接导航
      if (type === 'terms') {
        uni.navigateTo({
          url: '/pages/legal/legal'
        })
      } else if (type === 'privacy') {
        uni.navigateTo({
          url: '/pages/legal/authorization'
        })
      }
    },
    onProductTap(item) {
      // 保存推荐商品信息用于详情页
      try {
        uni.setStorageSync('selectedProduct', item)
      } catch (e) {
        console.error('Failed to save product:', e)
      }

      // 传递产品ID作为URL参数
      uni.navigateTo({
        url: `/pages/product/detail?id=${item.id}`
      })
    },
    onFavoriteChange({ index, isFavorite }) {
      const status = isFavorite ? '已收藏' : '已移除'
      uni.showToast({
        title: status,
        icon: 'none',
        duration: 1000
      })
    },
    /**
     * 处理推荐商品收藏时需要授权的情况
     */
    onFavoriteNeedAuth({ index, item }) {
      console.log('❤️ [Profile] 未登陆用户试图收藏商品:', item.name)
      // 设置待执行操作为收藏，登陆后触发收藏
      this.pendingAction = { type: 'favorite', index: index }
      // 显示手机号授权弹窗
      this.showPhoneAuthModal = true
    },
    onEditProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    },
    /**
     * 处理账户操作（登陆或退出登录）
     */
    handleAccountAction() {
      if (authService.isLoggedIn()) {
        // 已登陆 - 执行退出登录
        this.handleLogout()
      } else {
        // 未登陆 - 显示手机号授权登陆弹窗
        this.showPhoneAuthModal = true
      }
    },

    /**
     * 退出登录
     */
    async handleLogout() {
      // Show confirmation dialog
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？退出后需要重新授权',
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            // Perform logout
            try {
              await authService.logout()
              uni.showToast({
                title: '已退出登录',
                icon: 'success',
                duration: 1000
              })

              // 刷新页面信息：清空用户信息并重新加载推荐商品（移除收藏状态）
              this.loadUserInfo()
              this.loadProfileBanners()
              this.loadRecommendedProducts()
              console.log('🚪 [Profile] 已退出登录，页面信息已刷新，推荐商品已重新加载')
            } catch (error) {
              console.error('Logout failed:', error)
              uni.showToast({
                title: '退出登录失败',
                icon: 'none',
                duration: 1000
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.profile-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
}

/* 轮播图区域 */
.banner-section {
  width: 100%;
  height: 920rpx;

  .banner-swiper {
    width: 100%;
    height: 100%;
  }

  .banner-item {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .banner-image {
    width: 100%;
    height: 100%;
  }

  .banner-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-text-overlay {
    position: absolute;
    bottom: 100rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;

    .banner-brand {
      display: block;
      font-size: 56rpx;
      font-weight: 500;
      color: #ffffff;
      letter-spacing: 2rpx;
      margin-bottom: 20rpx;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    }

    .banner-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;

      .welcome-desc-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12rpx;

        .welcome-desc {
          display: block;
          font-size: 28rpx;
          color: #ffffff;
          letter-spacing: 1rpx;
        }
        .welcome-actions {
          display: flex;
          align-items: center;

          .action-icon {
            width: 44rpx;
            height: 44rpx;
            border-radius: 50%;
            border: 1rpx solid rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 12rpx;
            transition: opacity 0.2s;

            text {
              color: #ffffff;
              font-size: 24rpx;
            }

            &:active {
              opacity: 0.8;
            }
          }
        }

      }
    }
  }
}

/* 我的订单卡片 */
.orders-card {
  margin: 0 40rpx;
  margin-top: -80rpx;
  background: #ffffff; 
  padding: 32rpx 24rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1px solid #f0f0f0;

    .orders-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #000000;
    }

    .orders-arrow {
      display: block;
      font-size: 32rpx;
      color: #000000;
      font-weight: 300;
    }
  }

  .order-status-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;

    .order-status-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rpx;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }

      .status-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 88rpx;
        height: 88rpx;

        .status-icon {
          width: 56rpx;
          height: 56rpx;
          display: block;
        }
      }

      .status-label {
        display: block;
        font-size: 22rpx;
        color: #333333;
        text-align: center;
        font-weight: 400;
      }

      &:active .status-icon-wrapper {
        opacity: 0.8;
      }
    }
  }
}

/* 快速访问区域 */
.quick-access-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 40rpx 40rpx 0;
  margin-top: 32rpx;

  .quick-access-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 24rpx;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 8rpx;
    cursor: pointer;

    &:active {
      background: #f9f9f9;
      border-color: #000000;
    }

    .quick-access-icon {
      width: 72rpx;
      height: 72rpx;
      display: block;
      margin-bottom: 16rpx;
    }

    .quick-access-label {
      display: block;
      font-size: 26rpx;
      color: #333333;
      font-weight: 400;
      text-align: center;
    }
  }
}

/* 法律授权区域 */
.legal-access-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 0 40rpx;
  margin-top: 20rpx;
  margin-bottom: 40rpx;

  .legal-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 24rpx;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 8rpx;
    cursor: pointer;

    &:active {
      background: #f9f9f9;
      border-color: #000000;
    }

    .legal-icon {
      width: 72rpx;
      height: 72rpx;
      display: block;
      margin-bottom: 16rpx;
    }

    .legal-label {
      display: block;
      font-size: 26rpx;
      color: #333333;
      font-weight: 400;
      text-align: center;
    }
  }
}

/* 账户操作区域 */
.account-actions-section {
  padding: 0 40rpx;
  margin-top: 60rpx;
  margin-bottom: 40rpx;

  .account-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 18rpx 0;
    border-radius: 8rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    .account-text {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      letter-spacing: 1rpx;
    }

    /* 退出登录模式 - 已登陆，显示退出登录 */
    &.logout-mode {
      background: #ffffff;
      border: 2px solid #d0d0d0;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .account-text {
        color: #333333;
      }

      &:active {
        background: #f5f5f5;
        border-color: #b0b0b0;
        box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.12);
      }
    }

    /* 登陆模式 - 未登陆，显示登陆 */
    &.login-mode {
      background: #ffffff;
      border: 2px solid #d0d0d0;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .account-text {
        color: #333333;
      }

      &:active {
        background: #f5f5f5;
        border-color: #b0b0b0;
        box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.12);
      }
    }
  }
}

</style>
