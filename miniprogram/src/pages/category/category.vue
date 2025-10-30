<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-wrapper">
        <input
          type="text"
          placeholder="搜索商品"
          class="search-input"
          v-model="searchKeyword"
          @input="onSearchInput"
        />
        <view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">✕</view>
      </view>
    </view>

    <!-- 分类和排序筛选 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view
          v-for="(category, index) in categories"
          :key="index"
          class="filter-tab"
          :class="{ active: activeCategory === index }"
          @tap="onCategoryChange(index)"
        >
          <text>{{ category.name }}</text>
        </view>
      </view>

      <view class="sort-options">
        <view
          v-for="(sort, index) in sortOptions"
          :key="index"
          class="sort-item"
          :class="{ active: activeSortIndex === index }"
          @tap="onSortChange(index)"
        >
          <text class="sort-text">{{ sort.label }}</text>
        </view>
      </view>
    </view>

    <!-- 商品网格 -->
    <view class="products-section">
      <!-- 骨架屏加载状态 -->
      <view v-if="isLoading" class="product-grid">
        <view
          v-for="(_, index) in 4"
          :key="'skeleton-' + index"
          class="product-item skeleton-item"
        >
          <view class="product-image-wrapper">
            <view class="skeleton-image"></view>
          </view>
          <view class="product-info">
            <view class="skeleton-text skeleton-title"></view>
            <view class="skeleton-text skeleton-category"></view>
            <view class="skeleton-text skeleton-price"></view>
          </view>
        </view>
      </view>

      <!-- 实际内容 -->
      <view v-else class="product-grid">
        <view
          v-for="(product, index) in filteredProducts"
          :key="index"
          class="product-item"
          @tap="onProductTap(product)"
        >
          <view class="product-image-wrapper">
            <image
              class="product-image"
              :src="product.image"
              mode="aspectFill"
              @load="onImageLoad"
            ></image>
            <view v-if="product.isNew" class="product-badge">新品</view>
          </view>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <view class="product-meta">
              <text class="product-category">{{ product.category }}</text>
            </view>
            <text class="product-price">¥{{ product.price }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!isLoading && filteredProducts.length === 0" class="empty-state">
        <text class="empty-text">未找到相关商品</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      activeCategory: 0,
      activeSortIndex: 0,
      isLoading: true,
      categories: [
        { id: 'all', name: '全部' },
        { id: 'clothing', name: '服装' },
        { id: 'jewelry', name: '珠宝' },
        { id: 'shoes', name: '鞋履' },
        { id: 'perfume', name: '香水' }
      ],
      sortOptions: [
        { label: '推荐', value: 'recommend' },
        { label: '新品', value: 'new' },
        { label: '热销', value: 'hot' },
        { label: '价格↓', value: 'price_desc' },
        { label: '价格↑', value: 'price_asc' }
      ],
      allProducts: [
        // 服装系列
        {
          id: 1,
          name: '经典黑色T恤',
          category: '服装',
          categoryId: 'clothing',
          price: '2800',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 2,
          name: '优雅连衣裙',
          category: '服装',
          categoryId: 'clothing',
          price: '4800',
          image: 'https://images.unsplash.com/photo-1595777707802-41d339d60280?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 3,
          name: '商务夹克',
          category: '服装',
          categoryId: 'clothing',
          price: '5600',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80',
          isNew: false,
          isSold: false
        },
        // 珠宝系列
        {
          id: 4,
          name: '黄金项链',
          category: '珠宝',
          categoryId: 'jewelry',
          price: '18600',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 5,
          name: '钻石手镯',
          category: '珠宝',
          categoryId: 'jewelry',
          price: '32000',
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 6,
          name: '珍珠耳环',
          category: '珠宝',
          categoryId: 'jewelry',
          price: '8800',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          isNew: false,
          isSold: false
        },
        // 鞋履系列
        {
          id: 7,
          name: '高跟鞋',
          category: '鞋履',
          categoryId: 'shoes',
          price: '3200',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 8,
          name: '运动鞋',
          category: '鞋履',
          categoryId: 'shoes',
          price: '1200',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 9,
          name: '皮革靴子',
          category: '鞋履',
          categoryId: 'shoes',
          price: '2800',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
          isNew: false,
          isSold: false
        },
        // 香水系列
        {
          id: 10,
          name: '玫瑰香水',
          category: '香水',
          categoryId: 'perfume',
          price: '1800',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 11,
          name: '柑橘香氛',
          category: '香水',
          categoryId: 'perfume',
          price: '1500',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 12,
          name: '木质香水',
          category: '香水',
          categoryId: 'perfume',
          price: '2200',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          isNew: false,
          isSold: false
        }
      ]
    }
  },
  onLoad() {
    // 模拟数据加载，500ms后隐藏骨架屏
    setTimeout(() => {
      this.isLoading = false
    }, 500)
  },
  computed: {
    filteredProducts() {
      let products = this.allProducts

      // 按分类过滤
      if (this.activeCategory !== 0) {
        const categoryId = this.categories[this.activeCategory].id
        products = products.filter(p => p.categoryId === categoryId)
      }

      // 按搜索关键词过滤
      if (this.searchKeyword) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          p.category.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }

      // 排序
      const sortValue = this.sortOptions[this.activeSortIndex].value
      switch (sortValue) {
        case 'new':
          products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
          break
        case 'hot':
          // 可根据销量或浏览量排序，这里简单示例
          products.sort((a, b) => b.id - a.id)
          break
        case 'price_desc':
          products.sort((a, b) => parseInt(b.price) - parseInt(a.price))
          break
        case 'price_asc':
          products.sort((a, b) => parseInt(a.price) - parseInt(b.price))
          break
        default:
          // 推荐顺序
          break
      }

      return products
    }
  },
  methods: {
    onSearchInput(e) {
      this.searchKeyword = e.detail.value
    },
    clearSearch() {
      this.searchKeyword = ''
    },
    onImageLoad() {
      // 图片加载完成，可在此处添加加载计数逻辑
    },
    onCategoryChange(index) {
      this.activeCategory = index
    },
    onSortChange(index) {
      this.activeSortIndex = index
    },
    onProductTap(product) {
      uni.navigateTo({
        url: '/pages/product/detail'
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

/* 搜索栏 */
.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx 40rpx;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    padding-right: 60rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    font-size: 28rpx;
    color: #333333;
    border: none;

    &:focus {
      background: #f0f0f0;
    }
  }

  .clear-btn {
    position: absolute;
    right: 20rpx;
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #999999;

    &:active {
      color: #333333;
    }
  }
}

/* 筛选部分 */
.filter-section {
  padding: 20rpx 40rpx;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .filter-tabs {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;
    overflow-x: auto;
    padding-bottom: 12rpx;

    &::-webkit-scrollbar {
      height: 4rpx;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 2rpx;
    }
  }

  .filter-tab {
    flex-shrink: 0;
    padding: 12rpx 24rpx;
    background: #f5f5f5;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666666;
    border: 1px solid transparent;

    &.active {
      background: #000000;
      color: #ffffff;
    }
  }

  .sort-options {
    display: flex;
    gap: 16rpx;
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 4rpx;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
    }
  }

  .sort-item {
    flex-shrink: 0;
    padding: 8rpx 16rpx;
    font-size: 24rpx;
    color: #999999;
    border-bottom: 2rpx solid transparent;

    &.active {
      color: #000000;
      border-bottom-color: #000000;

      .sort-text {
        font-weight: 500;
      }
    }
  }
}

/* 商品网格 */
.products-section {
  padding: 40rpx;

  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }

  .product-item {
    background: #ffffff;
    border-radius: 8rpx;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

    &:active {
      opacity: 0.9;
    }

    .product-image-wrapper {
      position: relative;
      width: 100%;
      height: 340rpx;
      background: #f5f5f5;
      overflow: hidden;

      .product-image {
        width: 100%;
        height: 100%;
      }

      .product-badge {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        padding: 6rpx 12rpx;
        background: #000000;
        color: #ffffff;
        font-size: 20rpx;
        font-weight: 500;
        border-radius: 4rpx;
      }
    }

    .product-info {
      padding: 24rpx;

      .product-name {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 12rpx;
        font-weight: 400;
        line-height: 1.3;
      }

      .product-meta {
        margin-bottom: 12rpx;

        .product-category {
          font-size: 24rpx;
          color: #999999;
        }
      }

      .product-price {
        display: block;
        font-size: 32rpx;
        color: #000000;
        font-weight: 600;
      }
    }
  }
}

/* 骨架屏加载动画 */
.skeleton-item {
  pointer-events: none;

  .skeleton-image {
    width: 100%;
    height: 340rpx;
    background: linear-gradient(
      90deg,
      #f0f0f0 0%,
      #f8f8f8 50%,
      #f0f0f0 100%
    );
    background-size: 200% 100%;
    animation: skeletonLoading 1.5s infinite;
    border-radius: 8rpx;
  }

  .skeleton-text {
    height: 16rpx;
    background: linear-gradient(
      90deg,
      #f0f0f0 0%,
      #f8f8f8 50%,
      #f0f0f0 100%
    );
    background-size: 200% 100%;
    animation: skeletonLoading 1.5s infinite;
    border-radius: 4rpx;
    margin-bottom: 12rpx;

    &.skeleton-title {
      width: 90%;
      height: 24rpx;
    }

    &.skeleton-category {
      width: 60%;
      height: 16rpx;
    }

    &.skeleton-price {
      width: 50%;
      height: 20rpx;
    }
  }

  .product-info {
    padding: 24rpx;

    .skeleton-text:last-child {
      margin-bottom: 0;
    }
  }
}

@keyframes skeletonLoading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;

  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>
