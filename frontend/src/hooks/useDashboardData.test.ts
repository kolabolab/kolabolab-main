import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardStats, useDashboardActivities, useUserStartups } from './useDashboardData'

// Mock the apiClient module
vi.mock('../services/apiClient', () => ({
  dashboardAPI: {
    getStats: vi.fn(),
    getActivities: vi.fn(),
    getUserStartups: vi.fn(),
  },
}))

import { dashboardAPI } from '../services/apiClient'

const mockedDashboardAPI = dashboardAPI as {
  getStats: ReturnType<typeof vi.fn>
  getActivities: ReturnType<typeof vi.fn>
  getUserStartups: ReturnType<typeof vi.fn>
}

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state initially', () => {
    mockedDashboardAPI.getStats.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should return data on successful fetch', async () => {
    const mockStats = {
      totalStartups: 5,
      totalInvestors: 10,
      totalFunding: 50000,
      successRate: 40,
    }
    mockedDashboardAPI.getStats.mockResolvedValue(mockStats)

    const { result } = renderHook(() => useDashboardStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockStats)
    expect(result.current.error).toBeNull()
  })

  it('should return error on failed fetch', async () => {
    mockedDashboardAPI.getStats.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDashboardStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
  })

  it('should refetch data when refetch is called', async () => {
    const mockStats = {
      totalStartups: 5,
      totalInvestors: 10,
      totalFunding: 50000,
      successRate: 40,
    }
    mockedDashboardAPI.getStats.mockResolvedValue(mockStats)

    const { result } = renderHook(() => useDashboardStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockedDashboardAPI.getStats).toHaveBeenCalledTimes(1)

    // Trigger refetch
    const updatedStats = { ...mockStats, totalStartups: 6 }
    mockedDashboardAPI.getStats.mockResolvedValue(updatedStats)
    result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toEqual(updatedStats)
    })

    expect(mockedDashboardAPI.getStats).toHaveBeenCalledTimes(2)
  })
})

describe('useDashboardActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array as initial data', () => {
    mockedDashboardAPI.getActivities.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useDashboardActivities())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return activities on successful fetch', async () => {
    const mockActivities = {
      activities: [
        { id: '1', type: 'startup', message: 'Created startup', timestamp: '2024-01-01T00:00:00Z' },
        { id: '2', type: 'investment', message: 'Received funding', timestamp: '2024-01-02T00:00:00Z' },
      ],
    }
    mockedDashboardAPI.getActivities.mockResolvedValue(mockActivities)

    const { result } = renderHook(() => useDashboardActivities())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockActivities.activities)
    expect(result.current.error).toBeNull()
  })

  it('should handle empty activities response', async () => {
    mockedDashboardAPI.getActivities.mockResolvedValue({ activities: [] })

    const { result } = renderHook(() => useDashboardActivities())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return error on failed fetch', async () => {
    mockedDashboardAPI.getActivities.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useDashboardActivities())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error?.message).toBe('Server error')
  })
})

describe('useUserStartups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array as initial data', () => {
    mockedDashboardAPI.getUserStartups.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useUserStartups())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return startups on successful fetch', async () => {
    const mockStartups = {
      startups: [
        { id: '1', name: 'TechStart', stage: 'seed', fundingAmount: 50000, status: 'active' },
        { id: '2', name: 'AI Vision', stage: 'pre-seed', fundingAmount: 25000, status: 'active' },
      ],
    }
    mockedDashboardAPI.getUserStartups.mockResolvedValue(mockStartups)

    const { result } = renderHook(() => useUserStartups())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockStartups.startups)
    expect(result.current.error).toBeNull()
  })

  it('should handle empty startups response', async () => {
    mockedDashboardAPI.getUserStartups.mockResolvedValue({ startups: [] })

    const { result } = renderHook(() => useUserStartups())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return error on failed fetch', async () => {
    mockedDashboardAPI.getUserStartups.mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useUserStartups())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error?.message).toBe('Unauthorized')
  })

  it('should refetch data when refetch is called', async () => {
    const mockStartups = {
      startups: [
        { id: '1', name: 'TechStart', stage: 'seed', fundingAmount: 50000, status: 'active' },
      ],
    }
    mockedDashboardAPI.getUserStartups.mockResolvedValue(mockStartups)

    const { result } = renderHook(() => useUserStartups())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updatedStartups = {
      startups: [
        ...mockStartups.startups,
        { id: '2', name: 'New Startup', stage: 'idea', fundingAmount: 0, status: 'active' },
      ],
    }
    mockedDashboardAPI.getUserStartups.mockResolvedValue(updatedStartups)
    result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toEqual(updatedStartups.startups)
    })
  })
})
