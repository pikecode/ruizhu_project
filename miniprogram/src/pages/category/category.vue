<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        type="text"
        placeholder="搜索商品"
        class="search-input"
        @input="onSearchInput"
      />
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
      <view class="product-grid">
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
      <view v-if="filteredProducts.length === 0" class="empty-state">
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
      categories: [
        { id: 'all', name: '全部' },
        { id: 'bags', name: '手袋' },
        { id: 'backpacks', name: '背包' },
        { id: 'wallets', name: '钱包' },
        { id: 'accessories', name: '配件' }
      ],
      sortOptions: [
        { label: '推荐', value: 'recommend' },
        { label: '新品', value: 'new' },
        { label: '热销', value: 'hot' },
        { label: '价格↓', value: 'price_desc' },
        { label: '价格↑', value: 'price_asc' }
      ],
      allProducts: [
        // 手袋系列
        {
          id: 1,
          name: '经典皮质手袋',
          category: '手袋',
          categoryId: 'bags',
          price: '12800',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 2,
          name: '优雅肩挎包',
          category: '手袋',
          categoryId: 'bags',
          price: '9800',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 3,
          name: '简约公文包',
          category: '手袋',
          categoryId: 'bags',
          price: '15600',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          isNew: false,
          isSold: false
        },
        // 背包系列
        {
          id: 4,
          name: '高端旅行背包',
          category: '背包',
          categoryId: 'backpacks',
          price: '8600',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 5,
          name: '商务双肩包',
          category: '背包',
          categoryId: 'backpacks',
          price: '7200',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 6,
          name: '户外探险背包',
          category: '背包',
          categoryId: 'backpacks',
          price: '6800',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
          isNew: false,
          isSold: false
        },
        // 钱包系列
        {
          id: 7,
          name: '优雅钱包',
          category: '钱包',
          categoryId: 'wallets',
          price: '3200',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 8,
          name: '长款皮夹',
          category: '钱包',
          categoryId: 'wallets',
          price: '4200',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 9,
          name: '卡片夹',
          category: '钱包',
          categoryId: 'wallets',
          price: '1800',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
          isNew: false,
          isSold: false
        },
        // 配件系列
        {
          id: 10,
          name: '皮质腰带',
          category: '配件',
          categoryId: 'accessories',
          price: '2800',
          image: 'https://images.unsplash.com/photo-1624526267942-ab67cb38a25f?w=400&q=80',
          isNew: false,
          isSold: false
        },
        {
          id: 11,
          name: '丝巾',
          category: '配件',
          categoryId: 'accessories',
          price: '1200',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          isNew: true,
          isSold: false
        },
        {
          id: 12,
          name: '钥匙扣',
          category: '配件',
          categoryId: 'accessories',
          price: '680',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          isNew: false,
          isSold: false
        }
      ]
    }
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
    onCategoryChange(index) {
      this.activeCategory = index
    },
    onSortChange(index) {
      this.activeSortIndex = index
    },
    onProductTap(product) {
      uni.showToast({
        title: product.name,
        icon: 'none',
        duration: 1500
      })
      // 可以导航到商品详情页
      // uni.navigateTo({
      //   url: `/pages/product-detail/product-detail?id=${product.id}`
      // })
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

  .search-input {
    width: 100%;
    height: 72rpx;
    padding: 0 24rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    font-size: 28rpx;
    color: #333333;
    border: none;
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
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:active {
      transform: scale(0.98);
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
