'use client';

import { CorollaAppShell } from '@/components/layout';
import { ToastProvider } from '@/components/ui/toast';

interface CorollaAppShellWithToastProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

export function CorollaAppShellWithToast({
  children,
  user,
}: CorollaAppShellWithToastProps) {
  return (
    <ToastProvider>
      <CorollaAppShell user={user}>{children}</CorollaAppShell>
    </ToastProvider>
  );
}
