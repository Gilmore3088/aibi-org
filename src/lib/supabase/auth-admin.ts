// Admin-side Supabase Auth helpers.
//
// Used by API routes that capture an email (assessment, inquiry, newsletter,
// waitlist) to provision a Supabase Auth account for that email — so every
// captured email becomes a real user the platform can authenticate later.
//
// Idempotent: returns the existing user's id if one already exists for that
// email; creates a new email-confirmed user otherwise. No password is set —
// the user authenticates via magic link until they choose to set one.
//
// Server-only. Uses the service role key.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface EnsureAuthUserResult {
  readonly userId: string | null;
  readonly created: boolean;
  readonly skipped?: string;
}

/**
 * Ensures a Supabase Auth user exists for this email. Idempotent.
 *
 * Returns:
 *   { userId: <uuid>, created: true }   — net-new user
 *   { userId: <uuid>, created: false }  — already existed
 *   { userId: null, created: false, skipped: <reason> } — supabase not configured
 *
 * Never throws on "already registered" — that's not an error in our flow.
 */
export async function ensureAuthUser(email: string): Promise<EnsureAuthUserResult> {
  if (!isSupabaseConfigured()) {
    return { userId: null, created: false, skipped: 'supabase-not-configured' };
  }

  const supabase = createServiceRoleClient();

  // Try to create first. email_confirm:true skips the verify-email step
  // since the email arrived through one of our gated capture flows.
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (!createError && createData.user) {
    return { userId: createData.user.id, created: true };
  }

  // Common case when the email is already in auth.users — fall back to lookup.
  // listUsers is paginated; we scan the first 1000 which is enough for our
  // current scale. If this grows, switch to a direct SQL query via service client.
  try {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      console.warn('[auth-admin] listUsers fallback failed:', listError.message);
      return { userId: null, created: false, skipped: 'list-users-failed' };
    }
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      return { userId: existing.id, created: false };
    }
  } catch (err) {
    console.warn('[auth-admin] listUsers exception:', err);
  }

  console.warn(
    '[auth-admin] createUser failed and no existing user found:',
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

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
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
