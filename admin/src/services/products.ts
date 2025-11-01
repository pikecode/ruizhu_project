import api from './api'
import { Product, ProductListItem, Category } from '@/types'

export interface ProductListResponse {
  items: ProductListItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export const productsService = {
  // Get products list with pagination and filters (admin only)
  getProducts: (params: {
    page?: number
    limit?: number
    keyword?: string
    categoryId?: number
    minPrice?: number
    maxPrice?: number
    sort?: string
    isNew?: boolean
    onSale?: boolean
  }): Promise<ProductListResponse> => {
    return api.get('/admin/products', { params }).then((res) => res.data.data)
  },

  // Get product detail by ID (admin only)
  getProductById: (id: number): Promise<Product> => {
    return api.get(`/admin/products/${id}`).then((res) => res.data.data)
  },

  // Get hot products
  getHotProducts: (limit?: number): Promise<ProductListItem[]> => {
    return api.get('/products/hot', { params: { limit } }).then((res) => res.data.data)
  },

  // Search products by keyword (admin only)
  searchProducts: (keyword: string, limit?: number): Promise<ProductListResponse> => {
    return api.get('/admin/products/search', { params: { keyword, limit } }).then((res) => res.data.data)
  },

  // Get products by category
  getProductsByCategory: (categoryId: number, limit?: number): Promise<ProductListItem[]> => {
    return api.get(`/products/category/${categoryId}`, { params: { limit } }).then((res) => res.data.data)
  },

  // Create product (admin only)
  createProduct: (payload: any): Promise<Product> => {
    return api.post('/admin/products', payload).then((res) => res.data.data)
  },

  // Update product (admin only)
  updateProduct: (id: number, payload: Partial<Product>): Promise<Product> => {
    return api.put(`/admin/products/${id}`, payload).then((res) => res.data.data)
  },

  // Delete product (admin only)
  deleteProduct: (id: number): Promise<void> => {
    return api.delete(`/admin/products/${id}`).then(() => undefined)
  },

  // Get all categories
  getCategories: (): Promise<Category[]> => {
    return api.get('/categories').then((res) => res.data.data)
  },

  // Get category by ID
  getCategoryById: (id: number): Promise<Category> => {
    return api.get(`/categories/${id}`).then((res) => res.data.data)
  },
}
