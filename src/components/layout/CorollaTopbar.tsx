'use client';

import Link from 'next/link';
import { Plus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CorollaTopbarProps {
  title?: string;
  onMenuClick?: () => void;
  className?: string;
}

export function CorollaTopbar({
  title,
  onMenuClick,
  className,
}: CorollaTopbarProps) {
  return (
    <header className={cn('corolla-topbar', className)}>
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-full text-corolla-on-surface-variant hover:bg-corolla-surface-variant lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </button>
        )}

        {/* Page title */}
        {title && <h1 className="corolla-page-title">{title}</h1>}
      </div>

      {/* Quick Grant CTA */}
      <Link href="/access/new" className="corolla-btn-primary">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Quick Grant</span>
      </Link>
    </header>
  );
}

