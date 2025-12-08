'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Loader2, X, Search } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export interface SelectedUser {
  id: string;
  name: string;
  email: string;
}

export interface AutocompleteUserFieldProps {
  value: SelectedUser | null;
  onChange: (user: SelectedUser | null) => void;
  error?: string;
  disabled?: boolean;
}

export function AutocompleteUserField({
  value,
  onChange,
  error,
  disabled,
}: AutocompleteUserFieldProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { users, isLoading } = useUsers(debouncedQuery);

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

  // Reset highlight when users change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [users]);

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
          setHighlightedIndex((i) => Math.min(i + 1, users.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (users[highlightedIndex]) {
            onChange(users[highlightedIndex]);
            setOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    },
    [open, users, highlightedIndex, onChange]
  );

  const handleSelect = (user: SelectedUser) => {
    onChange(user);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  // Render selected user
  if (value) {
    return (
      <div>
        <label className="corolla-label mb-2 block">User</label>
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm',
            'border-2 border-corolla-primary/20'
          )}
        >
          <div className="corolla-avatar h-10 w-10 text-sm">
            {value.name[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-corolla-on-surface">
              {value.name}
            </p>
            <p className="truncate text-sm text-corolla-on-surface-variant">
              {value.email}
            </p>
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
      <label className="corolla-label mb-2 block">User</label>
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
          placeholder="Search by name or email..."
          disabled={disabled}
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
      {open && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border-2 border-corolla-outline bg-white shadow-xl">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-corolla-on-surface-variant">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-corolla-on-surface-variant">
                <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No users found for &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              <ul ref={listRef} className="max-h-64 overflow-auto py-2">
                {users.map((user, index) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(user)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                        index === highlightedIndex
                          ? 'bg-corolla-active-nav'
                          : 'hover:bg-corolla-surface-variant'
                      )}
                    >
                      <div className="corolla-avatar h-10 w-10 text-sm">
                        {user.name[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-corolla-on-surface">
                          {user.name}
                        </p>
                        <p className="truncate text-sm text-corolla-on-surface-variant">
                          {user.email}
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
          Start typing to search for a user by name or email
        </p>
      )}
    </div>
  );
}
