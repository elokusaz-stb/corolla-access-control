'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Layers, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Instance {
  id: string;
  name: string;
}

export interface InstanceSelectFieldProps {
  value: Instance | null;
  onChange: (instance: Instance | null) => void;
  instances: Instance[];
  error?: string;
  disabled?: boolean;
}

export function InstanceSelectField({
  value,
  onChange,
  instances,
  error,
  disabled,
}: InstanceSelectFieldProps) {
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

  const handleSelect = (instance: Instance | null) => {
    onChange(instance);
    setOpen(false);
  };

  // Don't render if no instances available
  if (instances.length === 0) {
    return null;
  }

  const isDisabled = disabled;

  return (
    <div ref={containerRef}>
      <label className="corolla-label mb-2 block">
        Instance
        <span className="ml-1 text-xs font-normal normal-case text-corolla-on-surface-variant">
          (optional)
        </span>
      </label>
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
            <Layers
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
            {value?.name || 'All instances (no specific instance)'}
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
              {/* "No specific instance" option */}
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                    'hover:bg-corolla-surface-variant',
                    value === null && 'bg-corolla-active-nav'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-corolla-surface-variant">
                      <Layers className="h-4 w-4 text-corolla-on-surface-variant" />
                    </div>
                    <span className="text-corolla-on-surface-variant">
                      All instances
                    </span>
                  </div>
                  {value === null && (
                    <Check className="h-5 w-5 text-corolla-primary" />
                  )}
                </button>
              </li>

              {/* Instance options */}
              {instances.map((instance) => (
                <li key={instance.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(instance)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
                      'hover:bg-corolla-surface-variant',
                      value?.id === instance.id && 'bg-corolla-active-nav'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-corolla-primary-container">
                        <Layers className="h-4 w-4 text-corolla-primary" />
                      </div>
                      <span className="font-medium text-corolla-on-surface">
                        {instance.name}
                      </span>
                    </div>
                    {value?.id === instance.id && (
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
      {!error && (
        <p className="mt-2 text-xs text-corolla-on-surface-variant">
          Optionally select a specific system instance
        </p>
      )}
    </div>
  );
}

