import api from './api'

export const arrayCollectionsService = {
  // ==================== 数组集合管理 ====================

  /**
   * 创建数组集合
   */
  createArrayCollection: (data: any) =>
    api.post('/array-collections', data).then((res: any) => res.data),

  /**
   * 获取数组集合列表
   */
  getArrayCollections: (params?: { page?: number; limit?: number }) =>
    api.get('/array-collections', { params }).then((res: any) => res.data),

  /**
   * 获取数组集合详情
   */
  getArrayCollectionDetail: (id: number) =>
    api.get(`/array-collections/${id}`).then((res: any) => res.data),

  /**
   * 更新数组集合
   */
  updateArrayCollection: (id: number, data: any) =>
    api.put(`/array-collections/${id}`, data).then((res: any) => res.data),

  /**
   * 删除数组集合
   */
  deleteArrayCollection: (id: number) =>
    api.delete(`/array-collections/${id}`),

  // ==================== 卡片项目管理 ====================

  /**
   * 创建卡片项目
   */
  createItem: (arrayCollectionId: number, data: any) =>
    api
      .post(`/array-collections/${arrayCollectionId}/items`, data)
      .then((res: any) => res.data),

  /**
   * 更新卡片项目
   */
  updateItem: (itemId: number, data: any) =>
    api.put(`/array-collections/items/${itemId}`, data).then((res: any) => res.data),

  /**
   * 删除卡片项目
   */
  deleteItem: (itemId: number) =>
    api.delete(`/array-collections/items/${itemId}`),

  /**
   * 获取单个卡片项目的详情（包括商品列表）
   */
  getItemDetail: (itemId: number) =>
    api.get(`/array-collections/items/${itemId}`).then((res: any) => res.data),

  /**
   * 更新集合内项目的排序
   */
  updateItemsSort: (collectionId: number, items: any[]) =>
    api
      .put(`/array-collections/${collectionId}/items/sort`, { items })
      .then((res: any) => res.data),

  // ==================== 商品管理 ====================

  /**
   * 添加商品到卡片
   */
  addProductsToItem: (itemId: number, productIds: number[]) =>
    api
      .post(`/array-collections/items/${itemId}/products`, { productIds })
      .then((res: any) => res.data),

  /**
   * 从卡片删除商品
   */
  removeProductsFromItem: (itemId: number, productIds: number[]) =>
    api.delete(`/array-collections/items/${itemId}/products`, {
      data: { productIds },
    }),

  /**
   * 更新卡片内商品的排序
   */
  updateItemProductsSort: (itemId: number, products: any[]) =>
    api
      .put(`/array-collections/items/${itemId}/products/sort`, { products })
      .then((res: any) => res.data),
}
