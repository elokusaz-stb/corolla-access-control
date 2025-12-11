import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: 'active' | 'removed';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'corolla-badge',
        status === 'active' && 'corolla-badge--active',
        status === 'removed' && 'corolla-badge--removed',
        className
      )}
    >
      {status === 'active' ? 'Active' : 'Removed'}
    </span>
  );
}

