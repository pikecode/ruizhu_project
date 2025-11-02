import { api } from './api'

/**
 * 数据集合中的产品数据结构
 */
export interface ArrayCollectionProduct {
  id: number
  name: string
  sku: string
  category?: string
  price: string
  image: string
  coverImageUrl?: string
  currentPrice?: number
  originalPrice?: number
}

/**
 * 数据集合项的数据结构
 */
export interface ArrayCollectionItem {
  id: number
  title: string
  description: string
  coverImageUrl: string
  sortOrder: number
  products?: ArrayCollectionProduct[]
}

/**
 * 数据集合的数据结构
 */
export interface ArrayCollection {
  id: number
  title: string
  slug: string
  description?: string
  items: ArrayCollectionItem[]
}

export interface ArrayCollectionResponse {
  code: number
  message: string
  data: ArrayCollection
}

/**
 * 数据集合服务
 */
export const arrayCollectionService = {
  /**
   * 按 slug 获取数据集合详情（包含项目和产品列表）
   * API: GET /array-collections/slug/:slug
   */
  getArrayCollectionBySlug: async (slug: string): Promise<ArrayCollection | null> => {
    try {
      console.log('📡 [ArrayCollection] 正在获取数据集合:', slug)
      const response = await api.get<ArrayCollectionResponse>(`/array-collections/slug/${slug}`)
      console.log('📡 [ArrayCollection] 获取数据集合成功:', response)

      // 处理新的标准响应格式 { code, message, data }
      if (response && response.data) {
        return response.data
      }

      return null
    } catch (error) {
      console.error(`❌ [ArrayCollection] 获取数据集合失败 ${slug}:`, error)
      return null
    }
  }
}
