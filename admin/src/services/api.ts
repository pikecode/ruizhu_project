import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { mockProducts, mockOrders, mockCoupons } from '@/mocks/data'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api/v1'
const USE_MOCK_DATA = import.meta.env.MODE === 'development' // 开发环境使用模拟数据

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and fallback to mock data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 如果是 404 或网络错误，尝试使用模拟数据
    if (USE_MOCK_DATA && (error.response?.status === 404 || !error.response)) {
      const url = error.config?.url || ''

      if (url.includes('/products')) {
        console.warn('⚠️ 使用模拟产品数据（后端 API 不可用）')
        return Promise.resolve({
          data: mockProducts,
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config,
        })
      } else if (url.includes('/orders')) {
        console.warn('⚠️ 使用模拟订单数据（后端 API 不可用）')
        return Promise.resolve({
          data: mockOrders,
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config,
        })
      } else if (url.includes('/coupons')) {
        console.warn('⚠️ 使用模拟优惠券数据（后端 API 不可用）')
        return Promise.resolve({
          data: mockCoupons,
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config,
        })
      }
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Permission denied
      console.error('Access denied')
    }
    return Promise.reject(error)
  }
)

export default api
