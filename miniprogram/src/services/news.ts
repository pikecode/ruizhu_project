import { api } from './api'

/**
 * 资讯数据结构
 */
export interface NewsItem {
  id: number
  title: string
  subtitle?: string
  description?: string
  coverImageUrl?: string
  detailImageUrl?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface NewsResponse {
  code: number
  message: string
  data: {
    items: NewsItem[]
    total: number
    page: number
    limit: number
    pages: number
  }
}

/**
 * 资讯服务
 */
export const newsService = {
  /**
   * 获取资讯列表
   * API: GET /news?page=1&limit=3
   */
  getNewsList: async (page: number = 1, limit: number = 3): Promise<NewsItem[]> => {
    try {
      const response = await api.get<NewsResponse>('/news', {
        params: { page, limit }
      })
      return response.data?.items || []
    } catch (error) {
      console.error('Failed to fetch news list:', error)
      return []
    }
  }
}
