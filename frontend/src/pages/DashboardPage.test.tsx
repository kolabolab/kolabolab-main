import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

// Mock the hooks
vi.mock('../hooks/useDashboardData', () => ({
  useDashboardStats: vi.fn(),
  useDashboardActivities: vi.fn(),
  useUserStartups: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
  useAuthStore: vi.fn(),
}))

import { useDashboardStats, useDashboardActivities, useUserStartups } from '../hooks/useDashboardData'
import { useAuth } from '../hooks/useAuth'

const mockUseDashboardStats = vi.mocked(useDashboardStats)
const mockUseDashboardActivities = vi.mocked(useDashboardActivities)
const mockUseUserStartups = vi.mocked(useUserStartups)
const mockUseAuth = vi.mocked(useAuth)

function renderDashboard() {
  return render(
    <MemoryRouter>
      <ChakraProvider>
        <HelmetProvider>
          <DashboardPage />
        </HelmetProvider>
      </ChakraProvider>
    </MemoryRouter>
  )
}

const fakeUser = {
  id: 'user-1',
  email: 'jane@example.com',
  username: 'janedoe',
  firstName: 'Jane',
  lastName: 'Doe',
  roles: ['entrepreneur'],
  isEmailVerified: true,
  onboardingCompleted: true,
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: fakeUser,
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
      isLoading: false,
      isAuthenticated: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
      updateUser: vi.fn(),
    })
  })

  describe('Loading state', () => {
    it('renders spinners when all data is loading', () => {
      mockUseDashboardStats.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })
      mockUseUserStartups.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      renderDashboard()

      const spinners = screen.getAllByText('', { selector: '.chakra-spinner' })
      expect(spinners.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Successful data rendering', () => {
    it('renders stats, activities, and startups correctly', () => {
      mockUseDashboardStats.mockReturnValue({
        data: {
          totalStartups: 5,
          totalInvestors: 12,
          totalFunding: 25000000, // $250,000 in cents
          successRate: 40,
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({
        data: [
          { id: 'a1', type: 'startup', message: 'Created startup Alpha', timestamp: '2024-01-15T10:00:00Z' },
          { id: 'a2', type: 'investment', message: 'Received funding for Beta', timestamp: '2024-01-14T09:00:00Z' },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseUserStartups.mockReturnValue({
        data: [
          { id: 's1', name: 'Alpha Corp', stage: 'seed', fundingAmount: 15000000, status: 'active' },
          { id: 's2', name: 'Beta Inc', stage: 'series-a', fundingAmount: 10000000, status: 'successful' },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      renderDashboard()

      // Stats
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('$250,000')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()

      // Activities
      expect(screen.getByText('Created startup Alpha')).toBeInTheDocument()
      expect(screen.getByText('Received funding for Beta')).toBeInTheDocument()

      // Startups
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument()
      expect(screen.getByText('Beta Inc')).toBeInTheDocument()
    })

    it('shows StatHelpText when stats are non-zero', () => {
      mockUseDashboardStats.mockReturnValue({
        data: {
          totalStartups: 3,
          totalInvestors: 5,
          totalFunding: 100000,
          successRate: 33,
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
      mockUseUserStartups.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })

      renderDashboard()

      expect(screen.getByText('Startups created')).toBeInTheDocument()
      expect(screen.getByText('Across all startups')).toBeInTheDocument()
      expect(screen.getByText('Total raised')).toBeInTheDocument()
      expect(screen.getByText('Of your startups')).toBeInTheDocument()
    })
  })

  describe('Empty state rendering', () => {
    it('renders EmptyStateStartups when startups array is empty', () => {
      mockUseDashboardStats.mockReturnValue({
        data: { totalStartups: 0, totalInvestors: 0, totalFunding: 0, successRate: 0 },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
      mockUseUserStartups.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })

      renderDashboard()

      expect(screen.getByText('No startups yet')).toBeInTheDocument()
      expect(screen.getByText(/Create Your First Startup/i)).toBeInTheDocument()
    })

    it('renders EmptyStateActivities when activities array is empty', () => {
      mockUseDashboardStats.mockReturnValue({
        data: { totalStartups: 0, totalInvestors: 0, totalFunding: 0, successRate: 0 },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
      mockUseUserStartups.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })

      renderDashboard()

      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })
  })

  describe('Error state rendering', () => {
    it('renders ErrorState for stats with retry button', async () => {
      const refetchStats = vi.fn()
      mockUseDashboardStats.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Stats fetch failed'),
        refetch: refetchStats,
      })
      mockUseDashboardActivities.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
      mockUseUserStartups.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })

      renderDashboard()

      expect(screen.getByText('Stats fetch failed')).toBeInTheDocument()
      const retryButtons = screen.getAllByRole('button', { name: /retry/i })
      expect(retryButtons.length).toBeGreaterThanOrEqual(1)

      const user = userEvent.setup()
      await user.click(retryButtons[0])
      expect(refetchStats).toHaveBeenCalledTimes(1)
    })

    it('renders ErrorState for activities with retry button', async () => {
      const refetchActivities = vi.fn()
      mockUseDashboardStats.mockReturnValue({
        data: { totalStartups: 0, totalInvestors: 0, totalFunding: 0, successRate: 0 },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({
        data: [],
        loading: false,
        error: new Error('Activities fetch failed'),
        refetch: refetchActivities,
      })
      mockUseUserStartups.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })

      renderDashboard()

      expect(screen.getByText('Activities fetch failed')).toBeInTheDocument()
      const retryButtons = screen.getAllByRole('button', { name: /retry/i })

      const user = userEvent.setup()
      await user.click(retryButtons[0])
      expect(refetchActivities).toHaveBeenCalledTimes(1)
    })

    it('renders ErrorState for startups with retry button', async () => {
      const refetchStartups = vi.fn()
      mockUseDashboardStats.mockReturnValue({
        data: { totalStartups: 0, totalInvestors: 0, totalFunding: 0, successRate: 0 },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
      mockUseUserStartups.mockReturnValue({
        data: [],
        loading: false,
        error: new Error('Startups fetch failed'),
        refetch: refetchStartups,
      })

      renderDashboard()

      expect(screen.getByText('Startups fetch failed')).toBeInTheDocument()
      const retryButtons = screen.getAllByRole('button', { name: /retry/i })

      const user = userEvent.setup()
      await user.click(retryButtons[0])
      expect(refetchStartups).toHaveBeenCalledTimes(1)
    })
  })

  describe('Zero stats display', () => {
    it('does not show StatHelpText when all stats are zero', () => {
      mockUseDashboardStats.mockReturnValue({
        data: { totalStartups: 0, totalInvestors: 0, totalFunding: 0, successRate: 0 },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mockUseDashboardActivities.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
      mockUseUserStartups.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })

      renderDashboard()

      // Stats should show zero values
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('$0')).toBeInTheDocument()

      // No help text / percentage indicators when all stats are zero
      expect(screen.queryByText('Startups created')).not.toBeInTheDocument()
      expect(screen.queryByText('Across all startups')).not.toBeInTheDocument()
      expect(screen.queryByText('Total raised')).not.toBeInTheDocument()
      expect(screen.queryByText('Of your startups')).not.toBeInTheDocument()
    })
  })
})
