import { api } from './api'

/**
 * 会员礼遇数据结构
 */
export interface MemberBenefit {
  id: number
  title: string
  subtitle?: string | null
  imageUrl?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MemberBenefitResponse {
  code: number
  message: string
  data: MemberBenefit | MemberBenefit[]
}

/**
 * 会员礼遇服务
 */
export const memberBenefitsService = {
  /**
   * 获取首页展示的会员礼遇列表（仅启用的）
   * API: GET /member-benefits
   */
  async getActiveMemberBenefits(): Promise<MemberBenefit[]> {
    try {
      const response = await api.get<MemberBenefitResponse>('/member-benefits')
      return Array.isArray(response.data) ? response.data : [response.data]
    } catch (error) {
      console.error('Failed to fetch member benefits:', error)
      return []
    }
  },

  /**
   * 获取单个会员礼遇详情
   * API: GET /member-benefits/:id
   */
  async getMemberBenefitById(id: number): Promise<MemberBenefit | null> {
    try {
      const response = await api.get<MemberBenefitResponse>(`/member-benefits/${id}`)
      return (Array.isArray(response.data) ? response.data[0] : response.data) || null
    } catch (error) {
      console.error(`Failed to fetch member benefit ${id}:`, error)
      return null
    }
  }
}
