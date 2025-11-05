/**
 * 产品咨询 API 服务
 * 封装所有咨询相关的 API 调用
 */

import { api } from './api'

/**
 * 咨询创建请求数据
 */
export interface ConsultationSubmitData {
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  userName: string
  userPhone: string
  userEmail?: string
  color?: string
  // 服装相关
  height?: string
  weight?: string
  chest?: string
  waist?: string
  hip?: string
  // 鞋履相关
  shoeSize?: string
  // 珠宝相关
  ringSize?: string
  jewelrySize?: string
  jewelryMaterial?: string
  // 香水相关
  perfumePreference?: string
  // 通用
  remarks?: string
}

/**
 * 咨询响应数据
 */
export interface ConsultationResponse {
  id: number
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  userName: string
  userPhone: string
  userEmail: string | null
  color: string | null
  height: string | null
  weight: string | null
  chest: string | null
  waist: string | null
  hip: string | null
  shoeSize: string | null
  ringSize: string | null
  jewelrySize: string | null
  jewelryMaterial: string | null
  perfumePreference: string | null
  remarks: string | null
  status: 'unread' | 'read' | 'processing' | 'completed'
  createdAt: string
  updatedAt: string
}

/**
 * 提交咨询
 */
export async function submitConsultation(
  data: ConsultationSubmitData
): Promise<ConsultationResponse> {
  try {
    console.log('[consultations.ts] 提交咨询数据:', data)

    const response = await api.post<{
      code: number
      message: string
      data: ConsultationResponse
    }>('/consultations', data)

    console.log('[consultations.ts] 咨询提交响应:', response)

    if (response && response.data) {
      console.log('[consultations.ts] 咨询提交成功:', response.data)
      return response.data
    }

    throw new Error('提交咨询失败')
  } catch (error) {
    console.error('[consultations.ts] 提交咨询错误:', error)
    throw error
  }
}

/**
 * 获取咨询列表（管理员使用）
 */
export async function getConsultations(options: {
  page?: number
  limit?: number
  status?: 'unread' | 'read' | 'processing' | 'completed'
  productId?: number
  categoryId?: number
  keyword?: string
} = {}): Promise<ConsultationResponse[]> {
  try {
    const { page = 1, limit = 20, status, productId, categoryId, keyword } =
      options

    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    if (status) {
      params.append('status', status)
    }
    if (productId) {
      params.append('productId', productId.toString())
    }
    if (categoryId) {
      params.append('categoryId', categoryId.toString())
    }
    if (keyword) {
      params.append('keyword', keyword)
    }

    const response = await api.get<{
      code: number
      message: string
      data: {
        items: ConsultationResponse[]
        total: number
        page: number
        limit: number
        pages: number
      }
    }>(`/consultations?${params.toString()}`)

    console.log('[consultations.ts] 获取咨询列表响应:', response)

    if (response && response.data && response.data.items) {
      return response.data.items
    }

    return []
  } catch (error) {
    console.error('[consultations.ts] 获取咨询列表失败:', error)
    return []
  }
}

/**
 * 获取单个咨询详情
 */
export async function getConsultationById(
  id: number
): Promise<ConsultationResponse | null> {
  try {
    const response = await api.get<{
      code: number
      message: string
      data: ConsultationResponse
    }>(`/consultations/${id}`)

    console.log('[consultations.ts] 获取咨询详情响应:', response)

    if (response && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('[consultations.ts] 获取咨询详情失败:', error)
    return null
  }
}

/**
 * 获取咨询统计信息
 */
export async function getConsultationStats(): Promise<{
  total: number
  unread: number
  read: number
  processing: number
  completed: number
} | null> {
  try {
    const response = await api.get<{
      code: number
      message: string
      data: {
        total: number
        unread: number
        read: number
        processing: number
        completed: number
      }
    }>('/consultations/stats/overview')

    console.log('[consultations.ts] 获取统计信息响应:', response)

    if (response && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('[consultations.ts] 获取统计信息失败:', error)
    return null
  }
}
