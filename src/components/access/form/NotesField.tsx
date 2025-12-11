'use client';

import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NotesField({ value, onChange, disabled }: NotesFieldProps) {
  return (
    <div>
      <label className="corolla-label mb-2 flex items-center gap-2">
        <FileText className="h-3.5 w-3.5" />
        Notes
        <span className="text-xs font-normal normal-case text-corolla-on-surface-variant">
          (optional)
        </span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any relevant notes about this access grant..."
        disabled={disabled}
        rows={3}
        className={cn(
          'w-full resize-none rounded-xl bg-white p-3 shadow-sm',
          'text-corolla-on-surface placeholder:text-corolla-on-surface-variant/60',
          'border-2 border-corolla-quick-grant-border/50',
          'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-corolla-primary',
          'transition-all duration-150',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />
      <p className="mt-2 text-xs text-corolla-on-surface-variant">
        Optional context or reason for this access grant
      </p>
    </div>
  );
}

