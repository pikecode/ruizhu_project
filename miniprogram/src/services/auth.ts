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

  /**
   * 获取微信登录信息（openId 和 sessionKey）
   * 这是手机号授权的前置条件
   *
   * @param forceRefresh 是否强制刷新sessionKey（手机号授权时需要新的sessionKey）
   */
  async wechatLogin(forceRefresh: boolean = false): Promise<{ openId: string }> {
    return new Promise((resolve, reject) => {
      // 首先尝试获取存储的 openId
      const storedOpenId = uni.getStorageSync('openId')

      // 如果存在缓存且不需要强制刷新，直接返回缓存
      if (storedOpenId && !forceRefresh) {
        console.log('✅ 使用缓存的 openId:', storedOpenId)
        resolve({ openId: storedOpenId })
        return
      }

      // 如果没有存储或需要强制刷新，调用微信登录
      uni.login({
        provider: 'weixin',
        success: (loginRes: any) => {
          if (loginRes.code) {
            // 调用后端接口获取 openId（不再请求 sessionKey）
            // ⚠️ 安全提示：sessionKey 应该只在后端保存，不发送给客户端
            api
              .post<{
                openId: string
              }>('/auth/wechat/login-code', {
                code: loginRes.code
              })
              .then((response) => {
                const { openId } = response
                // 只存储 openId
                uni.setStorageSync('openId', openId)
                console.log('✅ 微信登录成功，openId:', openId)
                console.log('⚠️ 注意：sessionKey 不会在客户端保存，手机号解密将由后端完成')
                resolve({ openId })
              })
              .catch((error) => {
                reject(new Error('微信登录失败: ' + error.message))
              })
          } else {
            reject(new Error('获取微信登录授权失败'))
          }
        },
        fail: (error: any) => {
          reject(new Error('微信登录失败: ' + error.errMsg))
        }
      })
    })
  },

  /**
   * 处理微信手机号授权事件
   * 获取用户授权的手机号并进行登录/注册
   *
   * ⚠️ 安全提示：
   * - 不再在前端请求或存储 sessionKey
   * - 前端只存储 openId
   * - 加密的手机号数据发送给后端，由后端使用其存储的 sessionKey 进行解密
   * - 这样可以防止 sessionKey 在网络中传输，保证安全性
   */
  async handlePhoneNumberEvent(event: any): Promise<User> {
    // 获取手机号加密数据
    const { detail = {} } = event

    // 检查用户是否授权
    if (detail.errMsg === 'getPhoneNumber:fail user deny') {
      throw new Error('您已拒绝授权手机号，无法继续')
    }

    if (detail.errMsg !== 'getPhoneNumber:ok') {
      throw new Error('获取手机号失败，请重试')
    }

    try {
      console.log('📱 开始微信手机号授权流程...')

      // 获取 openId（不再需要获取 sessionKey）
      const loginInfo = await this.wechatLogin(true) // forceRefresh = true
      const openId = loginInfo.openId

      console.log('✓ 已获取 openId')
      console.log('📤 发送加密手机号数据给后端进行解密...')

      // 调用后端接口进行手机号登录/注册
      // ⚠️ 安全：只发送 openId 和加密数据，不发送 sessionKey
      // 后端会使用其自己存储的 sessionKey 进行解密
      const response = await api.post<AuthResponse>('/auth/wechat/phone-login', {
        openId,
        encryptedPhone: detail.encryptedData,
        iv: detail.iv
        // ⚠️ sessionKey 不发送 - 后端使用其自己存储的 sessionKey 进行解密
      })

      console.log('✅ API 响应:', {
        hasAccessToken: !!response.access_token,
        user: response.user?.id,
        responseKeys: Object.keys(response)
      })

      // 保存 Token 和用户信息
      // 注意：API 返回的是 access_token (下划线)，不是 accessToken (驼峰式)
      const accessToken = response.access_token
      if (accessToken) {
        console.log('💾 保存 accessToken 到存储...')
        uni.setStorageSync('accessToken', accessToken)
        // refreshToken 在 WeChat 流程中可能不返回，这里处理可选值
        if (response.refresh_token) {
          uni.setStorageSync('refreshToken', response.refresh_token)
        }
        uni.setStorageSync('user', JSON.stringify(response.user))
        uni.setStorageSync('loginTime', Date.now())
        console.log('✓ Token 已保存，isLoggedIn():', this.isLoggedIn())
        console.log('✓ 保存的 accessToken:', accessToken.substring(0, 20) + '...')
      } else {
        console.warn('⚠️ API 响应中没有 access_token，响应:', response)
      }

      return response.user
    } catch (error: any) {
      console.error('❌ 手机号授权失败:', error)
      const message = error?.message || '手机号授权失败'
      throw new Error(message)
    }
  },
}
