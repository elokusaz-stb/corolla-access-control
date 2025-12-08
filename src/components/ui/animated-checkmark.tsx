'use client';

import { cn } from '@/lib/utils';

interface AnimatedCheckmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Animated checkmark component for success states
 * Uses CSS animation for a smooth drawing effect
 */
export function AnimatedCheckmark({
  size = 'md',
  className,
}: AnimatedCheckmarkProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  const strokeWidths = {
    sm: 3,
    md: 3,
    lg: 4,
  };

  return (
    <div className={cn('relative', sizes[size], className)}>
      {/* Background circle with pulse */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-green-500',
          'animate-success-pop'
        )}
      />

      {/* Checkmark SVG */}
      <svg
        className={cn('absolute inset-0', sizes[size])}
        viewBox="0 0 52 52"
        fill="none"
      >
        <path
          d="M14 27L22 35L38 19"
          stroke="white"
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-checkmark"
          style={{
            strokeDasharray: 50,
            strokeDashoffset: 50,
          }}
        />
      </svg>
    </div>
  );
}

/**
 * Success message with animated checkmark
 */
export function SuccessMessage({
  title,
  message,
  className,
}: {
  title: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        'animate-fade-in',
        className
      )}
    >
      <AnimatedCheckmark size="lg" className="mb-4" />
      <h3 className="mt-4 text-xl font-bold text-green-700">{title}</h3>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
