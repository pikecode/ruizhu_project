import { api } from './api'

/**
 * 心愿单项产品信息（从API返回的关联产品数据）
 */
export interface WishlistItemProduct {
  id: number
  name: string
  coverImageUrl: string | null        // 第一张图片URL
  currentPrice: number | null         // 现价（分为单位）
  originalPrice: number | null        // 原价（分为单位）
  discountRate: number                // 折扣率 0-100
  isNew: boolean
  isSaleOn: boolean
}

/**
 * 心愿单项数据结构（从API返回，包含产品信息）
 */
export interface WishlistItem {
  id: number                           // 心愿单项ID
  userId: number                       // 用户ID
  productId: number                    // 商品ID
  product: WishlistItemProduct         // 关联的产品信息
  createdAt: string
  updatedAt: string
}

/**
 * 心愿单产品数据结构（前端组件使用的格式）
 */
export interface WishlistProduct {
  id: number
  name: string
  image: string
  price: number                        // 商品价格（分为单位）
  originalPrice?: number
  discountRate?: number
  isNew?: boolean
  isSaleOn?: boolean
}

/**
 * 心愿单响应数据结构
 */
export interface WishlistResponse {
  items: WishlistItem[]
  total: number
  page: number
  totalPages?: number  // 后端返回的字段
}

/**
 * 批量检查心愿单返回结果（productId -> isFavorite）
 */
export interface WishlistCheckResult {
  [productId: number]: boolean
}

/**
 * 心愿单API响应
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 心愿单服务
 */
export const wishlistService = {
  /**
   * 添加商品到心愿单
   * API: POST /wishlists
   */
  addToWishlist: async (productId: number): Promise<WishlistItem | null> => {
    try {
      const response = await api.post<ApiResponse<WishlistItem>>(
        '/wishlists',
        { productId }
      )

      console.log('添加到心愿单成功:', response)
      return response.data || null
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      throw error
    }
  },

  /**
   * 从心愿单删除商品
   * API: DELETE /wishlists/:productId
   */
  removeFromWishlist: async (productId: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse>(
        `/wishlists/${productId}`
      )

      console.log('从心愿单删除成功:', response)
      return true
    } catch (error) {
      console.error(`Failed to remove from wishlist (productId: ${productId}):`, error)
      throw error
    }
  },

  /**
   * 获取用户的心愿单
   * API: GET /wishlists?page=1&limit=20
   */
  getWishlist: async (page: number = 1, limit: number = 20): Promise<WishlistResponse | null> => {
    try {
      const response = await api.get<ApiResponse<WishlistResponse>>(
        `/wishlists?page=${page}&limit=${limit}`
      )

      console.log('获取心愿单成功:', response)
      return response.data || null
    } catch (error) {
      console.error('Failed to get wishlist:', error)
      return null
    }
  },

  /**
   * 检查单个产品是否在心愿单中
   * API: POST /wishlists/check
   */
  checkWishlist: async (productId: number): Promise<boolean> => {
    try {
      const result = await wishlistService.checkMultipleWishlists([productId])
      return result[productId] || false
    } catch (error) {
      console.error(`Failed to check wishlist for product ${productId}:`, error)
      return false
    }
  },

  /**
   * 批量检查多个产品是否在心愿单中
   * API: POST /wishlists/check
   * 返回结果格式: { productId1: true, productId2: false, ... }
   */
  checkMultipleWishlists: async (productIds: number[]): Promise<WishlistCheckResult> => {
    try {
      const response = await api.post<ApiResponse<WishlistCheckResult>>(
        '/wishlists/check',
        { productIds }
      )

      console.log('批量检查心愿单成功:', response)
      // 后端现在返回标准格式: { code: 200, message: "Success", data: {13: true, ...} }
      return response.data || {}
    } catch (error) {
      console.error('Failed to check multiple wishlists:', error)
      // 返回全部为false的结果作为降级处理
      const result: WishlistCheckResult = {}
      productIds.forEach(id => {
        result[id] = false
      })
      return result
    }
  },

  /**
   * 切换商品的收藏状态（添加或删除）
   * 如果已收藏则删除，否则添加
   */
  toggleWishlist: async (productId: number, isCurrentlyFavorite: boolean): Promise<boolean> => {
    try {
      if (isCurrentlyFavorite) {
        await wishlistService.removeFromWishlist(productId)
      } else {
        await wishlistService.addToWishlist(productId)
      }
      return true
    } catch (error) {
      console.error(`Failed to toggle wishlist for product ${productId}:`, error)
      throw error
    }
  },

  /**
   * 清空心愿单
   * API: DELETE /wishlists
   */
  clearWishlist: async (): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse>(
        '/wishlists'
      )

      console.log('清空心愿单成功:', response)
      return true
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
      throw error
    }
  }
}
