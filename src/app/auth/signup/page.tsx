'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';

const MIN_PASSWORD_LENGTH = 8;

function passwordsMatch(a: string, b: string): boolean {
  return a === b;
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') ?? '/dashboard';

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;
    const fullName = data.get('fullName') as string;
    const institutionName = data.get('institutionName') as string;
    const terms = data.get('terms');

    if (!terms) {
      setError('You must accept the terms to create an account.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);

    // Server-side admin createUser bypasses Supabase's hosted SMTP entirely
    // (email is auto-confirmed). The browser then signs in with the password
    // they just chose to establish the session cookie.
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName.trim(),
          institutionName: institutionName.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        setError(data.error ?? `Signup failed (${res.status}).`);
        return;
      }
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : 'Signup request failed.');
      return;
    }

    const signInResult = await signIn(email, password);
    setPending(false);
    if (signInResult.error) {
      setError(
        `Account created, but sign-in failed: ${signInResult.error}. Try signing in manually.`,
      );
      return;
    }

    router.push(redirectTo);
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
          <h1 className="font-serif text-3xl text-[color:var(--color-ink)]">Create Account</h1>
        </div>

        {/* Card */}
        <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[2px] p-7 space-y-5">
          {error && (
            <p role="alert" className="text-[color:var(--color-error)] text-sm font-sans px-3 py-2 bg-[color:var(--color-error)]/8 rounded-[2px] border border-[color:var(--color-error)]/20">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2.5 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/20 rounded-[2px] font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-slate)]/60 focus:outline-none focus:border-[color:var(--color-terra)] focus:ring-1 focus:ring-[color:var(--color-terra)] transition-colors"
                placeholder="Jane Doe"
              />
            </div>

            {/* Email */}
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

            {/* Institution (optional) */}
            <div className="space-y-1">
              <label htmlFor="institutionName" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
                Institution{' '}
                <span className="normal-case font-normal text-[color:var(--color-slate)]">(optional)</span>
              </label>
              <input
                id="institutionName"
                name="institutionName"
                type="text"
                autoComplete="organization"
                className="w-full px-3 py-2.5 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/20 rounded-[2px] font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-slate)]/60 focus:outline-none focus:border-[color:var(--color-terra)] focus:ring-1 focus:ring-[color:var(--color-terra)] transition-colors"
                placeholder="First Community Bank"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
                Password
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

            {/* Confirm password */}
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

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded-[2px] border-[color:var(--color-ink)]/30 text-[color:var(--color-terra)] focus:ring-[color:var(--color-terra)] accent-[color:var(--color-terra)] shrink-0"
              />
              <label htmlFor="terms" className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-[color:var(--color-terra)] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[color:var(--color-terra)] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 px-6 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-sm font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center font-sans text-sm text-[color:var(--color-slate)]">
          Already have an account?{' '}
          <Link
            href={`/auth/login${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-[color:var(--color-terra)] hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
