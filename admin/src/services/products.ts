import api from './api'
import { Product, PaginationParams, PaginationResult } from '@/types'

export const productsService = {
  getProducts: (params: PaginationParams): Promise<PaginationResult<Product>> => {
    return api.get('/products', { params }).then((res) => res.data.data)
  },

  getProductById: (id: string): Promise<Product> => {
    return api.get(`/products/${id}`).then((res) => res.data.data)
  },

  createProduct: (payload: Partial<Product>): Promise<Product> => {
    return api.post('/products', payload).then((res) => res.data.data)
  },

  updateProduct: (id: string, payload: Partial<Product>): Promise<Product> => {
    return api.patch(`/products/${id}`, payload).then((res) => res.data.data)
  },

  deleteProduct: (id: string): Promise<void> => {
    return api.delete(`/products/${id}`).then((res) => res.data)
  },

  uploadImage: (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data.data.url)
  },
}
