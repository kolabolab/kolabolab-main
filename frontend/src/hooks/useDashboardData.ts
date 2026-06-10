import { useState, useEffect, useCallback } from 'react'
import { dashboardAPI } from '../services/apiClient'

// Types matching the backend API response shapes
export interface DashboardStats {
  totalStartups: number
  totalInvestors: number
  totalFunding: number
  successRate: number
}

export interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
}

export interface StartupSummary {
  id: string
  name: string
  stage: string
  fundingAmount: number
  status: string
}

interface UseAsyncDataResult<T> {
  data: T
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetches dashboard statistics for the authenticated user.
 * Returns totalStartups, totalInvestors, totalFunding (in cents), and successRate.
 */
export function useDashboardStats(): UseAsyncDataResult<DashboardStats | null> {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dashboardAPI.getStats()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Fetches recent activities for the authenticated user.
 * Returns up to 20 most recent activities ordered by timestamp descending.
 */
export function useDashboardActivities(): UseAsyncDataResult<Activity[]> {
  const [data, setData] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dashboardAPI.getActivities()
      setData(result.activities ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Fetches the authenticated user's startups.
 * Returns the list of startups with id, name, stage, fundingAmount, and status.
 */
export function useUserStartups(): UseAsyncDataResult<StartupSummary[]> {
  const [data, setData] = useState<StartupSummary[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dashboardAPI.getUserStartups()
      setData(result.startups ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch startups'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
