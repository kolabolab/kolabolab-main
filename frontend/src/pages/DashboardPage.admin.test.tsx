/**
 * Unit Tests for DashboardPage admin modifications
 *
 * Tests that:
 * - Delete button is NOT shown when user roles don't include 'admin'
 * - "Pending Approval" badge appears for startups with status 'pending_approval'
 * - Admin nav link appears only for admin users
 *
 * **Validates: Requirements 4.1, 4.2, 4.3, 6.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import React from 'react'
import DashboardPage from './DashboardPage'
import { Navbar } from '../components/layout/Navbar'
import { useAuthStore } from '../hooks/useAuth'
import { theme } from '../theme'

// Mock the dashboard data hooks
vi.mock('../hooks/useDashboardData', () => ({
  useDashboardStats: vi.fn(),
  useDashboardActivities: vi.fn(),
  useUserStartups: vi.fn(),
}))

import { useDashboardStats, useDashboardActivities, useUserStartups } from '../hooks/useDashboardData'

const mockUseDashboardStats = vi.mocked(useDashboardStats)
const mockUseDashboardActivities = vi.mocked(useDashboardActivities)
const mockUseUserStartups = vi.mocked(useUserStartups)

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
}

function createUser(roles: string[]) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles,
    isEmailVerified: true,
    onboardingCompleted: true,
  }
}

const mockStats = {
  totalStartups: 3,
  totalInvestors: 5,
  totalFunding: 100000,
  successRate: 33,
}

const mockStartups = [
  { id: 'startup-1', name: 'Active Startup', stage: 'mvp', fundingAmount: 50000, status: 'active' },
  { id: 'startup-2', name: 'Pending Startup', stage: 'idea', fundingAmount: 0, status: 'pending_approval' },
  { id: 'startup-3', name: 'Failed Startup', stage: 'growth', fundingAmount: 25000, status: 'failed' },
]

function setupMocks() {
  mockUseDashboardStats.mockReturnValue({
    data: mockStats,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseDashboardActivities.mockReturnValue({
    data: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  })
  mockUseUserStartups.mockReturnValue({
    data: mockStartups,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ChakraProvider theme={theme}>
        <HelmetProvider>
          <DashboardPage />
        </HelmetProvider>
      </ChakraProvider>
    </MemoryRouter>
  )
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <ChakraProvider theme={theme}>
        <Navbar />
      </ChakraProvider>
    </MemoryRouter>
  )
}

describe('DashboardPage - Admin modifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
    setupMocks()
  })

  describe('Delete button visibility (Requirement 6.3)', () => {
    it('does NOT show delete button for non-admin users', async () => {
      const user = createUser(['entrepreneur'])
      useAuthStore.getState().setAuth(user, mockTokens)

      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Active Startup')).toBeInTheDocument()
      })

      // Delete button should NOT be present for non-admin users
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(deleteButtons).toHaveLength(0)
    })

    it('does NOT show delete button when user has empty roles', async () => {
      const user = createUser([])
      useAuthStore.getState().setAuth(user, mockTokens)

      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Active Startup')).toBeInTheDocument()
      })

      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      expect(deleteButtons).toHaveLength(0)
    })

    it('shows delete button for admin users', async () => {
      const user = createUser(['admin'])
      useAuthStore.getState().setAuth(user, mockTokens)

      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Active Startup')).toBeInTheDocument()
      })

      // Admin should see delete buttons for each startup
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Pending Approval badge (Requirements 4.2, 4.3)', () => {
    it('displays "Pending Approval" badge for startups with pending_approval status', async () => {
      const user = createUser(['entrepreneur'])
      useAuthStore.getState().setAuth(user, mockTokens)

      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Pending Startup')).toBeInTheDocument()
      })

      // Should show "Pending Approval" badge
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    })

    it('does NOT display "Pending Approval" badge for active startups', async () => {
      const user = createUser(['entrepreneur'])
      useAuthStore.getState().setAuth(user, mockTokens)

      // Only active startups
      mockUseUserStartups.mockReturnValue({
        data: [{ id: 'startup-1', name: 'Active Startup', stage: 'mvp', fundingAmount: 50000, status: 'active' }],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Active Startup')).toBeInTheDocument()
      })

      expect(screen.queryByText('Pending Approval')).not.toBeInTheDocument()
    })

    it('visually distinguishes pending startups from active ones', async () => {
      const user = createUser(['entrepreneur'])
      useAuthStore.getState().setAuth(user, mockTokens)

      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Pending Startup')).toBeInTheDocument()
      })

      // The pending startup should have a badge with "Pending Approval"
      const pendingBadge = screen.getByText('Pending Approval')
      expect(pendingBadge).toBeInTheDocument()

      // Active startup should show "active" badge instead
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })
})

describe('Navbar - Admin link visibility (Requirement 2.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
  })

  it('shows Admin nav link for admin users', () => {
    const user = createUser(['admin'])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderNavbar()

    // Admin link should be present in the navigation
    const adminLinks = screen.getAllByText('Admin')
    expect(adminLinks.length).toBeGreaterThan(0)
  })

  it('does NOT show Admin nav link for non-admin users', () => {
    const user = createUser(['entrepreneur'])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderNavbar()

    // Admin link should NOT be present
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('does NOT show Admin nav link for unauthenticated users', () => {
    // Don't set any auth
    renderNavbar()

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows Admin nav link when user has admin among other roles', () => {
    const user = createUser(['entrepreneur', 'admin', 'investor'])
    useAuthStore.getState().setAuth(user, mockTokens)

    renderNavbar()

    const adminLinks = screen.getAllByText('Admin')
    expect(adminLinks.length).toBeGreaterThan(0)
  })
})
