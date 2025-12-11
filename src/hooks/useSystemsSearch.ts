'use client';

import useSWR from 'swr';
import { useDebounce } from './useDebounce';

export interface System {
    id: string;
    name: string;
    description: string | null;
}

async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch');
    }
    return res.json();
}

/**
 * Hook to search systems with debounced query
 */
export function useSystemsSearch(search: string) {
    const debouncedSearch = useDebounce(search, 300);

    const params = new URLSearchParams();
    if (debouncedSearch && debouncedSearch.length >= 2) {
        params.set('search', debouncedSearch);
    }
    params.set('includeTiers', 'true');
    params.set('includeInstances', 'true');

    const shouldFetch = debouncedSearch.length >= 2;
    const url = shouldFetch ? `/api/systems?${params.toString()}` : null;

    const { data, error, isLoading } = useSWR<{
        data: System[];
        total: number;
    }>(url, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 1000,
    });

    return {
        systems: data?.data ?? [],
        total: data?.total ?? 0,
        isLoading: shouldFetch ? isLoading : false,
        error,
    };
}
