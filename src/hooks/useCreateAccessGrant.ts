'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import type { AccessGrant } from './useAccessGrants';

export interface CreateAccessGrantInput {
  userId: string;
  systemId: string;
  instanceId?: string | null;
  tierId: string;
  notes?: string;
}

export interface CreateAccessGrantResult {
  success: boolean;
  grant?: AccessGrant;
  error?: string;
  code?: string;
}

export function useCreateAccessGrant() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createGrant = async (
    input: CreateAccessGrantInput
  ): Promise<CreateAccessGrantResult> => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/access-grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: input.userId,
          systemId: input.systemId,
          instanceId: input.instanceId || null,
          tierId: input.tierId,
          notes: input.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to create access grant',
          code: data.error || 'UNKNOWN_ERROR',
        };
      }

      // Revalidate access grants list
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/access-grants')
      );

      return {
        success: true,
        grant: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        code: 'NETWORK_ERROR',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createGrant, isSubmitting };
}
