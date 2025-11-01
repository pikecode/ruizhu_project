import api from './api'

export interface Collection {
  id: number
  name: string
  description?: string
  icon?: string
  is_system: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CollectionProduct {
  id: number
  collection_id: number
  product_id: number
  sort_order: number
}

class CollectionsService {
  // 获取所有集合
  async getCollections(params?: { page?: number; limit?: number }) {
    try {
      const response = await api.get('/collections', { params })
      return response.data.data
    } catch (error) {
      console.error('获取集合列表失败:', error)
      throw error
    }
  }

  // 获取单个集合详情
  async getCollectionById(id: number) {
    try {
      const response = await api.get(`/collections/${id}`)
      return response.data.data
    } catch (error) {
      console.error('获取集合详情失败:', error)
      throw error
    }
  }

  // 获取集合详情（包括产品）
  async getCollectionDetail(id: number) {
    try {
      const response = await api.get(`/collections/${id}/detail`)
      return response.data.data
    } catch (error) {
      console.error('获取集合详情失败:', error)
      throw error
    }
  }

  // 更新集合（只允许编辑，不允许删除系统集合）
  async updateCollection(id: number, data: Partial<Collection>) {
    try {
      const response = await api.put(`/collections/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('更新集合失败:', error)
      throw error
    }
  }

  // 删除集合（系统集合无法删除）
  async deleteCollection(id: number) {
    try {
      const response = await api.delete(`/collections/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('删除集合失败:', error)
      throw error
    }
  }

  // 获取集合内的产品
  async getCollectionProducts(collectionId: number) {
    try {
      const response = await api.get(`/collections/${collectionId}/products`)
      return response.data.data
    } catch (error) {
      console.error('获取集合产品列表失败:', error)
      throw error
    }
  }

  // 添加产品到集合
  async addProductToCollection(collectionId: number, productId: number, sortOrder: number = 0) {
    try {
      const response = await api.post(
        `/collections/${collectionId}/products`,
        { product_id: productId, sort_order: sortOrder }
      )
      return response.data.data
    } catch (error) {
      console.error('添加产品到集合失败:', error)
      throw error
    }
  }

  // 从集合移除产品
  async removeProductFromCollection(collectionId: number, productId: number) {
    try {
      const response = await api.delete(
        `/collections/${collectionId}/products/${productId}`
      )
      return response.data.data
    } catch (error) {
      console.error('从集合移除产品失败:', error)
      throw error
    }
  }

  // 更新集合内产品的排序
  async updateCollectionProductOrder(
    collectionId: number,
    productId: number,
    sortOrder: number
  ) {
    try {
      const response = await api.put(
        `/collections/${collectionId}/products/${productId}`,
        { sort_order: sortOrder }
      )
      return response.data.data
    } catch (error) {
      console.error('更新产品排序失败:', error)
      throw error
    }
  }

  // 添加多个产品到集合
  async addProductsToCollection(collectionId: number, productIds: number[]) {
    try {
      const response = await api.post(
        `/collections/${collectionId}/products/add`,
        { productIds }
      )
      return response.data.data
    } catch (error) {
      console.error('添加产品到集合失败:', error)
      throw error
    }
  }

  // 从集合删除多个产品
  async removeProductsFromCollection(collectionId: number, productIds: number[]) {
    try {
      const response = await api.delete(
        `/collections/${collectionId}/products/remove`,
        { data: { productIds } }
      )
      return response.data.data
    } catch (error) {
      console.error('从集合移除产品失败:', error)
      throw error
    }
  }

  // 更新集合产品排序
  async updateProductsSort(
    collectionId: number,
    sortData: Array<{ productId: number; sortOrder: number }>
  ) {
    try {
      const response = await api.put(
        `/collections/${collectionId}/products/sort`,
        { products: sortData }
      )
      return response.data.data
    } catch (error) {
      console.error('更新产品排序失败:', error)
      throw error
    }
  }
}

export const collectionsService = new CollectionsService()
