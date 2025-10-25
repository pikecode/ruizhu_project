import api from './api'
import { LoginPayload, AuthResponse } from '@/types'

export const authService = {
  login: (payload: LoginPayload): Promise<AuthResponse> => {
    return api.post('/auth/login', payload).then((res) => res.data.data)
  },

  register: (payload: any): Promise<AuthResponse> => {
    return api.post('/auth/register', payload).then((res) => res.data.data)
  },

  logout: (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  getProfile: () => {
    return api.get('/auth/profile').then((res) => res.data.data)
  },

  refreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken')
    return api.post('/auth/refresh', { refreshToken }).then((res) => res.data.data)
  },
}
