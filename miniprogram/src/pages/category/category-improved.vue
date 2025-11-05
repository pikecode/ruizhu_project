<!--
  改进版分类页面
  使用完整的商品数据模型
  支持更多功能和更好的性能
-->

<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        type="text"
        placeholder="搜索商品"
        class="search-input"
        :value="searchKeyword"
        @input="onSearchInput"
      />
    </view>

    <!-- 分类和排序筛选 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view
          v-for="(category, index) in categories"
          :key="category.id"
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
          :key="sort.value"
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
      <view v-if="filteredProducts.length > 0" class="product-grid">
        <view
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-item"
          @tap="onProductTap(product)"
        >
          <!-- 图片容器 -->
          <view class="product-image-wrapper">
            <image
              :src="product.images.cover"
              mode="aspectFill"
              class="product-image"
            />

            <!-- 状态徽章 -->
            <view v-if="getStatusBadges(product).length > 0" class="badges">
              <view
                v-for="(badge, idx) in getStatusBadges(product)"
                :key="idx"
                class="badge"
                :class="getBadgeClass(badge)"
              >
                {{ badge }}
              </view>
            </view>
          </view>

          <!-- 商品信息 -->
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>

            <!-- 分类和统计 -->
            <view class="product-meta">
              <text class="product-category">{{ product.category.name }}</text>
              <text class="product-stats" v-if="product.stats.rating">
                ⭐ {{ product.stats.rating }} ({{ product.stats.reviews }})
              </text>
            </view>

            <!-- 价格和折扣 -->
            <view class="price-section">
              <text class="current-price">
                ¥{{ formatPrice(product.price.current) }}
              </text>
              <text
                v-if="product.price.discount && product.price.discount < 100"
                class="discount-badge"
              >
                {{ product.price.discount }}折
              </text>
              <text
                v-if="product.price.original > product.price.current"
                class="original-price"
              >
                ¥{{ formatPrice(product.price.original) }}
              </text>
            </view>

            <!-- 库存状态 -->
            <view class="stock-status" v-if="!isProductAvailable(product)">
              {{ getOutOfStockText(product) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">未找到相关商品</text>
        <button class="empty-btn" @tap="resetFilters">重置筛选</button>
      </view>
    </view>

    <!-- 加载提示 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type {
  Product,
  Category,
  Price,
  ProductImages,
  ProductStatus,
  ProductStats,
  ProductStock,
  SortType
} from '@/types/product'
import {
  formatPrice,
  isProductAvailable,
  getStatusBadges,
  calculateDiscount,
  SortType as SortTypeEnum
} from '@/types/product'

interface SortOption {
  label: string
  value: SortType
}

export default defineComponent({
  name: 'CategoryPage',

  data() {
    return {
      // 搜索和筛选
      searchKeyword: '',
      activeCategory: 0,
      activeSortIndex: 0,

      // 分类列表
      categories: [
        { id: 'all', name: '全部' },
        { id: 'bags', name: '手袋' },
        { id: 'backpacks', name: '背包' },
        { id: 'wallets', name: '钱包' },
        { id: 'accessories', name: '配件' }
      ] as Category[],

      // 排序选项
      sortOptions: [
        { label: '推荐', value: SortTypeEnum.RECOMMEND },
        { label: '新品', value: SortTypeEnum.NEW },
        { label: '热销', value: SortTypeEnum.HOT },
        { label: '价格↓', value: SortTypeEnum.PRICE_DESC },
        { label: '价格↑', value: SortTypeEnum.PRICE_ASC }
      ] as SortOption[],

      // 商品数据
      allProducts: [] as Product[],
      loading: false
    }
  },

  computed: {
    /**
     * 计算过滤和排序后的商品列表
     */
    filteredProducts(): Product[] {
      let products = [...this.allProducts]

      // 1. 按分类过滤
      if (this.activeCategory !== 0) {
        const selectedCategoryId = this.categories[this.activeCategory].id
        products = products.filter(p => p.category.id === selectedCategoryId)
      }

      // 2. 按搜索关键词过滤
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        products = products.filter(p => {
          const matchName = p.name.toLowerCase().includes(keyword)
          const matchDescription = p.description.toLowerCase().includes(keyword)
          const matchCategory = p.category.name.toLowerCase().includes(keyword)
          const matchTags = p.tags.some(tag =>
            tag.toLowerCase().includes(keyword)
          )

          return matchName || matchDescription || matchCategory || matchTags
        })
      }

      // 3. 排序
      const sortValue = this.sortOptions[this.activeSortIndex].value
      products = this.sortProducts(products, sortValue)

      return products
    }
  },

  methods: {
    /**
     * 搜索输入处理
     */
    onSearchInput(e: any) {
      this.searchKeyword = e.detail.value
      // 搜索时重置分类 (可选)
      // this.activeCategory = 0
    },

    /**
     * 分类切换
     */
    onCategoryChange(index: number) {
      this.activeCategory = index
    },

    /**
     * 排序方式切换
     */
    onSortChange(index: number) {
      this.activeSortIndex = index
    },

    /**
     * 商品点击 - 导航到详情页
     */
    onProductTap(product: Product) {
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?id=${product.id}`
      })
    },

    /**
     * 重置所有筛选
     */
    resetFilters() {
      this.searchKeyword = ''
      this.activeCategory = 0
      this.activeSortIndex = 0
    },

    /**
     * 排序商品列表
     */
    sortProducts(products: Product[], sortType: SortType): Product[] {
      const sorted = [...products]

      switch (sortType) {
        case SortTypeEnum.NEW:
          // 新品优先
          sorted.sort((a, b) => {
            if (a.status.isNew === b.status.isNew) {
              return b.createdAt - a.createdAt
            }
            return a.status.isNew ? -1 : 1
          })
          break

        case SortTypeEnum.HOT:
          // 按销量排序
          sorted.sort((a, b) => b.stats.sales - a.stats.sales)
          break

        case SortTypeEnum.PRICE_DESC:
          // 价格从高到低
          sorted.sort((a, b) => b.price.current - a.price.current)
          break

        case SortTypeEnum.PRICE_ASC:
          // 价格从低到高
          sorted.sort((a, b) => a.price.current - b.price.current)
          break

        case SortTypeEnum.RECOMMEND:
        default:
          // 推荐顺序 (按创建时间 + 销量组合)
          sorted.sort((a, b) => {
            const scoreA = b.stats.sales + (b.status.isNew ? 10000 : 0)
            const scoreB = a.stats.sales + (a.status.isNew ? 10000 : 0)
            return scoreA - scoreB
          })
          break
      }

      return sorted
    },

    /**
     * 导入外部函数
     */
    formatPrice,
    isProductAvailable,
    getStatusBadges,

    /**
     * 获取缺货文案
     */
    getOutOfStockText(product: Product): string {
      if (product.status.isSoldOut) return '已售罄'
      if (product.status.isOutOfStock) return '缺货'
      return '库存不足'
    },

    /**
     * 获取徽章的样式类
     */
    getBadgeClass(badge: string): string {
      const classMap: { [key: string]: string } = {
        '新品': 'badge-new',
        '已售罄': 'badge-soldout',
        'VIP专属': 'badge-vip',
        '缺货': 'badge-outofstock'
      }
      return classMap[badge] || ''
    },

    /**
     * 加载商品数据
     */
    async fetchProducts() {
      this.loading = true

      try {
        // 模拟 API 调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // TODO: 替换为真实 API 调用
        // const response = await uni.request({
        //   url: `${API_BASE}/api/v1/products`,
        //   method: 'GET',
        //   data: {
        //     page: 1,
        //     limit: 50
        //   }
        // })

        // 演示数据 (实际应该从 API 获取)
        this.allProducts = this.generateMockProducts()
      } catch (error) {
        console.error('加载商品失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 生成演示数据
     */
    generateMockProducts(): Product[] {
      const mockData: Product[] = [
        {
          id: 1,
          name: '经典皮质手袋',
          description: '高端皮革手工打造的经典款式',
          category: { id: 'bags', name: '手袋' },
          tags: [],
          price: {
            original: 128000,
            current: 99800,
            discount: 78,
            currency: 'CNY'
          },
          images: {
            thumb: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&q=60',
            cover: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
            detail: [
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90'
            ]
          },
          status: {
            isNew: false,
            isSaleOn: true,
            isOutOfStock: false,
            isSoldOut: false
          },
          stats: {
            sales: 2850,
            views: 15000,
            rating: 4.8,
            reviews: 342,
            favorites: 1200
          },
          stock: {
            quantity: 50,
            lowStockThreshold: 10
          },
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now()
        },
        {
          id: 2,
          name: '优雅肩挎包',
          description: '简约设计，优雅品味',
          category: { id: 'bags', name: '手袋' },
          tags: ['new'],
          price: {
            original: 98000,
            current: 98000,
            currency: 'CNY'
          },
          images: {
            thumb: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=60',
            cover: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
            detail: [
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90'
            ]
          },
          status: {
            isNew: true,
            isSaleOn: true,
            isOutOfStock: false,
            isSoldOut: false
          },
          stats: {
            sales: 1240,
            views: 8500,
            rating: 4.6,
            reviews: 189,
            favorites: 580
          },
          stock: {
            quantity: 30,
            lowStockThreshold: 10
          },
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now()
        }
        // ... 更多商品
      ]

      return mockData
    }
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.fetchProducts()
  }
})
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
}

/* === 搜索栏 === */
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

    &::placeholder {
      color: #999999;
    }
  }
}

/* === 筛选部分 === */
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
    scroll-behavior: smooth;

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
    transition: all 0.3s ease;

    &.active {
      background: #000000;
      color: #ffffff;
    }

    &:active {
      transform: scale(0.95);
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
    transition: all 0.3s ease;

    &.active {
      color: #000000;
      border-bottom-color: #000000;

      .sort-text {
        font-weight: 500;
      }
    }

    &:active {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

/* === 商品网格 === */
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
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    /* === 图片容器 === */
    .product-image-wrapper {
      position: relative;
      width: 100%;
      height: 340rpx;
      background: #f5f5f5;
      overflow: hidden;

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* === 徽章 === */
      .badges {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .badge {
          padding: 6rpx 12rpx;
          border-radius: 4rpx;
          font-size: 20rpx;
          font-weight: 500;
          text-align: center;
          width: max-content;

          &.badge-new {
            background: #000000;
            color: #ffffff;
          }

          &.badge-vip {
            background: #ffd700;
            color: #333333;
          }

          &.badge-soldout {
            background: #999999;
            color: #ffffff;
          }

          &.badge-outofstock {
            background: #ff6b6b;
            color: #ffffff;
          }
        }
      }
    }

    /* === 商品信息 === */
    .product-info {
      padding: 24rpx;

      .product-name {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 12rpx;
        font-weight: 400;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      /* === 元数据 === */
      .product-meta {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 12rpx;
        font-size: 22rpx;

        .product-category {
          color: #999999;
        }

        .product-stats {
          color: #ff6b6b;
          font-weight: 500;
        }
      }

      /* === 价格部分 === */
      .price-section {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 12rpx;

        .current-price {
          font-size: 32rpx;
          color: #000000;
          font-weight: 600;
        }

        .discount-badge {
          padding: 4rpx 8rpx;
          background: #ff6b6b;
          color: #ffffff;
          font-size: 18rpx;
          border-radius: 3rpx;
          font-weight: 500;
        }

        .original-price {
          font-size: 22rpx;
          color: #999999;
          text-decoration: line-through;
        }
      }

      /* === 库存状态 === */
      .stock-status {
        font-size: 20rpx;
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }
}

/* === 空状态 === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  padding: 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 40rpx;
  }

  .empty-btn {
    padding: 12rpx 40rpx;
    background: #000000;
    color: #ffffff;
    border-radius: 6rpx;
    font-size: 26rpx;
    border: none;
  }
}

/* === 加载状态 === */
.loading {
  position: fixed;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 20rpx 40rpx;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  border-radius: 8rpx;
  font-size: 26rpx;
  z-index: 1000;
}
</style>
