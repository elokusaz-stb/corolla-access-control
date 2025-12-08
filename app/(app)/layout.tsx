import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CorollaAppShellWithToast } from './CorollaAppShellWithToast';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const userData = {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0],
    email: user.email!,
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 lg:p-8">
      <CorollaAppShellWithToast user={userData}>
        {children}
      </CorollaAppShellWithToast>
    </div>
  );
}
