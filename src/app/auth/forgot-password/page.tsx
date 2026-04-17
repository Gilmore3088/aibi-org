'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/supabase/auth';

export default function ForgotPasswordPage() {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    const result = await resetPassword(email);
    setPending(false);

    if (result.error) {
      setError(result.error);
      setState('error');
      return;
    }
    setState('sent');
  }

  return (
    <main className="flex-1 flex items-start justify-center px-6 py-14 md:py-20">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            The AI Banking Institute
          </p>
          <h1 className="font-serif text-3xl text-[color:var(--color-ink)]">Reset Password</h1>
        </div>

        {/* Card */}
        <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[2px] p-7 space-y-5">
          {state === 'sent' ? (
            <div className="text-center space-y-3 py-2">
              <p className="font-sans text-sm text-[color:var(--color-ink)]">
                If that address is in our system, a reset link is on its way.
              </p>
              <p className="font-sans text-xs text-[color:var(--color-slate)]">
                Check your spam folder if you don&apos;t see it within a few minutes.
              </p>
            </div>
          ) : (
            <>
              <p className="font-sans text-sm text-[color:var(--color-slate)]">
                Enter the email address linked to your account and we&apos;ll send a reset link.
              </p>

              {error && (
                <p role="alert" className="text-[color:var(--color-error)] text-sm font-sans px-3 py-2 bg-[color:var(--color-error)]/8 rounded-[2px] border border-[color:var(--color-error)]/20">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-3 py-2.5 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/20 rounded-[2px] font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-slate)]/60 focus:outline-none focus:border-[color:var(--color-terra)] focus:ring-1 focus:ring-[color:var(--color-terra)] transition-colors"
                    placeholder="you@yourbank.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-2.5 px-6 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-sm font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center font-sans text-sm text-[color:var(--color-slate)]">
          Remembered it?{' '}
          <Link href="/auth/login" className="text-[color:var(--color-terra)] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
