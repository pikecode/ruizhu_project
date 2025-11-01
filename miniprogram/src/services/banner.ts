import { api } from './api'

/**
 * Banner 数据结构
 */
export interface Banner {
  id: number
  mainTitle: string
  subtitle: string
  description?: string
  type: 'image' | 'video'
  imageUrl?: string
  videoUrl?: string
  videoThumbnailUrl?: string
  pageType: 'home' | 'custom'
  isActive: boolean
  sortOrder: number
  linkType: 'url' | 'none' | 'product' | 'category' | 'collection'
  linkValue?: string
  createdAt: string
  updatedAt: string
}

export interface BannerResponse {
  code: number
  message: string
  data: Banner[]
}

/**
 * Banner 服务
 */
export const bannerService = {
  /**
   * 获取首页轮播图数据（仅显示启用的 banner）
   *
   * API: GET /banners/home
   * 返回数据格式：
   * {
   *   "code": 200,
   *   "message": "Successfully retrieved home banners",
   *   "data": [
   *     {
   *       "id": 1,
   *       "mainTitle": "首页促销",
   *       "subtitle": "限时优惠",
   *       "type": "video",
   *       "imageUrl": "...",
   *       "videoUrl": "...",
   *       "videoThumbnailUrl": "...",
   *       "linkType": "category",
   *       "linkValue": "1"
   *     }
   *   ]
   * }
   */
  getHomeBanners: async (): Promise<Banner[]> => {
    try {
      const response = await api.get<BannerResponse>('/banners/home')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch home banners:', error)
      return []
    }
  },

  /**
   * 获取 banner 列表（分页）
   *
   * API: GET /banners?page=1&limit=10&pageType=home
   */
  getBanners: async (page: number = 1, limit: number = 10, pageType: 'home' | 'custom' = 'home') => {
    try {
      const response = await api.get<any>('/banners', {
        params: { page, limit, pageType }
      })
      return response.data || { items: [], total: 0 }
    } catch (error) {
      console.error('Failed to fetch banners:', error)
      return { items: [], total: 0 }
    }
  },

  /**
   * 根据 banner 类型获取显示的媒体 URL
   * - 如果是视频类型，返回 videoUrl (显示视频)
   * - 如果是图片类型，返回 imageUrl
   */
  getDisplayUrl: (banner: Banner): string => {
    if (banner.type === 'video') {
      return banner.videoUrl || banner.imageUrl || ''
    }
    return banner.imageUrl || ''
  },

  /**
   * 获取 banner 的视频 URL
   * 如果 banner 是视频类型，返回视频 URL；否则返回空
   */
  getVideoUrl: (banner: Banner): string | null => {
    if (banner.type === 'video') {
      return banner.videoUrl || null
    }
    return null
  }
}
