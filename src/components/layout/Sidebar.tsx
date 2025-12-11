'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Shield,
  Plus,
  Upload,
  Settings,
  Users,
  LogOut,
  Car,
} from 'lucide-react';
import { NavSection, NavLinkItem } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  user?: {
    name?: string;
    email: string;
  };
  onLogout?: () => void;
  className?: string;
}

export function Sidebar({ user, onLogout, className }: SidebarProps) {
  return (
    <aside
      className={cn('flex h-full w-64 flex-col border-r bg-card', className)}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">Corolla</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {/* Main Section */}
          <NavSection title="Main">
            <NavLinkItem
              href="/dashboard"
              label="Dashboard"
              icon={LayoutDashboard}
              exact
            />
            <NavLinkItem
              href="/dashboard/access"
              label="Access Overview"
              icon={Shield}
            />
          </NavSection>

          {/* Actions Section */}
          <NavSection title="Actions">
            <NavLinkItem
              href="/access/new"
              label="Log Access Grant"
              icon={Plus}
            />
            <NavLinkItem
              href="/access/bulk"
              label="Bulk Upload"
              icon={Upload}
            />
          </NavSection>

          {/* Admin Section */}
          <NavSection title="Admin">
            <NavLinkItem
              href="/admin/systems"
              label="Systems"
              icon={Settings}
            />
            <NavLinkItem href="/admin/users" label="Users" icon={Users} />
          </NavSection>
        </div>
      </div>

      {/* User Section */}
      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium uppercase">
              {user.name?.[0] ?? user.email[0]}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">
                {user.name ?? 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

