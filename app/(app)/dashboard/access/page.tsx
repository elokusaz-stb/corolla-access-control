'use client';

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import {
  FilterBar,
  FilterValues,
  QuickGrantCard,
  AccessGrantsList,
} from '@/components/access';
import { useAccessGrants, useRemoveAccessGrant } from '@/hooks/useAccessGrants';

const DEFAULT_LIMIT = 20;

export default function AccessOverviewPage() {
  const [filters, setFilters] = useState<FilterValues>({
    userId: '',
    userName: '',
    systemId: '',
    instanceId: '',
    tierId: '',
    status: '',
    search: '',
  });
  const [offset, setOffset] = useState(0);

  // Build API filters from UI state
  const apiFilters = {
    userId: filters.userId || undefined,
    systemId: filters.systemId || undefined,
    instanceId: filters.instanceId || undefined,
    tierId: filters.tierId || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    limit: DEFAULT_LIMIT,
    offset,
  };

  const { grants, total, limit, isLoading, isValidating } =
    useAccessGrants(apiFilters);
  const { removeGrant } = useRemoveAccessGrant();

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setOffset(0); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((newOffset: number) => {
    setOffset(newOffset);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRemove = useCallback(
    async (grantId: string) => {
      await removeGrant(grantId);
    },
    [removeGrant]
  );

  return (
    <div className="-mx-6 -mt-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="corolla-page-title">Access Overview</h1>
          <p className="mt-1 text-corolla-on-surface-variant">
            View and manage all access grants across systems.
          </p>
        </div>
        <button className="corolla-btn-secondary">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="space-y-6 px-6">
        {/* Quick Grant Card */}
        <QuickGrantCard />

        {/* Access Grants List */}
        <div className="corolla-card p-6">
          <AccessGrantsList
            grants={grants}
            total={total}
            limit={limit}
            offset={offset}
            isLoading={isLoading}
            isValidating={isValidating}
            onRemove={handleRemove}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
