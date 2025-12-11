'use client';

import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubmitButtonProps {
  isLoading: boolean;
  disabled: boolean;
}

export function SubmitButton({ isLoading, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={cn(
        'flex w-full items-center justify-center gap-2',
        'bg-corolla-primary text-white',
        'rounded-full px-6 py-4',
        'text-base font-semibold',
        'shadow-lg shadow-corolla-primary/25',
        'transition-all duration-150',
        'hover:shadow-xl hover:shadow-corolla-primary/30 hover:brightness-110',
        'active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-corolla-primary focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Creating Access Grant...
        </>
      ) : (
        <>
          <Plus className="h-5 w-5" />
          Log Access Grant
        </>
      )}
    </button>
  );
}

