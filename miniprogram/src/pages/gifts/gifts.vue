<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="main-title">VIP私人定制</text>
      <text class="sub-title">专属尊贵体验</text>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'women' }"
        @tap="switchTab('women')"
      >
        <text class="tab-text">女士甄选</text>
        <view v-if="activeTab === 'women'" class="tab-line"></view>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'men' }"
        @tap="switchTab('men')"
      >
        <text class="tab-text">男士甄选</text>
        <view v-if="activeTab === 'men'" class="tab-line"></view>
      </view>
    </view>

    <!-- 产品展示 Swiper 区域 -->
    <swiper
      class="products-swiper"
      :indicator-dots="false"
      :autoplay="false"
      :circular="true"
      @change="onSwiperChange"
    >
      <swiper-item v-for="(slide, slideIndex) in productSlides" :key="slideIndex">
        <view class="products-section">
          <!-- 左侧大图展示 -->
          <view class="featured-product" @tap="onProductTap(slide.featured)">
            <image
              class="featured-image"
              :src="slide.featured.image"
              mode="aspectFill"
            ></image>
            <view class="featured-info">
              <text class="featured-name">{{ slide.featured.name }}</text>
              <text class="featured-price">¥ {{ slide.featured.price }}</text>
            </view>
          </view>

          <!-- 右侧产品列表 -->
          <view class="products-list">
            <view
              class="product-card"
              v-for="(product, index) in slide.products"
              :key="index"
              @tap="onProductTap(product)"
            >
              <image
                class="product-image"
                :src="product.image"
                mode="aspectFill"
              ></image>
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
                <text class="product-price">¥ {{ product.price }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 探索更多按钮 -->
    <view class="explore-more" @tap="onExploreMore">
      <text class="explore-text">探索更多</text>
    </view>

    <!-- 轮播指示器 -->
    <view class="indicator-dots">
      <view
        class="dot"
        v-for="(dot, slideIndex) in productSlides.length"
        :key="slideIndex"
        :class="{ active: slideIndex === currentSlide }"
      ></view>
    </view>

    <!-- 更多分类区域 -->
    <view class="more-categories">
      <text class="category-title">定制系列</text>

      <view class="category-grid">
        <view
          class="category-item"
          v-for="(category, index) in categories"
          :key="index"
          @tap="onCategoryTap(category)"
        >
          <image
            class="category-image"
            :src="category.image"
            mode="aspectFill"
          ></image>
          <view class="category-overlay">
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'women',
      currentSlide: 0,
      productSlides: [
        {
          featured: {
            name: '鞋子',
            price: '1799',
            image: '/static/images/product/鞋子1.jpg'
          },
          products: [
            {
              name: '珠宝',
              price: '5800',
              image: '/static/images/product/饰品184152.jpg'
            },
            {
              name: '珠宝',
              price: '7500',
              image: '/static/images/product/饰品184157.jpg'
            }
          ]
        },
        {
          featured: {
            name: '服装',
            price: '2800',
            image: '/static/images/product/服饰2.jpg'
          },
          products: [
            {
              name: '珠宝',
              price: '8900',
              image: '/static/images/product/饰品184201.jpg'
            },
            {
              name: '珠宝',
              price: '9800',
              image: '/static/images/product/饰品184205.jpg'
            }
          ]
        },
        {
          featured: {
            name: '服装',
            price: '3500',
            image: '/static/images/product/服饰1.jpg'
          },
          products: [
            {
              name: '珠宝',
              price: '6500',
              image: '/static/images/product/饰品184212.jpg'
            },
            {
              name: '珠宝',
              price: '10000',
              image: '/static/images/product/饰品184216.jpg'
            }
          ]
        }
      ],
      jewelryImages: [
        '/static/images/product/饰品184152.jpg',
        '/static/images/product/饰品184157.jpg',
        '/static/images/product/饰品184201.jpg',
        '/static/images/product/饰品184205.jpg',
        '/static/images/product/饰品184208.jpg',
        '/static/images/product/饰品184212.jpg',
        '/static/images/product/饰品184216.jpg',
        '/static/images/product/饰品184219.jpg'
      ],
      categories: [
        {
          name: '高级配饰',
          image: '/static/images/product/饰品184152.jpg'
        },
        {
          name: '高级配饰',
          image: '/static/images/product/饰品184157.jpg'
        },
        {
          name: '高级配饰',
          image: '/static/images/product/饰品184201.jpg'
        },
        {
          name: '高级配饰',
          image: '/static/images/product/饰品184205.jpg'
        }
      ]
    }
  },
  mounted() {
    this.generateCategories()
  },
  methods: {
    generateCategories() {
      // 随机生成4个珠宝定制系列
      const randomJewelry = this.jewelryImages.sort(() => Math.random() - 0.5).slice(0, 4)
      this.categories = randomJewelry.map(image => ({
        name: '高级配饰',
        image: image
      }))
    },
    switchTab(tab) {
      this.activeTab = tab
      // 这里可以加载不同的产品数据
      console.log('切换到:', tab === 'women' ? '女士' : '男士')
    },
    onSwiperChange(e) {
      this.currentSlide = e.detail.current
    },
    onProductTap(product) {
      uni.showToast({
        title: product.name,
        icon: 'none'
      })
    },
    onExploreMore() {
      uni.showToast({
        title: '探索更多产品',
        icon: 'none'
      })
    },
    onCategoryTap(category) {
      uni.showToast({
        title: category.name,
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
}

/* 页面标题 */
.page-header {
  padding: 80rpx 0 60rpx;
  text-align: center;

  .main-title {
    display: block;
    font-size: 56rpx;
    font-weight: 500;
    color: #000000;
    letter-spacing: 2rpx;
    margin-bottom: 20rpx;
  }

  .sub-title {
    display: block;
    font-size: 28rpx;
    color: #666666;
    letter-spacing: 1rpx;
  }
}

/* 分类标签 */
.category-tabs {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  padding: 0 40rpx 60rpx;

  .tab-item {
    position: relative;
    padding-bottom: 20rpx;
    cursor: pointer;

    .tab-text {
      font-size: 32rpx;
      color: #999999;
      transition: all 0.3s;
    }

    &.active .tab-text {
      color: #000000;
      font-weight: 500;
    }

    .tab-line {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4rpx;
      background: #000000;
    }
  }
}

/* 产品 Swiper */
.products-swiper {
  height: 760rpx;
  margin-bottom: 60rpx;
}

/* 产品展示区域 */
.products-section {
  display: flex;
  gap: 24rpx;
  padding: 0 40rpx;
  height: 100%;
  align-items: flex-start;

  .featured-product {
    flex: 1;
    background: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .featured-image {
      width: 100%;
      height: 595rpx;
      object-fit: cover;
    }

    .featured-info {
      padding: 24rpx;

      .featured-name {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 12rpx;
      }

      .featured-price {
        display: block;
        font-size: 32rpx;
        color: #000000;
        font-weight: 600;
      }
    }
  }

  .products-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .product-card {
      background: #f5f5f5;
      border-radius: 8rpx;
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;

      .product-image {
        width: 100%;
        height: 245rpx;
        object-fit: cover;
      }

      .product-info {
        padding: 16rpx;

        .product-name {
          display: block;
          font-size: 26rpx;
          color: #333333;
          margin-bottom: 8rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-price {
          display: block;
          font-size: 28rpx;
          color: #000000;
          font-weight: 600;
        }
      }
    }
  }
}

/* 探索更多按钮 */
.explore-more {
  margin: 0 40rpx 40rpx;
  padding: 32rpx 0;
  background: #000000;
  border-radius: 8rpx;
  text-align: center;

  .explore-text {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 500;
    letter-spacing: 1rpx;
  }
}

/* 轮播指示器 */
.indicator-dots {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx 0;

  .dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #d8d8d8;
    transition: all 0.3s;

    &.active {
      background: #000000;
      width: 32rpx;
      border-radius: 8rpx;
    }
  }
}

/* 更多分类区域 */
.more-categories {
  padding: 60rpx 40rpx;

  .category-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 60rpx;
    letter-spacing: 2rpx;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .category-item {
      position: relative;
      height: 340rpx;
      border-radius: 8rpx;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .category-image {
        width: 100%;
        height: 100%;
        flex: 1;
        object-fit: cover;
      }

      .category-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 30rpx;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3), transparent);
        min-height: 120rpx;
        display: flex;
        align-items: flex-end;
        z-index: 2;

        .category-name {
          display: block;
          font-size: 32rpx;
          color: #ffffff;
          font-weight: 500;
          text-align: center;
          width: 100%;
          text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
        }
      }
    }
  }
}
</style>
