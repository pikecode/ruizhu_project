/**
 * 应用配置文件
 * 统一管理所有配置，通过环境变量 VITE_API_URL 动态配置
 *
 * 注意：VITE_API_URL 应该包含完整的 API 地址，例如：
 * - 本地开发: http://localhost:8888/api
 * - 线上环境: /api (相对路径，nginx 会转发到后端)
 */

// API 服务基础地址（包含 /api 前缀）
// 生产环境使用相对路径，让 nginx 代理转发到后端
// 开发环境可以使用完整 URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 应用名称
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Ruizhu Admin'

// 导出完整配置对象供应用使用
export const config = {
  apiUrl: API_BASE_URL,
  appName: APP_NAME,
}

export default config
