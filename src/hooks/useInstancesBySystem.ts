'use client';

import useSWR from 'swr';

export interface Instance {
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
 * Hook to fetch instances for a specific system
 */
export function useInstancesBySystem(systemId: string | null) {
    const url = systemId ? `/api/systems/${systemId}/instances` : null;

    const { data, error, isLoading } = useSWR<{
        data: Instance[];
    }>(url, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        instances: data?.data ?? [],
        isLoading,
        error,
    };
}
