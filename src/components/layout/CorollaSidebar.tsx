'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Plus,
  Upload,
  Settings,
  Users,
  LogOut,
  Car,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CorollaSidebarProps {
  user?: {
    name?: string;
    email: string;
  };
  onLogout?: () => void;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'Main',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
      { href: '/dashboard/access', label: 'Access Overview', icon: Shield },
    ],
  },
  {
    title: 'Actions',
    items: [
      { href: '/access/new', label: 'Log Access Grant', icon: Plus },
      { href: '/access/bulk', label: 'Bulk Upload', icon: Upload },
    ],
  },
  {
    title: 'Admin',
    items: [
      { href: '/admin/systems', label: 'Systems', icon: Settings },
      { href: '/admin/users', label: 'Users', icon: Users },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        'corolla-nav-item',
        isActive ? 'corolla-nav-item--active' : 'corolla-nav-item--inactive'
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

export function CorollaSidebar({
  user,
  onLogout,
  onClose,
}: CorollaSidebarProps) {
  return (
    <aside className="corolla-sidebar h-full w-64 lg:rounded-l-window">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-corolla-primary text-white shadow-md shadow-corolla-primary/20">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-corolla-on-surface">
            Corolla
          </span>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-corolla-on-surface-variant hover:bg-white/50 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {navigation.map((group) => (
            <div key={group.title}>
              <h3 className="corolla-label mb-2 px-4">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-corolla-outline p-4">
          <div className="flex items-center gap-3">
            {/* Avatar with DiceBear-style initials */}
            <div className="corolla-avatar h-10 w-10 text-sm">
              {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-corolla-on-surface">
                {user.name ?? 'User'}
              </p>
              <p className="truncate text-xs text-corolla-on-surface-variant">
                {user.email}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-corolla-on-surface-variant transition-colors hover:bg-white/50 hover:text-corolla-on-surface"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
