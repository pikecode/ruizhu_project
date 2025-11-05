import { http } from './http'

/**
 * 会员礼遇接口
 */

export interface MemberBenefit {
  id: number
  title: string
  subtitle?: string | null
  imageUrl?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export const memberBenefitsService = {
  /**
   * 获取首页展示的会员礼遇列表（仅启用的）
   * GET /api/v1/member-benefits
   */
  async getActiveMemberBenefits(): Promise<MemberBenefit[]> {
    const response = await http.get('/member-benefits')
    return response.data || []
  },

  /**
   * 获取单个会员礼遇详情
   * GET /api/v1/member-benefits/:id
   */
  async getMemberBenefitById(id: number): Promise<MemberBenefit> {
    const response = await http.get(`/member-benefits/${id}`)
    return response.data
  }
}
