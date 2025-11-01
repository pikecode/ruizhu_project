import { api } from './api'

/**
 * 购物车项数据结构（从API返回，包含产品信息）
 */
export interface CartItem {
  id: number                           // 购物车项ID
  productId: number                    // 商品ID
  name: string                         // 商品名称
  image: string                        // 商品图片URL
  price: number                        // 商品价格（分为单位）
  quantity: number                     // 数量
  color?: string                       // 选择的颜色
  size?: string                        // 选择的尺码
  selected?: boolean                   // 选中状态（前端使用）
  selectedAttributes?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

/**
 * 添加到购物车的请求数据结构
 */
export interface AddToCartRequest {
  productId: number
  quantity: number
  selectedAttributes?: Record<string, any>
  priceSnapshot?: number
}

/**
 * 购物车摘要数据结构
 */
export interface CartSummary {
  totalItems: number
  totalPrice: number
  items: CartItem[]
}

/**
 * 购物车API响应
 */
export interface CartResponse {
  code: number
  message: string
  data: CartItem | CartItem[] | CartSummary | null
}

/**
 * 购物车服务
 */
export const cartService = {
  /**
   * 添加商品到购物车
   * API: POST /cart
   */
  addToCart: async (productId: number, quantity: number = 1, selectedAttributes?: Record<string, any>, priceSnapshot?: number): Promise<CartItem | null> => {
    try {
      const requestData: AddToCartRequest = {
        productId,
        quantity,
      }

      // 可选参数
      if (selectedAttributes) {
        requestData.selectedAttributes = selectedAttributes
      }
      if (priceSnapshot) {
        requestData.priceSnapshot = priceSnapshot
      }

      const response = await api.post<{ code: number; message: string; data: CartItem }>(
        '/cart',
        requestData
      )

      console.log('添加到购物车成功:', response)
      return response.data || null
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  },

  /**
   * 获取购物车
   * API: GET /cart
   */
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get<{ code: number; message: string; data: CartItem[] }>(
        '/cart'
      )

      console.log('获取购物车成功:', response)
      return response.data || []
    } catch (error) {
      console.error('Failed to get cart:', error)
      return []
    }
  },

  /**
   * 获取购物车摘要
   * API: GET /cart/summary
   */
  getCartSummary: async (): Promise<CartSummary | null> => {
    try {
      const response = await api.get<{ code: number; message: string; data: CartSummary }>(
        '/cart/summary'
      )

      console.log('获取购物车摘要成功:', response)
      return response.data || null
    } catch (error) {
      console.error('Failed to get cart summary:', error)
      return null
    }
  },

  /**
   * 更新购物车项
   * API: PUT /cart/:itemId
   */
  updateCartItem: async (itemId: number, quantity?: number, selectedAttributes?: Record<string, any>): Promise<CartItem | null> => {
    try {
      const updateData: any = {}

      if (quantity !== undefined) {
        updateData.quantity = quantity
      }
      if (selectedAttributes) {
        updateData.selectedAttributes = selectedAttributes
      }

      const response = await api.put<{ code: number; message: string; data: CartItem }>(
        `/cart/${itemId}`,
        updateData
      )

      console.log('更新购物车项成功:', response)
      return response.data || null
    } catch (error) {
      console.error(`Failed to update cart item ${itemId}:`, error)
      throw error
    }
  },

  /**
   * 删除购物车项
   * API: DELETE /cart/:itemId
   */
  removeFromCart: async (itemId: number): Promise<boolean> => {
    try {
      const response = await api.delete<{ code: number; message: string }>(
        `/cart/${itemId}`
      )

      console.log('从购物车删除成功:', response)
      return true
    } catch (error) {
      console.error(`Failed to remove cart item ${itemId}:`, error)
      throw error
    }
  },

  /**
   * 清空购物车
   * API: DELETE /cart
   */
  clearCart: async (): Promise<boolean> => {
    try {
      const response = await api.delete<{ code: number; message: string }>(
        '/cart'
      )

      console.log('清空购物车成功:', response)
      return true
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  },

  /**
   * 删除多个购物车项
   * API: POST /cart/clear-items
   */
  clearCartItems: async (itemIds: number[]): Promise<boolean> => {
    try {
      const response = await api.post<{ code: number; message: string }>(
        '/cart/clear-items',
        { itemIds }
      )

      console.log('删除多个购物车项成功:', response)
      return true
    } catch (error) {
      console.error('Failed to clear cart items:', error)
      throw error
    }
  }
}
