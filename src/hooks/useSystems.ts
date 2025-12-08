'use client';

import useSWR from 'swr';

export interface System {
  id: string;
  name: string;
  description: string | null;
}

export interface SystemOwner {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SystemWithDetails extends System {
  tiers?: Array<{ id: string; name: string }>;
  instances?: Array<{ id: string; name: string }>;
  owners?: SystemOwner[];
  _count?: {
    tiers: number;
    instances: number;
  };
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
}

export function useSystems(options?: {
  search?: string;
  includeTiers?: boolean;
  includeInstances?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.includeTiers) params.set('includeTiers', 'true');
  if (options?.includeInstances) params.set('includeInstances', 'true');

  const url = `/api/systems${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{
    data: SystemWithDetails[];
    total: number;
  }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    systems: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
