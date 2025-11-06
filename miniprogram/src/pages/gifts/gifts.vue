<template>
  <view class="page">
    <!-- 自定义顶部导航栏 -->
    <CustomNavbar title="RUIZHU" />

    <!-- 轮播图区域（包含动画和其他banner） -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :indicator-color="indicatorColor"
        :indicator-active-color="indicatorActiveColor"
        :autoplay="false"
        :circular="false"
        @change="onBannerChange"
      >
        <!-- 所有轮播项：统一结构 -->
        <swiper-item v-for="(item, index) in allBanners" :key="index">
          <view class="banner-item" @tap="onBannerTap(item)">
            <!-- 视频类型：显示视频，使用封面图作为 poster -->
            <video v-if="item.type === 'video'" class="banner-video" :src="item.image" :poster="item.videoThumbnail" controls="false" autoplay muted loop></video>
            <!-- 图片类型：显示图片 -->
            <image v-else class="banner-image" :src="item.image" mode="aspectFill"></image>
            <view class="banner-overlay">
              <text class="banner-title" @tap.stop="onBannerTap(item)">{{ item.title }}</text>
              <view class="banner-subtitle">
                <text class="subtitle-text" @tap.stop="onBannerTap(item)">{{ item.subtitle }}</text>
                <view class="subtitle-line"></view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="main-title">{{ collectionName }}</text>
      <text class="sub-title">{{ collectionDescription }}</text>
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
          <view class="featured-product">
            <image
              class="featured-image"
              :src="slide.featured.image"
              mode="aspectFill"
            ></image>
            <view class="featured-info">
              <text class="featured-name">{{ slide.featured.name }}</text>
            </view>
          </view>

          <!-- 右侧产品列表 -->
          <view class="products-list">
            <view
              class="product-card"
              v-for="(product, index) in slide.products"
              :key="index"
            >
              <image
                class="product-image"
                :src="product.image"
                mode="aspectFill"
              ></image>
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 定制咨询按钮 -->
    <view class="explore-more" @tap="onExploreMore">
      <text class="explore-text">定制咨询</text>
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
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import { bannerService } from '@/services/banner'
import { collectionService } from '@/services/collection'

export default {
  components: {
    CustomNavbar
  },
  data() {
    return {
      // Banner 相关
      indicatorColor: 'rgba(255, 255, 255, 0.5)',
      indicatorActiveColor: '#ffffff',
      currentBannerIndex: 0,
      // 从 API 加载的轮播数据
      allBanners: [],
      // Banner 加载状态
      bannerLoading: false,

      // 产品相关（从 API 加载）
      currentSlide: 0,
      productSlides: [],
      collectionName: '',
      collectionDescription: ''
    }
  },
  onLoad() {
    console.log('VIP定制页面加载完成')
    // 加载轮播图数据
    this.loadBanners()
    // 加载产品数据
    this.loadProducts()
  },
  methods: {
    /**
     * 加载轮播图数据
     * 从 API 获取 custom banner 数据
     */
    async loadBanners() {
      try {
        this.bannerLoading = true
        const result = await bannerService.getBanners(1, 100, 'custom')

        if (result && result.items && result.items.length > 0) {
          // 转换 API 返回的数据格式为前端需要的格式
          this.allBanners = result.items.map(banner => ({
            id: banner.id,
            type: banner.type, // 'image' 或 'video'
            title: banner.mainTitle,
            subtitle: banner.subtitle,
            // 如果是视频，显示视频 URL；如果是图片，显示图片 URL
            image: bannerService.getDisplayUrl(banner),
            // 视频封面图（用于 video 的 poster 属性）
            videoThumbnail: banner.videoThumbnailUrl || '',
            // 保存完整的 banner 数据用于点击处理
            linkType: banner.linkType,
            linkValue: banner.linkValue,
            videoUrl: bannerService.getVideoUrl(banner)
          }))

          console.log('轮播图加载成功:', this.allBanners)
        } else {
          console.warn('未获取到轮播图数据')
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
        uni.showToast({ title: '轮播图加载失败', icon: 'none' })
      } finally {
        this.bannerLoading = false
      }
    },

    /**
     * 加载产品数据
     * 从 API 获取 private-customization 集合数据
     */
    async loadProducts() {
      try {
        const collection = await collectionService.getCollectionBySlug('private-customization')

        if (collection) {
          // 保存集合的名称和描述
          this.collectionName = collection.name || ''
          this.collectionDescription = collection.description || ''

          if (collection.products && collection.products.length > 0) {
            // 将产品转换为 productSlides 格式
            // 每个 slide 包含一个 featured 和 2 个 products
            const products = collection.products
            const slides = []

            for (let i = 0; i < products.length; i += 3) {
              const featured = products[i]
              const slide = {
                featured: {
                  name: featured.name,
                  price: (featured.currentPrice / 100).toFixed(2),
                  image: featured.coverImageUrl || '',
                  id: featured.id
                },
                products: []
              }

              // 添加相邻的两个产品到 slide 的 products 中
              for (let j = i + 1; j < i + 3 && j < products.length; j++) {
                const product = products[j]
                slide.products.push({
                  name: product.name,
                  price: (product.currentPrice / 100).toFixed(2),
                  image: product.coverImageUrl || '',
                  id: product.id
                })
              }

              slides.push(slide)
            }

            this.productSlides = slides
            console.log('产品数据加载成功:', this.productSlides)
          } else {
            console.warn('集合中没有产品数据')
          }
        } else {
          console.warn('未获取到集合数据')
        }
      } catch (error) {
        console.error('加载产品数据失败:', error)
        uni.showToast({ title: '产品加载失败', icon: 'none' })
      }
    },

    onBannerChange(e) {
      this.currentBannerIndex = e.detail.current
    },

    /**
     * 处理 banner 点击事件
     * 根据 linkType 处理跳转逻辑
     */
    onBannerTap(banner) {
      const { linkType, linkValue, title } = banner

      switch (linkType) {
        case 'product':
          // 跳转到商品详情
          if (linkValue) {
            uni.navigateTo({
              url: `/pages/product/detail?id=${linkValue}`,
              fail: () => {
                uni.showToast({ title: '页面开发中', icon: 'none' })
              }
            })
          }
          break

        case 'category':
          // 跳转到分类页面
          if (linkValue) {
            uni.navigateTo({
              url: `/pages/category/list?categoryId=${linkValue}`,
              fail: () => {
                uni.showToast({ title: '页面开发中', icon: 'none' })
              }
            })
          }
          break

        case 'collection':
          // 跳转到集合/专题详情
          if (linkValue) {
            uni.navigateTo({
              url: `/pages/collection/detail?id=${linkValue}`,
              fail: () => {
                uni.showToast({ title: '页面开发中', icon: 'none' })
              }
            })
          }
          break

        case 'url':
          // 跳转到外部链接
          if (linkValue) {
            uni.navigateTo({
              url: `/pages/webview/index?url=${encodeURIComponent(linkValue)}`,
              fail: () => {
                uni.showToast({ title: '页面开发中', icon: 'none' })
              }
            })
          }
          break

        case 'none':
        default:
          // 无链接
          console.log('Banner 无关联链接:', title)
          break
      }
    },

    onSwiperChange(e) {
      this.currentSlide = e.detail.current
    },

    onExploreMore() {
      uni.navigateTo({
        url: '/pages/consultation/consultation'
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
    object-fit: fill;
  }

  .banner-overlay {
    position: absolute;
    bottom: 100rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
  }

  .banner-title {
    font-size: 64rpx;
    font-weight: 500;
    color: #ffffff;
    letter-spacing: 2rpx;
    margin-bottom: 20rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  }

  .banner-subtitle {
    display: flex;
    flex-direction: column;
    align-items: center;

    .subtitle-text {
      font-size: 28rpx;
      color: #ffffff;
      letter-spacing: 1rpx;
      margin-bottom: 12rpx;
    }

    .subtitle-line {
      width: 120rpx;
      height: 2rpx;
      background: #ffffff;
    }
  }

  /* 视频项特殊样式 */
  .video-item {
    background: #000000;
  }
}

/* 页面标题 */
.page-header {
  padding: 40rpx 0 60rpx;
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
    max-height: 100%;

    .featured-image {
      width: 100%;
      height: 520rpx;
      flex-shrink: 0;
      object-fit: cover;
    }

    .featured-info {
      padding: 24rpx;
      flex: 0;

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
    max-height: 100%;
    overflow: hidden;

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
        height: 220rpx;
        flex-shrink: 0;
        object-fit: cover;
      }

      .product-info {
        padding: 16rpx;
        flex: 0;

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

    &.active {
      background: #000000;
      width: 32rpx;
      border-radius: 8rpx;
    }
  }
}
</style>
