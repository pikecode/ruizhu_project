import api from './api'
import { Order, PaginationParams, PaginationResult, OrderStatus } from '@/types'

/**
 * Admin Orders Service
 * All endpoints require admin authentication
 */
export const ordersService = {
  // Get all orders (admin only)
  getOrders: (params: PaginationParams): Promise<PaginationResult<Order>> => {
    return api.get('/admin/orders', { params }).then((res) => res.data.data)
  },

  // Get order by ID (admin only)
  getOrderById: (id: string): Promise<Order> => {
    return api.get(`/admin/orders/${id}`).then((res) => res.data.data)
  },

  // Create order (admin only)
  createOrder: (payload: Partial<Order>): Promise<Order> => {
    return api.post('/admin/orders', payload).then((res) => res.data.data)
  },

  // Update order status (admin only)
  updateOrderStatus: (id: string, status: OrderStatus): Promise<Order> => {
    return api.put(`/admin/orders/${id}`, { status }).then((res) => res.data.data)
  },

  // Cancel order (admin only)
  cancelOrder: (id: string): Promise<Order> => {
    return api.put(`/admin/orders/${id}`, { status: 'cancelled' }).then((res) => res.data.data)
  },

  // Delete order (admin only)
  deleteOrder: (id: string): Promise<void> => {
    return api.delete(`/admin/orders/${id}`).then((res) => res.data)
  },

  // Get orders by user ID (admin only)
  getOrdersByUserId: (userId: string): Promise<Order[]> => {
    return api.get(`/admin/orders/user/${userId}`).then((res) => res.data.data)
  },

  // Export orders (admin only)
  exportOrders: (params: any): Promise<Blob> => {
    return api.get('/admin/orders/export', { params, responseType: 'blob' }).then((res) => res.data)
  },
}
