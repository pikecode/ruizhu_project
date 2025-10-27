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
            <image class="product-img" :src="s.image" mode="aspectFill"></image>
            <view class="product-info-overlay">
              <text class="product-info-name">{{ s.title }}</text>
              <text class="product-info-price">¥ {{ s.price }}</text>
              <view class="product-info-action" @tap="onExploreNow">
                <text>即刻探索</text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- 描述部分 -->
      <view class="product-desc-section">
        <text class="product-desc-title">{{ currentSlideData.descTitle }}</text>
        <view class="product-desc-divider"></view>
        <text class="product-desc-text">{{ currentSlideData.desc }}</text>
      </view>
    </view>

    <!-- 风格灵感模块 -->
    <view class="style-section">
      <text class="style-title">风格灵感</text>

      <!-- 选项卡切换 -->
      <view class="style-tabs">
        <view
          class="style-tab"
          :class="{ active: styleGender === 'female' }"
          @tap="changeGender('female')"
        >
          <text>女士</text>
        </view>
        <view
          class="style-tab"
          :class="{ active: styleGender === 'male' }"
          @tap="changeGender('male')"
        >
          <text>男士</text>
        </view>
      </view>

      <!-- 产品轮播 -->
      <swiper
        class="style-swiper"
        :indicator-dots="true"
        :indicator-active-color="'#ffffff'"
        :indicator-color="'rgba(255,255,255,0.4)'"
        :autoplay="false"
        :circular="true"
        @change="onStyleSwiperChange"
      >
        <swiper-item v-for="(product, idx) in currentStyleProducts" :key="idx">
          <view class="style-product" @tap="addToCart(product)">
            <image class="style-product-image" :src="product.image" mode="aspectFill"></image>
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
export default {
  data() {
    return {
      currentSlide: 0,
      currentStyleSlide: 0,
      styleGender: 'female',
      heroSlides: [
        {
          image: '/static/images/product/120251017222238.jpg',
          title: 'Re-Nylon双肩背包',
          price: '21,800',
          descTitle: 'Prada双肩包',
          desc: '四十多年来的经典风格象征以其作为灵感，重新设计出引人注目的新款式，采用新材料和色彩搭配。'
        },
        {
          image: '/static/images/product/120251017222229.jpg',
          title: 'Re-Nylon双肩背包',
          price: '21,800',
          descTitle: '都市出行之选',
          desc: '轻量材质与容量平衡，满足日常通勤与短途出行需求，延续品牌经典语汇。'
        },
        {
          image: '/static/images/product/120251017222242.jpg',
          title: 'Re-Nylon与牛皮革拼接',
          price: '28,700',
          descTitle: '高级拼接系列',
          desc: '精选皮革拼接 Re‑Nylon，强化层次与触感，兼顾耐用与质感。'
        }
      ],
      seriesCards: [
        {
          image: '/static/images/product/120251017184201.jpg',
          title: '城市系列',
          sub: '轻盈耐磨 · 通勤之选',
          slideIndex: 0
        },
        {
          image: '/static/images/product/120251017184212.jpg',
          title: '旅行系列',
          sub: '大容量 · 多口袋设计',
          slideIndex: 1
        },
        {
          image: '/static/images/product/120251017184205.jpg',
          title: '经典系列',
          sub: '标志元素 · 百搭配色',
          slideIndex: 2
        },
        {
          image: '/static/images/product/120251017184219.jpg',
          title: '限定系列',
          sub: '限量配色 · 特别徽标',
          slideIndex: 2
        }
      ],
      femaleProducts: [
        {
          id: 'female-1',
          name: 'Re-Nylon风雨羽绒夹克',
          category: '夹克',
          price: '25,400',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&q=80'
        },
        {
          id: 'female-2',
          name: '徽标饰流苏边巾',
          category: '配件',
          price: '5,550',
          image: 'https://images.unsplash.com/photo-1520903074185-8ebb4ee87b84?w=500&q=80'
        },
        {
          id: 'female-3',
          name: '牛皮革靴',
          category: '靴类',
          price: '15,700',
          image: 'https://images.unsplash.com/photo-1548062407-f961713e6786?w=500&q=80'
        },
        {
          id: 'female-4',
          name: '编织手提包',
          category: '手袋',
          price: '18,900',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80'
        },
        {
          id: 'female-5',
          name: '皮质腰带',
          category: '配件',
          price: '8,800',
          image: 'https://images.unsplash.com/photo-1624526267942-ab67cb38a25f?w=500&q=80'
        }
      ],
      maleProducts: [
        {
          id: 'male-1',
          name: 'Re-Nylon羽绒夹克',
          category: '夹克',
          price: '27,500',
          image: 'https://images.unsplash.com/photo-1576995853952-c10e174b88b0?w=500&q=80'
        },
        {
          id: 'male-2',
          name: '皮质公文包',
          category: '包',
          price: '32,800',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'
        },
        {
          id: 'male-3',
          name: '牛皮革商务靴',
          category: '靴类',
          price: '19,200',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80'
        },
        {
          id: 'male-4',
          name: '编织围巾',
          category: '配件',
          price: '6,800',
          image: 'https://images.unsplash.com/photo-1520903074185-8ebb4ee87b84?w=500&q=80'
        },
        {
          id: 'male-5',
          name: '皮质腕表带',
          category: '配件',
          price: '4,200',
          image: 'https://images.unsplash.com/photo-1579377947182-88a160446b74?w=500&q=80'
        }
      ]
    }
  },
  computed: {
    currentSlideData() {
      return this.heroSlides[this.currentSlide] || this.heroSlides[0]
    },
    currentStyleProducts() {
      return this.styleGender === 'female' ? this.femaleProducts : this.maleProducts
    }
  },
  methods: {
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
    changeGender(gender) {
      this.styleGender = gender
      this.currentStyleSlide = 0
    },
    onStyleSwiperChange(e) {
      this.currentStyleSlide = e.detail.current || 0
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

.product-info-overlay {
  position: absolute;
  left: 40rpx;
  top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  max-width: 300rpx;
}

.product-info-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #000;
  line-height: 1.3;
}

.product-info-price {
  display: block;
  font-size: 28rpx;
  color: #000;
  margin-top: 8rpx;
}

.product-info-action {
  display: inline-block;
  margin-top: 16rpx;
  padding: 12rpx 24rpx;
  background: transparent;
  color: #000;
  border: 2rpx solid #000;
  border-radius: 4rpx;
  font-size: 24rpx;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-thickness: 1rpx;

  &:active {
    opacity: 0.7;
  }
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

.style-swiper {
  height: 800rpx;
  margin-bottom: 40rpx;
  border-radius: 0;
  overflow: hidden;
}

.style-product {
  height: 800rpx;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.style-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
