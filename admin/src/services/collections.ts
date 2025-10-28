import apiClient from './api'
import { Collection, CollectionDetail, ApiResponse, PaginationParams } from '@/types'

export const collectionsService = {
  // 获取集合列表（分页）
  getCollections: async (params: PaginationParams) => {
    const response = await apiClient.get<ApiResponse<{
      items: Collection[]
      total: number
      page: number
      limit: number
      pages: number
    }>>('/collections', { params })
    return response.data.data!
  },

  // 获取集合详情（包含产品列表）
  getCollectionDetail: async (id: number) => {
    const response = await apiClient.get<ApiResponse<CollectionDetail>>(
      `/collections/${id}/detail`
    )
    return response.data.data!
  },

  // 创建集合
  createCollection: async (data: {
    name: string
    slug: string
    description?: string
    coverImageUrl?: string
    iconUrl?: string
    sortOrder?: number
    isActive?: boolean
    isFeatured?: boolean
    remark?: string
  }) => {
    const response = await apiClient.post<ApiResponse<Collection>>('/collections', data)
    return response.data.data!
  },

  // 更新集合
  updateCollection: async (id: number, data: Partial<Collection>) => {
    const response = await apiClient.put<ApiResponse<Collection>>(
      `/collections/${id}`,
      data
    )
    return response.data.data!
  },

  // 删除集合
  deleteCollection: async (id: number) => {
    await apiClient.delete(`/collections/${id}`)
  },

  // 添加产品到集合
  addProductsToCollection: async (collectionId: number, productIds: number[]) => {
    await apiClient.post(
      `/collections/${collectionId}/products/add`,
      { productIds }
    )
  },

  // 从集合删除产品
  removeProductsFromCollection: async (collectionId: number, productIds: number[]) => {
    await apiClient.delete(
      `/collections/${collectionId}/products/remove`,
      { data: { productIds } }
    )
  },

  // 调整集合内产品的排序
  updateProductsSort: async (
    collectionId: number,
    products: Array<{ productId: number; sortOrder: number }>
  ) => {
    await apiClient.put(
      `/collections/${collectionId}/products/sort`,
      { products }
    )
  },
}
