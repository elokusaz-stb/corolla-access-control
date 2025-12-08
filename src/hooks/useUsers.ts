'use client';

import useSWR from 'swr';

export interface User {
  id: string;
  name: string;
  email: string;
  managerId: string | null;
  _count?: {
    grants: number;
  };
}

interface UseUsersOptions {
  search?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
}

/**
 * Hook to fetch users with optional search
 * For autocomplete: pass search with minLength check
 * For listing all: pass enabled: true without search
 */
export function useUsers(options: UseUsersOptions | string = {}) {
  // Support old API: useUsers(searchString)
  const opts: UseUsersOptions =
    typeof options === 'string' ? { search: options } : options;

  const { search, limit = 50, offset = 0, enabled = true } = opts;
  
  const params = new URLSearchParams();
  if (search && search.length >= 1) {
    params.set('search', search);
  }
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  // For autocomplete, require 2+ chars. For listing, always fetch if enabled
  const isAutocomplete = search !== undefined;
  const shouldFetch = enabled && (!isAutocomplete || (search && search.length >= 2));
  
  const url = shouldFetch ? `/api/users?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<{
    data: User[];
    total: number;
  }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  return {
    users: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading: shouldFetch ? isLoading : false,
    error,
    mutate,
  };
}
