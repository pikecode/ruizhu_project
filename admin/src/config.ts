/**
 * Application Configuration
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

export const API_ENDPOINTS = {
  // Banner endpoints
  BANNERS: '/banners',
  BANNERS_HOME: '/banners/home',
  BANNER_DETAIL: (id: number) => `/banners/${id}`,
  BANNER_UPLOAD_IMAGE: (id: number) => `/banners/${id}/upload-image`,
  BANNER_UPLOAD_VIDEO: (id: number) => `/banners/${id}/upload-video`,

  // Product endpoints
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: number) => `/products/${id}`,

  // Collection endpoints
  COLLECTIONS: '/collections',
  COLLECTION_DETAIL: (id: number) => `/collections/${id}`,

  // Order endpoints
  ORDERS: '/orders',
  ORDER_DETAIL: (id: number) => `/orders/${id}`,

  // User endpoints
  USERS: '/users',
  USER_DETAIL: (id: number) => `/users/${id}`,
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
}
