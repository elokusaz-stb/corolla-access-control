'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Loader2, X, Search, Shield, Layers } from 'lucide-react';
import { useSystems, SystemWithDetails } from '@/hooks/useSystems';
import { cn } from '@/lib/utils';

export type SelectedSystem = SystemWithDetails;

export interface AutocompleteSystemFieldProps {
  value: SelectedSystem | null;
  onChange: (system: SelectedSystem | null) => void;
  error?: string;
  disabled?: boolean;
}

export function AutocompleteSystemField({
  value,
  onChange,
  error,
  disabled,
}: AutocompleteSystemFieldProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { systems, isLoading } = useSystems({
    includeTiers: true,
    includeInstances: true,
  });

  // Filter systems by query
  const filteredSystems = systems.filter(
    (system) =>
      system.name.toLowerCase().includes(query.toLowerCase()) ||
      system.description?.toLowerCase().includes(query.toLowerCase())
  );

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

  // Reset highlight when filtered systems change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredSystems.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const highlighted = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((i) =>
            Math.min(i + 1, filteredSystems.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredSystems[highlightedIndex]) {
            onChange(filteredSystems[highlightedIndex]);
            setOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    },
    [open, filteredSystems, highlightedIndex, onChange]
  );

  const handleSelect = (system: SelectedSystem) => {
    onChange(system);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  // Render selected system
  if (value) {
    return (
      <div>
        <label className="corolla-label mb-2 block">System</label>
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm',
            'border-2 border-corolla-primary/20'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-corolla-primary-container">
            <Settings className="h-5 w-5 text-corolla-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-corolla-on-surface">
              {value.name}
            </p>
            <div className="flex items-center gap-3 text-xs text-corolla-on-surface-variant">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {value.tiers?.length ?? 0} tiers
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {value.instances?.length ?? 0} instances
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full text-corolla-on-surface-variant transition-colors hover:bg-corolla-surface-variant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <label className="corolla-label mb-2 block">System</label>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a system..."
          disabled={disabled || isLoading}
          className={cn(
            'w-full rounded-xl bg-white p-3 pl-11 shadow-sm',
            'text-corolla-on-surface placeholder:text-corolla-on-surface-variant/60',
            'focus:outline-none focus:ring-2 focus:ring-corolla-primary',
            'transition-all duration-150',
            error && 'ring-2 ring-red-400',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-corolla-primary" />
        )}
      </div>

      {/* Dropdown */}
      {open && !isLoading && (
        <div className="absolute z-50 mt-2 w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border-2 border-corolla-outline bg-white shadow-xl">
            {filteredSystems.length === 0 ? (
              <div className="py-8 text-center text-corolla-on-surface-variant">
                <Settings className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>
                  {query
                    ? `No systems found for "${query}"`
                    : 'No systems available'}
                </p>
              </div>
            ) : (
              <ul ref={listRef} className="max-h-64 overflow-auto py-2">
                {filteredSystems.map((system, index) => (
                  <li key={system.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(system)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                        index === highlightedIndex
                          ? 'bg-corolla-active-nav'
                          : 'hover:bg-corolla-surface-variant'
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-corolla-primary-container">
                        <Settings className="h-5 w-5 text-corolla-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-corolla-on-surface">
                          {system.name}
                        </p>
                        <p className="truncate text-sm text-corolla-on-surface-variant">
                          {system.description || 'No description'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!error && (
        <p className="mt-2 text-xs text-corolla-on-surface-variant">
          Select the system to grant access to
        </p>
      )}
    </div>
  );
}
