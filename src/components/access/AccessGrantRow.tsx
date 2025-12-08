'use client';

import { useState } from 'react';
import { Trash2, Loader2, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { AccessGrant } from '@/hooks/useAccessGrants';
import { cn } from '@/lib/utils';

export interface AccessGrantRowProps {
  grant: AccessGrant;
  onRemove: (grantId: string) => Promise<void>;
  index?: number;
}

export function AccessGrantRow({
  grant,
  onRemove,
  index = 0,
}: AccessGrantRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(grant.status === 'removed');
  const [showRemoveAnimation, setShowRemoveAnimation] = useState(false);

  const handleRemove = async () => {
    if (isRemoved || isRemoving) return;

    setIsRemoving(true);
    try {
      await onRemove(grant.id);
      setShowRemoveAnimation(true);
      // Delay the visual update for smooth animation
      setTimeout(() => {
        setIsRemoved(true);
        setShowRemoveAnimation(false);
      }, 300);
    } catch (error) {
      console.error('Failed to remove grant:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      role="row"
      aria-label={`Access grant for ${grant.user.name} to ${grant.system.name}`}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        'group grid grid-cols-12 items-center gap-x-3',
        'rounded-xl border border-corolla-outline bg-white',
        'mb-2 px-4 py-3',
        'transition-all duration-300 ease-smooth',
        'hover:-translate-y-0.5 hover:bg-corolla-surface-variant hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-corolla-primary focus-within:ring-offset-2',
        'animate-stagger-fade-in opacity-0',
        isRemoved &&
          'opacity-60 hover:translate-y-0 hover:opacity-60 hover:shadow-none',
        showRemoveAnimation && 'animate-fade-remove'
      )}
    >
      {/* User - cols 3 */}
      <div className="col-span-12 flex items-center gap-3 sm:col-span-3">
        <div
          className="corolla-avatar h-9 w-9 shrink-0 text-sm"
          aria-hidden="true"
        >
          {grant.user.name[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-corolla-on-surface">
            {grant.user.name}
          </p>
          <p className="truncate text-xs text-corolla-on-surface-variant">
            {grant.user.email}
          </p>
        </div>
      </div>

      {/* System - cols 2 */}
      <div className="col-span-6 mt-2 sm:col-span-2 sm:mt-0">
        <p className="truncate text-sm font-medium text-corolla-on-surface">
          {grant.system.name}
        </p>
      </div>

      {/* Instance - cols 2 */}
      <div className="col-span-6 mt-2 sm:col-span-2 sm:mt-0">
        <p className="truncate text-sm text-corolla-on-surface-variant">
          {grant.instance?.name ?? (
            <span className="italic opacity-50">All instances</span>
          )}
        </p>
      </div>

      {/* Tier - cols 2 */}
      <div className="col-span-4 mt-2 sm:col-span-2 sm:mt-0">
        <span className="corolla-badge corolla-badge--info">
          {grant.tier.name}
        </span>
      </div>

      {/* Status - cols 1 */}
      <div className="col-span-4 mt-2 sm:col-span-1 sm:mt-0">
        <StatusBadge status={isRemoved ? 'removed' : 'active'} />
      </div>

      {/* Actions - cols 2 */}
      <div
        className="col-span-4 mt-2 flex justify-end gap-2 sm:col-span-2 sm:mt-0"
        role="group"
        aria-label="Row actions"
      >
        {!isRemoved && (
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label={`Remove access grant for ${grant.user.name}`}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5',
              'text-sm font-medium text-red-600',
              'rounded-full border border-red-200 bg-red-50',
              'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
              'transition-all duration-200',
              'hover:border-red-300 hover:bg-red-100 hover:shadow-sm',
              'active:scale-95',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
              'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300'
            )}
          >
            {isRemoving ? (
              <Loader2
                className="h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden lg:inline">Remove</span>
          </button>
        )}
        <button
          aria-label="View more options"
          className={cn(
            'corolla-icon-btn h-8 w-8',
            'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
            'transition-all duration-200'
          )}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
