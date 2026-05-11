// Admin-side Supabase Auth helpers.
//
// Used by API routes that capture an email (assessment, inquiry, newsletter,
// waitlist, stripe webhook) to provision a Supabase Auth account for that
// email — so every captured email becomes a real user the platform can
// authenticate later.
//
// Idempotent + canonical-aware: returns the existing user's id if one
// already exists for any Gmail-canonical form of the email. Stores
// canonical form on create, so subsequent alias captures dedupe to the
// same auth user. Prevents the "ghost auth user per +alias" failure mode
// that bit production 2026-05-11.
//
// Server-only. Uses the service role key.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { canonicalEmail } from '@/lib/email/canonicalize';

export interface EnsureAuthUserResult {
  readonly userId: string | null;
  readonly created: boolean;
  readonly skipped?: string;
}

/**
 * Ensures a Supabase Auth user exists for this email. Idempotent.
 *
 * Match strategy:
 *   1. Exact match (case-insensitive) on auth.users.email.
 *   2. Canonical match (Gmail +alias / dots stripped) — covers buyers who
 *      paid with a +alias but already signed up under the base address.
 *   3. If no match, create a new user using the CANONICAL email so the
 *      next alias-purchase from the same Gmail inbox dedupes to it.
 *
 * Returns:
 *   { userId: <uuid>, created: true }   — net-new user
 *   { userId: <uuid>, created: false }  — already existed (exact OR canonical)
 *   { userId: null, created: false, skipped: <reason> } — unconfigured / failed
 *
 * Never throws on "already registered" — that's not an error in our flow.
 */
export async function ensureAuthUser(email: string): Promise<EnsureAuthUserResult> {
  if (!isSupabaseConfigured()) {
    return { userId: null, created: false, skipped: 'supabase-not-configured' };
  }

  const supabase = createServiceRoleClient();
  const lowered = email.trim().toLowerCase();
  const canonical = canonicalEmail(email);

  // Existence check FIRST. Avoids the previous "always try create, fall back
  // to listUsers on conflict" pattern, which silently created +alias
  // duplicates whenever the alias didn't exactly match an existing row.
  try {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      console.warn('[auth-admin] listUsers failed:', listError.message);
    } else if (list?.users) {
      const exact = list.users.find((u) => u.email?.toLowerCase() === lowered);
      if (exact) return { userId: exact.id, created: false };

      const canonicalMatches = list.users.filter(
        (u) => u.email && canonicalEmail(u.email) === canonical,
      );
      if (canonicalMatches.length > 0) {
        canonicalMatches.sort((a, b) => {
          const at = a.last_sign_in_at ? Date.parse(a.last_sign_in_at) : 0;
          const bt = b.last_sign_in_at ? Date.parse(b.last_sign_in_at) : 0;
          return bt - at;
        });
        return { userId: canonicalMatches[0].id, created: false };
      }
    }
  } catch (err) {
    console.warn('[auth-admin] existence check exception:', err);
  }

  // No match — create with CANONICAL email. Storing the canonical form
  // (rather than the as-typed alias) means the next alias purchase from
  // the same Gmail inbox dedupes against this row instead of creating
  // yet another ghost.
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: canonical,
    email_confirm: true,
  });

  if (!createError && createData.user) {
    return { userId: createData.user.id, created: true };
  }

  // Race condition fallback: another concurrent webhook may have created the
  // row between our check and our create. Re-list and look for canonical.
  try {
    const { data: list } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const racey = list?.users?.find(
      (u) => u.email && canonicalEmail(u.email) === canonical,
    );
    if (racey) return { userId: racey.id, created: false };
  } catch {
    // fall through
  }

  console.warn(
    '[auth-admin] createUser failed and no canonical match found:',
    createError?.message ?? 'unknown',
  );
  return { userId: null, created: false, skipped: 'create-and-lookup-failed' };
}

/**
 * Generates a one-time magic-link signin URL for the given email.
 *
 * Returns a URL pointing at our own /auth/callback route with a token_hash
 * query param. The callback handler calls supabase.auth.verifyOtp() to
 * exchange the hash for a session, sets cookies on aibankinginstitute.com,
 * and redirects to nextPath.
 *
 * We deliberately do NOT use the action_link returned by generateLink —
 * that URL targets Supabase's /auth/v1/verify endpoint and uses the
 * implicit flow (tokens in the URL fragment), which a server route handler
 * cannot read. The hashed_token + verifyOtp path keeps everything
 * server-visible.
 *
 * Returns null on failure — caller should fall back to an unauthenticated URL.
 */
export async function generateMagicLink(
  email: string,
  nextPath: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceRoleClient();

  // Use canonical email so the link binds to the deduped auth user, not
  // an alias variant that won't have an account.
  const targetEmail = canonicalEmail(email);

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: targetEmail,
  });

  if (error) {
    console.warn('[auth-admin] generateMagicLink failed:', error.message);
    return null;
  }

  const tokenHash = data?.properties?.hashed_token;
  if (!tokenHash) {
    console.warn('[auth-admin] generateMagicLink: no hashed_token in response');
    return null;
  }

  // type=email is what supabase.auth.verifyOtp({ token_hash, type })
  // expects for magic-link verification. The Supabase docs explicitly
  // demonstrate this pattern even when the token came from
  // generateLink({ type: 'magiclink' }).
  const url = new URL('https://aibankinginstitute.com/auth/callback');
  url.searchParams.set('token_hash', tokenHash);
  url.searchParams.set('type', 'email');
  url.searchParams.set('next', nextPath);
  return url.toString();
}
