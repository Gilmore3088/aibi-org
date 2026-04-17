'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/supabase/auth';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    const result = await updatePassword(password);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-start justify-center px-6 py-14 md:py-20">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            The AI Banking Institute
          </p>
          <h1 className="font-serif text-3xl text-[color:var(--color-ink)]">New Password</h1>
        </div>

        {/* Card */}
        <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[2px] p-7 space-y-5">
          <p className="font-sans text-sm text-[color:var(--color-slate)]">
            Choose a strong password for your account.
          </p>

          {error && (
            <p role="alert" className="text-[color:var(--color-error)] text-sm font-sans px-3 py-2 bg-[color:var(--color-error)]/8 rounded-[2px] border border-[color:var(--color-error)]/20">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                className="w-full px-3 py-2.5 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/20 rounded-[2px] font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-slate)]/60 focus:outline-none focus:border-[color:var(--color-terra)] focus:ring-1 focus:ring-[color:var(--color-terra)] transition-colors"
                placeholder={`${MIN_PASSWORD_LENGTH}+ characters`}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2.5 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/20 rounded-[2px] font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-slate)]/60 focus:outline-none focus:border-[color:var(--color-terra)] focus:ring-1 focus:ring-[color:var(--color-terra)] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 px-6 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-sm font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-sm text-[color:var(--color-slate)]">
          <Link href="/auth/login" className="text-[color:var(--color-terra)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
