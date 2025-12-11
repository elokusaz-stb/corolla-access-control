'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tier {
  id: string;
  name: string;
}

export interface TierSelectFieldProps {
  value: Tier | null;
  onChange: (tier: Tier | null) => void;
  tiers: Tier[];
  error?: string;
  disabled?: boolean;
}

export function TierSelectField({
  value,
  onChange,
  tiers,
  error,
  disabled,
}: TierSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tier: Tier) => {
    onChange(tier);
    setOpen(false);
  };

  const isDisabled = disabled || tiers.length === 0;

  return (
    <div ref={containerRef}>
      <label className="corolla-label mb-2 block">Access Tier</label>
      <button
        type="button"
        onClick={() => !isDisabled && setOpen(!open)}
        disabled={isDisabled}
        className={cn(
          'flex w-full items-center justify-between rounded-xl bg-white p-3 shadow-sm',
          'text-left transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-corolla-primary',
          error && 'ring-2 ring-red-400',
          isDisabled && 'cursor-not-allowed opacity-50',
          !isDisabled && 'hover:shadow-md'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              value
                ? 'bg-corolla-primary-container'
                : 'bg-corolla-surface-variant'
            )}
          >
            <Shield
              className={cn(
                'h-4 w-4',
                value
                  ? 'text-corolla-primary'
                  : 'text-corolla-on-surface-variant'
              )}
            />
          </div>
          <span
            className={cn(
              'font-medium',
              value
                ? 'text-corolla-on-surface'
                : 'text-corolla-on-surface-variant/60'
            )}
          >
            {value?.name ||
              (tiers.length === 0
                ? 'Select a system first'
                : 'Select access tier...')}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-corolla-on-surface-variant transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border-2 border-corolla-outline bg-white shadow-xl">
            <ul className="max-h-64 overflow-auto py-2">
              {tiers.map((tier) => (
                <li key={tier.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(tier)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                      'hover:bg-corolla-surface-variant',
                      value?.id === tier.id && 'bg-corolla-active-nav'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-corolla-primary-container">
                        <Shield className="h-4 w-4 text-corolla-primary" />
                      </div>
                      <span className="font-medium text-corolla-on-surface">
                        {tier.name}
                      </span>
                    </div>
                    {value?.id === tier.id && (
                      <Check className="h-5 w-5 text-corolla-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!error && tiers.length > 0 && (
        <p className="mt-2 text-xs text-corolla-on-surface-variant">
          Choose the level of access to grant
        </p>
      )}
    </div>
  );
}

