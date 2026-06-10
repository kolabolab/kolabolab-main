import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

export interface SearchFilters {
  q: string;
  industry: string;
  stage: string[];
  roleType: string[];
  skills: string[];
}

export interface StartupSearchResult {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  tags: string[];
  lookingFor: any[];
  compensationType: string;
  location: string;
  teamSize: number;
  fundingAmount: number;
  createdAt: string;
}

export interface UseStartupSearchReturn {
  filters: SearchFilters;
  setFilter: (key: keyof SearchFilters, value: string | string[]) => void;
  clearFilters: () => void;
  results: StartupSearchResult[];
  total: number;
  loading: boolean;
  error: string | null;
}

const DEFAULT_FILTERS: SearchFilters = {
  q: '',
  industry: '',
  stage: [],
  roleType: [],
  skills: [],
};

function parseFiltersFromParams(params: URLSearchParams): SearchFilters {
  return {
    q: params.get('q') || '',
    industry: params.get('industry') || '',
    stage: params.get('stage')?.split(',').filter(Boolean) || [],
    roleType: params.get('roleType')?.split(',').filter(Boolean) || [],
    skills: params.get('skills')?.split(',').filter(Boolean) || [],
  };
}

function serializeFiltersToParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.stage.length > 0) params.set('stage', filters.stage.join(','));
  if (filters.roleType.length > 0) params.set('roleType', filters.roleType.join(','));
  if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
  return params;
}

export function useStartupSearch(): UseStartupSearchReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(() => parseFiltersFromParams(searchParams));
  const [results, setResults] = useState<StartupSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (currentFilters: SearchFilters) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      const params = serializeFiltersToParams(currentFilters);
      const response = await apiClient.get('/api/startups/search', {
        params: Object.fromEntries(params.entries()),
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setResults(response.data.startups || []);
        setTotal(response.data.total || 0);
        setError(null);
      }
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.message === 'Request cancelled' || err?.code === 'ERR_CANCELED') {
        return; // Ignore cancelled requests
      }
      if (!controller.signal.aborted) {
        setError(err?.message || 'Failed to search startups');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Sync URL params when filters change
  useEffect(() => {
    const params = serializeFiltersToParams(filters);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch on mount and when filters change (with debounce for text search)
  useEffect(() => {
    fetchResults(filters);
  }, [filters.industry, filters.stage, filters.roleType, filters.skills, fetchResults]);

  // Debounce text search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchResults(filters);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.q, fetchResults]);

  const setFilter = useCallback((key: keyof SearchFilters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  return {
    filters,
    setFilter,
    clearFilters,
    results,
    total,
    loading,
    error,
  };
}
