/**
 * 商品数据类型定义
 * 完整的商品数据模型，支持列表、详情、购物车等多个场景
 */

/**
 * 分类信息
 */
export interface Category {
  id: string           // 分类 ID: 'bags', 'wallets', 'backpacks', 'accessories'
  name: string         // 显示名称: '手袋', '钱包', '背包', '配件'
}

/**
 * 价格信息
 * 注意: price 单位为 分 (元 * 100)
 * 例: 12800 = 128.00 元
 */
export interface Price {
  original: number     // 原价 (分为单位)
  current: number      // 现价 (分为单位)
  discount?: number    // 折扣率 0-100, 如 78 表示 78 折
  currency: 'CNY' | 'USD'  // 货币类型
}

/**
 * 商品图片集合
 */
export interface ProductImages {
  thumb: string        // 缩略图 200x200, 用于列表页快速加载
  cover: string        // 封面图 400x400, 用于分类页、搜索结果
  list?: string[]      // 列表页使用的图片数组 (可选)
  detail?: string[]    // 详情页高清图 800x800+ (可选)
}

/**
 * 商品状态
 */
export interface ProductStatus {
  isNew: boolean       // 是否新品
  isSaleOn: boolean    // 是否上架
  isOutOfStock: boolean  // 是否缺货
  isSoldOut?: boolean  // 是否售罄
  isVipOnly?: boolean  // VIP 专属
}

/**
 * 商品统计数据
 */
export interface ProductStats {
  sales: number        // 销量 (用于热销排序)
  views: number        // 浏览量
  rating: number       // 平均评分 0-5
  reviews: number      // 评价数量
  favorites: number    // 收藏数
}

/**
 * 库存信息
 */
export interface ProductStock {
  quantity: number     // 库存数量
  lowStockThreshold: number  // 库存预警阈值
}

/**
 * 基础商品模型
 * 用于列表页、分类页、搜索页显示
 * 代码行数约 50-80 行
 */
export interface Product {
  // === 基础字段 ===
  id: number
  name: string
  description: string

  // === 分类和标签 ===
  category: Category
  tags: string[]       // 如: ['new', 'hot', 'vip_only', 'limited']

  // === 价格和销售 ===
  price: Price

  // === 图片 ===
  images: ProductImages

  // === 状态 ===
  status: ProductStatus

  // === 统计信息 ===
  stats: ProductStats

  // === 库存 ===
  stock: ProductStock

  // === 时间戳 ===
  createdAt: number    // Unix timestamp (毫秒)
  updatedAt: number
}

/**
 * 商品详细信息
 * 仅在详情页加载，包含额外信息
 */
export interface ProductDetails {
  brand: string
  material: string
  origin: string
  weight?: string
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
}

/**
 * 商品属性 (颜色、尺码等)
 */
export interface ProductAttributes {
  colors?: ColorOption[]
  sizes?: SizeOption[]
  [key: string]: any
}

export interface ColorOption {
  id: string
  name: string
  hex?: string        // 十六进制颜色值
  images?: string[]   // 该颜色的专有图片
}

export interface SizeOption {
  id: string
  label: string       // 显示标签 'S', 'M', 'L' 等
  value?: string      // 具体数值
  stock?: number      // 该规格的库存
}

/**
 * 商品运费信息
 */
export interface ProductShipping {
  weight: number      // 重量 (克)
  dimensions?: {
    length: number
    width: number
    height: number
  }
  templateId?: string
  freeShippingThreshold?: number  // 免运费额度
}

/**
 * 商品详情内容
 */
export interface ProductContent {
  fullDescription: string  // 完整 HTML 描述
  highlights: string[]     // 卖点列表
  careGuide?: string       // 护理指南
  warranty?: string        // 保修信息
}

/**
 * SEO 信息
 */
export interface ProductSEO {
  keywords: string[]
  metaDescription: string
}

/**
 * 关联信息
 */
export interface ProductRelations {
  relatedProducts: number[]  // 相关商品 ID
  bundleProducts?: BundleProduct[]
}

export interface BundleProduct {
  id: number
  quantity: number
  discount?: number
}

/**
 * 完整商品模型 (详情页使用)
 * 包含 Product 的所有字段 + 额外的详情字段
 */
export interface FullProduct extends Product {
  details: ProductDetails
  attributes?: ProductAttributes
  shipping?: ProductShipping
  content: ProductContent
  seo?: ProductSEO
  relations?: ProductRelations

  // 详情页特有的数据
  reviews?: ProductReview[]
  relatedProducts?: Product[]
}

/**
 * 用户评价
 */
export interface ProductReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number       // 1-5
  comment: string
  images?: string[]
  createdAt: number
}

/**
 * 购物车中的商品
 */
export interface CartProduct extends Product {
  // 购物车特定字段
  quantity: number              // 购买数量
  selectedColor?: string        // 选中的颜色 ID
  selectedSize?: string         // 选中的尺码 ID
  selectedAttributes?: {        // 其他选中属性
    [key: string]: string
  }
  addedAt: number               // 加入购物车时间
  cartPrice?: number            // 加入时的价格 (用于对比)
  subtotal?: number             // 小计 (price * quantity)
}

/**
 * 订单中的商品
 */
export interface OrderProduct extends CartProduct {
  orderId: string
  orderPrice: number            // 订单时的价格
  paidPrice: number             // 实付价格
  status: 'pending' | 'shipped' | 'delivered' | 'returned'
  refundable: boolean
  refundReason?: string
}

/**
 * API 列表响应
 */
export interface ListProductsResponse {
  code: number
  message: string
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
      hasMore: boolean
    }
    filters?: {
      categories: Array<{
        id: string
        name: string
        count: number
      }>
      priceRange: {
        min: number
        max: number
      }
    }
  }
}

/**
 * API 详情响应
 */
export interface ProductDetailResponse {
  code: number
  message: string
  data: FullProduct & {
    reviews?: ProductReview[]
    relatedProducts?: Product[]
  }
}

/**
 * API 搜索响应
 */
export interface SearchProductsResponse {
  code: number
  message: string
  data: {
    keyword: string
    results: Product[]
    total: number
    suggestions?: string[]
  }
}

/**
 * 格式化价格辅助函数
 */
export function formatPrice(price: number): string {
  return (price / 100).toFixed(2)
}

/**
 * 计算折扣率
 */
export function calculateDiscount(original: number, current: number): number {
  if (original === 0) return 0
  return Math.round((current / original) * 100)
}

/**
 * 判断商品是否可购买
 */
export function isProductAvailable(product: Product): boolean {
  return (
    product.status.isSaleOn &&
    !product.status.isOutOfStock &&
    !product.status.isSoldOut &&
    product.stock.quantity > 0
  )
}

/**
 * 获取商品显示价格文字
 */
export function getPriceDisplay(product: Product): string {
  const { current, original } = product.price
  const discount = calculateDiscount(original, current)

  if (discount < 100) {
    return `¥${formatPrice(current)} (${discount}折)`
  }

  return `¥${formatPrice(current)}`
}

/**
 * 获取商品状态标签
 */
export function getStatusBadges(product: Product): string[] {
  const badges: string[] = []

  if (product.status.isNew) badges.push('新品')
  if (product.status.isSoldOut) badges.push('已售罄')
  if (product.status.isVipOnly) badges.push('VIP专属')
  if (product.status.isOutOfStock) badges.push('缺货')

  return badges
}

/**
 * 排序类型枚举
 */
export enum SortType {
  RECOMMEND = 'recommend',
  NEW = 'new',
  HOT = 'hot',
  PRICE_DESC = 'price_desc',
  PRICE_ASC = 'price_asc'
}

/**
 * 商品标签枚举
 */
export enum ProductTag {
  NEW = 'new',
  HOT = 'hot',
  LIMITED = 'limited',
  VIP_ONLY = 'vip_only',
  DISCOUNT = 'discount'
}
