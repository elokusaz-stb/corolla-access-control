'use client';

import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsertGrantsButtonProps {
  count: number;
  onInsert: () => void;
  isInserting: boolean;
  isSuccess: boolean;
}

export function InsertGrantsButton({
  count,
  onInsert,
  isInserting,
  isSuccess,
}: InsertGrantsButtonProps) {
  if (isSuccess) {
    return (
      <div
        className={cn(
          'fixed bottom-8 left-1/2 z-50 -translate-x-1/2',
          'flex items-center gap-3',
          'border-2 border-green-200 bg-green-50',
          'rounded-full px-6 py-4',
          'shadow-xl',
          'duration-300 animate-in slide-in-from-bottom-4'
        )}
      >
        <CheckCircle className="h-6 w-6 text-green-500" />
        <span className="font-semibold text-green-700">
          Successfully inserted {count} access grant{count !== 1 ? 's' : ''}!
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-8 left-1/2 z-50 -translate-x-1/2',
        'flex items-center gap-4',
        'border border-corolla-outline bg-corolla-surface',
        'rounded-full px-6 py-3',
        'shadow-xl',
        'duration-300 animate-in slide-in-from-bottom-4'
      )}
    >
      <span className="text-sm text-corolla-on-surface-variant">
        <strong className="text-corolla-on-surface">{count}</strong> access
        grant
        {count !== 1 ? 's' : ''} ready
      </span>
      <button
        onClick={onInsert}
        disabled={isInserting}
        className={cn(
          'flex items-center gap-2',
          'bg-corolla-primary text-white',
          'rounded-full px-6 py-2.5',
          'text-sm font-semibold',
          'shadow-lg shadow-corolla-primary/25',
          'transition-all duration-150',
          'hover:shadow-xl hover:brightness-110',
          'active:scale-95',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {isInserting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Inserting...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Insert Access Grants
          </>
        )}
      </button>
    </div>
  );
}
