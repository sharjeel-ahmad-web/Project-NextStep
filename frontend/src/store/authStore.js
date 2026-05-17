import { create } from 'zustand'
import { authAPI } from '../services/api'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('accessToken', data.access_token)
    localStorage.setItem('refreshToken', data.refresh_token)
    set({ user: data.user, isAuthenticated: true })
    return data
  },

  register: async (userData) => {
    const { data } = await authAPI.register(userData)
    localStorage.setItem('accessToken', data.access_token)
    localStorage.setItem('refreshToken', data.refresh_token)
    set({ user: data.user, isAuthenticated: true })
    return data
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.clear()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const { data } = await authAPI.getMe()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.clear()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ isLoading: loading }),
}))

export default useAuthStore
