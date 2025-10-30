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
import { getCategories, getProducts, searchProducts } from '../../services/products'

export default {
  data() {
    return {
      searchKeyword: '',
      activeCategory: 0,
      activeSortIndex: 0,
      isLoading: true,
      categories: [],
      sortOptions: [
        { label: '推荐', value: 'recommend' },
        { label: '新品', value: 'new' },
        { label: '热销', value: 'hot' },
        { label: '价格↓', value: 'price_desc' },
        { label: '价格↑', value: 'price_asc' }
      ],
      allProducts: [],
      searchTimer: null
    }
  },
  async onLoad() {
    // 初始化分类
    this.categories = getCategories()

    // 加载默认商品列表
    this.loadProducts()
  },
  computed: {
    filteredProducts() {
      let products = this.allProducts

      // 按搜索关键词过滤（本地搜索）
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
          // 后端已按销量排序，此处只做本地补充排序
          break
        case 'price_desc':
          products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
          break
        case 'price_asc':
          products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          break
        default:
          // 推荐顺序（后端默认）
          break
      }

      return products
    }
  },
  methods: {
    /**
     * 加载商品列表
     */
    async loadProducts() {
      this.isLoading = true
      try {
        const sortValue = this.sortOptions[this.activeSortIndex].value
        const categoryId = this.activeCategory === 0 ? 0 : this.categories[this.activeCategory].id

        const products = await getProducts({
          page: 1,
          limit: 50,
          categoryId: categoryId === 0 ? undefined : categoryId,
          sortBy: sortValue
        })

        this.allProducts = products
      } catch (error) {
        console.error('Failed to load products:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 搜索输入（防抖）
     */
    onSearchInput(e) {
      this.searchKeyword = e.detail.value

      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      // 如果搜索关键词为空，加载当前分类商品
      if (!this.searchKeyword.trim()) {
        this.loadProducts()
        return
      }

      // 防抖：300ms后执行搜索
      this.searchTimer = setTimeout(async () => {
        this.isLoading = true
        try {
          const products = await searchProducts(this.searchKeyword)
          this.allProducts = products
        } catch (error) {
          console.error('Search failed:', error)
        } finally {
          this.isLoading = false
        }
      }, 300)
    },

    /**
     * 清空搜索
     */
    clearSearch() {
      this.searchKeyword = ''
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.loadProducts()
    },

    /**
     * 图片加载完成
     */
    onImageLoad() {
      // 图片加载完成，可在此处添加加载计数逻辑
    },

    /**
     * 分类切换
     */
    async onCategoryChange(index) {
      this.activeCategory = index
      this.activeSortIndex = 0
      this.searchKeyword = ''
      await this.loadProducts()
    },

    /**
     * 排序方式切换
     */
    async onSortChange(index) {
      this.activeSortIndex = index
      await this.loadProducts()
    },

    /**
     * 商品点击
     */
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
