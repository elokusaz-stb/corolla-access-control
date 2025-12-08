'use client';

import useSWR, { mutate } from 'swr';

// Types
export interface AccessGrantUser {
  id: string;
  name: string;
  email: string;
}

export interface AccessGrantSystem {
  id: string;
  name: string;
}

export interface AccessGrantInstance {
  id: string;
  name: string;
}

export interface AccessGrantTier {
  id: string;
  name: string;
}

export interface AccessGrant {
  id: string;
  userId: string;
  systemId: string;
  instanceId: string | null;
  tierId: string;
  status: 'active' | 'removed';
  grantedBy: string;
  grantedAt: string;
  removedAt: string | null;
  notes: string | null;
  user: AccessGrantUser;
  system: AccessGrantSystem;
  instance: AccessGrantInstance | null;
  tier: AccessGrantTier;
}

export interface AccessGrantFilters {
  userId?: string;
  systemId?: string;
  instanceId?: string;
  tierId?: string;
  status?: 'active' | 'removed' | '';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AccessGrantsResponse {
  data: AccessGrant[];
  total: number;
  limit: number;
  offset: number;
}

// Fetcher function
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Failed to fetch');
  }
  return res.json();
}

// Build query string from filters
function buildQueryString(filters: AccessGrantFilters): string {
  const params = new URLSearchParams();

  if (filters.userId) params.set('userId', filters.userId);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.instanceId) params.set('instanceId', filters.instanceId);
  if (filters.tierId) params.set('tierId', filters.tierId);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset !== undefined)
    params.set('offset', filters.offset.toString());

  return params.toString();
}

// Main hook for fetching access grants
export function useAccessGrants(filters: AccessGrantFilters = {}) {
  const queryString = buildQueryString(filters);
  const url = `/api/access-grants${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, isValidating } = useSWR<AccessGrantsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    grants: data?.data ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? 20,
    offset: data?.offset ?? 0,
    isLoading,
    isValidating,
    error,
  };
}

// Hook for removing an access grant
export function useRemoveAccessGrant() {
  const removeGrant = async (
    grantId: string,
    notes?: string
  ): Promise<AccessGrant> => {
    const res = await fetch(`/api/access-grants/${grantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'removed', notes }),
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: 'Failed to remove grant' }));
      throw new Error(error.message);
    }

    // Revalidate access grants list
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/api/access-grants')
    );

    return res.json();
  };

  return { removeGrant };
}

// Key generator for cache invalidation
export function getAccessGrantsKey(filters: AccessGrantFilters = {}) {
  const queryString = buildQueryString(filters);
  return `/api/access-grants${queryString ? `?${queryString}` : ''}`;
}

// Revalidate all access grants
export function revalidateAccessGrants() {
  mutate(
    (key) => typeof key === 'string' && key.startsWith('/api/access-grants')
  );
}
