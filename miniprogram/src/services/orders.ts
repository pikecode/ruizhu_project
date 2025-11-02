import { api } from './api'

/**
 * 订单项数据结构
 */
export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: number
    name: string
    coverImageUrl: string
    currentPrice: number
    originalPrice: number
  }
}

/**
 * 订单数据结构
 */
export interface Order {
  id: number
  orderNumber: string
  userId: number
  status: string
  statusText: string
  totalAmount: number
  subtotalAmount: number
  shippingAmount: number
  discountAmount: number
  paymentMethod: string | null
  paymentStatus: string
  shippingAddress: any
  remark: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

/**
 * 订单列表响应数据结构
 */
export interface OrdersResponse {
  items: Order[]
  total: number
  page: number
  totalPages: number
}

/**
 * 订单统计数据结构
 */
export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
}

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 创建订单DTO
 */
export interface CreateOrderDto {
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
  }>
  shippingAddressId: number
  paymentMethod?: string
  remark?: string
}

/**
 * 订单服务
 */
const ordersService = {
  /**
   * 获取用户订单列表
   * API: GET /orders?page=1&limit=20
   */
  getUserOrders: async (page: number = 1, limit: number = 20): Promise<OrdersResponse | null> => {
    try {
      const response = await api.get<ApiResponse<OrdersResponse>>(
        `/orders?page=${page}&limit=${limit}`
      )

      console.log('📡 [OrdersService] 原始 API response:', response)
      console.log('📡 [OrdersService] response.data:', response.data)
      console.log('📡 [OrdersService] 即将返回:', response.data || null)
      return response.data || null
    } catch (error) {
      console.error('Failed to get user orders:', error)
      return null
    }
  },

  /**
   * 根据状态获取订单
   * API: GET /orders/status/:status?page=1&limit=20
   */
  getOrdersByStatus: async (status: string, page: number = 1, limit: number = 20): Promise<OrdersResponse | null> => {
    try {
      const response = await api.get<ApiResponse<OrdersResponse>>(
        `/orders/status/${status}?page=${page}&limit=${limit}`
      )

      console.log(`获取${status}状态订单成功:`, response)
      return response.data || null
    } catch (error) {
      console.error(`Failed to get orders by status ${status}:`, error)
      return null
    }
  },

  /**
   * 获取订单详情
   * API: GET /orders/:orderId
   */
  getOrderDetail: async (orderId: number): Promise<Order | null> => {
    try {
      const response = await api.get<ApiResponse<Order>>(
        `/orders/${orderId}`
      )

      console.log('获取订单详情成功:', response)
      return response.data || null
    } catch (error) {
      console.error(`Failed to get order detail for ${orderId}:`, error)
      return null
    }
  },

  /**
   * 获取订单统计
   * API: GET /orders/stats/summary
   */
  getOrderStats: async (): Promise<OrderStats | null> => {
    try {
      const response = await api.get<ApiResponse<OrderStats>>(
        '/orders/stats/summary'
      )

      console.log('获取订单统计成功:', response)
      return response.data || null
    } catch (error) {
      console.error('Failed to get order stats:', error)
      return null
    }
  },

  /**
   * 获取待支付订单数量
   * API: GET /orders/pending/count
   */
  getPendingOrdersCount: async (): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<{ pendingCount: number }>>(
        '/orders/pending/count'
      )

      console.log('获取待支付订单数量成功:', response)
      return response.data?.pendingCount || 0
    } catch (error) {
      console.error('Failed to get pending orders count:', error)
      return 0
    }
  },

  /**
   * 创建订单
   * API: POST /orders
   */
  createOrder: async (orderData: CreateOrderDto): Promise<Order | null> => {
    try {
      const response = await api.post<ApiResponse<Order>>(
        '/orders',
        orderData
      )

      console.log('创建订单成功:', response)
      return response.data || null
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  },

  /**
   * 取消订单
   * API: PUT /orders/:orderId/cancel
   */
  cancelOrder: async (orderId: number): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse>(
        `/orders/${orderId}/cancel`
      )

      console.log('取消订单成功:', response)
      return true
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error)
      throw error
    }
  },

  /**
   * 更新订单
   * API: PUT /orders/:orderId
   */
  updateOrder: async (orderId: number, updateData: any): Promise<Order | null> => {
    try {
      const response = await api.put<ApiResponse<Order>>(
        `/orders/${orderId}`,
        updateData
      )

      console.log('更新订单成功:', response)
      return response.data || null
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error)
      throw error
    }
  }
}

export default ordersService