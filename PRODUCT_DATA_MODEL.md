# 🎯 商品信息数据结构设计指南

## 📋 目录
1. [当前分析](#当前分析)
2. [完整数据模型](#完整数据模型)
3. [数据设计方案](#数据设计方案)
4. [API 响应格式](#api-响应格式)
5. [实现示例](#实现示例)
6. [最佳实践](#最佳实践)

---

## 🔍 当前分析

### 现有商品数据结构

分类页面当前使用的商品模型（12 个商品，5 个分类）：

```javascript
{
  id: 1,                                    // 商品 ID
  name: '经典皮质手袋',                      // 商品名称
  category: '手袋',                         // 分类名称 (显示用)
  categoryId: 'bags',                       // 分类 ID (逻辑用)
  price: '12800',                           // 价格 (字符串)
  image: 'https://images.unsplash.com/...', // 商品主图
  isNew: false,                             // 是否新品
  isSold: false                             // 是否已售出
}
```

### 当前设计的优点

✅ **简单直观** - 字段少，易于理解
✅ **够用于当前** - 能展示首页、分类、VIP 页面
✅ **排序过滤方便** - 已支持分类、搜索、排序
✅ **UI 展示满足** - 名称、价格、图片、徽章

### 当前设计的问题

❌ **字段不足** - 缺少库存、销量、评分等重要信息
❌ **价格格式混乱** - 字符串格式，计算时需要转换
❌ **图片单一** - 仅一张主图，无缩略图、详情图
❌ **描述缺失** - 无商品描述、规格信息
❌ **无关联数据** - 无品牌、颜色、尺码等属性
❌ **购物车差异** - 购物袋页面缺少 quantity、选中状态等
❌ **统计数据缺失** - 无销量、浏览量、评价数等
❌ **不支持详情页** - 缺少详情页所需的数据字段

---

## 📊 完整数据模型

### 方案 1: 基础版（推荐用于初期）

```typescript
/**
 * 商品基础信息模型
 * 用于列表页、分类页、搜索页展示
 */
interface Product {
  // 基础字段
  id: number                          // 商品 ID (必需)
  name: string                        // 商品名称 (必需)
  description: string                 // 简短描述 (100字以内)

  // 分类和标签
  category: {
    id: string                        // 分类 ID (bags/wallets/...)
    name: string                      // 分类名称 (手袋/钱包/...)
  }
  tags: string[]                      // 标签数组 (新品/热销/VIP 专属/...)

  // 价格和销售
  price: {
    original: number                  // 原价 (数字格式)
    current: number                   // 现价 (数字格式)
    discount?: number                 // 折扣率 (0-100)
  }

  // 图片
  images: {
    thumb: string                     // 缩略图 (200x200)
    cover: string                     // 封面/主图 (400x400)
    list?: string[]                   // 列表页用
    detail?: string[]                 // 详情页用 (高清图)
  }

  // 状态
  status: {
    isNew: boolean                    // 新品标记
    isSaleOn: boolean                 // 是否上架
    isOutOfStock: boolean             // 库存状态
    isSoldOut?: boolean               // 是否售罄
    isVipOnly?: boolean               // VIP 专属
  }

  // 统计信息
  stats: {
    sales: number                     // 销量
    views: number                     // 浏览量
    rating: number                    // 评分 (0-5)
    reviews: number                   // 评价数
    favorites: number                 // 收藏数
  }

  // 库存
  stock: {
    quantity: number                  // 库存数量
    low_stock_threshold: number       // 库存预警阈值
  }

  // 时间戳
  createdAt: number                   // 创建时间 (Unix timestamp)
  updatedAt: number                   // 更新时间
}
```

### 方案 2: 标准版（推荐用于完整电商）

```typescript
/**
 * 完整商品模型
 * 包含详情页、购物车、订单所需的全部信息
 */
interface FullProduct extends Product {
  // 商品详细信息
  details: {
    brand: string                     // 品牌
    material: string                  // 材质
    origin: string                    // 产地
    weight?: string                   // 重量
    dimensions?: {                    // 尺寸
      length: number
      width: number
      height: number
      unit: 'cm' | 'inch'
    }
  }

  // 属性和规格
  attributes: {
    colors?: Array<{                  // 颜色选项
      id: string
      name: string
      hex?: string                    // 十六进制颜色值
      images?: string[]               // 该颜色的图片
    }>
    sizes?: Array<{                   // 尺码选项
      id: string
      label: string                   // S/M/L/XL 等
      value?: string                  // 具体数值
      stock?: number                  // 该规格库存
    }>
    [key: string]: any                // 其他属性
  }

  // 运费
  shipping: {
    weight: number                    // 重量 (克)
    dimensions?: {
      length: number
      width: number
      height: number
    }
    template_id?: string              // 运费模板 ID
    free_shipping_threshold?: number  // 免运费额度
  }

  // 详情页内容
  content: {
    fullDescription: string           // 完整描述 (HTML)
    highlights: string[]              // 卖点列表
    careGuide?: string                // 护理指南
    warranty?: string                 // 保修信息
  }

  // SEO 信息
  seo?: {
    keywords: string[]
    metaDescription: string
  }

  // 推荐和关联
  relations?: {
    relatedProducts: number[]         // 相关商品 ID
    bundleProducts?: Array<{          // 套餐商品
      id: number
      quantity: number
      discount?: number
    }>
  }
}
```

### 方案 3: 购物车商品模型

```typescript
/**
 * 购物车中的商品模型
 * 包含用户选择的属性和数量
 */
interface CartProduct extends Product {
  // 购物车特定字段
  cartItem: {
    quantity: number                  // 购买数量
    selectedColor?: string            // 选中的颜色
    selectedSize?: string             // 选中的尺码
    selectedAttributes?: {            // 其他选中的属性
      [key: string]: string
    }
    addedAt: number                   // 加入购物车时间
    cartPrice: number                 // 加入时的价格 (用于对比)
  }

  // 计算字段
  subtotal?: number                   // 小计 (price * quantity)
  discount?: number                   // 该商品的折扣金额
}
```

### 方案 4: 订单商品模型

```typescript
/**
 * 订单中的商品模型
 */
interface OrderProduct extends CartProduct {
  orderItem: {
    orderId: string                   // 订单 ID
    orderPrice: number                // 订单时的价格
    paidPrice: number                 // 实付价格
    status: 'pending' | 'shipped' | 'delivered' | 'returned'
    refundable: boolean               // 是否可退款
    refundReason?: string             // 退款原因
  }
}
```

---

## 🎨 数据设计方案

### 核心设计原则

#### 1️⃣ 字段分离原则

```
同一数据，不同角度的使用：

商品基础信息 (Product)
  ├─ 列表页展示 (精简版)
  ├─ 详情页展示 (完整版)
  └─ 搜索结果展示 (精简版)

购物车商品 (CartProduct)
  ├─ 用户选择的属性
  ├─ 购买数量
  └─ 实时价格

订单商品 (OrderProduct)
  ├─ 订单时的价格 (固定)
  ├─ 订单状态
  └─ 退货信息
```

#### 2️⃣ 价格字段规范

```javascript
// ❌ 错误做法
price: '12800'                    // 字符串，不便于计算

// ✅ 正确做法
price: {
  original: 12800,              // 原价 (以分为单位: 元 * 100)
  current: 9800,                // 现价
  discount: 78                  // 折扣率 (78% = 78折)
  currency: 'CNY'               // 货币类型
}

// 好处
// - 数字格式便于计算
// - 包含多个价格字段
// - 支持币种信息
// - 容易计算折扣和税费
```

#### 3️⃣ 图片字段规范

```javascript
// ❌ 原始做法
image: 'https://...'              // 单一图片，多个地方使用不同尺寸

// ✅ 改进做法
images: {
  thumb: 'https://.../200x200',    // 缩略图 (轻量级)
  cover: 'https://.../400x400',    // 列表/搜索用
  list: [                          // 列表页图片组
    'https://.../400x400',
    'https://.../400x400'
  ],
  detail: [                        // 详情页高清图
    'https://.../800x800',
    'https://.../800x800'
  ]
}

// 好处
// - 不同场景用不同图片
// - 减少加载体积
// - 支持图片懒加载
// - 便于 CDN 优化
```

#### 4️⃣ 状态字段规范

```javascript
// ❌ 散乱的状态字段
isNew: true
isSold: false
isVipOnly: true
inStock: true

// ✅ 结构化状态
status: {
  isNew: true,              // 新品标记
  isSaleOn: true,           // 上架状态
  isOutOfStock: false,      // 缺货状态
  isSoldOut: false,         // 售罄状态
  isVipOnly: true           // VIP 专属
}

// 好处
// - 状态集中管理
// - 易于扩展
// - 逻辑清晰
```

#### 5️⃣ 数据汇总字段

```javascript
// 列表页需要的汇总信息
stats: {
  sales: 2850,              // 销量
  views: 15000,             // 浏览次数
  rating: 4.8,              // 平均评分
  reviews: 342,             // 评价数量
  favorites: 1200           // 收藏数
}

// 好处
// - 减少计算，直接显示
// - 提高性能
// - 便于排序 (热销排序用 sales)
```

---

## 🔌 API 响应格式

### 列表页 API

```typescript
/**
 * GET /api/v1/products
 * Query: category, page, limit, sort, search
 */
interface ListProductsResponse {
  code: 0,
  message: 'success',
  data: {
    products: Product[],          // 商品数组
    pagination: {
      page: 1,
      limit: 20,
      total: 250,
      hasMore: true
    },
    filters: {
      categories: Array<{
        id: string
        name: string
        count: number             // 该分类商品数
      }>,
      priceRange: {
        min: 100,
        max: 50000
      }
    }
  }
}
```

### 详情页 API

```typescript
/**
 * GET /api/v1/products/:id
 */
interface ProductDetailResponse {
  code: 0,
  message: 'success',
  data: FullProduct & {
    reviews: Array<{               // 评价列表
      id: string
      userId: string
      userName: string
      rating: number
      comment: string
      images?: string[]
      createdAt: number
    }>,
    relatedProducts: Product[]      // 相关商品
  }
}
```

### 搜索 API

```typescript
/**
 * GET /api/v1/products/search
 * Query: keyword, filters, sort, page, limit
 */
interface SearchResponse {
  code: 0,
  message: 'success',
  data: {
    keyword: string,
    results: Product[],
    total: number,
    suggestions: string[]          // 搜索建议
  }
}
```

---

## 💻 实现示例

### 1️⃣ 基础版数据定义 (TypeScript)

```typescript
// types/product.ts

export interface Category {
  id: string
  name: string
}

export interface Price {
  original: number              // 元 * 100 (分)
  current: number
  discount?: number
  currency: 'CNY' | 'USD'
}

export interface ProductImages {
  thumb: string
  cover: string
  list?: string[]
  detail?: string[]
}

export interface ProductStatus {
  isNew: boolean
  isSaleOn: boolean
  isOutOfStock: boolean
  isSoldOut?: boolean
  isVipOnly?: boolean
}

export interface ProductStats {
  sales: number
  views: number
  rating: number
  reviews: number
  favorites: number
}

export interface Product {
  id: number
  name: string
  description: string

  category: Category
  tags: string[]

  price: Price
  images: ProductImages
  status: ProductStatus
  stats: ProductStats

  stock: {
    quantity: number
    lowStockThreshold: number
  }

  createdAt: number
  updatedAt: number
}
```

### 2️⃣ 分类页面改造

```vue
<script>
import type { Product } from '@/types/product'

export default {
  data() {
    return {
      allProducts: [] as Product[],
      searchKeyword: '',
      activeCategory: 0,
      activeSortIndex: 0,

      categories: [
        { id: 'all', name: '全部' },
        { id: 'bags', name: '手袋' },
        { id: 'wallets', name: '钱包' },
        // ...
      ],

      sortOptions: [
        { label: '推荐', value: 'recommend' },
        { label: '新品', value: 'new' },
        { label: '热销', value: 'hot' },
        { label: '价格↓', value: 'price_desc' },
        { label: '价格↑', value: 'price_asc' }
      ]
    }
  },

  computed: {
    filteredProducts() {
      let products = [...this.allProducts]

      // 分类过滤
      if (this.activeCategory !== 0) {
        const categoryId = this.categories[this.activeCategory].id
        products = products.filter(p => p.category.id === categoryId)
      }

      // 关键词过滤
      if (this.searchKeyword) {
        products = products.filter(p =>
          p.name.includes(this.searchKeyword) ||
          p.description.includes(this.searchKeyword)
        )
      }

      // 排序
      switch (this.sortOptions[this.activeSortIndex].value) {
        case 'new':
          products.sort((a, b) =>
            (b.status.isNew ? 1 : 0) - (a.status.isNew ? 1 : 0)
          )
          break
        case 'hot':
          products.sort((a, b) => b.stats.sales - a.stats.sales)
          break
        case 'price_desc':
          products.sort((a, b) => b.price.current - a.price.current)
          break
        case 'price_asc':
          products.sort((a, b) => a.price.current - b.price.current)
          break
      }

      return products
    }
  },

  async onLoad() {
    // 从 API 加载商品
    await this.fetchProducts()
  },

  methods: {
    async fetchProducts() {
      try {
        const response = await uni.request({
          url: `${API_BASE}/api/v1/products`,
          method: 'GET',
          data: {
            page: 1,
            limit: 20
          }
        })

        if (response[1].data.code === 0) {
          this.allProducts = response[1].data.data.products
        }
      } catch (error) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },

    onProductTap(product: Product) {
      // 导航到详情页，传递商品 ID
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?id=${product.id}`
      })
    },

    // 格式化价格显示
    formatPrice(price: number): string {
      return (price / 100).toFixed(2)
    }
  }
}
</script>
```

### 3️⃣ 购物车页面集成

```vue
<script>
import type { CartProduct, Product } from '@/types/product'

export default {
  data() {
    return {
      cartItems: [] as CartProduct[]
    }
  },

  computed: {
    cartTotal() {
      return this.cartItems.reduce((sum, item) => {
        return sum + (item.price.current * item.cartItem.quantity)
      }, 0)
    }
  },

  methods: {
    // 从其他页面添加到购物车
    addToCart(product: Product, options?: {
      color?: string
      size?: string
      quantity?: number
    }) {
      const existing = this.cartItems.find(
        item => item.id === product.id
      )

      if (existing) {
        existing.cartItem.quantity += options?.quantity || 1
      } else {
        const cartProduct: CartProduct = {
          ...product,
          cartItem: {
            quantity: options?.quantity || 1,
            selectedColor: options?.color,
            selectedSize: options?.size,
            addedAt: Date.now()
          }
        }
        this.cartItems.push(cartProduct)
      }

      // 保存到本地存储
      this.saveCart()
    },

    saveCart() {
      uni.setStorageSync('cart_items', JSON.stringify(this.cartItems))
    },

    loadCart() {
      const data = uni.getStorageSync('cart_items')
      if (data) {
        this.cartItems = JSON.parse(data)
      }
    }
  },

  onLoad() {
    this.loadCart()
  }
}
</script>
```

### 4️⃣ 商品详情页

```vue
<!-- pages/product-detail/product-detail.vue -->

<template>
  <view class="detail-page" v-if="product">
    <!-- 图片轮播 -->
    <swiper :indicator-dots="true" :autoplay="false">
      <swiper-item v-for="(img, idx) in product.images.detail" :key="idx">
        <image :src="img" mode="aspectFill" class="detail-image" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="product-info">
      <view class="name">{{ product.name }}</view>

      <!-- 价格 -->
      <view class="price-section">
        <text class="current-price">
          ¥{{ formatPrice(product.price.current) }}
        </text>
        <text class="original-price" v-if="product.price.discount">
          ¥{{ formatPrice(product.price.original) }}
        </text>
      </view>

      <!-- 统计信息 -->
      <view class="stats">
        <text>销量: {{ product.stats.sales }}</text>
        <text>评分: {{ product.stats.rating }}⭐</text>
        <text>评价: {{ product.stats.reviews }}</text>
      </view>

      <!-- 详细描述 -->
      <view class="description">{{ product.description }}</view>

      <!-- 颜色选择 -->
      <view class="attributes" v-if="product.attributes?.colors">
        <text class="label">选择颜色</text>
        <view class="color-options">
          <button
            v-for="color in product.attributes.colors"
            :key="color.id"
            :style="{ backgroundColor: color.hex }"
            @tap="selectedColor = color.id"
            :class="{ selected: selectedColor === color.id }"
          >
            {{ color.name }}
          </button>
        </view>
      </view>

      <!-- 库存 -->
      <view class="stock" v-if="product.stock.quantity > 0">
        库存充足 ({{ product.stock.quantity }} 件)
      </view>
      <view class="out-of-stock" v-else>缺货</view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="btn-addcart" @tap="addToCart">加入购物车</button>
      <button class="btn-buy" @tap="buyNow">立即购买</button>
    </view>
  </view>
</template>

<script>
import type { FullProduct } from '@/types/product'

export default {
  data() {
    return {
      product: null as FullProduct | null,
      selectedColor: '',
      selectedSize: '',
      quantity: 1
    }
  },

  async onLoad(options) {
    const { id } = options
    await this.fetchProductDetail(id)
  },

  methods: {
    async fetchProductDetail(id: string) {
      try {
        const response = await uni.request({
          url: `${API_BASE}/api/v1/products/${id}`,
          method: 'GET'
        })

        if (response[1].data.code === 0) {
          this.product = response[1].data.data
        }
      } catch (error) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },

    addToCart() {
      if (!this.product) return

      // 发送到全局购物车状态 (Pinia)
      const cartStore = useCartStore()
      cartStore.addItem({
        product: this.product,
        selectedColor: this.selectedColor,
        selectedSize: this.selectedSize,
        quantity: this.quantity
      })

      uni.showToast({ title: '已加入购物车', icon: 'success' })
    },

    buyNow() {
      this.addToCart()
      uni.switchTab({ url: '/pages/cart/cart' })
    },

    formatPrice(price: number): string {
      return (price / 100).toFixed(2)
    }
  }
}
</script>
```

---

## ✅ 最佳实践

### 1️⃣ 数据一致性

```javascript
// ✅ 好做法：统一数据源
const store = useProductStore()

// 在所有页面使用同一个数据源
const products = computed(() => store.products)
const filteredProducts = computed(() => {
  return store.products.filter(...)
})

// ❌ 避免：重复定义数据
// 每个页面自己维护一份 allProducts 列表
```

### 2️⃣ 价格计算

```javascript
// ✅ 使用数字进行计算
const subtotal = item.price.current * item.quantity / 100

// ❌ 避免：字符串转换
const price = parseInt('12800')  // 容易出错
```

### 3️⃣ 图片加载

```javascript
// ✅ 根据场景选择合适的图片
// 列表页使用 cover
<image :src="product.images.cover" />

// 详情页使用 detail 高清图
<image :src="product.images.detail[0]" />

// 缩略图使用 thumb
<image :src="product.images.thumb" />

// ❌ 避免：全部使用同一张图
```

### 4️⃣ 状态判断

```javascript
// ✅ 使用 status 对象
<view v-if="product.status.isOutOfStock">缺货</view>

// 或使用计算属性
const isAvailable = computed(() =>
  product.status.isSaleOn && !product.status.isOutOfStock
)

// ❌ 避免：多个布尔字段混乱判断
<view v-if="!product.isSold && product.inStock">
```

### 5️⃣ 搜索和过滤

```javascript
// ✅ 完整搜索
const searchProducts = (keyword) => {
  return products.filter(p =>
    p.name.includes(keyword) ||
    p.description.includes(keyword) ||
    p.tags.some(tag => tag.includes(keyword))
  )
}

// ✅ 多维度过滤
const filtered = products.filter(p => {
  const matchCategory = !selectedCategory ||
    p.category.id === selectedCategory
  const matchPrice = p.price.current >= minPrice &&
    p.price.current <= maxPrice
  const matchStatus = p.status.isSaleOn &&
    !p.status.isOutOfStock

  return matchCategory && matchPrice && matchStatus
})
```

### 6️⃣ 性能优化

```javascript
// ✅ 使用虚拟滚动处理大列表
<virtual-scroller
  :items="filteredProducts"
  :item-height="340"
>
  <template #default="{ item }">
    <ProductCard :product="item" />
  </template>
</virtual-scroller>

// ✅ 图片懒加载
<image
  :src="product.images.cover"
  lazy-load
  @load="onImageLoad"
  @error="onImageError"
/>

// ✅ 分页加载
onReachBottom() {
  if (!loading && hasMore) {
    page++
    fetchMore()
  }
}
```

### 7️⃣ 缓存策略

```javascript
// ✅ 缓存商品列表
const cacheProducts = (products, cacheKey = 'products') => {
  const cache = {
    data: products,
    timestamp: Date.now()
  }
  uni.setStorageSync(cacheKey, JSON.stringify(cache))
}

const getCachedProducts = (cacheKey = 'products', maxAge = 3600000) => {
  const cache = uni.getStorageSync(cacheKey)
  if (!cache) return null

  const parsed = JSON.parse(cache)
  if (Date.now() - parsed.timestamp > maxAge) {
    uni.removeStorageSync(cacheKey)
    return null
  }

  return parsed.data
}

// 使用
async onLoad() {
  // 先检查缓存
  const cached = getCachedProducts('products')
  if (cached) {
    this.products = cached
    return
  }

  // 如果没有缓存，从 API 加载
  const products = await fetchProducts()
  cacheProducts(products)
  this.products = products
}
```

---

## 📈 数据演进路径

### 第 1 阶段：基础版（当前）

```
商品数据结构简单，仅包含：
- 基础字段 (id, name, price, image)
- 分类信息 (category, categoryId)
- 状态标记 (isNew, isSold)

痛点: 无法支持复杂功能
```

### 第 2 阶段：标准版（推荐）

```
扩展数据模型，添加：
+ 完整的价格、图片、状态结构
+ 统计信息 (sales, rating, reviews)
+ 库存管理
+ 详情页所需字段

收益: 支持完整电商流程
```

### 第 3 阶段：企业级（可选）

```
进一步完善：
+ 详细的属性系统 (颜色、尺码、材质等)
+ 评价和用户反馈
+ 推荐算法数据
+ SEO 信息
+ 库存同步

收益: 完整的商品生态
```

---

## 🚀 实现建议

### 短期 (1-2 周)

- [ ] 定义 TypeScript 类型文件
- [ ] 更新分类页商品数据结构
- [ ] 改进价格字段格式
- [ ] 添加 stats 统计字段

### 中期 (2-4 周)

- [ ] 创建产品详情页
- [ ] 集成后端 API
- [ ] 实现详情页完整数据加载
- [ ] 添加 Pinia 全局购物车

### 长期 (1-2 月)

- [ ] 完善属性系统 (颜色、尺码)
- [ ] 实现用户评价系统
- [ ] 搜索优化
- [ ] 推荐算法

---

## 📚 完整参考

### 字段对照表

| 字段 | 列表页 | 详情页 | 购物车 | 订单 | 说明 |
|------|--------|--------|--------|------|------|
| id | ✅ | ✅ | ✅ | ✅ | 商品 ID |
| name | ✅ | ✅ | ✅ | ✅ | 商品名称 |
| description | ✅ | ✅ | ❌ | ❌ | 简短描述 |
| category | ✅ | ✅ | ❌ | ❌ | 分类信息 |
| price | ✅ | ✅ | ✅ | ✅ | 价格 |
| images | ✅ | ✅ | ✅ | ❌ | 图片 |
| status | ✅ | ✅ | ❌ | ❌ | 状态 |
| stats | ✅ | ✅ | ❌ | ❌ | 统计 |
| stock | ❌ | ✅ | ✅ | ❌ | 库存 |
| attributes | ❌ | ✅ | ✅ | ❌ | 属性 |
| details | ❌ | ✅ | ❌ | ❌ | 详细信息 |
| content | ❌ | ✅ | ❌ | ❌ | 详情内容 |

### 枚举值参考

```typescript
// 商品状态
enum ProductStatus {
  DRAFT = 'draft',           // 草稿
  SALE_ON = 'sale_on',       // 上架
  SALE_OFF = 'sale_off',     // 下架
  OUT_OF_STOCK = 'out_of_stock'  // 缺货
}

// 排序方式
enum SortType {
  RECOMMEND = 'recommend',   // 推荐
  NEWEST = 'new',            // 新品
  HOTTEST = 'hot',           // 热销
  PRICE_HIGH = 'price_desc', // 价格高
  PRICE_LOW = 'price_asc'    // 价格低
}

// 标签
enum ProductTag {
  NEW = 'new',               // 新品
  HOT = 'hot',               // 热销
  LIMITED = 'limited',       // 限量
  VIP_ONLY = 'vip_only',     // VIP专属
  DISCOUNT = 'discount'      // 优惠
}
```

---

## 总结

✅ **推荐方案**: 使用**标准版数据模型**
- 足够完整支持电商功能
- 易于扩展和维护
- 与 API 规范一致
- 性能和开发效率平衡

📊 **关键改进**:
1. 字段结构化（price、images、status）
2. 数据类型统一（数字而非字符串）
3. 添加统计信息（sales、rating）
4. 支持属性系统（colors、sizes）
5. 包含详情页数据

🚀 **立即行动**:
- [ ] 复制 TypeScript 类型定义
- [ ] 更新分类页数据结构
- [ ] 创建产品详情页
- [ ] 集成后端 API

最后更新: 2025-10-28
