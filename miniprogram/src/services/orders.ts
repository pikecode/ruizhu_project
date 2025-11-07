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
    price: number  // 商品价格（以分为单位）
    productType?: string  // 产品类型（用于识别会员产品）
    discount?: number  // 产品折扣倍数（0.01-1.0）
    selectedAttributes?: Record<string, any>  // 其他属性
  }>
  addressId?: number  // 收货地址ID（可选，充值订单不需要）
  shippingAddressId?: number  // 旧版字段名兼容
  totalAmount: number  // 订单总金额（以分为单位）
  finalAmount: number  // 最终支付金额（以分为单位）
  discountAmount?: number  // 折扣金额（以分为单位）
  shippingAmount?: number  // 运费（以分为单位）
  paymentMethod?: string
  remark?: string
  isRecharge?: boolean  // 是否为充值订单
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

      // 数据转换: 将backend的orderNo字段映射到前端期望的orderNumber字段
      if (response.data && response.data.items) {
        response.data.items = response.data.items.map((order: any) => ({
          ...order,
          orderNumber: order.orderNo || order.orderNumber, // 优先使用orderNo，兼容orderNumber
        }))
      }

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

      // 数据转换: 将backend的orderNo字段映射到前端期望的orderNumber字段
      if (response.data && response.data.items) {
        response.data.items = response.data.items.map((order: any) => ({
          ...order,
          orderNumber: order.orderNo || order.orderNumber,
        }))
      }

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

      // 数据转换: 将backend的orderNo字段映射到前端期望的orderNumber字段
      if (response.data) {
        response.data = {
          ...response.data,
          orderNumber: response.data.orderNo || response.data.orderNumber,
        } as any
      }

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

      // 数据转换: 将backend的orderNo字段映射到前端期望的orderNumber字段
      if (response.data) {
        response.data = {
          ...response.data,
          orderNumber: response.data.orderNo || response.data.orderNumber,
        } as any
      }

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
  },

  /**
   * 标记订单为已支付（在微信支付成功后立即调用）
   * API: PUT /orders/:orderId/mark-as-paid
   */
  markOrderAsPaid: async (orderId: number): Promise<Order | null> => {
    try {
      console.log('📡 [OrdersService] 正在调用 markOrderAsPaid API...')
      console.log('📡 [OrdersService] 订单ID:', orderId)

      const response = await api.put<ApiResponse<Order>>(
        `/orders/${orderId}/mark-as-paid`
      )

      console.log('✅ [OrdersService] 标记订单为已支付成功，响应:', response)
      console.log('✅ [OrdersService] 返回的订单对象:', response.data)
      return response.data || null
    } catch (error) {
      console.error('❌ [OrdersService] 标记订单为已支付失败，详细信息:', {
        orderId,
        errorMessage: error?.message,
        errorCode: error?.code,
        fullError: error
      })
      throw error
    }
  }
}

export default ordersService