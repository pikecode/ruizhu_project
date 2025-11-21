/**
 * 商品 API 服务
 * 封装所有商品相关的 API 调用
 */

import { api } from './api'

/**
 * 后端商品列表项响应数据类型
 */
export interface ProductListItem {
  id: number
  name: string
  subtitle?: string
  categoryId: number
  currentPrice: number // 单位：分（需要转换为元）
  originalPrice: number // 单位：分
  discountRate: number
  salesCount: number
  averageRating: number
  reviewsCount: number
  isNew: boolean
  isSaleOn: boolean
  stockStatus?: 'normal' | 'outOfStock' | 'soldOut'
  coverImageUrl?: string | null
  tags?: string[]
}

/**
 * 商品列表响应
 */
export interface ProductListResponse {
  items: ProductListItem[]
  total: number
  page: number
  limit: number
  pages: number
}

/**
 * 前端使用的商品数据格式
 */
export interface Product {
  id: number
  name: string
  category: string // 分类名称
  categoryId: number
  price: string // 前端显示价格（元为单位）
  image: string
  isNew: boolean
  isSold: boolean
}

/**
 * 类别映射表（用于将后端的 categoryId 转换为中文名称）
 */
const CATEGORY_MAP: Record<number, string> = {
  1: '服装',
  2: '珠宝',
  3: '鞋履',
  4: '香水',
  // 添加更多分类根据实际需要
}

/**
 * 将后端价格（分）转换为前端显示价格（元）
 */
function formatPrice(priceInCents: number): string {
  if (!priceInCents && priceInCents !== 0) {
    return '0.00'
  }
  const priceInYuan = (Number(priceInCents) / 100).toFixed(2)
  return priceInYuan
}

/**
 * 将后端商品数据转换为前端格式
 */
function mapProductToFrontend(backendProduct: ProductListItem, categoryName: string = ''): Product {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    category: categoryName || CATEGORY_MAP[backendProduct.categoryId] || '其他',
    categoryId: backendProduct.categoryId,
    price: formatPrice(backendProduct.currentPrice),
    image: backendProduct.coverImageUrl || '',
    isNew: backendProduct.isNew,
    stockQuantity: backendProduct.stockQuantity || 0,
    isSold: backendProduct.stockQuantity <= 0
  }
}

/**
 * 获取所有分类列表
 * 注：后端暂无分类接口，此处使用本地定义
 */
export function getCategories() {
  return [
    { id: 0, name: '全部' },
    { id: 1, name: '服装' },
    { id: 2, name: '珠宝' },
    { id: 3, name: '鞋履' },
    { id: 4, name: '香水' }
  ]
}

/**
 * 构建查询字符串（小程序不支持 URLSearchParams）
 */
function buildQueryString(params: Record<string, string | number>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

/**
 * 获取商品列表
 */
export async function getProducts(options: {
  page?: number
  limit?: number
  categoryId?: number
  sortBy?: 'recommend' | 'new' | 'hot' | 'price_asc' | 'price_desc'
  productType?: 'standard' | 'custom'
} = {}): Promise<Product[]> {
  const { page = 1, limit = 20, categoryId, sortBy = 'recommend', productType } = options

  try {
    const params: Record<string, string | number> = {
      page,
      limit
    }

    // 构建查询参数
    if (categoryId && categoryId !== 0) {
      params.categoryId = categoryId
    }

    // 添加产品类型参数
    if (productType) {
      params.productType = productType
    }

    // 根据排序方式处理
    switch (sortBy) {
      case 'new':
        params.sortBy = 'createdAt'
        params.sortOrder = 'desc'
        break
      case 'hot':
        params.sortBy = 'salesCount'
        params.sortOrder = 'desc'
        break
      case 'price_asc':
        params.sortBy = 'currentPrice'
        params.sortOrder = 'asc'
        break
      case 'price_desc':
        params.sortBy = 'currentPrice'
        params.sortOrder = 'desc'
        break
      default:
        // 推荐（默认排序）
        break
    }

    const queryString = buildQueryString(params)
    const url = `/products${queryString ? '?' + queryString : ''}`
    console.log('[products.ts] 请求URL:', url)
    console.log('[products.ts] 请求参数:', params)

    const response = await api.get<{ data: ProductListResponse }>(url)

    console.log('[products.ts] API响应:', response)
    console.log('[products.ts] 响应中的items数量:', response.data?.items?.length || 0)

    // 将后端数据转换为前端格式
    const products = response.data.items.map(item =>
      mapProductToFrontend(item, CATEGORY_MAP[item.categoryId])
    )

    console.log('[products.ts] 转换后的产品数量:', products.length)
    console.log('[products.ts] 转换后的产品:', products)

    return products
  } catch (error) {
    console.error('[products.ts] 获取产品失败:', error)
    return []
  }
}

/**
 * 按分类获取商品
 */
export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  if (categoryId === 0) {
    // 全部商品
    return getProducts()
  }

  return getProducts({ categoryId })
}

/**
 * 搜索商品
 */
export async function searchProducts(keyword: string): Promise<Product[]> {
  try {
    const params = {
      keyword,
      limit: 50
    }

    const queryString = buildQueryString(params)
    const response = await api.get<{ data: ProductListResponse }>(
      `/products/search${queryString ? '?' + queryString : ''}`
    )

    const products = response.data.items.map(item =>
      mapProductToFrontend(item, CATEGORY_MAP[item.categoryId])
    )

    return products
  } catch (error) {
    console.error('Failed to search products:', error)
    return []
  }
}

/**
 * 获取热销商品
 */
export async function getHotProducts(limit: number = 10): Promise<Product[]> {
  try {
    const response = await api.get<{ data: { items: ProductListItem[] } }>(
      `/products/hot?limit=${limit}`
    )

    const products = response.data.items.map(item =>
      mapProductToFrontend(item, CATEGORY_MAP[item.categoryId])
    )

    return products
  } catch (error) {
    console.error('Failed to fetch hot products:', error)
    return []
  }
}

/**
 * 价格对象结构
 */
export interface PriceObject {
  originalPrice: number // 单位：分
  currentPrice: number // 单位：分
  discountRate: number
  currency: string
}

/**
 * 产品图片对象
 */
export interface ProductImage {
  id: number
  imageUrl: string
  imageType: string
  altText?: string
  sortOrder: number
  width?: number
  height?: number
  fileSize?: number
  createdAt: string
}

/**
 * 商品详情响应数据类型（后端返回）
 */
export interface ProductDetailResponse {
  id: number
  name: string
  subtitle?: string
  categoryId: number
  categoryName?: string
  productType?: 'standard' | 'custom' | 'vip_recharge' // 产品类型
  discount?: number // VIP 充值产品的折扣倍数（直接在产品上）
  price?: PriceObject // 价格对象（单位：元）
  currentPrice?: number // 兼容旧结构（单位：分）
  originalPrice?: number // 兼容旧结构（单位：分）
  discountRate?: number
  description?: string
  images?: ProductImage[] // 商品图片对象数组
  coverImageUrl?: string
  colors?: string[] // 商品颜色选项
  specs?: Record<string, string[]> // 其他规格
  salesCount: number
  averageRating: number | string
  reviewsCount: number
  isNew: boolean
  isSaleOn: boolean
  stockStatus?: 'normal' | 'outOfStock' | 'soldOut'
  skuCode?: string
  [key: string]: any
}

/**
 * 前端商品详情格式
 */
export interface ProductDetail {
  id: number
  name: string
  category: string
  price: string // 元为单位
  originalPrice?: string
  description: string
  images: string[] // 轮播图片
  colors: string[] // 颜色选项
  skuCode: string
  isNew: boolean
  salesCount: number
  rating: number
  reviewCount: number
}

/**
 * 将后端商品详情数据转换为前端格式
 *
 * 图片合并策略：
 * 1. coverImageUrl 是产品主图（作为轮播的第一张）
 * 2. images 数组是 ProductImage 表的所有图片
 * 3. 前端合并这两个字段，构建完整的轮播图片列表
 *
 * 顺序：[coverImageUrl, images[0], images[1], ...]
 */
function mapProductDetailToFrontend(
  backendProduct: ProductDetailResponse
): ProductDetail {
  // 获取图片列表 - 合并 coverImageUrl 和 images 数组
  let images: string[] = []

  // 1. 先添加 coverImageUrl（如果存在）- 作为第一张图片
  if (backendProduct.coverImageUrl) {
    images.push(backendProduct.coverImageUrl)
  }

  // 2. 再添加 images 数组中的所有图片（如果存在）
  if (backendProduct.images && backendProduct.images.length > 0) {
    // 提取 images 数组中每个对象的 imageUrl 属性
    const imageUrls = backendProduct.images.map(img => img.imageUrl)
    images.push(...imageUrls)
  }

  // 3. 如果都没有，使用空数组
  // images 将为空，轮播组件会处理这种情况

  // 颜色列表（如果后端没有颜色信息，使用默认选项）
  const colors = backendProduct.colors && backendProduct.colors.length > 0
    ? backendProduct.colors
    : ['颜色选项']

  // 处理价格 - 支持两种格式
  let price = '0.00'
  let originalPrice = '0.00'

  if (backendProduct.price && typeof backendProduct.price === 'object') {
    // 新格式：price 是一个对象，单位是分，需要除以100
    price = formatPrice(backendProduct.price.currentPrice || 0)
    originalPrice = formatPrice(backendProduct.price.originalPrice || 0)
  } else if (backendProduct.currentPrice) {
    // 旧格式：currentPrice 是数字，单位也是分，需要除以100
    price = formatPrice(backendProduct.currentPrice)
    originalPrice = formatPrice(backendProduct.originalPrice || 0)
  }

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    category: backendProduct.categoryName || CATEGORY_MAP[backendProduct.categoryId] || '其他',
    price,
    originalPrice,
    description: backendProduct.description || '暂无描述',
    images, // 轮播图片数组（当前通常只有一张）
    colors,
    skuCode: backendProduct.skuCode || `SKU${backendProduct.id}`,
    isNew: backendProduct.isNew,
    salesCount: backendProduct.salesCount || 0,
    rating: Number(backendProduct.averageRating) || 0,
    reviewCount: backendProduct.reviewsCount || 0
  }
}

/**
 * 获取商品详情 - 返回完整的后端数据（包含 productType、selectedAttributes 等信息）
 * 用于支付流程中提取 VIP 折扣信息
 */
export async function getProductDetail(productId: number): Promise<ProductDetailResponse | null> {
  try {
    const response = await api.get<{ code: number; message: string; data: ProductDetailResponse }>(
      `/products/${productId}`
    )

    console.log('获取商品详情响应:', response)

    if (response && response.data) {
      console.log('返回的商品详情:', response.data)
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to fetch product detail:', error)
    return null
  }
}

/**
 * 获取商品详情页面显示格式 - 返回转换后的前端数据格式
 */
export async function getProductDetailForDisplay(productId: number): Promise<ProductDetail | null> {
  try {
    const rawData = await getProductDetail(productId)
    if (rawData) {
      const productDetail = mapProductDetailToFrontend(rawData)
      console.log('映射后的商品详情:', productDetail)
      return productDetail
    }
    return null
  } catch (error) {
    console.error('Failed to get product detail for display:', error)
    return null
  }
}
