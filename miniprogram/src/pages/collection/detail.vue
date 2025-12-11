<template>
  <view class="detail-page">
    <!-- 集合标题 -->
    <view class="header">
      <text class="collection-title">{{ collectionName }}</text>
      <text class="product-count">{{ productCount }}</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-wrapper">
        <text class="search-icon">🔍</text>
        <input
          type="text"
          placeholder="搜索商品"
          class="search-input"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
      </view>
    </view>

    <!-- 分类选项卡 -->
    <view class="category-tabs">
      <view
        v-for="(category, index) in categories"
        :key="index"
        class="tab-item"
        :class="{ active: activeCategory === index }"
        @tap="activeCategory = index"
      >
        <view class="tab-image">
          <image :src="category.image" mode="aspectFill"></image>
        </view>
        <text class="tab-label">{{ category.name }}</text>
      </view>
    </view>

    <!-- 筛选和排序 -->
    <view class="filter-bar">
      <view class="filter-item">
        <text class="filter-icon">⊙</text>
        <text class="filter-label">筛选</text>
      </view>
      <view class="sort-item">
        <text class="sort-icon">≡</text>
        <text class="sort-label">排序</text>
      </view>
    </view>

    <!-- 产品网格 -->
    <view class="products-grid">
      <view
        v-for="(product, index) in filteredProducts"
        :key="index"
        class="product-card"
        @tap="onProductTap(product)"
      >
        <!-- 产品图片 -->
        <view class="product-image-wrapper">
          <image class="product-image" :src="product.image" mode="aspectFill"></image>
          <view v-if="product.isNew" class="badge">新品</view>
          <!-- 小图指示器 -->
          <view class="image-dots">
            <view
              v-for="(dot, i) in product.imageCount"
              :key="i"
              class="dot"
              :class="{ active: i === 0 }"
            ></view>
          </view>
        </view>

        <!-- 产品信息 -->
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price">¥{{ product.price }}</text>
        </view>

        <!-- 收藏按钮 -->
        <view class="favorite-btn" @tap.stop="toggleFavorite(index)">
          <text :class="{ active: product.isFavorite }">♡</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { createCollectionShareInfo, generateSharePath } from '@/services/share'

export default {
  data() {
    return {
      collectionId: 0,
      collectionName: '秋冬系列',
      productCount: 243,
      searchKeyword: '',
      activeCategory: 0,
      categories: [
        {
          name: '秋冬系列',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=150&q=80'
        },
        {
          name: '包袋',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&q=80'
        },
        {
          name: '成衣',
          image: 'https://images.unsplash.com/photo-1595777707802-41d339d60280?w=150&q=80'
        },
        {
          name: '鞋履',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&q=80'
        },
        {
          name: '配饰',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&q=80'
        }
      ],
      products: [
        {
          id: 1,
          name: '再生尼龙羽绒夹克',
          price: '26,900',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80',
          imageCount: 2,
          isNew: true,
          isFavorite: false,
          category: 0
        },
        {
          id: 2,
          name: 'Re-Nylon 夹克',
          price: '23,300',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80',
          imageCount: 2,
          isNew: true,
          isFavorite: false,
          category: 0
        },
        {
          id: 3,
          name: '羊毛格纹针织衫',
          price: '12,500',
          image: 'https://images.unsplash.com/photo-1595777707802-41d339d60280?w=400&q=80',
          imageCount: 2,
          isNew: true,
          isFavorite: false,
          category: 0
        },
        {
          id: 4,
          name: '皮革靴子',
          price: '15,800',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
          imageCount: 2,
          isNew: false,
          isFavorite: false,
          category: 0
        },
        {
          id: 5,
          name: '黑色羊皮背包',
          price: '21,700',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
          imageCount: 2,
          isNew: true,
          isFavorite: false,
          category: 0
        },
        {
          id: 6,
          name: '金色链条项链',
          price: '8,900',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          imageCount: 2,
          isNew: false,
          isFavorite: false,
          category: 0
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      let products = this.products.filter(p => p.category === this.activeCategory)

      if (this.searchKeyword) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }

      return products
    }
  },
  onLoad(options) {
    // 从路由参数获取集合名称
    if (options.collection) {
      this.collectionName = options.collection
    }
    // 从URL参数获取集合ID
    if (options?.id) {
      this.collectionId = parseInt(options.id)
    }
    console.log('集合详情页加载', options)
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    const shareInfo = createCollectionShareInfo(
      this.collectionId,
      this.collectionName
    )
    return {
      title: shareInfo.title,
      desc: shareInfo.desc || '',
      path: generateSharePath(shareInfo.path, shareInfo.query),
      imageUrl: '/static/images/logo.jpg'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const shareInfo = createCollectionShareInfo(
      this.collectionId,
      this.collectionName
    )
    return {
      title: shareInfo.title,
      desc: shareInfo.desc || '',
      imageUrl: '/static/images/logo.jpg'
    }
  },

  methods: {
    onSearchInput(e) {
      this.searchKeyword = e.detail.value
    },
    toggleFavorite(index) {
      const product = this.filteredProducts[index]
      if (product) {
        product.isFavorite = !product.isFavorite
        const status = product.isFavorite ? '已收藏' : '已移除收藏'
        uni.showToast({
          title: status,
          icon: 'none',
          duration: 1000
        })
      }
    },
    onProductTap(product) {
      uni.navigateTo({
        url: '/pages/product/detail'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 60rpx;
}

/* 头部标题 */
.header {
  padding: 40rpx 40rpx 30rpx;
  text-align: center;

  .collection-title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
    letter-spacing: 1rpx;
  }

  .product-count {
    display: block;
    font-size: 26rpx;
    color: #999999;
  }
}

/* 搜索栏 */
.search-bar {
  padding: 0 40rpx 24rpx;

  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 24rpx;
    padding: 0 16rpx;
    height: 72rpx;

    .search-icon {
      font-size: 28rpx;
      color: #999999;
      margin-right: 8rpx;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      font-size: 28rpx;
      color: #000000;
      padding: 0;

      &::placeholder {
        color: #cccccc;
      }
    }
  }
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 12rpx;
  padding: 0 40rpx 24rpx;
  overflow-x: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    flex-shrink: 0;
    cursor: pointer;
    

    &.active .tab-image {
      border-color: #000000;
    }

    .tab-image {
      width: 100rpx;
      height: 100rpx;
      border: 3px solid #e0e0e0;
      border-radius: 8rpx;
      overflow: hidden;
      

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .tab-label {
      font-size: 22rpx;
      color: #666666;
      text-align: center;
      max-width: 100rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &.active .tab-label {
      color: #000000;
      font-weight: 600;
    }
  }
}

/* 筛选排序栏 */
.filter-bar {
  display: flex;
  gap: 40rpx;
  padding: 24rpx 40rpx;
  border-bottom: 1px solid #f0f0f0;

  .filter-item,
  .sort-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    cursor: pointer;

    .filter-icon,
    .sort-icon {
      font-size: 28rpx;
      color: #000000;
    }

    .filter-label,
    .sort-label {
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
    }
  }
}

/* 产品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 24rpx 20rpx;

  .product-card {
    position: relative;
    background: #f8f8f8;
    border-radius: 8rpx;
    overflow: hidden;
    cursor: pointer;
    

    &:active {
      opacity: 0.9;
    }

    .product-image-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      background: #f5f5f5;
      overflow: hidden;

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .badge {
        position: absolute;
        top: 12rpx;
        left: 12rpx;
        padding: 4rpx 12rpx;
        background: #000000;
        color: #ffffff;
        font-size: 18rpx;
        font-weight: 600;
        border-radius: 3rpx;
      }

      .image-dots {
        position: absolute;
        bottom: 12rpx;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 6rpx;

        .dot {
          width: 6rpx;
          height: 6rpx;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);

          &.active {
            background: #ffffff;
          }
        }
      }
    }

    .product-info {
      padding: 12rpx;

      .product-name {
        display: block;
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
        margin-bottom: 8rpx;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .product-price {
        display: block;
        font-size: 26rpx;
        color: #000000;
        font-weight: 600;
      }
    }

    .favorite-btn {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      cursor: pointer;

      text {
        font-size: 28rpx;
        color: #999999;

        &.active {
          color: #ff0000;
        }
      }

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
