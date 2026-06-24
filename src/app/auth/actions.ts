'use server';

// Server actions for auth flows. Keep these here so client components
// can call signOut / sendPasswordSetupAction without importing the Supabase
// browser client — otherwise the SDK gets bundled into every page that
// mounts a client component referencing those helpers.

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeNext } from '@/lib/supabase/auth';
import { ensureAuthUser, generateMagicLink } from '@/lib/supabase/auth-admin';
import { sendIndepthAssessmentPurchase } from '@/lib/resend';
import { clearAuthCookiesForSignOut } from './signOutCookies';

/**
 * Re-send the In-Depth buyer their ONE-CLICK access link — the same
 * passwordless magic link the Stripe webhook emails on purchase. No password
 * to set: the link verifies through /auth/callback and drops them straight
 * into /assessment/in-depth/take with a session.
 *
 * The account + entitlement already exist (provisioned by the webhook);
 * ensureAuthUser is idempotent and just guarantees the row before we mint the
 * link. This is the primary recovery path on the purchase success page —
 * preferred over sendPasswordSetupAction, which forces a password step.
 */
export async function sendInDepthAccessLinkAction(
  email: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured.' };
  }
  try {
    await ensureAuthUser(email); // idempotent — guarantees the auth row exists
    const magicLinkUrl = await generateMagicLink(email, '/assessment/in-depth/take');
    if (!magicLinkUrl) {
      return { error: 'Could not generate your access link — try the password option below.' };
    }
    const res = await sendIndepthAssessmentPurchase({ email, amountPaid: '', magicLinkUrl });
    if ('skipped' in res) {
      return { error: 'Email is temporarily unavailable — try the password option below.' };
    }
    if (!res.ok) {
      return { error: 'Could not send the email — try the password option below.' };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not send your access link.' };
  }
}

/**
 * Send a "set your password" email — the post-assessment account-completion
 * flow. Internally this is a Supabase recovery email; we frame it as
 * "set your password" because the caller is typically a brand-new soft
 * account created by /api/capture-email's ensureAuthUser. Replaces the
 * prior sendMagicLinkAction (#187, magic-link retirement 2026-05-28).
 *
 * Works for legacy magic-link users too — resetPasswordForEmail does not
 * care whether a password was set previously.
 */
export async function sendPasswordSetupAction(
  email: string,
  redirectTo?: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Auth is not configured.' };
  }
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'https';
  const origin = host ? `${proto}://${host}` : 'https://aibankinginstitute.com';
  const next = sanitizeNext(redirectTo);
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Recovery callback runs through /auth/callback, which detects
    // type=recovery and routes the verified user to /auth/reset-password.
    // The next param is preserved through the recovery handshake so the
    // user lands on the page they were trying to reach.
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
  });
  return { error: error?.message ?? null };
}

export async function signOutAction(): Promise<void> {
  // Clear every Supabase auth cookie. The @supabase/ssr cookie names
  // follow the pattern `sb-<project-ref>-auth-token[.<chunk>]`, so we
  // delete anything starting with `sb-`. Doing this directly (rather
  // than calling supabase.auth.signOut()) means this server action does
  // not import the Supabase SDK, so AuthDropdown — its only caller —
  // stays free of any Supabase JS in the client bundle.
  const cookieStore = await cookies();
  clearAuthCookiesForSignOut(cookieStore);
  redirect('/');
}
