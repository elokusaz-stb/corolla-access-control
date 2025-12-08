'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidRow, ErrorRow, BulkUploadRow } from '@/hooks/useBulkUpload';

export interface BulkPreviewRowProps {
  row: ValidRow | ErrorRow;
  isError: boolean;
  index?: number;
}

function isErrorRow(row: ValidRow | ErrorRow): row is ErrorRow {
  return 'errors' in row;
}

export function BulkPreviewRow({
  row,
  isError,
  index = 0,
}: BulkPreviewRowProps) {
  const data: BulkUploadRow = row.rowData;
  const errors = isError && isErrorRow(row) ? row.errors : [];

  return (
    <div
      role="row"
      aria-label={`Row ${row.rowNumber}: ${isError ? 'Error' : 'Valid'}`}
      style={{ animationDelay: `${index * 30}ms` }}
      className={cn(
        'group',
        'animate-stagger-fade-in opacity-0',
        'transition-all duration-200',
        isError
          ? 'corolla-row--error'
          : 'bg-white hover:-translate-y-0.5 hover:bg-corolla-surface-variant'
      )}
    >
      {/* Main row */}
      <div className="grid grid-cols-12 items-center gap-x-3 px-4 py-3 transition-colors">
        {/* Row Number */}
        <div className="col-span-1" role="cell">
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
              'transition-transform duration-200',
              isError
                ? 'bg-red-100 text-red-700 group-hover:scale-110'
                : 'bg-corolla-primary-container text-corolla-primary group-hover:scale-110'
            )}
            aria-label={`Row ${row.rowNumber}`}
          >
            {row.rowNumber}
          </span>
        </div>

        {/* User Email */}
        <div className="col-span-3" role="cell">
          <p
            className={cn(
              'truncate text-sm transition-colors duration-200',
              isError ? 'text-red-700' : 'text-corolla-on-surface'
            )}
          >
            {data.user_email || (
              <span className="italic text-red-400" aria-label="Missing email">
                Missing
              </span>
            )}
          </p>
        </div>

        {/* System */}
        <div className="col-span-2" role="cell">
          <p
            className={cn(
              'truncate text-sm transition-colors duration-200',
              isError ? 'text-red-700' : 'text-corolla-on-surface'
            )}
          >
            {data.system_name || (
              <span className="italic text-red-400" aria-label="Missing system">
                Missing
              </span>
            )}
          </p>
        </div>

        {/* Instance */}
        <div className="col-span-2" role="cell">
          <p
            className={cn(
              'truncate text-sm transition-colors duration-200',
              isError ? 'text-red-700/70' : 'text-corolla-on-surface-variant'
            )}
          >
            {data.instance_name || <span className="opacity-50">—</span>}
          </p>
        </div>

        {/* Tier */}
        <div className="col-span-2" role="cell">
          <span
            className={cn(
              'corolla-badge transition-all duration-200',
              isError
                ? 'border-red-200 bg-red-100 text-red-700'
                : 'corolla-badge--info group-hover:shadow-md'
            )}
          >
            {data.access_tier_name || <span className="italic">Missing</span>}
          </span>
        </div>

        {/* Status */}
        <div
          className="col-span-2 flex items-center justify-end gap-2"
          role="cell"
        >
          {isError ? (
            <div
              className="flex items-center gap-1.5 text-red-600"
              aria-label={`${errors.length} validation error${errors.length > 1 ? 's' : ''}`}
            >
              <XCircle className="h-4 w-4 animate-shake" aria-hidden="true" />
              <span className="text-xs font-medium">
                {errors.length} error{errors.length > 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 text-green-600"
              aria-label="Valid row"
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-medium">Valid</span>
            </div>
          )}
        </div>
      </div>

      {/* Error messages */}
      {isError && errors.length > 0 && (
        <div className="animate-slide-in-from-top px-4 pb-3">
          <ul
            className="ml-7 space-y-1"
            role="list"
            aria-label="Validation errors"
          >
            {errors.map((error, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-red-600"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <AlertTriangle
                  className="mt-0.5 h-3 w-3 shrink-0"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
