import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: 'entrepreneur' | 'investor' | 'collaborator' | 'mentor'
  accessibilityPreferences: {
    screenReaderOptimized: boolean
    highContrastMode: boolean
    reducedMotion: boolean
    voiceInputEnabled: boolean
    keyboardNavigationOnly: boolean
    fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  }
  skills: string[]
  location?: {
    city: string
    country: string
    coordinates: [number, number]
  }
  languages: string[]
  timezone: string
  isVerified: boolean
  onboardingCompleted: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User> & { email: string; password: string }) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  updateAccessibilityPreferences: (preferences: Partial<User['accessibilityPreferences']>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Mock user data for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'entrepreneur',
    accessibilityPreferences: {
      screenReaderOptimized: true,
      highContrastMode: false,
      reducedMotion: false,
      voiceInputEnabled: true,
      keyboardNavigationOnly: true,
      fontSize: 'medium',
    },
    skills: ['React', 'Node.js', 'Product Management'],
    location: {
      city: 'San Francisco',
      country: 'USA',
      coordinates: [-122.4194, 37.7749],
    },
    languages: ['English', 'Spanish'],
    timezone: 'America/Los_Angeles',
    isVerified: true,
    onboardingCompleted: true,
  },
  {
    id: '2',
    email: 'marcus@example.com',
    firstName: 'Marcus',
    lastName: 'Chen',
    role: 'collaborator',
    accessibilityPreferences: {
      screenReaderOptimized: false,
      highContrastMode: false,
      reducedMotion: false,
      voiceInputEnabled: false,
      keyboardNavigationOnly: false,
      fontSize: 'medium',
    },
    skills: ['Full Stack Development', 'DevOps', 'System Architecture'],
    location: {
      city: 'Toronto',
      country: 'Canada',
      coordinates: [-79.3832, 43.6532],
    },
    languages: ['English', 'Mandarin'],
    timezone: 'America/Toronto',
    isVerified: true,
    onboardingCompleted: true,
  },
  {
    id: '3',
    email: 'david@example.com',
    firstName: 'David',
    lastName: 'Williams',
    role: 'investor',
    accessibilityPreferences: {
      screenReaderOptimized: false,
      highContrastMode: false,
      reducedMotion: true,
      voiceInputEnabled: false,
      keyboardNavigationOnly: false,
      fontSize: 'large',
    },
    skills: ['Angel Investing', 'Due Diligence', 'Mentoring'],
    location: {
      city: 'London',
      country: 'UK',
      coordinates: [-0.1276, 51.5074],
    },
    languages: ['English', 'French'],
    timezone: 'Europe/London',
    isVerified: true,
    onboardingCompleted: true,
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock authentication - find user by email
          const user = mockUsers.find(u => u.email === email)
          
          if (!user) {
            throw new Error('Invalid email or password')
          }
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          })
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Check if email already exists
          const existingUser = mockUsers.find(u => u.email === userData.email)
          if (existingUser) {
            throw new Error('Email already registered')
          }
          
          // Create new user
          const newUser: User = {
            id: Date.now().toString(),
            email: userData.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role || 'entrepreneur',
            accessibilityPreferences: {
              screenReaderOptimized: false,
              highContrastMode: false,
              reducedMotion: false,
              voiceInputEnabled: false,
              keyboardNavigationOnly: false,
              fontSize: 'medium',
              ...userData.accessibilityPreferences,
            },
            skills: userData.skills || [],
            location: userData.location,
            languages: userData.languages || ['English'],
            timezone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            isVerified: false,
            onboardingCompleted: false,
          }
          
          // Add to mock users (in real app, this would be handled by backend)
          mockUsers.push(newUser)
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false 
          })
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        })
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return
        
        set({ isLoading: true })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const updatedUser = { ...user, ...updates }
          
          // Update in mock users array
          const userIndex = mockUsers.findIndex(u => u.id === user.id)
          if (userIndex !== -1) {
            mockUsers[userIndex] = updatedUser
          }
          
          set({ 
            user: updatedUser, 
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false 
          })
        }
      },

      updateAccessibilityPreferences: (preferences) => {
        const { user } = get()
        if (!user) return
        
        const updatedUser = {
          ...user,
          accessibilityPreferences: {
            ...user.accessibilityPreferences,
            ...preferences,
          },
        }
        
        set({ user: updatedUser })
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'kolabolab-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)