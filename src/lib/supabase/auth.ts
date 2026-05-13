// Auth utility functions — thin wrappers over the Supabase client.
// All functions use the browser client (safe for Client Components).
// Import and call these instead of calling supabase.auth directly.

import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Open-redirect defense. Allow only same-origin relative paths starting
// with a single "/". Reject protocol-relative ("//evil.com"), absolute
// URLs, and anything with embedded newlines. Anything that fails returns
// the default "/dashboard" so callers can use this unconditionally.
export function sanitizeNext(
  candidate: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (typeof candidate !== 'string') return fallback;
  if (candidate.length === 0 || candidate.length > 512) return fallback;
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//')) return fallback;
  if (/[\r\n\t]/.test(candidate)) return fallback;
  return candidate;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface SignUpMetadata {
  readonly fullName: string;
  readonly institutionName?: string;
}

export interface AuthResult {
  readonly error: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function client() {
  return createBrowserClient();
}

// ── Auth functions ───────────────────────────────────────────────────────────

/**
 * Create a new account with email, password, and profile metadata.
 * Supabase sends a confirmation email — user must verify before signing in
 * (depending on your project's email confirmation setting).
 */
export async function signUp(
  email: string,
  password: string,
  metadata: SignUpMetadata,
  redirectTo?: string,
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured. Set Supabase environment variables.' };
  }
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://aibankinginstitute.com';
  const next = sanitizeNext(redirectTo);
  const { error } = await client().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: metadata.fullName,
        institution_name: metadata.institutionName ?? '',
      },
    },
  });
  return { error: error?.message ?? null };
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured. Set Supabase environment variables.' };
  }
  const { error } = await client().auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

/**
 * Send a one-time magic link to the given email.
 * The link redirects to /auth/callback which exchanges it for a session.
 */
export async function signInWithMagicLink(
  email: string,
  redirectTo?: string,
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured. Set Supabase environment variables.' };
  }
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://aibankinginstitute.com';
  const next = sanitizeNext(redirectTo);
  const { error } = await client().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return { error: error?.message ?? null };
}

/**
 * Sign out the current user and clear the session cookie.
 */
export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { error: null };
  const { error } = await client().auth.signOut();
  return { error: error?.message ?? null };
}

/**
 * Send a password reset email.
 *
 * The recovery link routes through /auth/callback so the OTP can be
 * verified, the recovery session cookies set, and only then the user is
 * forwarded to /auth/reset-password. The prior direct redirect to
 * /auth/reset-password bypassed the OTP exchange, leaving the reset
 * page without a session and unable to call updateUser({ password }).
 *
 * The /auth/callback POST handler recognizes type=recovery and forces
 * the post-verify destination to /auth/reset-password, so the next
 * query param here is informational but kept for symmetry.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured. Set Supabase environment variables.' };
  }
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://aibankinginstitute.com';
  const { error } = await client().auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/auth/reset-password')}`,
  });
  return { error: error?.message ?? null };
}

/**
 * Update the current user's password.
 * Only valid after a reset-password redirect (recovery session).
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured. Set Supabase environment variables.' };
  }
  const { error } = await client().auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

/**
 * Return the current session, or null if not signed in.
 */
export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await client().auth.getSession();
  return data.session;
}
