import api from './api'
import { User, PaginationParams, PaginationResult } from '@/types'

/**
 * Admin 用户管理服务
 * 用于 Admin 后台系统的用户管理
 * 与小程序消费者用户（/api/users）完全分离
 */
export const usersService = {
  /**
   * 获取 Admin 用户列表（分页）
   */
  getUsers: (params: PaginationParams): Promise<PaginationResult<User>> => {
    return api
      .get('/admin/users', { params })
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch users:', error);
        throw error;
      });
  },

  /**
   * 获取单个 Admin 用户
   */
  getUserById: (id: string): Promise<User> => {
    return api
      .get(`/admin/users/${id}`)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch user:', error);
        throw error;
      });
  },

  /**
   * 创建 Admin 用户
   */
  createUser: (payload: Partial<User>): Promise<User> => {
    return api
      .post('/admin/users', payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to create user:', error);
        throw error;
      });
  },

  /**
   * 更新 Admin 用户
   */
  updateUser: (id: string, payload: Partial<User>): Promise<User> => {
    return api
      .patch(`/admin/users/${id}`, payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to update user:', error);
        throw error;
      });
  },

  /**
   * 删除 Admin 用户
   */
  deleteUser: (id: string): Promise<void> => {
    return api
      .delete(`/admin/users/${id}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error('Failed to delete user:', error);
        throw error;
      });
  },

  /**
   * 获取当前登录的 Admin 用户信息
   */
  getCurrentProfile: (): Promise<User> => {
    return api
      .get('/admin/users/profile/current')
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch current profile:', error);
        throw error;
      });
  },

  /**
   * 获取角色列表（如果需要）
   */
  getRoles: () => {
    return api
      .get('/roles')
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch roles:', error);
        throw error;
      });
  },
}

