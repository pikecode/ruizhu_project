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
  pageType: 'home' | 'custom' | 'profile' | 'about' | 'featured'
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
   * API: GET /banners?page=1&limit=10&pageType=home|custom|profile|about
   */
  getBanners: async (page: number = 1, limit: number = 10, pageType?: 'home' | 'custom' | 'profile' | 'about' | 'featured') => {
    try {
      // 直接在 URL 中构造查询参数（小程序不支持 params 自动转换）
      let url = `/banners?page=${page}&limit=${limit}`
      if (pageType) {
        url += `&pageType=${pageType}`
      }

      console.log('📡 [Banner] 请求 URL:', url)
      const response = await api.get<any>(url)

      console.log('📡 [Banner] 原始响应:', response)

      // 处理 API 返回的数据
      // API 返回格式可能是：
      // 1. { code, message, data: { items: [...], total, page, totalPages } }
      // 2. { code, message, data: [...] }
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // 如果直接是数组，包装成分页格式
          return {
            items: response.data,
            total: response.data.length,
            page: page,
            totalPages: 1
          }
        } else if (response.data.items) {
          // 如果已经是分页格式，直接返回
          return response.data
        }
      }

      return { items: [], total: 0, page, totalPages: 0 }
    } catch (error) {
      console.error('Failed to fetch banners:', error)
      return { items: [], total: 0, page, totalPages: 0 }
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
