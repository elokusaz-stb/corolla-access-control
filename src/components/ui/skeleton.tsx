import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'button';
}

/**
 * Skeleton loading component for Corolla
 * Provides visual feedback during async operations
 */
export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer',
        {
          'rounded-xl': variant === 'default',
          'rounded-full': variant === 'circular' || variant === 'button',
          'h-4 rounded-md': variant === 'text',
        },
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for a single row in a list
 */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-12 items-center gap-x-3 px-4 py-4',
        className
      )}
    >
      <div className="col-span-1">
        <Skeleton variant="circular" className="h-8 w-8" />
      </div>
      <div className="col-span-3 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
      </div>
      <div className="col-span-2">
        <Skeleton variant="text" className="w-2/3" />
      </div>
      <div className="col-span-2">
        <Skeleton variant="text" className="w-1/2" />
      </div>
      <div className="col-span-2">
        <Skeleton variant="button" className="h-6 w-16" />
      </div>
      <div className="col-span-2">
        <Skeleton variant="button" className="h-6 w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Access Grant row
 */
export function SkeletonAccessGrantRow() {
  return (
    <div className="rounded-xl border border-corolla-outline bg-white px-4 py-3">
      <div className="grid grid-cols-12 items-center gap-x-3">
        <div className="col-span-3 flex items-center gap-3">
          <Skeleton variant="circular" className="h-9 w-9" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
        </div>
        <div className="col-span-2">
          <Skeleton variant="text" className="w-2/3" />
        </div>
        <div className="col-span-2">
          <Skeleton variant="text" className="w-1/2" />
        </div>
        <div className="col-span-2">
          <Skeleton variant="button" className="h-6 w-20" />
        </div>
        <div className="col-span-2">
          <Skeleton variant="button" className="h-6 w-16" />
        </div>
        <div className="col-span-1 flex justify-end">
          <Skeleton variant="circular" className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for System row
 */
export function SkeletonSystemRow() {
  return (
    <div className="px-6 py-5">
      <div className="grid grid-cols-12 items-center gap-x-4">
        <div className="col-span-5 flex items-center gap-4">
          <Skeleton variant="default" className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-5 w-1/2" />
            <Skeleton variant="text" className="h-3 w-3/4" />
          </div>
        </div>
        <div className="col-span-3 flex gap-2">
          <Skeleton variant="button" className="h-6 w-16" />
          <Skeleton variant="button" className="h-6 w-12" />
        </div>
        <div className="col-span-2 flex -space-x-2">
          <Skeleton variant="circular" className="h-8 w-8" />
          <Skeleton variant="circular" className="h-8 w-8" />
        </div>
        <div className="col-span-2 flex justify-end">
          <Skeleton variant="button" className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Card
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-corolla-outline bg-white p-6',
        className
      )}
    >
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-1/3" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Form field
 */
export function SkeletonFormField({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton variant="text" className="h-3 w-24" />
      <Skeleton variant="default" className="h-12 w-full" />
    </div>
  );
}

/**
 * Full page loading skeleton
 */
export function SkeletonPage() {
  return (
    <div className="animate-fade-in space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="button" className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        <SkeletonCard />
        <div className="overflow-hidden rounded-2xl border border-corolla-outline bg-white">
          <div className="divide-y divide-corolla-outline">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

