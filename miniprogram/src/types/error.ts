/**
 * 错误类型定义
 * 用于处理 API 响应、业务错误等
 */

/**
 * API 错误类型枚举
 */
export enum ApiErrorType {
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  UNAUTHORIZED = '401',
  NOT_FOUND = '404',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * 扩展的错误类 - 包含 API 错误元数据
 */
export interface ApiError extends Error {
  errorType?: string | ApiErrorType
  statusCode?: number
  code?: number
}

/**
 * 从 Error 对象中安全地提取错误类型
 * 支持多种错误格式
 * @param error 错误对象
 * @returns 错误类型或空字符串
 */
export function extractErrorType(error: unknown): string {
  if (error instanceof Error) {
    return (error as ApiError).errorType || ''
  }
  return ''
}

/**
 * 从 Error 对象中安全地提取状态码
 * @param error 错误对象
 * @returns 状态码或 undefined
 */
export function extractStatusCode(error: unknown): number | undefined {
  if (error instanceof Error) {
    return (error as ApiError).statusCode
  }
  return undefined
}

/**
 * 检查错误是否是库存不足类型
 * @param error 错误对象
 * @param errorMsg 错误消息
 * @returns 是否是库存不足错误
 */
export function isInsufficientStockError(error: unknown, errorMsg: string): boolean {
  const errorType = extractErrorType(error)
  return errorType === ApiErrorType.INSUFFICIENT_STOCK || errorMsg.includes('库存不足')
}

/**
 * 检查错误是否是授权相关错误
 * @param errorMsg 错误消息
 * @returns 是否是授权错误
 */
export function isAuthError(errorMsg: string): boolean {
  return errorMsg.includes('登录过期') || errorMsg.includes('401')
}
