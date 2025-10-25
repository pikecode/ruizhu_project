import api from './api'
import { Order, PaginationParams, PaginationResult, OrderStatus } from '@/types'

export const ordersService = {
  getOrders: (params: PaginationParams): Promise<PaginationResult<Order>> => {
    return api.get('/orders', { params }).then((res) => res.data.data)
  },

  getOrderById: (id: string): Promise<Order> => {
    return api.get(`/orders/${id}`).then((res) => res.data.data)
  },

  createOrder: (payload: Partial<Order>): Promise<Order> => {
    return api.post('/orders', payload).then((res) => res.data.data)
  },

  updateOrderStatus: (id: string, status: OrderStatus): Promise<Order> => {
    return api.patch(`/orders/${id}`, { status }).then((res) => res.data.data)
  },

  cancelOrder: (id: string): Promise<Order> => {
    return api.patch(`/orders/${id}`, { status: 'cancelled' }).then((res) => res.data.data)
  },

  deleteOrder: (id: string): Promise<void> => {
    return api.delete(`/orders/${id}`).then((res) => res.data)
  },

  getOrdersByUserId: (userId: string): Promise<Order[]> => {
    return api.get(`/orders/user/${userId}`).then((res) => res.data.data)
  },

  exportOrders: (params: any): Promise<Blob> => {
    return api.get('/orders/export', { params, responseType: 'blob' }).then((res) => res.data)
  },
}
