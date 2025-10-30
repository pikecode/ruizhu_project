/**
 * 认证服务
 * 处理用户登录、注册、注销等认证相关业务逻辑
 */

import { api } from './api'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  realName?: string
  avatar?: string
  user_type?: string
  [key: string]: any
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户注册
   */
  async register(
    username: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
      phone,
    })

    // 保存 Token 和用户信息
    if (response.accessToken) {
      uni.setStorageSync('accessToken', response.accessToken)
      uni.setStorageSync('refreshToken', response.refreshToken)
      uni.setStorageSync('user', JSON.stringify(response.user))
      uni.setStorageSync('loginTime', Date.now())
    }

    return response
  },

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      username,
      password,
    })

    // 保存 Token 和用户信息
    if (response.accessToken) {
      uni.setStorageSync('accessToken', response.accessToken)
      uni.setStorageSync('refreshToken', response.refreshToken)
      uni.setStorageSync('user', JSON.stringify(response.user))
      uni.setStorageSync('loginTime', Date.now())
    }

    return response
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  },

  /**
   * 更新个人信息
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data)

    // 更新本地存储的用户信息
    if (response) {
      uni.setStorageSync('user', JSON.stringify(response))
    }

    return response
  },

  /**
   * 修改密码
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    })
  },

  /**
   * 刷新 Token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = uni.getStorageSync('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    const response = await api.post<AuthResponse>('/auth/refresh-token', {
      refreshToken,
    })

    // 保存新的 Token
    if (response.accessToken) {
      uni.setStorageSync('accessToken', response.accessToken)
      uni.setStorageSync('refreshToken', response.refreshToken)
    }

    return response
  },

  /**
   * 登出
   */
  async logout(): Promise<void> {
    const refreshToken = uni.getStorageSync('refreshToken')

    // 调用登出 API (可能失败，但不影响本地清理)
    if (refreshToken) {
      try {
        await api.post<{ message: string }>('/auth/logout', { refreshToken })
      } catch (error) {
        console.warn('Logout API call failed:', error)
      }
    }

    // 清除本地数据
    uni.removeStorageSync('accessToken')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('user')
    uni.removeStorageSync('loginTime')
  },

  /**
   * 检查用户是否已登录
   */
  isLoggedIn(): boolean {
    const token = uni.getStorageSync('accessToken')
    return !!token
  },

  /**
   * 获取本地缓存的用户信息
   */
  getLocalUser(): User | null {
    try {
      const userStr = uni.getStorageSync('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Failed to parse user data:', error)
      return null
    }
  },

  /**
   * 获取访问 Token
   */
  getAccessToken(): string | null {
    return uni.getStorageSync('accessToken') || null
  },

  /**
   * 清除所有认证信息
   */
  clearAuth(): void {
    uni.removeStorageSync('accessToken')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('user')
    uni.removeStorageSync('loginTime')
  },
}
