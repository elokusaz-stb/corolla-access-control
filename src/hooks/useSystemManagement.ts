'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

export interface SystemOwner {
  id: string;
  name: string;
  email: string;
}

export interface SystemTier {
  id: string;
  name: string;
}

export interface SystemInstance {
  id: string;
  name: string;
}

export interface SystemDetails {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tiers: SystemTier[];
  instances: SystemInstance[];
  owners: SystemOwner[];
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
}

export function useSystemDetails(systemId: string | null) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<SystemDetails>(
    systemId
      ? `/api/systems/${systemId}?includeTiers=true&includeInstances=true&includeOwners=true`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    system: data,
    isLoading,
    error,
    revalidate,
  };
}

export function useSystemMutations(systemId: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSystem = useCallback(
    async (data: { name?: string; description?: string }) => {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/systems/${systemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to update system');
        }
        await mutate(
          `/api/systems/${systemId}?includeTiers=true&includeInstances=true&includeOwners=true`
        );
        await mutate(
          (key) => typeof key === 'string' && key.startsWith('/api/systems')
        );
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [systemId]
  );

  const addTier = useCallback(
    async (name: string) => {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/systems/${systemId}/tiers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to add tier');
        }
        await mutate(
          `/api/systems/${systemId}?includeTiers=true&includeInstances=true&includeOwners=true`
        );
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [systemId]
  );

  const addInstance = useCallback(
    async (name: string) => {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/systems/${systemId}/instances`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to add instance');
        }
        await mutate(
          `/api/systems/${systemId}?includeTiers=true&includeInstances=true&includeOwners=true`
        );
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [systemId]
  );

  const addOwners = useCallback(
    async (userIds: string[]) => {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/systems/${systemId}/owners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to add owners');
        }
        await mutate(
          `/api/systems/${systemId}?includeTiers=true&includeInstances=true&includeOwners=true`
        );
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [systemId]
  );

  return {
    isUpdating,
    updateSystem,
    addTier,
    addInstance,
    addOwners,
  };
}

export function useCreateSystem() {
  const [isCreating, setIsCreating] = useState(false);

  const createSystem = useCallback(
    async (data: { name: string; description?: string }) => {
      setIsCreating(true);
      try {
        const res = await fetch('/api/systems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to create system');
        }
        await mutate(
          (key) => typeof key === 'string' && key.startsWith('/api/systems')
        );
        return await res.json();
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createSystem, isCreating };
}
