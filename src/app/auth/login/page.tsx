'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn, signInWithMagicLink } from '@/lib/supabase/auth';

// ── Dev bypass ───────────────────────────────────────────────────────────────
// Only available in development. Sets a flag so protected pages can short-circuit.
function DevSkipButton() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.setItem('aibi-dev-auth', 'true');
        window.location.href = '/dashboard';
      }}
      className="w-full py-2 px-4 border border-dashed border-[color:var(--color-slate)]/40 text-[color:var(--color-slate)] text-sm font-sans rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
    >
      Dev: Skip Login
    </button>
  );
}

// ── Password form ─────────────────────────────────────────────────────────────

function PasswordForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const result = await signIn(email, password);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <p role="alert" className="text-[color:var(--color-error)] text-sm font-sans px-3 py-2 bg-[color:var(--color-error)]/8 rounded-[2px] border border-[color:var(--color-error)]/20">
          {error}
        </p>
      )}
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
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
            Password
          </label>
          <Link href="/auth/forgot-password" className="font-sans text-xs text-[color:var(--color-terra)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

// ── Magic link form ───────────────────────────────────────────────────────────

function MagicLinkForm({ redirectTo }: { redirectTo: string }) {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    const result = await signInWithMagicLink(email, redirectTo);
    setPending(false);

    if (result.error) {
      setError(result.error);
      setState('error');
      return;
    }
    setState('sent');
  }

  if (state === 'sent') {
    return (
      <div className="text-center space-y-2 py-4">
        <p className="font-sans text-sm text-[color:var(--color-ink)]">
          Check your inbox. A sign-in link is on its way.
        </p>
        <p className="font-sans text-xs text-[color:var(--color-slate)]">
          The link expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <p role="alert" className="text-[color:var(--color-error)] text-sm font-sans px-3 py-2 bg-[color:var(--color-error)]/8 rounded-[2px] border border-[color:var(--color-error)]/20">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="magic-email" className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink)]/70">
          Email
        </label>
        <input
          id="magic-email"
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
        className="w-full py-2.5 px-6 bg-[color:var(--color-parch)] text-[color:var(--color-ink)] border border-[color:var(--color-ink)]/20 font-sans text-sm font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Sending link...' : 'Send Magic Link'}
      </button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') ?? '/dashboard';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<'password' | 'magic'>('password');

  return (
    <main className="flex-1 flex items-start justify-center px-6 py-14 md:py-20">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            The AI Banking Institute
          </p>
          <h1 className="font-serif text-3xl text-[color:var(--color-ink)]">Sign In</h1>
        </div>

        {/* Card */}
        <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[2px] p-7 space-y-6">

          {/* URL-level error (from callback redirect) */}
          {urlError && (
            <p role="alert" className="text-[color:var(--color-error)] text-sm font-sans px-3 py-2 bg-[color:var(--color-error)]/8 rounded-[2px] border border-[color:var(--color-error)]/20">
              {urlError === 'missing_code'
                ? 'The sign-in link is invalid or has expired. Please try again.'
                : urlError === 'not_configured'
                  ? 'Authentication is not yet configured.'
                  : urlError}
            </p>
          )}

          {/* Mode toggle */}
          <div className="flex rounded-[2px] border border-[color:var(--color-ink)]/15 overflow-hidden text-xs font-sans font-semibold uppercase tracking-[0.12em]">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 transition-colors ${
                mode === 'password'
                  ? 'bg-[color:var(--color-ink)] text-[color:var(--color-linen)]'
                  : 'bg-transparent text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-ink)]'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 transition-colors ${
                mode === 'magic'
                  ? 'bg-[color:var(--color-ink)] text-[color:var(--color-linen)]'
                  : 'bg-transparent text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-ink)]'
              }`}
            >
              Magic Link
            </button>
          </div>

          {mode === 'password' ? (
            <PasswordForm redirectTo={redirectTo} />
          ) : (
            <MagicLinkForm redirectTo={redirectTo} />
          )}

          <DevSkipButton />
        </div>

        {/* Footer link */}
        <p className="text-center font-sans text-sm text-[color:var(--color-slate)]">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/signup${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-[color:var(--color-terra)] hover:underline font-semibold"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
