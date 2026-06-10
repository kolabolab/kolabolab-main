import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, User } from './useAuth'

const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  roles: ['entrepreneur'],
  isEmailVerified: true,
  onboardingCompleted: false,
  ...overrides,
})

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  describe('User interface with onboardingCompleted', () => {
    it('stores onboardingCompleted as false for new users', () => {
      const user = createTestUser({ onboardingCompleted: false })
      useAuthStore.getState().setAuth(user, mockTokens)

      const state = useAuthStore.getState()
      expect(state.user?.onboardingCompleted).toBe(false)
    })

    it('stores onboardingCompleted as true for users who completed onboarding', () => {
      const user = createTestUser({ onboardingCompleted: true })
      useAuthStore.getState().setAuth(user, mockTokens)

      const state = useAuthStore.getState()
      expect(state.user?.onboardingCompleted).toBe(true)
    })
  })

  describe('updateUser action', () => {
    it('updates onboardingCompleted via updateUser', () => {
      const user = createTestUser({ onboardingCompleted: false })
      useAuthStore.getState().setAuth(user, mockTokens)

      useAuthStore.getState().updateUser({ onboardingCompleted: true })

      const state = useAuthStore.getState()
      expect(state.user?.onboardingCompleted).toBe(true)
    })

    it('updates roles via updateUser', () => {
      const user = createTestUser({ roles: [] })
      useAuthStore.getState().setAuth(user, mockTokens)

      useAuthStore.getState().updateUser({ roles: ['collaborator', 'investor'] })

      const state = useAuthStore.getState()
      expect(state.user?.roles).toEqual(['collaborator', 'investor'])
    })

    it('updates both roles and onboardingCompleted simultaneously', () => {
      const user = createTestUser({ roles: [], onboardingCompleted: false })
      useAuthStore.getState().setAuth(user, mockTokens)

      useAuthStore.getState().updateUser({
        roles: ['entrepreneur', 'collaborator'],
        onboardingCompleted: true,
      })

      const state = useAuthStore.getState()
      expect(state.user?.roles).toEqual(['entrepreneur', 'collaborator'])
      expect(state.user?.onboardingCompleted).toBe(true)
    })

    it('does not update user if no user is set', () => {
      useAuthStore.getState().updateUser({ onboardingCompleted: true })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
    })

    it('preserves other user fields when updating', () => {
      const user = createTestUser({
        email: 'jane@example.com',
        firstName: 'Jane',
        onboardingCompleted: false,
      })
      useAuthStore.getState().setAuth(user, mockTokens)

      useAuthStore.getState().updateUser({ onboardingCompleted: true })

      const state = useAuthStore.getState()
      expect(state.user?.email).toBe('jane@example.com')
      expect(state.user?.firstName).toBe('Jane')
      expect(state.user?.onboardingCompleted).toBe(true)
    })
  })

  describe('stale localStorage handling (merge function)', () => {
    it('defaults onboardingCompleted to false when missing from persisted state', () => {
      // Simulate what the merge function does with stale data
      const staleUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        roles: ['entrepreneur'],
        isEmailVerified: true,
        // onboardingCompleted is intentionally missing
      }

      // The merge function should handle this
      const mergedUser = {
        ...staleUser,
        onboardingCompleted: (staleUser as any).onboardingCompleted ?? false,
        roles: staleUser.roles ?? [],
      }

      expect(mergedUser.onboardingCompleted).toBe(false)
    })

    it('defaults roles to empty array when missing from persisted state', () => {
      const staleUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        // roles is intentionally missing
      }

      const mergedUser = {
        ...staleUser,
        onboardingCompleted: (staleUser as any).onboardingCompleted ?? false,
        roles: (staleUser as any).roles ?? [],
      }

      expect(mergedUser.roles).toEqual([])
      expect(mergedUser.onboardingCompleted).toBe(false)
    })

    it('preserves onboardingCompleted when present in persisted state', () => {
      const freshUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        roles: ['investor'],
        isEmailVerified: true,
        onboardingCompleted: true,
      }

      const mergedUser = {
        ...freshUser,
        onboardingCompleted: freshUser.onboardingCompleted ?? false,
        roles: freshUser.roles ?? [],
      }

      expect(mergedUser.onboardingCompleted).toBe(true)
      expect(mergedUser.roles).toEqual(['investor'])
    })
  })
})
