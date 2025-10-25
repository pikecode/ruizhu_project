import { create } from 'zustand'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isLoggedIn: boolean

  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,

  setUser: (user: User | null) => {
    set({ user })
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },

  setToken: (token: string | null) => {
    set({ token, isLoggedIn: !!token })
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isLoggedIn: false,
      error: null,
    })
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },

  hydrate: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isLoggedIn: true,
      })
    }
  },
}))
