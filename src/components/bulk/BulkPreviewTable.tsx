'use client';

import { CheckCircle, XCircle, FileWarning } from 'lucide-react';
import { BulkPreviewRow } from './BulkPreviewRow';
import { cn } from '@/lib/utils';
import type { ValidRow, ErrorRow } from '@/hooks/useBulkUpload';

export interface BulkPreviewTableProps {
  validRows: ValidRow[];
  errorRows: ErrorRow[];
}

export function BulkPreviewTable({
  validRows,
  errorRows,
}: BulkPreviewTableProps) {
  const totalRows = validRows.length + errorRows.length;
  const hasErrors = errorRows.length > 0;

  // Combine and sort by row number
  const allRows = [
    ...validRows.map((row) => ({ ...row, isError: false as const })),
    ...errorRows.map((row) => ({ ...row, isError: true as const })),
  ].sort((a, b) => a.rowNumber - b.rowNumber);

  return (
    <div
      className={cn(
        'mt-8 overflow-hidden',
        'rounded-[2rem] bg-white',
        'border border-corolla-outline',
        'shadow-lg',
        'duration-300 animate-in slide-in-from-bottom-4'
      )}
    >
      {/* Summary Header */}
      <div className="flex items-center justify-between border-b border-corolla-outline bg-corolla-surface px-6 py-4">
        <div>
          <h3 className="text-lg font-bold text-corolla-on-surface">
            Preview Results
          </h3>
          <p className="text-sm text-corolla-on-surface-variant">
            {totalRows} row{totalRows !== 1 ? 's' : ''} found in CSV
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-corolla-on-surface">
              {validRows.length} valid
            </span>
          </div>
          {hasErrors && (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {errorRows.length} error{errorRows.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {hasErrors && (
        <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-3">
          <FileWarning className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            <strong>
              Fix {errorRows.length} error{errorRows.length !== 1 ? 's' : ''}
            </strong>{' '}
            before you can insert access grants. Update your CSV and re-upload.
          </p>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-x-3 bg-corolla-surface-variant px-4 py-3">
        <div className="corolla-label col-span-1">Row</div>
        <div className="corolla-label col-span-3">User Email</div>
        <div className="corolla-label col-span-2">System</div>
        <div className="corolla-label col-span-2">Instance</div>
        <div className="corolla-label col-span-2">Tier</div>
        <div className="corolla-label col-span-2 text-right">Status</div>
      </div>

      {/* Table Body */}
      <div className="max-h-[400px] divide-y divide-corolla-outline overflow-y-auto">
        {allRows.map((row) => (
          <BulkPreviewRow key={row.rowNumber} row={row} isError={row.isError} />
        ))}
      </div>

      {/* Footer Summary */}
      <div className="flex items-center justify-between border-t border-corolla-outline bg-corolla-surface px-6 py-4">
        <p className="text-sm text-corolla-on-surface-variant">
          {hasErrors ? (
            <>
              <span className="font-medium text-red-600">
                Cannot insert grants
              </span>{' '}
              — resolve errors first
            </>
          ) : (
            <>
              <span className="font-medium text-green-600">All rows valid</span>{' '}
              — ready to insert
            </>
          )}
        </p>
        {!hasErrors && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Ready</span>
          </div>
        )}
      </div>
    </div>
  );
}

