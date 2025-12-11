'use client';

import useSWR from 'swr';

export interface Tier {
    id: string;
    name: string;
    systemId: string;
}

async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch');
    }
    return res.json();
}

/**
 * Hook to fetch tiers for a specific system
 */
export function useTiersBySystem(systemId: string | null) {
    const url = systemId ? `/api/systems/${systemId}/tiers` : null;

    const { data, error, isLoading } = useSWR<{
        data: Tier[];
    }>(url, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        tiers: data?.data ?? [],
        isLoading,
        error,
    };
}
