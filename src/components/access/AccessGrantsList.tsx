'use client';

import { Shield, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AccessGrantRow } from './AccessGrantRow';
import { SkeletonAccessGrantRow } from '@/components/ui/skeleton';
import type { AccessGrant } from '@/hooks/useAccessGrants';
import { cn } from '@/lib/utils';

export interface AccessGrantsListProps {
  grants: AccessGrant[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  isValidating: boolean;
  onRemove: (grantId: string) => Promise<void>;
  onPageChange: (offset: number) => void;
}

function Pagination({
  total,
  limit,
  offset,
  onPageChange,
}: {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 pt-4"
    >
      <button
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          'corolla-icon-btn h-9 w-9',
          'disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-corolla-on-surface-variant"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange((page - 1) * limit)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3',
              'text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-corolla-primary focus:ring-offset-2',
              page === currentPage
                ? 'bg-corolla-primary text-white shadow-md'
                : 'text-corolla-on-surface-variant hover:scale-105 hover:bg-corolla-surface-variant'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(offset + limit)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          'corolla-icon-btn h-9 w-9',
          'disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

function LoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-fade-in space-y-2">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 50}ms` }}
          className="animate-stagger-fade-in opacity-0"
        >
          <SkeletonAccessGrantRow />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ offset }: { offset: number }) {
  return (
    <div className="corolla-empty-state animate-fade-in">
      <div className="corolla-empty-state-icon">
        <Shield className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-lg font-bold text-corolla-on-surface">
        No access grants found
      </h3>
      <p className="mt-2 max-w-sm text-sm text-corolla-on-surface-variant">
        {offset > 0
          ? 'No more grants to show. Try going back to the first page.'
          : 'Access grants will appear here once they are logged. Start by granting access to a user.'}
      </p>
      {offset === 0 && (
        <Link href="/access/new" className="corolla-btn-primary mt-6">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log First Grant
        </Link>
      )}
    </div>
  );
}

export function AccessGrantsList({
  grants,
  total,
  limit,
  offset,
  isLoading,
  isValidating,
  onRemove,
  onPageChange,
}: AccessGrantsListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div role="status" aria-label="Loading access grants">
        <div className="mb-2 grid hidden grid-cols-12 gap-x-3 px-4 py-3 sm:grid">
          <div className="corolla-label col-span-3">User</div>
          <div className="corolla-label col-span-2">System</div>
          <div className="corolla-label col-span-2">Instance</div>
          <div className="corolla-label col-span-2">Tier</div>
          <div className="corolla-label col-span-1">Status</div>
          <div className="corolla-label col-span-2 text-right">Actions</div>
        </div>
        <LoadingSkeleton count={5} />
        <span className="sr-only">Loading access grants...</span>
      </div>
    );
  }

  // Empty state
  if (grants.length === 0) {
    return <EmptyState offset={offset} />;
  }

  return (
    <div className="relative" role="region" aria-label="Access grants list">
      {/* Validating indicator */}
      {isValidating && (
        <div
          className="absolute -top-2 right-0 flex animate-fade-in items-center gap-2 rounded-full bg-corolla-surface px-3 py-1.5 text-xs text-corolla-on-surface-variant shadow-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          <span>Refreshing...</span>
        </div>
      )}

      {/* Table Header */}
      <div
        className="mb-2 grid hidden grid-cols-12 gap-x-3 px-4 py-3 text-corolla-on-surface-variant sm:grid"
        role="row"
        aria-hidden="true"
      >
        <div className="corolla-label col-span-3">User</div>
        <div className="corolla-label col-span-2">System</div>
        <div className="corolla-label col-span-2">Instance</div>
        <div className="corolla-label col-span-2">Tier</div>
        <div className="corolla-label col-span-1">Status</div>
        <div className="corolla-label col-span-2 text-right">Actions</div>
      </div>

      {/* Grants List */}
      <div className="space-y-0" role="list">
        {grants.map((grant, index) => (
          <AccessGrantRow
            key={grant.id}
            grant={grant}
            onRemove={onRemove}
            index={index}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        total={total}
        limit={limit}
        offset={offset}
        onPageChange={onPageChange}
      />

      {/* Results count */}
      <p
        className="mt-4 text-center text-xs text-corolla-on-surface-variant"
        role="status"
        aria-live="polite"
      >
        Showing {offset + 1}–{Math.min(offset + grants.length, total)} of{' '}
        {total} grants
      </p>
    </div>
  );
}
