import api from './api'

/**
 * 咨询数据类型
 */
export interface Consultation {
  id: number
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  userName: string
  userPhone: string
  userEmail: string | null
  color: string | null
  // 服装相关
  clothingSize: string | null
  height: string | null
  weight: string | null
  chest: string | null
  waist: string | null
  hip: string | null
  // 鞋履相关
  shoeSize: string | null
  remarks: string | null
  status: 'unread' | 'read' | 'processing' | 'completed'
  createdAt: string
  updatedAt: string
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  limit?: number
  [key: string]: any
}

/**
 * 咨询统计信息
 */
export interface ConsultationStats {
  total: number
  unread: number
  read: number
  processing: number
  completed: number
}

/**
 * Admin Consultations Service
 * All endpoints require admin authentication
 */
export const consultationsService = {
  // Get all consultations
  getConsultations: (params: PaginationParams): Promise<PaginationResult<Consultation>> => {
    return api.get('/consultations', { params }).then((res) => res.data.data)
  },

  // Get consultation by ID
  getConsultationById: (id: number): Promise<Consultation> => {
    return api.get(`/consultations/${id}`).then((res) => res.data.data)
  },

  // Update consultation status
  updateConsultationStatus: (
    id: number,
    status: 'unread' | 'read' | 'processing' | 'completed'
  ): Promise<Consultation> => {
    return api
      .patch(`/consultations/${id}/status`, { status })
      .then((res) => res.data.data)
  },

  // Delete single consultation
  deleteConsultation: (id: number): Promise<void> => {
    return api.delete(`/consultations/${id}`).then((res) => res.data)
  },

  // Delete multiple consultations
  deleteConsultations: (ids: number[]): Promise<void> => {
    return api.delete('/consultations', { data: { ids } }).then((res) => res.data)
  },

  // Get consultation statistics
  getStats: (): Promise<ConsultationStats> => {
    return api.get('/consultations/stats/overview').then((res) => res.data.data)
  },

  // Export consultations (if needed)
  exportConsultations: (params: any): Promise<Blob> => {
    return api
      .get('/consultations/export', { params, responseType: 'blob' })
      .then((res) => res.data)
  },
}
