import api from './api'

export interface ConsumerUser {
  id: number
  phone?: string
  openId?: string
  username?: string
  email?: string
  nickname?: string
  avatarUrl?: string
  gender: string
  province?: string
  city?: string
  country?: string
  isPhoneAuthorized: boolean
  isProfileAuthorized: boolean
  status: string
  registrationSource: string
  lastLoginAt?: string
  lastLoginIp?: string
  loginCount: number
  createdAt: string
  updatedAt: string
}

export interface ConsumerUserResponse {
  code: number
  message: string
  data: {
    items: ConsumerUser[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * 消费者用户管理服务
 * 用于管理小程序用户（非 Admin 系统用户）
 * 与 Admin 用户（usersService）完全分离
 */
export const consumerUsersService = {
  /**
   * 获取消费者用户列表（分页）
   */
  getUsers: async (page: number = 1, limit: number = 10): Promise<ConsumerUserResponse['data']> => {
    try {
      const response = await api.get('/users', {
        params: { page, limit },
      })

      // 处理两种可能的响应格式
      // 1. 数组格式：[{ id: 1, ... }, { id: 2, ... }]
      // 2. 分页格式：{ items: [...], total: 1, page: 1, ... }

      if (Array.isArray(response.data)) {
        // 数组格式，转换为分页格式
        return {
          items: response.data,
          total: response.data.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(response.data.length / limit),
        }
      }

      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch consumer users:', error)
      throw error
    }
  },

  /**
   * 获取单个消费者用户
   */
  getUserById: async (id: number): Promise<ConsumerUser> => {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch consumer user:', error)
      throw error
    }
  },

  /**
   * 删除消费者用户
   */
  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`)
    } catch (error) {
      console.error('Failed to delete consumer user:', error)
      throw error
    }
  },

  /**
   * 禁用消费者用户账户
   */
  banUser: async (id: number): Promise<void> => {
    try {
      await api.patch(`/users/${id}`, { status: 'banned' })
    } catch (error) {
      console.error('Failed to ban consumer user:', error)
      throw error
    }
  },
}
