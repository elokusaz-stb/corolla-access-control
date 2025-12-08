'use client';

import { Settings, Search, Loader2 } from 'lucide-react';
import { SystemRow } from './SystemRow';
import { cn } from '@/lib/utils';
import type { SystemWithDetails } from '@/hooks/useSystems';

export interface SystemsListProps {
  systems: SystemWithDetails[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onManage: (systemId: string) => void;
}

export function SystemsList({
  systems,
  isLoading,
  searchQuery,
  onSearchChange,
  onManage,
}: SystemsListProps) {
  const filteredSystems = systems.filter(
    (system) =>
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={cn(
        'bg-corolla-surface',
        'rounded-[2rem]',
        'border border-corolla-outline',
        'shadow-lg',
        'overflow-hidden'
      )}
    >
      {/* Search Header */}
      <div className="border-b border-corolla-outline px-6 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search systems..."
            className="corolla-input w-full pl-11"
          />
        </div>
      </div>

      {/* Systems List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-corolla-primary" />
        </div>
      ) : filteredSystems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-corolla-surface-variant">
            <Settings className="h-8 w-8 text-corolla-on-surface-variant" />
          </div>
          <p className="mt-4 font-medium text-corolla-on-surface">
            {searchQuery ? 'No systems found' : 'No systems yet'}
          </p>
          <p className="mt-1 text-sm text-corolla-on-surface-variant">
            {searchQuery
              ? `No systems match "${searchQuery}"`
              : 'Create your first system to get started'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-corolla-outline">
          {filteredSystems.map((system, index) => (
            <SystemRow 
              key={system.id} 
              system={system} 
              onManage={onManage}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {!isLoading && filteredSystems.length > 0 && (
        <div className="border-t border-corolla-outline bg-corolla-surface-variant/30 px-6 py-3">
          <p className="text-center text-xs text-corolla-on-surface-variant">
            {filteredSystems.length} system
            {filteredSystems.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}
