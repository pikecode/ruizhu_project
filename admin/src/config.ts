/**
 * Application Configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  // Banner endpoints
  BANNERS: '/api/v1/banners',
  BANNERS_HOME: '/api/v1/banners/home',
  BANNER_DETAIL: (id: number) => `/api/v1/banners/${id}`,
  BANNER_UPLOAD_IMAGE: (id: number) => `/api/v1/banners/${id}/upload-image`,
  BANNER_UPLOAD_VIDEO: (id: number) => `/api/v1/banners/${id}/upload-video`,

  // Product endpoints
  PRODUCTS: '/api/v1/products',
  PRODUCT_DETAIL: (id: number) => `/api/v1/products/${id}`,

  // Collection endpoints
  COLLECTIONS: '/api/v1/collections',
  COLLECTION_DETAIL: (id: number) => `/api/v1/collections/${id}`,

  // Order endpoints
  ORDERS: '/api/v1/orders',
  ORDER_DETAIL: (id: number) => `/api/v1/orders/${id}`,

  // User endpoints
  USERS: '/api/v1/users',
  USER_DETAIL: (id: number) => `/api/v1/users/${id}`,
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
}
