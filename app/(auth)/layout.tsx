import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Corolla Access Control',
  description: 'Sign in to access the Corolla Access Control system',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
