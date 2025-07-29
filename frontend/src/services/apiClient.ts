import axios from 'axios'
import { useAuthStore } from '../hooks/useAuth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kolabolab-api-staging.beryour.workers.dev';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState()
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { tokens, clearAuth } = useAuthStore.getState()
      
      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken
          })
          
          const newTokens = response.data
          useAuthStore.getState().setAuth(newTokens.user, newTokens)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          clearAuth()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, clear auth
        clearAuth()
        window.location.href = '/login'
      }
    }
    
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data
  },
  
  register: async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
  }) => {
    const response = await apiClient.post('/api/auth/register', userData)
    return response.data
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken })
    return response.data
  },
  
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout')
    return response.data
  },
  
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.data
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/api/auth/reset-password', { token, newPassword })
    return response.data
  },
  
  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/api/auth/verify-email', { token })
    return response.data
  },
  
  resendVerificationEmail: async (email: string) => {
    const response = await apiClient.post('/api/auth/resend-verification-email', { email })
    return response.data
  }
}

export default apiClient
