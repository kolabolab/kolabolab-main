/**
 * Unit Tests for AdminRoute component
 *
 * Tests that the AdminRoute guard correctly renders children for admin users
 * and redirects non-admin users to /dashboard.
 *
 * **Validates: Requirements 2.1, 2.2**
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import { AdminRoute } from './AdminRoute'
import { useAuthStore } from '../../hooks/useAuth'
import { theme } from '../../theme'

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
}

function createUser(roles: string[] | null | undefined) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles: roles as string[],
    isEmailVerified: true,
    onboardingCompleted: true,
  }
}

function renderAdminRoute() {
  return render(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Admin Content</div>
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={<div data-testid="dashboard-redirect">Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  )
}

describe('AdminRoute component', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  it('renders children when user has admin role', () => {
    const user = createUser(['admin'])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderAdminRoute()

    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-redirect')).not.toBeInTheDocument()
  })

  it('renders children when user has admin role among other roles', () => {
    const user = createUser(['entrepreneur', 'admin', 'investor'])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderAdminRoute()

    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-redirect')).not.toBeInTheDocument()
  })

  it('redirects to /dashboard when user has non-admin roles', () => {
    const user = createUser(['entrepreneur'])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderAdminRoute()

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user roles is null', () => {
    const user = createUser(null)
    useAuthStore.getState().setAuth(user, mockTokens)

    renderAdminRoute()

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user roles is undefined', () => {
    const user = createUser(undefined)
    useAuthStore.getState().setAuth(user, mockTokens)

    renderAdminRoute()

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user is null (not authenticated)', () => {
    // Don't set any auth - user will be null
    renderAdminRoute()

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user has empty roles array', () => {
    const user = createUser([])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderAdminRoute()

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument()
  })
})
