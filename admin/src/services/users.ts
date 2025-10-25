import api from './api'
import { User, PaginationParams, PaginationResult } from '@/types'

export const usersService = {
  getUsers: (params: PaginationParams): Promise<PaginationResult<User>> => {
    return api.get('/users', { params }).then((res) => res.data.data)
  },

  getUserById: (id: string): Promise<User> => {
    return api.get(`/users/${id}`).then((res) => res.data.data)
  },

  createUser: (payload: Partial<User>): Promise<User> => {
    return api.post('/users', payload).then((res) => res.data.data)
  },

  updateUser: (id: string, payload: Partial<User>): Promise<User> => {
    return api.patch(`/users/${id}`, payload).then((res) => res.data.data)
  },

  deleteUser: (id: string): Promise<void> => {
    return api.delete(`/users/${id}`).then((res) => res.data)
  },

  assignRole: (userId: string, roleId: string): Promise<User> => {
    return api.post(`/users/${userId}/roles`, { roleId }).then((res) => res.data.data)
  },

  getRoles: () => {
    return api.get('/roles').then((res) => res.data.data)
  },
}
