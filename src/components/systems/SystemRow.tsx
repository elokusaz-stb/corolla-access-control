'use client';

import { Settings, Shield, Layers, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SystemWithDetails } from '@/hooks/useSystems';

export interface SystemRowProps {
  system: SystemWithDetails;
  onManage: (systemId: string) => void;
  index?: number;
}

export function SystemRow({ system, onManage, index = 0 }: SystemRowProps) {
  // Get counts from _count if available, otherwise from arrays
  const tierCount = system._count?.tiers ?? system.tiers?.length ?? 0;
  const instanceCount = system._count?.instances ?? system.instances?.length ?? 0;
  
  // Owners come as { user: { id, name, email } }[] from API
  const owners = system.owners?.map((o) => o.user) ?? [];

  return (
    <div
      role="row"
      aria-label={`System: ${system.name}`}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        'group grid grid-cols-12 items-center gap-x-4',
        'px-6 py-5',
        'transition-all duration-300 ease-smooth',
        'hover:-translate-y-0.5 hover:bg-corolla-surface-variant hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-corolla-primary focus-within:ring-offset-2',
        'animate-stagger-fade-in opacity-0'
      )}
    >
      {/* System Icon + Info - cols 5 */}
      <div className="col-span-12 flex items-center gap-4 sm:col-span-5">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            'shrink-0 bg-corolla-primary-container',
            'transition-all duration-300',
            'group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-corolla-primary/20'
          )}
          aria-hidden="true"
        >
          <Settings className="h-6 w-6 text-corolla-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-bold text-corolla-on-surface">
            {system.name}
          </h3>
          <p className="truncate text-sm text-corolla-on-surface-variant">
            {system.description || (
              <span className="italic opacity-60">No description</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Chips - cols 3 */}
      <div className="col-span-6 mt-3 flex items-center gap-2 sm:col-span-3 sm:mt-0">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full',
            'bg-corolla-surface-variant px-3 py-1',
            'text-xs font-medium text-corolla-on-surface-variant',
            'transition-all duration-200',
            'group-hover:bg-white group-hover:shadow-sm'
          )}
          aria-label={`${tierCount} access tier${tierCount !== 1 ? 's' : ''}`}
        >
          <Shield className="h-3 w-3" aria-hidden="true" />
          {tierCount} tier{tierCount !== 1 ? 's' : ''}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full',
            'bg-corolla-surface-variant px-3 py-1',
            'text-xs font-medium text-corolla-on-surface-variant',
            'transition-all duration-200',
            'group-hover:bg-white group-hover:shadow-sm'
          )}
          aria-label={`${instanceCount} instance${instanceCount !== 1 ? 's' : ''}`}
        >
          <Layers className="h-3 w-3" aria-hidden="true" />
          {instanceCount}
        </span>
      </div>

      {/* Owners - cols 2 */}
      <div className="col-span-6 mt-3 flex items-center sm:col-span-2 sm:mt-0">
        {owners.length > 0 ? (
          <div
            className="flex -space-x-2"
            role="group"
            aria-label={`${owners.length} system owner${owners.length !== 1 ? 's' : ''}`}
          >
            {owners.slice(0, 3).map((owner, ownerIndex) => (
              <div
                key={owner.id}
                className={cn(
                  'corolla-avatar h-8 w-8 text-xs ring-2 ring-white',
                  'transition-all duration-200',
                  'group-hover:ring-corolla-surface-variant',
                  'hover:z-10 hover:scale-110'
                )}
                style={{ transitionDelay: `${ownerIndex * 50}ms` }}
                title={owner.name}
                aria-label={owner.name}
              >
                {owner.name[0]?.toUpperCase() ?? 'U'}
              </div>
            ))}
            {owners.length > 3 && (
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  'bg-corolla-surface-variant text-xs font-medium text-corolla-on-surface-variant',
                  'ring-2 ring-white',
                  'transition-all duration-200',
                  'group-hover:ring-corolla-surface-variant'
                )}
                aria-label={`${owners.length - 3} more owners`}
              >
                +{owners.length - 3}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs italic text-corolla-on-surface-variant opacity-60">
            No owners
          </span>
        )}
      </div>

      {/* Manage Button - cols 2 */}
      <div className="col-span-12 mt-3 flex justify-end sm:col-span-2 sm:mt-0">
        <button
          onClick={() => onManage(system.id)}
          aria-label={`Manage ${system.name}`}
          className={cn(
            'inline-flex items-center gap-1.5',
            'border border-corolla-quick-grant-border bg-corolla-primary-container',
            'text-corolla-on-surface',
            'rounded-full px-4 py-1.5',
            'text-sm font-medium',
            'shadow-sm',
            'transition-all duration-200',
            'hover:scale-105 hover:bg-corolla-active-nav hover:shadow-md',
            'active:scale-95',
            'opacity-70 group-hover:opacity-100',
            'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-corolla-primary focus:ring-offset-2'
          )}
        >
          Manage
          <ChevronRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
