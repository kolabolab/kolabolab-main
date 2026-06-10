/**
 * Unit Tests for AdminDashboardPage component
 *
 * Tests that the admin dashboard renders stats, pending startups table
 * with approve/reject buttons, all startups table with delete buttons,
 * and confirmation dialog on delete click.
 *
 * **Validates: Requirements 7.1, 8.1, 8.4, 9.1**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboardPage from './AdminDashboardPage'

// Mock the adminAPI service
vi.mock('../services/apiClient', () => ({
  adminAPI: {
    getStats: vi.fn(),
    getPendingStartups: vi.fn(),
    approveStartup: vi.fn(),
    rejectStartup: vi.fn(),
    deleteStartup: vi.fn(),
  },
}))

import { adminAPI } from '../services/apiClient'

const mockGetStats = vi.mocked(adminAPI.getStats)
const mockGetPendingStartups = vi.mocked(adminAPI.getPendingStartups)

const mockStats = {
  totalUsers: 42,
  totalStartups: 15,
  pendingStartups: 3,
}

const mockPendingStartups = [
  {
    id: 'startup-1',
    name: 'Alpha Startup',
    stage: 'idea',
    status: 'pending_approval',
    createdAt: '2024-01-10T10:00:00Z',
    creator: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  },
  {
    id: 'startup-2',
    name: 'Beta Corp',
    stage: 'mvp',
    status: 'pending_approval',
    createdAt: '2024-01-12T14:00:00Z',
    creator: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  },
]

function renderAdminDashboard() {
  return render(
    <MemoryRouter>
      <ChakraProvider>
        <HelmetProvider>
          <AdminDashboardPage />
        </HelmetProvider>
      </ChakraProvider>
    </MemoryRouter>
  )
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetStats.mockResolvedValue(mockStats)
    mockGetPendingStartups.mockResolvedValue(mockPendingStartups)
  })

  describe('Stats section', () => {
    it('renders platform stats with correct data', async () => {
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument()
      })

      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Total Startups')).toBeInTheDocument()
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    })

    it('displays stat help text descriptions', async () => {
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getByText('Registered accounts')).toBeInTheDocument()
      })

      expect(screen.getByText('All startups on platform')).toBeInTheDocument()
      expect(screen.getByText('Awaiting review')).toBeInTheDocument()
    })
  })

  describe('Pending startups table', () => {
    it('renders pending startups with approve and reject buttons', async () => {
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getAllByText('Alpha Startup').length).toBeGreaterThanOrEqual(1)
      })

      expect(screen.getAllByText('Beta Corp').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThanOrEqual(1)

      // Each pending startup should have Approve and Reject buttons
      const approveButtons = screen.getAllByRole('button', { name: /approve/i })
      const rejectButtons = screen.getAllByRole('button', { name: /reject/i })

      expect(approveButtons).toHaveLength(2)
      expect(rejectButtons).toHaveLength(2)
    })

    it('renders startup stage badges', async () => {
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getByText('idea')).toBeInTheDocument()
      })

      expect(screen.getByText('mvp')).toBeInTheDocument()
    })

    it('shows empty message when no pending startups', async () => {
      mockGetPendingStartups.mockResolvedValue([])

      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getByText('No startups pending approval')).toBeInTheDocument()
      })
    })
  })

  describe('All startups table', () => {
    it('renders all startups with delete buttons', async () => {
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getAllByText('Alpha Startup').length).toBeGreaterThanOrEqual(1)
      })

      // The all startups section should have delete buttons
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(deleteButtons).toHaveLength(2)
    })

    it('renders status badges for startups', async () => {
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Delete confirmation dialog', () => {
    it('opens confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getAllByText('Alpha Startup').length).toBeGreaterThanOrEqual(1)
      })

      // Click the first delete button (from the All Startups section)
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Delete Startup')).toBeInTheDocument()
      })

      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('closes confirmation dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderAdminDashboard()

      await waitFor(() => {
        expect(screen.getAllByText('Alpha Startup').length).toBeGreaterThanOrEqual(1)
      })

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Startup')).toBeInTheDocument()
      })

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete Startup')).not.toBeInTheDocument()
      })
    })
  })
})
