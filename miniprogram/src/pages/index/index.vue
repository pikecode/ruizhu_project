<template>
  <view class="page">
    <!-- 自定义顶部导航栏 -->
    <CustomNavbar title="RUIZHU" />

    <!-- 轮播图区域（统一结构：动画和banner都包含标题） -->
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

    <!-- 会员礼遇（参考视觉模块） -->
    <view class="benefits-section">
      <text class="section-title">会员礼遇</text>
      <view class="benefits-card">
        <view class="benefit-items">
          <!-- 左侧礼遇 -->
          <view class="benefit-item">
            <view class="benefit-media icon">
              <image class="benefit-image" src="/static/images/logo.jpg" mode="aspectFit"></image>
            </view>
            <text class="benefit-title">至高尊享12期免息</text>
            <text class="benefit-desc">单笔订单金额≥15,000元可享</text>
          </view>

          <!-- 右侧礼遇 -->
          <view class="benefit-item">
            <view class="benefit-media">
              <image class="benefit-image" src="/static/images/product/120251017184208.jpg" mode="aspectFit"></image>
            </view>
            <text class="benefit-title">品牌定制笔记本</text>
            <view class="benefit-desc-wrap">
              <text class="benefit-desc">会员单笔订单≥15,000元加赠</text>
              <text class="benefit-desc muted">（送完为止）</text>
            </view>
          </view>
        </view>

        <view class="benefit-action" @tap="onJoinNow">
          <text>即刻入会</text>
        </view>
      </view>
    </view>

    <!-- 陈列货架模块（Swiper 效果 - 一屏4个） -->
    <view class="collection-section">
      <text class="section-title">{{ shelfCollectionName }}</text>

      <!-- Swiper 容器 -->
      <swiper
        class="shelf-swiper"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        scroll-with-animation
      >
        <!-- 每个 swiper-item 显示4个产品（2行2列） -->
        <swiper-item
          v-for="(_, pageIndex) in Math.ceil(shelfProducts.length / 4)"
          :key="pageIndex"
        >
          <view class="shelf-page">
            <!-- 第1行 -->
            <view class="shelf-row">
              <view class="shelf-items">
                <view
                  v-for="(p, i) in shelfProducts.slice(pageIndex * 4, pageIndex * 4 + 2)"
                  :key="'row1-' + i"
                  class="shelf-item"
                  @tap="onShelfProductTap(p)"
                >
                  <image class="shelf-image" :src="p.image" mode="aspectFit"></image>
                  <view class="shelf-meta">
                    <text class="shelf-en">{{ p.en }}</text>
                    <text class="shelf-cn">{{ p.cn }}</text>
                    <text class="shelf-price">¥ {{ p.price }}</text>
                  </view>
                </view>
              </view>
              <view class="shelf-bar"></view>
            </view>

            <!-- 第2行 -->
            <view class="shelf-row">
              <view class="shelf-items">
                <view
                  v-for="(p, i) in shelfProducts.slice(pageIndex * 4 + 2, pageIndex * 4 + 4)"
                  :key="'row2-' + i"
                  class="shelf-item"
                  @tap="onShelfProductTap(p)"
                >
                  <image class="shelf-image" :src="p.image" mode="aspectFit"></image>
                  <view class="shelf-meta">
                    <text class="shelf-en">{{ p.en }}</text>
                    <text class="shelf-cn">{{ p.cn }}</text>
                    <text class="shelf-price">¥ {{ p.price }}</text>
                  </view>
                </view>
              </view>
              <view class="shelf-bar"></view>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <view class="collection-action" @tap="onExploreMoreShelves">
        <text>精选搭配</text>
      </view>
    </view>

    <!-- 精品珠宝区域（Swiper 效果 - 一屏4个） -->
    <view class="jewelry-section">
      <text class="section-title">精品珠宝</text>

      <!-- Swiper 容器 -->
      <swiper
        class="jewelry-swiper"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        scroll-with-animation
      >
        <!-- 每个 swiper-item 显示4个产品（2行2列） -->
        <swiper-item
          v-for="(_, pageIndex) in Math.ceil(jewelryProducts.length / 4)"
          :key="pageIndex"
        >
          <view class="jewelry-page">
            <!-- 第1行 -->
            <view class="jewelry-row">
              <view
                v-for="(item, i) in jewelryProducts.slice(pageIndex * 4, pageIndex * 4 + 2)"
                :key="'row1-' + i"
                class="jewelry-item"
                @tap="onJewelryProductTap(item)"
              >
                <view class="jewelry-image-wrapper">
                  <image class="jewelry-image" :src="item.image" mode="aspectFit"></image>
                </view>
                <view class="jewelry-info">
                  <text class="jewelry-name">{{ item.name }}</text>
                  <text class="jewelry-price">¥{{ item.price }}</text>
                </view>
              </view>
            </view>

            <!-- 第2行 -->
            <view class="jewelry-row">
              <view
                v-for="(item, i) in jewelryProducts.slice(pageIndex * 4 + 2, pageIndex * 4 + 4)"
                :key="'row2-' + i"
                class="jewelry-item"
                @tap="onJewelryProductTap(item)"
              >
                <view class="jewelry-image-wrapper">
                  <image class="jewelry-image" :src="item.image" mode="aspectFit"></image>
                </view>
                <view class="jewelry-info">
                  <text class="jewelry-name">{{ item.name }}</text>
                  <text class="jewelry-price">¥{{ item.price }}</text>
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品资讯区域（Swiper 效果 - 一屏3个） -->
    <view class="news-section">
      <text class="section-title">商品资讯</text>

      <!-- Swiper 容器 -->
      <swiper
        class="news-swiper"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        scroll-with-animation
      >
        <!-- 每个 swiper-item 显示3个产品（1行3列） -->
        <swiper-item
          v-for="(_, pageIndex) in Math.ceil(newsItems.length / 3)"
          :key="pageIndex"
        >
          <view class="news-page">
            <view class="news-grid">
              <view
                v-for="(item, i) in newsItems.slice(pageIndex * 3, pageIndex * 3 + 3)"
                :key="i"
                class="news-card"
                @tap="onNewsTap(item)"
              >
                <view class="news-image-wrapper">
                  <image class="news-image" :src="item.image" mode="aspectFill"></image>
                </view>
                <text class="news-title">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 推荐商品区域（3列） -->
    <GridSection
      title="推荐商品"
      :items="recommendProducts"
      cardType="recommend-card"
      :columns="3"
      @item-tap="onProductTap"
    />

    <!-- 底部备案信息区域 -->
    <view class="footer-info-section">
      <view class="info-row">
        <image class="info-icon" src="/static/images/icp-icon.png" mode="aspectFit"></image>
        <text class="info-text">沪ICP备16020595号</text>
      </view>
      <view class="info-row">
        <image class="info-icon" src="/static/images/safe-icon.png" mode="aspectFit"></image>
        <text class="info-text">沪公网安备 31010602002295号</text>
      </view>
      <view class="info-row">
        <image class="info-icon" src="/static/images/license-icon.png" mode="aspectFit"></image>
        <text class="info-text">电子营业执照</text>
      </view>
    </view>
  </view>
</template>

<script>
import GridSection from '@/components/GridSection.vue'
import CustomNavbar from '@/components/CustomNavbar.vue'
import { bannerService } from '@/services/banner'
import { collectionService } from '@/services/collection'
import { newsService } from '@/services/news'

export default {
  components: {
    GridSection,
    CustomNavbar
  },
  data() {
    return {
      indicatorColor: 'rgba(255, 255, 255, 0.5)',
      indicatorActiveColor: '#ffffff',
      currentBannerIndex: 0,

      // 轮播数据：从 API 获取
      allBanners: [],

      // 从 API 加载数据的加载状态
      bannerLoading: false,

      // 货架集合名称（从 API 获取）
      shelfCollectionName: '精品服饰',

      // 首页：陈列货架模块（两行 × 两列）
      shelfProducts: [
        {
          en: 'Re-Nylon',
          cn: '双肩背包',
          price: '21,800',
          image: '/static/images/product/120251017222229.jpg'
        },
        {
          en: 'Re-Nylon',
          cn: '双肩背包',
          price: '21,800',
          image: '/static/images/product/120251017222238.jpg'
        },
        {
          en: 'Re-Nylon与牛皮革',
          cn: '拼接双肩背包',
          price: '28,700',
          image: '/static/images/product/120251017222242.jpg'
        },
        {
          en: 'Re-Nylon与牛皮革',
          cn: '拼接双肩背包',
          price: '28,700',
          image: '/static/images/product/120251017222234.jpg'
        }
      ],
      // 精品珠宝
      jewelryProducts: [
        {
          name: '18K金钻石项链',
          category: '项链',
          price: '28,900',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'
        },
        {
          name: '翡翠手镯',
          category: '手镯',
          price: '15,600',
          image: 'https://images.unsplash.com/photo-1515562141207-6811bcb33eaf?w=400&q=80'
        },
        {
          name: '珍珠戒指',
          category: '戒指',
          price: '12,800',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'
        }
      ],
      // 商品资讯
      newsItems: [
        {
          id: 'news-1',
          title: '2024秋冬系列正式发布',
          desc: '全新设计理念融合传统工艺，探索奢华与可持续的完美平衡',
          image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
          tag: '新品首发',
          date: '2024-10-25',
          readCount: '12.5K'
        },
        {
          id: 'news-2',
          title: '如何甄选高质量珠宝首饰',
          desc: '专业珠宝顾问为您解析珍珠品质鉴定的秘诀',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
          tag: '购物指南',
          date: '2024-10-24',
          readCount: '8.3K'
        },
        {
          id: 'news-3',
          title: '品牌工坊探访：制作精品背包的故事',
          desc: '深入了解每一件产品背后的匠人精神与工艺创新',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
          tag: '',
          date: '2024-10-23',
          readCount: '6.8K'
        }
      ],

      // 推荐商品（3列）
      recommendProducts: [
        {
          name: '【明星同款】Prada Explore 中号Re-...',
          price: '26,800',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'
        },
        {
          name: '【预售】Prada Explore中号Nappa...',
          price: '28,500',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80'
        },
        {
          name: 'Re-Nylon双肩背包',
          price: '21,800',
          image: 'https://images.unsplash.com/photo-1556821552-5f06b5991ce0?w=400&q=80'
        },
        {
          name: '【预售】皮革中筒靴',
          price: '14,900',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80'
        },
        {
          name: 'Prada Bonnie 迷你牛皮革手袋',
          price: '19,600',
          image: 'https://images.unsplash.com/photo-1548062407-f961713e6786?w=400&q=80'
        },
        {
          name: 'Prada Re-Edition 1978小号Re-Nylon...',
          price: '15,200',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80'
        },
        {
          name: 'Re-Nylon双肩背包',
          price: '21,800',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'
        },
        {
          name: '再生尼龙羽绒夹克',
          price: '28,400',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80'
        },
        {
          name: '亮面皮革乐福鞋',
          price: '10,300',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80'
        }
      ]
    }
  },
  onLoad() {
    console.log('Ruizhu 首页加载完成')
    // 加载轮播图数据
    this.loadBanners()
    // 加载货架商品数据
    this.loadShelfProducts()
    // 加载珠宝商品数据
    this.loadJewelryProducts()
    // 加载资讯数据
    this.loadNews()
    // 加载推荐商品数据
    this.loadRecommendedProducts()
  },
  methods: {
    /**
     * 加载轮播图数据
     * 从 API 获取首页 banner 数据
     */
    async loadBanners() {
      try {
        this.bannerLoading = true
        const banners = await bannerService.getHomeBanners()

        if (banners && banners.length > 0) {
          // 转换 API 返回的数据格式为前端需要的格式
          this.allBanners = banners.map(banner => ({
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
     * 加载货架商品数据
     * 从 API 获取 premium-fashion 集合数据
     */
    async loadShelfProducts() {
      try {
        const collection = await collectionService.getCollectionBySlug('premium-fashion')

        if (collection) {
          // 更新集合名称
          this.shelfCollectionName = collection.name

          // 转换产品数据格式
          if (collection.products && collection.products.length > 0) {
            this.shelfProducts = collection.products.map(product => ({
              id: product.id,
              en: product.name,
              cn: product.subtitle || '\u00A0', // 如果没有副标题，使用不换行空格占位
              price: product.currentPrice ? `${product.currentPrice}` : '¥0',
              image: product.coverImageUrl || ''
            }))

            console.log('货架商品加载成功:', this.shelfProducts)
          } else {
            console.warn('集合中没有产品')
          }
        }
      } catch (error) {
        console.error('加载货架商品失败:', error)
      }
    },

    /**
     * 加载珠宝商品数据
     * 从 API 获取 premium-jewelry 集合数据
     */
    async loadJewelryProducts() {
      try {
        const collection = await collectionService.getCollectionBySlug('premium-jewelry')

        if (collection && collection.products && collection.products.length > 0) {
          // 转换产品数据格式
          this.jewelryProducts = collection.products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.subtitle || '珠宝',
            price: product.currentPrice ? `${product.currentPrice}` : '¥0',
            image: product.coverImageUrl || ''
          }))

          console.log('珠宝商品加载成功:', this.jewelryProducts)
        } else {
          console.warn('未获取到珠宝商品数据')
        }
      } catch (error) {
        console.error('加载珠宝商品失败:', error)
      }
    },

    /**
     * 加载资讯数据
     * 从 API 获取资讯列表
     */
    async loadNews() {
      try {
        const news = await newsService.getNewsList(1, 3)

        if (news && news.length > 0) {
          // 转换资讯数据格式
          this.newsItems = news.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || '',
            desc: item.description || '',
            image: item.coverImageUrl || '',
            tag: item.subtitle || '',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : '',
            readCount: '0'
          }))

          console.log('资讯加载成功:', this.newsItems)
        } else {
          console.warn('未获取到资讯数据')
        }
      } catch (error) {
        console.error('加载资讯失败:', error)
      }
    },

    /**
     * 加载推荐商品数据
     * 从 API 获取 recommended-products 集合数据
     */
    async loadRecommendedProducts() {
      try {
        const collection = await collectionService.getCollectionBySlug('recommended-products')

        if (collection && collection.products && collection.products.length > 0) {
          // 转换产品数据格式
          this.recommendProducts = collection.products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.currentPrice ? `${product.currentPrice}` : '¥0',
            image: product.coverImageUrl || ''
          }))

          console.log('推荐商品加载成功:', this.recommendProducts)
        } else {
          console.warn('未获取到推荐商品数据')
        }
      } catch (error) {
        console.error('加载推荐商品失败:', error)
      }
    },

    onJoinNow() {
      // 跳转至入会资料完善页
      uni.navigateTo({
        url: '/pages/membership/join',
        fail: () => {
          uni.showToast({ title: '页面开发中', icon: 'none' })
        }
      })
    },
    onShelfProductTap(p) {
      uni.showToast({ title: `${p.en} ${p.cn}`, icon: 'none' })
    },
    onExploreMoreShelves() {
      // 跳转到系列探索页
      uni.navigateTo({ url: '/pages/collection/explore' })
    },
    onVideoImageTap() {
      // 点击视频封面，可以打开视频播放器或跳转到视频详情
      uni.navigateTo({
        url: '/pages/video-player/video-player',  // 需要创建此页面
        fail: () => {
          // 如果页面不存在，显示提示
          uni.showToast({
            title: '视频播放器开发中',
            icon: 'none'
          })
        }
      })
    },

    onSwiperChange(e) {
      this.currentBannerIndex = e.detail.current
    },
    onBannerTap(banner) {
      // 根据 linkType 处理跳转逻辑
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
          // 跳转到外部链接（使用 web-view 或其他方式）
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
          // 无链接，可以只显示 banner 或跳转到首页
          console.log('Banner 无关联链接:', title)
          break
      }
    },
    onJewelryProductTap(product) {
      // 保存珠宝商品信息用于详情页
      try {
        uni.setStorageSync('selectedProduct', product)
      } catch (e) {
        console.error('Failed to save product:', e)
      }

      uni.navigateTo({
        url: '/pages/product/detail'
      })
    },
    onProductTap(product) {
      // 保存推荐商品信息用于详情页
      try {
        uni.setStorageSync('selectedProduct', product)
      } catch (e) {
        console.error('Failed to save product:', e)
      }

      uni.navigateTo({
        url: '/pages/product/detail'
      })
    },

    onNewsTap(news) {
      // 点击资讯卡片，跳转到资讯详情页
      uni.navigateTo({
        url: `/pages/news/detail?id=${news.id}`,
        fail: () => {
          uni.showToast({
            title: '页面开发中',
            icon: 'none'
          })
        }
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

/* 会员礼遇（参考视觉模块） */
.benefits-section {
  padding: 60rpx 40rpx 0;

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 30rpx;
    letter-spacing: 2rpx;
  }

  .benefits-card {
    background: #f4f4f4;
    border-radius: 8rpx;
    padding: 40rpx 24rpx 32rpx;
  }

  .benefit-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    align-items: start;
    margin-bottom: 28rpx;
  }

  .benefit-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8rpx 8rpx 0;
  }

  .benefit-media {
    width: 220rpx;
    height: 160rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
  }

  .benefit-media.icon {
    border-radius: 8rpx;
  }

  .benefit-image {
    width: 100%;
    height: 100%;
  }

  .benefit-title {
    display: block;
    font-size: 28rpx;
    color: #000000;
    font-weight: 600;
    margin-bottom: 6rpx;
  }

  .benefit-desc-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
  }

  .benefit-desc {
    display: block;
    font-size: 24rpx;
    color: #666666;
  }

  .benefit-desc.muted {
    color: #9a9a9a;
  }

  .benefit-action {
    height: 72rpx;
    width: 300rpx;
    margin: 0 auto;
    background: #000000;
    color: #ffffff;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;
    cursor: pointer;

    &:active {
      background: #333333;
    }
  }
}

/* 陈列货架模块 */
.collection-section {
  margin-top: 40rpx;
  padding: 40rpx 20rpx 20rpx;
  background: linear-gradient(180deg, #f6f2eb 0%, #f9f7f2 100%);

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 40rpx;
    letter-spacing: 2rpx;
  }

  .shelf-swiper {
    width: 100%;
    height: 925rpx;
    margin-bottom: 20rpx;
  }

  .shelf-page {
    width: 100%;
    height: 925rpx;
    display: flex;
    flex-direction: column;
    padding: 0 20rpx;
  }

  .shelf-row {
    position: relative;
    padding: 24rpx 20rpx 60rpx;
    margin-bottom: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .shelf-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    align-items: end;
    flex: 1;
  }

  .shelf-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16rpx;
  }

  .shelf-image {
    width: 260rpx;
    height: 240rpx;
  }

  .shelf-meta {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  .shelf-en {
    font-size: 28rpx;
    color: #000;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .shelf-cn {
    font-size: 26rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .shelf-price { font-size: 26rpx; color: #000; font-weight: 600; }

  .shelf-bar {
    position: absolute;
    left: 30rpx; right: 30rpx; bottom: 24rpx;
    height: 18rpx;
    background: linear-gradient(180deg, #e2c496 0%, #d1ae79 100%);
    border-radius: 6rpx;
    box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.12);
  }

  .collection-action {
    margin: 12rpx auto 10rpx;
    width: 320rpx; height: 88rpx;
    border-radius: 8rpx;
    background: #000; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 32rpx; font-weight: 600;
    cursor: pointer;

    &:active {
      background: #333;
    }
  }
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
}

/* 精品珠宝区域 */
.jewelry-section {
  padding: 60rpx 40rpx 40rpx;
  background: #ffffff;

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 40rpx;
    letter-spacing: 2rpx;
  }

  .jewelry-swiper {
    width: 100%;
    height: 925rpx;
    margin-bottom: 20rpx;
  }

  .jewelry-page {
    width: 100%;
    height: 925rpx;
    display: flex;
    flex-direction: column;
    padding: 0 20rpx;
  }

  .jewelry-row {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    align-items: center;
    justify-items: center;
  }

  .jewelry-item {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    width: 100%;

    &:active {
      opacity: 0.8;
    }

    .jewelry-image-wrapper {
      position: relative;
      width: 100%;
      height: 300rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      overflow: hidden;
      margin-bottom: 16rpx;

      .jewelry-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .jewelry-info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      align-items: center;
      text-align: center;

      .jewelry-name {
        display: block;
        font-size: 26rpx;
        color: #333333;
        font-weight: 500;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .jewelry-price {
        display: block;
        font-size: 28rpx;
        color: #000000;
        font-weight: 600;
      }
    }
  }
}

/* 商品资讯区域 */
.news-section {
  padding: 60rpx 40rpx 40rpx;
  background: #ffffff;

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 40rpx;
    letter-spacing: 2rpx;
  }

  .news-swiper {
    width: 100%;
    height: 440rpx;
    margin-bottom: 20rpx;
  }

  .news-page {
    width: 100%;
    height: 440rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    width: 100%;
  }

  .news-card {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      opacity: 0.8;
    }

    .news-image-wrapper {
      position: relative;
      width: 100%;
      height: 300rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      overflow: hidden;

      .news-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .news-tag {
        position: absolute;
        top: 12rpx;
        right: 12rpx;
        background: #000000;
        color: #ffffff;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        font-size: 20rpx;
        font-weight: 500;
      }
    }

    .news-content {
      display: flex;
      flex-direction: column;
      gap: 6rpx;
    }

    .news-title {
      display: block;
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .news-subtitle {
      display: block;
      font-size: 22rpx;
      color: #999999;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }
}

/* 底部备案信息区域 */
.footer-info-section {
  padding: 60rpx 40rpx;
  background: #f9f9f9;
  border-top: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  .info-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    justify-content: center;

    .info-icon {
      width: 28rpx;
      height: 28rpx;
      flex-shrink: 0;
    }

    .info-text {
      font-size: 24rpx;
      color: #666666;
      text-align: center;
    }
  }
}
</style>
