'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface NavLinkItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function NavLinkItem({
  href,
  label,
  icon: Icon,
  exact = false,
}: NavLinkItemProps) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

