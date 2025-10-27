/**
 * 基础 API 请求封装
 * 所有 HTTP 请求都通过此服务处理
 */

const BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8888/api/v1'

interface RequestOptions {
  method?: string
  header?: Record<string, string>
  timeout?: number
  [key: string]: any
}

interface ApiResponse<T = any> {
  code?: number
  message?: string
  data?: T
  [key: string]: any
}

/**
 * 统一的 HTTP 请求方法
 */
export const request = async <T = any>(
  method: string,
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<T> => {
  const token = uni.getStorageSync('accessToken')

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.header,
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method: method as any,
      data,
      header,
      timeout: options.timeout || 10000,
      success: (res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          // Token 过期，需要刷新
          uni.removeStorageSync('accessToken')
          uni.removeStorageSync('refreshToken')
          uni.removeStorageSync('user')
          uni.redirectTo({ url: '/pages/auth/login' })
          reject(new Error('登录过期，请重新登录'))
        } else {
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail: (err: any) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

/**
 * API 方法集合
 */
export const api = {
  /**
   * GET 请求
   */
  get: <T = any>(url: string, options?: RequestOptions) =>
    request<T>('GET', url, undefined, options),

  /**
   * POST 请求
   */
  post: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>('POST', url, data, options),

  /**
   * PUT 请求
   */
  put: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>('PUT', url, data, options),

  /**
   * PATCH 请求
   */
  patch: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>('PATCH', url, data, options),

  /**
   * DELETE 请求
   */
  delete: <T = any>(url: string, options?: RequestOptions) =>
    request<T>('DELETE', url, undefined, options),
}
