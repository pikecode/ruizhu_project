import { api } from './api'

/**
 * 集合中的产品数据结构
 */
export interface CollectionProduct {
  id: number
  name: string
  subtitle?: string
  description?: string
  coverImageUrl?: string
  isNew: number
  isSaleOn: number
  isOutOfStock: number
  stockQuantity: number
  currentPrice: number
  originalPrice: number
  discountRate: number
  tags: string[]
}

/**
 * 集合数据结构
 */
export interface Collection {
  id: number
  name: string
  slug: string
  description?: string
  coverImageUrl?: string
  iconUrl?: string
  sortOrder: number
  isActive: number
  isFeatured: number
  remark?: string
  createdAt: string
  updatedAt: string
  products: CollectionProduct[]
}

export interface CollectionResponse {
  code: number
  message: string
  data: Collection
}

/**
 * 集合服务
 */
export const collectionService = {
  /**
   * 按 slug 获取集合详情（包含产品列表）
   * API: GET /collections/:slug
   */
  getCollectionBySlug: async (slug: string): Promise<Collection | null> => {
    try {
      const response = await api.get<CollectionResponse>(`/collections/${slug}`)
      return response.data || null
    } catch (error) {
      console.error(`Failed to fetch collection ${slug}:`, error)
      return null
    }
  }
}
