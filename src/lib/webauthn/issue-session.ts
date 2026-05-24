// Server-side helper: turn a verified WebAuthn assertion into a real
// Supabase cookie session.
//
// Supabase Auth doesn't yet expose WebAuthn as a native primary factor,
// so we bridge the gap: after server-side WebAuthn verification, ask
// the admin API for a magic-link OTP hash, then immediately consume it
// server-side via verifyOtp to set the session cookies. The magic-link
// mechanism is only used internally here — the URL is never sent to
// the user, so the "anyone with the mailbox can sign in" threat that
// motivated removing magic-link auth is not reintroduced.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface IssueSessionResult {
  readonly ok: boolean;
  readonly error?: string;
}

export async function issueSessionForEmail(
  email: string,
): Promise<IssueSessionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured.' };
  }

  const admin = createServiceRoleClient();
  // generateLink returns a hashed token suitable for verifyOtp. We do
  // NOT email the action_link — it's discarded.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (error || !data?.properties?.hashed_token) {
    return {
      ok: false,
      error: error?.message ?? 'Could not generate session token.',
    };
  }

  const tokenHash = data.properties.hashed_token;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  const ssr = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        for (const cookie of list) {
          cookieStore.set({
            name: cookie.name,
            value: cookie.value,
            ...cookie.options,
          });
        }
      },
    },
  });

  const { error: verifyError } = await ssr.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
  });

  if (verifyError) {
    return { ok: false, error: verifyError.message };
  }

  return { ok: true };
}
