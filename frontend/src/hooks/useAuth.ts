import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  roles: string[]
  avatar?: string
  bio?: string
  company?: string
  location?: string
  isEmailVerified: boolean
  onboardingCompleted: boolean
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (user: User, tokens: AuthTokens) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  updateUser: (updates: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      setAuth: (user: User, tokens: AuthTokens) => {
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updates },
          })
        }
      },
    }),
    {
      name: 'kolabolab-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthStore> | undefined
        if (!persisted) return currentState

        // Handle stale localStorage data where onboardingCompleted may be missing
        const user = persisted.user
          ? {
              ...persisted.user,
              onboardingCompleted: persisted.user.onboardingCompleted ?? false,
              roles: persisted.user.roles ?? [],
            }
          : null

        return {
          ...currentState,
          ...persisted,
          user,
        }
      },
    }
  )
)

// Custom hook for easier access to auth state and actions
export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    user: store.user,
    tokens: store.tokens,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    setAuth: store.setAuth,
    clearAuth: store.clearAuth,
    setLoading: store.setLoading,
    updateUser: store.updateUser,
  }
}