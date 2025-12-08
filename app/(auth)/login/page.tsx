'use client';

import { useState } from 'react';
import { Car, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-window border-8 border-white/50 bg-corolla-surface p-8 text-center shadow-window">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="corolla-page-title mb-2">Check your email</h1>
          <p className="text-corolla-on-surface-variant">
            We&apos;ve sent a magic link to{' '}
            <strong className="text-corolla-on-surface">{email}</strong>
          </p>
          <p className="mt-4 text-sm text-corolla-on-surface-variant">
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            className="corolla-btn-secondary mt-6"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-window border-8 border-white/50 bg-corolla-surface p-8 shadow-window">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-corolla-primary text-white shadow-lg shadow-corolla-primary/30">
            <Car className="h-8 w-8" />
          </div>
          <h1 className="corolla-page-title">Welcome to Corolla</h1>
          <p className="mt-1 text-corolla-on-surface-variant">
            Access Control & Tracking System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="corolla-label mb-2 block">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="corolla-input w-full pl-10"
                required
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="corolla-btn-primary w-full justify-center"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Continue with Email
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-corolla-on-surface-variant">
          We&apos;ll send you a magic link to sign in securely.
        </p>
      </div>
    </div>
  );
}
