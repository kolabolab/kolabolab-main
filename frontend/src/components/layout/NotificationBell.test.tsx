import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { theme } from '../../theme'
import { NotificationBell } from './NotificationBell'

/**
 * Unit tests for NotificationBell component.
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../hooks/useNotifications', () => ({
  useUnreadCount: vi.fn(),
}))

import { useUnreadCount } from '../../hooks/useNotifications'
const mockUseUnreadCount = vi.mocked(useUnreadCount)

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders bell icon without badge when unread count is 0', () => {
    mockUseUnreadCount.mockReturnValue({ data: { unreadCount: 0 } } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
    expect(screen.queryByTestId('notification-badge')).toBeNull()
  })

  it('renders badge with unread count when count > 0', () => {
    mockUseUnreadCount.mockReturnValue({ data: { unreadCount: 5 } } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    expect(screen.getByLabelText('Notifications, 5 unread')).toBeInTheDocument()
    const badge = screen.getByTestId('notification-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('5')
  })

  it('displays "99+" when unread count exceeds 99', () => {
    mockUseUnreadCount.mockReturnValue({ data: { unreadCount: 150 } } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    expect(screen.getByLabelText('Notifications, 150 unread')).toBeInTheDocument()
    const badge = screen.getByTestId('notification-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('99+')
  })

  it('navigates to /notifications on click', () => {
    mockUseUnreadCount.mockReturnValue({ data: { unreadCount: 3 } } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    const button = screen.getByLabelText('Notifications, 3 unread')
    fireEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/notifications')
  })

  it('hides badge when data is undefined (loading state)', () => {
    mockUseUnreadCount.mockReturnValue({ data: undefined } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
    expect(screen.queryByTestId('notification-badge')).toBeNull()
  })

  it('shows badge with count of exactly 99', () => {
    mockUseUnreadCount.mockReturnValue({ data: { unreadCount: 99 } } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    const badge = screen.getByTestId('notification-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('99')
  })

  it('shows badge with count of 1', () => {
    mockUseUnreadCount.mockReturnValue({ data: { unreadCount: 1 } } as any)

    render(<NotificationBell />, { wrapper: createTestWrapper() })

    expect(screen.getByLabelText('Notifications, 1 unread')).toBeInTheDocument()
    const badge = screen.getByTestId('notification-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('1')
  })
})
