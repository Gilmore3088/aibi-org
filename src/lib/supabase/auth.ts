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
  /**
   * Set by signUp when the email already has an account. Supabase's
   * anti-enumeration behavior returns NO error for a signUp on an existing
   * confirmed email — but it also does NOT set the new password. Callers must
   * branch on this and route the user to the password-reset ("set your
   * password") flow instead of falsely reporting "check your inbox". This was
   * the cause of paid buyers getting "Invalid login credentials" right after
   * "creating" an account the Stripe webhook had already provisioned.
   */
  readonly alreadyRegistered?: boolean;
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
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com');
  const next = sanitizeNext(redirectTo);
  const { data, error } = await client().auth.signUp({
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
  if (error) return { error: error.message };
  // Anti-enumeration: when the email already exists (e.g. the Stripe webhook
  // pre-created a password-less account at purchase), Supabase returns a user
  // with an EMPTY identities array and no error — the password the user just
  // typed is silently discarded. Detect it so the caller routes to the
  // "set your password" reset flow instead of showing a false success.
  const identities = data.user?.identities;
  const alreadyRegistered = Array.isArray(identities) && identities.length === 0;
  return { error: null, alreadyRegistered };
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

// signInWithMagicLink removed 2026-05-28 (#187). Magic-link auth is
// a B2C pattern misaligned with the community-bank audience and gets
// routinely held by corporate email security gateways. Sign-in is
// password-only; the post-assessment "complete your account" flow
// uses resetPasswordForEmail framed as "Set your password" (see
// sendPasswordSetupAction in src/app/auth/actions.ts).

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
 * The /auth/callback POST handler recognizes type=recovery and forwards
 * `next` to /auth/reset-password?next=<dest>, so the reset page can
 * route the buyer to their intended destination after the password is set.
 */
export async function resetPassword(email: string, next?: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured. Set Supabase environment variables.' };
  }
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com');
  const safeNext = sanitizeNext(next ?? null);
  const { error } = await client().auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
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
