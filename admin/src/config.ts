/**
 * 应用配置文件
 * 支持通过环境变量动态配置 API 地址
 */

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// 为了向后兼容 banner.ts 和其他服务，导出 API_BASE_URL
export const API_BASE_URL = apiUrl

export const config = {
  // API 服务地址
  apiUrl,

  // 应用名称
  appName: import.meta.env.VITE_APP_NAME || 'Ruizhu Admin',
}

export default config
