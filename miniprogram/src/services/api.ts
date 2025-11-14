/**
 * 基础 API 请求封装
 * 所有 HTTP 请求都通过此服务处理
 */

/**
 * API 基础 URL 配置
 * 根据环境切换不同的后端地址
 *
 * 开发流程：
 * 1. 开发阶段：使用本地 NestAPI (http://localhost:8888/api)
 * 2. 测试完成：切换到生产环境 (https://yunjie.online/api)
 *
 * 注意：小程序的 request 请求会自动使用当前配置，无需重新编译
 */

// 开发环境配置（本地 NestAPI 开发）
const DEV_URL = 'http://localhost:3000/api'

// 生产环境配置（云服务器）
const PROD_URL = 'https://yunjie.online/api'

// 根据环境选择 API 地址
// 修改这里来切换开发/生产环境
// const BASE_URL = PROD_URL  // 生产环境（线上）
const BASE_URL = DEV_URL  // 本地开发环境（如需本地调试，注释上一行，取消注释此行）

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
  const fullUrl = `${BASE_URL}${url}`

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.header,
  }

  // 请求开始时的日志
  console.log('🚀 [API] 发起请求:')
  console.log('  - 方法:', method)
  console.log('  - 完整 URL:', fullUrl)
  console.log('  - Token 存在:', !!token)
  console.log('  - 请求数据:', data)

  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method: method as any,
      data,
      header,
      timeout: options.timeout || 10000,
      success: (res: any) => {
        console.log(`✅ [API] ${method} ${url} 响应成功`)
        console.log('  - 状态码:', res.statusCode)
        console.log('  - 响应数据:', res.data)

        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          // Token 过期，清除本地数据
          console.error('❌ [API] 401 未授权 - Token 可能过期或无效')
          console.error('❌ [API] 响应数据:', res.data)
          uni.removeStorageSync('accessToken')
          uni.removeStorageSync('refreshToken')
          uni.removeStorageSync('user')
          // 抛出错误，让调用方决定如何处理（显示授权弹窗或重定向）
          reject(new Error('登录过期，请重新登录'))
        } else {
          console.error('❌ [API] 请求失败 - 状态码:', res.statusCode)
          console.error('❌ [API] 响应数据:', res.data)
          reject(new Error(res.data?.message || `请求失败(${res.statusCode})`))
        }
      },
      fail: (err: any) => {
        console.error('❌ [API] 网络请求失败:')
        console.error('  - 方法:', method)
        console.error('  - URL:', fullUrl)
        console.error('  - 错误信息:', err.errMsg || '未知错误')
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
