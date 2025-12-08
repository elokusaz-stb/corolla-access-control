'use client';

import Link from 'next/link';
import { Plus, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface TopbarProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export function Topbar({
  title,
  showSearch = false,
  onMenuClick,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6',
        className
      )}
    >
      {/* Mobile menu button */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}

      {/* Page title */}
      {title && <h1 className="text-lg font-semibold md:text-xl">{title}</h1>}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search (optional) */}
      {showSearch && (
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-64 pl-8" />
        </div>
      )}

      {/* Quick action button */}
      <Button asChild size="sm" className="gap-1.5">
        <Link href="/access/new">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Log Access Grant</span>
        </Link>
      </Button>
    </header>
  );
}
