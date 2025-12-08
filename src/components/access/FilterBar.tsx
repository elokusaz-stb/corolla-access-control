'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, User, Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useSystems } from '@/hooks/useSystems';
import { cn } from '@/lib/utils';

export interface FilterValues {
  userId: string;
  userName: string;
  systemId: string;
  instanceId: string;
  tierId: string;
  status: 'active' | 'removed' | '';
  search: string;
}

export interface FilterBarProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

// Autocomplete dropdown component
function Autocomplete<T extends { id: string; name: string; email?: string }>({
  placeholder,
  value,
  displayValue,
  onSelect,
  onClear,
  items,
  isLoading,
  renderItem,
  onSearch,
  icon: Icon,
}: {
  placeholder: string;
  value: string;
  displayValue: string;
  onSelect: (item: T) => void;
  onClear: () => void;
  items: T[];
  isLoading: boolean;
  renderItem: (item: T) => React.ReactNode;
  onSearch: (query: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  if (value) {
    return (
      <div className="relative">
        <div className="corolla-input flex items-center gap-2 pr-8">
          {Icon && <Icon className="h-4 w-4 text-corolla-on-surface-variant" />}
          <span className="truncate text-sm text-corolla-on-surface">
            {displayValue}
          </span>
        </div>
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-corolla-surface-variant"
        >
          <X className="h-3.5 w-3.5 text-corolla-on-surface-variant" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn('corolla-input w-full', Icon && 'pl-9')}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-corolla-on-surface-variant" />
        )}
      </div>

      {open && items.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-corolla-outline bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full px-3 py-2 text-left transition-colors hover:bg-corolla-surface-variant"
                >
                  {renderItem(item)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Select dropdown component
function Select({
  placeholder,
  value,
  onChange,
  options,
  disabled,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'corolla-input flex w-full items-center justify-between gap-2',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'truncate text-sm',
            !selectedOption && 'text-corolla-on-surface-variant/60'
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-corolla-on-surface-variant transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-corolla-outline bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-corolla-on-surface-variant transition-colors hover:bg-corolla-surface-variant"
              >
                {placeholder}
              </button>
            </li>
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-corolla-surface-variant',
                    value === option.value &&
                      'bg-corolla-active-nav font-medium'
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [userSearch, setUserSearch] = useState('');
  const { users, isLoading: usersLoading } = useUsers(userSearch);
  const { systems, isLoading: systemsLoading } = useSystems({
    includeTiers: true,
    includeInstances: true,
  });

  const selectedSystem = systems.find((s) => s.id === filters.systemId);
  const tiers = selectedSystem?.tiers ?? [];
  const instances = selectedSystem?.instances ?? [];

  const hasFilters =
    filters.userId ||
    filters.systemId ||
    filters.instanceId ||
    filters.tierId ||
    filters.status ||
    filters.search;

  const clearFilters = () => {
    onFiltersChange({
      userId: '',
      userName: '',
      systemId: '',
      instanceId: '',
      tierId: '',
      status: '',
      search: '',
    });
  };

  return (
    <div className="sticky top-0 z-20 border-b border-corolla-outline bg-corolla-surface-variant p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="w-full sm:w-auto sm:max-w-xs sm:flex-1">
          <label className="corolla-label mb-1.5 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              placeholder="User name or email..."
              className="corolla-input w-full pl-9"
            />
          </div>
        </div>

        {/* User Autocomplete */}
        <div className="w-full sm:w-48">
          <label className="corolla-label mb-1.5 block">User</label>
          <Autocomplete
            placeholder="Select user..."
            value={filters.userId}
            displayValue={filters.userName}
            onSelect={(user) =>
              onFiltersChange({
                ...filters,
                userId: user.id,
                userName: user.name,
              })
            }
            onClear={() =>
              onFiltersChange({ ...filters, userId: '', userName: '' })
            }
            items={users}
            isLoading={usersLoading}
            onSearch={setUserSearch}
            icon={User}
            renderItem={(user) => (
              <div>
                <p className="text-sm font-medium text-corolla-on-surface">
                  {user.name}
                </p>
                <p className="text-xs text-corolla-on-surface-variant">
                  {user.email}
                </p>
              </div>
            )}
          />
        </div>

        {/* System Select */}
        <div className="w-full sm:w-44">
          <label className="corolla-label mb-1.5 block">System</label>
          <Select
            placeholder="All systems"
            value={filters.systemId}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                systemId: value,
                instanceId: '',
                tierId: '',
              })
            }
            options={systems.map((s) => ({ value: s.id, label: s.name }))}
            disabled={systemsLoading}
          />
        </div>

        {/* Instance Select */}
        <div className="w-full sm:w-40">
          <label className="corolla-label mb-1.5 block">Instance</label>
          <Select
            placeholder="All instances"
            value={filters.instanceId}
            onChange={(value) =>
              onFiltersChange({ ...filters, instanceId: value })
            }
            options={instances.map((i) => ({ value: i.id, label: i.name }))}
            disabled={!filters.systemId}
          />
        </div>

        {/* Tier Select */}
        <div className="w-full sm:w-36">
          <label className="corolla-label mb-1.5 block">Tier</label>
          <Select
            placeholder="All tiers"
            value={filters.tierId}
            onChange={(value) => onFiltersChange({ ...filters, tierId: value })}
            options={tiers.map((t) => ({ value: t.id, label: t.name }))}
            disabled={!filters.systemId}
          />
        </div>

        {/* Status Select */}
        <div className="w-full sm:w-32">
          <label className="corolla-label mb-1.5 block">Status</label>
          <Select
            placeholder="All"
            value={filters.status}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value as 'active' | 'removed' | '',
              })
            }
            options={[
              { value: 'active', label: 'Active' },
              { value: 'removed', label: 'Removed' },
            ]}
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="pb-2.5 text-sm text-corolla-on-surface-variant underline transition-colors hover:text-corolla-on-surface"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
