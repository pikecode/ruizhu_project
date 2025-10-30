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
  const priceInYuan = (priceInCents / 100).toFixed(2)
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
    isSold: backendProduct.stockStatus === 'outOfStock' || backendProduct.stockStatus === 'soldOut'
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
} = {}): Promise<Product[]> {
  const { page = 1, limit = 20, categoryId, sortBy = 'recommend' } = options

  try {
    const params: Record<string, string | number> = {
      page,
      limit
    }

    // 构建查询参数
    if (categoryId && categoryId !== 0) {
      params.categoryId = categoryId
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
    const response = await api.get<{ data: ProductListResponse }>(
      `/products${queryString ? '?' + queryString : ''}`
    )

    // 将后端数据转换为前端格式
    const products = response.data.items.map(item =>
      mapProductToFrontend(item, CATEGORY_MAP[item.categoryId])
    )

    return products
  } catch (error) {
    console.error('Failed to fetch products:', error)
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
