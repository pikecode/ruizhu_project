<template>
  <view class="explore-page">
    <!-- 产品展示卡片 -->
    <view class="product-card">
      <!-- 轮播部分 -->
      <swiper
        class="product-swiper"
        :indicator-dots="true"
        :indicator-active-color="'#000000'"
        :indicator-color="'rgba(0,0,0,0.3)'"
        :autoplay="false"
        :circular="false"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(s, i) in heroSlides" :key="i">
          <view class="product-image-container">
            <!-- 视频展示 -->
            <video
              v-if="s.type === 'video' && s.videoUrl"
              class="banner-video"
              :src="s.videoUrl"
              autoplay
              muted
              loop
            ></video>
            <!-- 图片展示 -->
            <image
              v-else
              class="product-img"
              :src="s.image"
              mode="aspectFill"
            ></image>
             
          </view>
        </swiper-item>
      </swiper>

      <!-- 描述部分 -->
      <view class="product-desc-section" v-if="currentSlideData && currentSlideData.mainTitle">
        <text class="product-desc-title">{{ currentSlideData.mainTitle }}</text>
        <view class="product-desc-divider"></view>
        <text class="product-desc-text">{{ currentSlideData.description || '品质卓越的精选商品' }}</text>
      </view>
    </view>

    <!-- 风格灵感模块 -->
    <view class="style-section">
      <text class="style-title">{{ styleCollectionTitle }}</text>

      <!-- 风格卡片轮播 -->
      <swiper
        v-if="styleCards.length > 0"
        class="style-swiper"
        :indicator-dots="true"
        :indicator-active-color="'#000000'"
        :indicator-color="'rgba(0,0,0,0.3)'"
        :autoplay="false"
        :circular="styleCards.length > 1"
        @change="onStyleCardChange"
      >
        <swiper-item v-for="card in styleCards" :key="card.id" class="style-swiper-item">
          <view class="style-container">
            <!-- 左侧：风格卡片大图 -->
            <view class="style-left">
              <image
                v-if="card.coverImageUrl"
                class="style-card-image"
                :src="card.coverImageUrl"
                mode="aspectFill"
              ></image>
              <view v-else class="style-card-placeholder">
                <text>图片加载中...</text>
              </view>
            </view>

            <!-- 右侧：产品列表 -->
            <scroll-view class="style-right" scroll-y>
              <view v-if="card.products && card.products.length > 0" class="style-products-list">
                <view v-for="product in card.products" :key="product.id" class="product-item" @tap="goToProductDetail(product.id)">
                  <view class="product-item-image">
                    <image
                      v-if="product.image"
                      class="product-item-img"
                      :src="product.image"
                      mode="aspectFill"
                    ></image>
                    <view v-else class="product-item-placeholder">无图</view>
                  </view>
                  <view class="product-item-info">
                    <text class="product-item-name">{{ product.name }}</text>
                    <text class="product-item-price">¥{{ product.price }}</text>
                  </view>
                </view>
              </view>
              <view v-else class="empty-products">
                <text>暂无产品</text>
              </view>
            </scroll-view>
          </view>
        </swiper-item>
      </swiper>

      <!-- 探索更多按钮 -->
      <view class="style-action" @tap="onExploreStyleMore">
        <text>探索更多</text>
      </view>

      <!-- 返回首页按钮 -->
      <view class="back-home-btn" @tap="backToHome">
        <text>返回首页</text>
      </view>
    </view>
  </view>
  </template>

<script>
import { bannerService } from '../../services/banner'
import { arrayCollectionService } from '../../services/arrayCollection'

export default {
  data() {
    return {
      currentSlide: 0,
      styleGender: 'female',
      heroSlides: [],
      isLoadingBanners: true,
      styleCards: [],
      currentStyleCardIndex: 0,
      styleCollectionTitle: '风格灵感'
    }
  },
  onLoad() {
    this.loadFeaturedBanners()
    this.loadStyleInspiration()
  },
  computed: {
    currentSlideData() {
      // 默认对象
      const defaultData = {
        id: 'default',
        type: 'image',
        image: '',
        videoUrl: '',
        title: '精选系列',
        mainTitle: '精选系列',
        price: '',
        description: '加载中...'
      }

      // 防守：确保 heroSlides 不为空
      if (!this.heroSlides || this.heroSlides.length === 0) {
        return defaultData
      }

      const data = this.heroSlides[this.currentSlide] || this.heroSlides[0]

      // 确保返回的对象有所有需要的字段
      if (!data) {
        return defaultData
      }

      return {
        ...defaultData,
        ...data
      }
    },
    currentStyleCard() {
      if (this.styleCards.length === 0) return null
      return this.styleCards[this.currentStyleCardIndex] || this.styleCards[0]
    },
    currentStyleProducts() {
      const card = this.currentStyleCard
      if (!card || !card.products) return []
      return card.products
    }
  },
  methods: {
    /**
     * 加载风格灵感数据集合
     */
    async loadStyleInspiration() {
      try {
        console.log('📡 [Explore] 正在加载风格灵感数据...')

        const collection = await arrayCollectionService.getArrayCollectionBySlug('style-inspiration')
        console.log('📡 [Explore] 获取到数据集合:', collection)

        if (collection && collection.items && collection.items.length > 0) {
          // 获取集合的标题
          this.styleCollectionTitle = collection.title || '风格灵感'

          // 直接使用 items 作为风格卡片，并映射每个卡片内的产品
          this.styleCards = collection.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            coverImageUrl: item.coverImageUrl,
            sortOrder: item.sortOrder,
            products: (item.products || []).map(product => ({
              id: product.id,
              name: product.name,
              category: product.category || '商品',
              // currentPrice 是以分为单位的整数，需要转换为元
              price: product.currentPrice ? `${(product.currentPrice / 100).toFixed(2)}` : '0',
              image: product.coverImageUrl || ''
            }))
          }))

          console.log('✅ [Explore] 成功加载风格灵感数据', {
            title: this.styleCollectionTitle,
            cardCount: this.styleCards.length,
            totalProducts: this.styleCards.reduce((sum, card) => sum + (card.products?.length || 0), 0)
          })
        } else {
          console.warn('⚠️ [Explore] 没有获取到风格灵感数据')
        }
      } catch (error) {
        console.error('❌ [Explore] 加载风格灵感数据失败:', error)
      }
    },

    /**
     * 加载 featured banner 数据
     */
    async loadFeaturedBanners() {
      try {
        this.isLoadingBanners = true
        console.log('📡 [Explore] 正在加载 featured banner 数据...')

        const response = await bannerService.getBanners(1, 100, 'featured')
        console.log('📡 [Explore] 获取到 banner 数据:', response)

        if (response && response.items && response.items.length > 0) {
          // 过滤启用的 banner 并转换数据结构
          this.heroSlides = response.items
            .filter(banner => banner.isActive === true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(banner => ({
              id: banner.id,
              type: banner.type, // 'image' 或 'video'
              image: banner.imageUrl || '',
              videoUrl: banner.videoUrl || '',
              title: banner.mainTitle,
              mainTitle: banner.mainTitle,
              price: banner.subtitle || '',
              description: banner.description || '精选系列商品，品质卓越'
            }))

          console.log('✅ [Explore] 成功加载', this.heroSlides.length, '个 featured banner')
        } else {
          console.warn('⚠️ [Explore] 没有获取到 featured banner 数据，使用默认数据')
          // 保持默认数据
          this.heroSlides = [
            {
              id: 'default-1',
              type: 'image',
              image: '/static/images/product/120251017222238.jpg',
              videoUrl: '',
              title: 'Re-Nylon双肩背包',
              mainTitle: 'Re-Nylon双肩背包',
              price: '21,800',
              description: '四十多年来的经典风格象征以其作为灵感，重新设计出引人注目的新款式，采用新材料和色彩搭配。'
            },
            {
              id: 'default-2',
              type: 'image',
              image: '/static/images/product/120251017222229.jpg',
              videoUrl: '',
              title: 'Re-Nylon双肩背包',
              mainTitle: 'Re-Nylon双肩背包',
              price: '21,800',
              description: '轻量材质与容量平衡，满足日常通勤与短途出行需求，延续品牌经典语汇。'
            },
            {
              id: 'default-3',
              type: 'image',
              image: '/static/images/product/120251017222242.jpg',
              videoUrl: '',
              title: 'Re-Nylon与牛皮革拼接',
              mainTitle: 'Re-Nylon与牛皮革拼接',
              price: '28,700',
              description: '精选皮革拼接 Re‑Nylon，强化层次与触感，兼顾耐用与质感。'
            }
          ]
        }
      } catch (error) {
        console.error('❌ [Explore] 加载 featured banner 失败:', error)
        // 加载失败时使用默认数据
        if (this.heroSlides.length === 0) {
          this.heroSlides = [
            {
              id: 'default-1',
              type: 'image',
              image: '/static/images/product/120251017222238.jpg',
              videoUrl: '',
              title: 'Re-Nylon双肩背包',
              mainTitle: 'Re-Nylon双肩背包',
              price: '21,800',
              description: '四十多年来的经典风格象征以其作为灵感，重新设计出引人注目的新款式，采用新材料和色彩搭配。'
            }
          ]
        }
      } finally {
        this.isLoadingBanners = false
      }
    },
    onSwiperChange(e) {
      this.currentSlide = e.detail.current || 0
    },
    onExploreNow() {
      uni.switchTab({ url: '/pages/category/category' })
    },
    goSlide(idx) {
      this.currentSlide = idx
    },
    onSeriesTap(card) {
      uni.showToast({ title: card.title, icon: 'none' })
    },
    onBuyNow() {
      const s = this.heroSlides[this.currentSlide]
      if (!s) return
      const toPlain = (val) => String(val).replace(/,/g, '')
      const item = {
        id: `hero-${this.currentSlide + 1}`,
        name: s.title,
        category: '背包',
        price: toPlain(s.price),
        image: s.image,
        quantity: 1
      }
      try {
        const pending = uni.getStorageSync('pendingCartItems') || []
        pending.push(item)
        uni.setStorageSync('pendingCartItems', pending)
      } catch (e) {}
      uni.switchTab({ url: '/pages/cart/cart' })
    },
    addToCart(product) {
      const toPlain = (val) => String(val).replace(/,/g, '')
      const item = {
        id: product.id,
        name: product.name,
        category: product.category,
        price: toPlain(product.price),
        image: product.image,
        quantity: 1
      }
      try {
        const pending = uni.getStorageSync('pendingCartItems') || []
        pending.push(item)
        uni.setStorageSync('pendingCartItems', pending)
        uni.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1500
        })
      } catch (e) {
        uni.showToast({
          title: '添加失败，请重试',
          icon: 'none'
        })
      }
    },
    onExploreStyleMore() {
      uni.switchTab({ url: '/pages/category/category' })
    },
    backToHome() {
      uni.switchTab({ url: '/pages/index/index' })
    },
    onImageLoadError(e) {
      console.warn('⚠️ [Explore] 图片加载失败:', e)
    },
    onStyleCardChange(e) {
      this.currentStyleCardIndex = e.detail.current || 0
    },
    goToProductDetail(productId) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${productId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.explore-page {
  min-height: 100vh;
  background: #e8dcc8;
  padding: 24rpx 24rpx 120rpx;
}

/* 原hero轮播样式 */
.hero-swiper { height: 760rpx; margin-bottom: 24rpx; }

.hero-card {
  position: relative;
  border: none;
  border-radius: 8rpx;
  overflow: hidden;
  background: transparent;
}

.hero-image { width: 100%; height: 760rpx; }

.hero-overlay {
  position: absolute;
  left: 40rpx; top: 60rpx;
  display: flex; flex-direction: column; gap: 16rpx;
}
.hero-title { font-size: 36rpx; font-weight: 700; color: #000; }
.hero-price { font-size: 30rpx; color: #000; margin-top: 4rpx; }
.hero-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.hero-cta, .hero-buy { padding: 14rpx 28rpx; border: 4rpx solid #000; border-radius: 6rpx; width: fit-content; background: rgba(255,255,255,0.85); }
.hero-buy { background: #000; color: #fff; border-color: #000; }
.hero-cta:active, .hero-buy:active { opacity: 0.85; }

/* 产品展示卡片 */
.product-card {
  margin: 40rpx 0;
  background: #ffffff;
  border-radius: 8rpx;
  overflow: visible;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.product-swiper {
  height: 580rpx;
  width: 100%;
  border-radius: 8rpx;
  position: relative;
  overflow: visible;
}

.product-swiper ::v-deep .wx-swiper-dots {
  position: absolute;
  right: auto;
  left: 420rpx;
  bottom: -150rpx;
  top: auto;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 0;
  width: auto;
  z-index: 999;
}

.product-swiper ::v-deep .wx-swiper-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  margin: 0;
}

.product-swiper ::v-deep .wx-swiper-dot.active {
  background-color: #000000;
  width: 10rpx;
  height: 10rpx;
}

.product-image-container {
  position: relative;
  height: 580rpx;
  width: 100%;
  background: #ffd54d;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.banner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #ffd54d;
}
 

.product-desc-section {
  position: absolute;
  bottom: -210rpx;
  left: 0;
  width: 400rpx;
  padding: 40rpx;
  height: 240rpx;
  background: #ffffff;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.product-desc-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #000;
  margin-bottom: 12rpx;
  flex-shrink: 0;
}

.product-desc-divider {
  width: 60rpx;
  height: 3rpx;
  background: #000;
  margin-bottom: 16rpx;
  border-radius: 2rpx;
  flex-shrink: 0;
}

.product-desc-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  letter-spacing: 0.5rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 风格灵感模块 */
.style-section {
  margin-top: 280rpx;
  padding: 0;
}

.style-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #000;
  text-align: center;
  margin-bottom: 40rpx;
  letter-spacing: 2rpx;
}

.style-tabs {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  margin-bottom: 40rpx;
}

.style-tab {
  position: relative;
  padding: 16rpx 0;
  cursor: pointer;
  transition: all 0.2s ease;

  text {
    font-size: 32rpx;
    color: #999;
    font-weight: 500;
  }

  &.active {
    text {
      color: #000;
      font-weight: 600;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -8rpx;
      left: 0;
      right: 0;
      height: 3rpx;
      background: #000;
      border-radius: 2rpx;
    }
  }
}

/* 风格灵感轮播 */
.style-swiper {
  height: 730rpx;
  margin-bottom: 40rpx;
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
}

.style-swiper-item {
  width: 100%;
  height: 100%;
}

/* 风格灵感布局 */
.style-container {
  display: flex;
  gap: 16rpx;
  height: 100%;
  width: 100%;
  background: #fff;
}

.style-left {
  width: 45%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.style-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  color: #999;
  font-size: 24rpx;
}

.style-right {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.style-products-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 16rpx;
}

.product-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 12rpx;
  background: #f9f9f9;
  border-radius: 6rpx;
  cursor: pointer;
  transition: background 0.2s;
}

.product-item:active {
  background: #f0f0f0;
}

.product-item-image {
  width: 100%;
  height: 160rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-item-placeholder {
  font-size: 20rpx;
  color: #999;
}

.product-item-info {
  display: flex;
  flex-direction: row;
  gap: 8rpx;
  align-items: center;
  justify-content: space-between;
}

.product-item-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #000;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-item-price {
  font-size: 22rpx;
  color: #ff6b35;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

.empty-products {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  color: #999;
  font-size: 24rpx;
}

.style-action {
  height: 80rpx;
  background: #000;
  color: #fff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  cursor: pointer;
  margin: 0 40rpx 32rpx;

  &:active {
    background: #333;
  }
}

.back-home-btn {
  height: 72rpx;
  background: transparent;
  color: #000;
  border: 2rpx solid #000;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  cursor: pointer;
  margin: 0 40rpx 40rpx;

  &:active {
    background: #f5f5f5;
  }
}
</style>
