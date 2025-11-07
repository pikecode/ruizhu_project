/**
 * 用户服务
 * 处理用户信息查询、更新等业务逻辑
 */

import { api } from './api'

export interface UserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  realName?: string
  avatar?: string
  discount?: number
  vipLevel?: number
  [key: string]: any
}

/**
 * 用户服务
 */
const usersService = {
  /**
   * 获取当前用户信息
   * API: GET /users/profile
   */
  getUserInfo: async (): Promise<UserInfo | null> => {
    try {
      console.log('📡 [UsersService] 正在获取用户信息...')

      const response = await api.get<{ code: number; message: string; data: UserInfo }>(
        '/users/profile'
      )

      console.log('✅ [UsersService] 用户信息获取成功:', response)
      return response.data || null
    } catch (error) {
      console.error('❌ [UsersService] 获取用户信息失败:', error)
      return null
    }
  },

  /**
   * 更新用户信息
   * API: PUT /users/profile
   */
  updateUserInfo: async (updateData: Partial<UserInfo>): Promise<UserInfo | null> => {
    try {
      console.log('📡 [UsersService] 正在更新用户信息...', updateData)

      const response = await api.put<{ code: number; message: string; data: UserInfo }>(
        '/users/profile',
        updateData
      )

      console.log('✅ [UsersService] 用户信息更新成功:', response)
      return response.data || null
    } catch (error) {
      console.error('❌ [UsersService] 更新用户信息失败:', error)
      throw error
    }
  }
}

export default usersService
