'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CorollaSidebar } from './CorollaSidebar';
import { CorollaTopbar } from './CorollaTopbar';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export interface CorollaAppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  pageTitle?: string;
}

export function CorollaAppShell({
  children,
  user,
  pageTitle,
}: CorollaAppShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="corolla-window flex w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-corolla-on-surface/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <CorollaSidebar
          user={user}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <CorollaTopbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
