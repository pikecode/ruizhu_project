import api from './api'
import { MemberBenefit, MemberBenefitListItem } from '@/types'

export interface MemberBenefitListResponse {
  items: MemberBenefitListItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export const memberBenefitsService = {
  // 获取列表（带分页）
  getMemberBenefits: (params: {
    page?: number
    limit?: number
    keyword?: string
  }): Promise<MemberBenefitListResponse> => {
    return api.get('/admin/member-benefits', { params }).then((res) => res.data.data)
  },

  // 获取详情
  getMemberBenefitById: (id: number): Promise<MemberBenefit> => {
    return api.get(`/admin/member-benefits/${id}`).then((res) => res.data.data)
  },

  // 创建
  createMemberBenefit: (payload: any): Promise<MemberBenefit> => {
    return api.post('/admin/member-benefits', payload).then((res) => res.data.data)
  },

  // 更新
  updateMemberBenefit: (id: number, payload: Partial<MemberBenefit>): Promise<MemberBenefit> => {
    return api.put(`/admin/member-benefits/${id}`, payload).then((res) => res.data.data)
  },

  // 删除
  deleteMemberBenefit: (id: number): Promise<void> => {
    return api.delete(`/admin/member-benefits/${id}`).then(() => undefined)
  },

  // 上传图片
  uploadImage: (id: number, file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post(`/admin/member-benefits/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data)
  },
}
