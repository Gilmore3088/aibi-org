// Reviewer authentication helper.
// Checks if the authenticated user's email is in the REVIEWER_EMAILS allowlist.
// REVIEWER_EMAILS is a comma-separated env var: "alice@bank.com, bob@bank.com"
//
// Per REVW-07: using REVIEWER_EMAILS env var allowlist for simplicity.
// Supabase table-based roles are deferred to a future phase.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/** Emails permitted to access the reviewer dashboard (lowercased, trimmed). */
export const REVIEWER_EMAILS: ReadonlySet<string> = new Set(
  (process.env.REVIEWER_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export interface ReviewerVerification {
  readonly isReviewer: boolean;
  readonly userId: string | null;
  readonly email: string | null;
}

/**
 * Server-side reviewer auth check.
 * Call from Server Components and Route Handlers to gate reviewer content.
 *
 * Returns isReviewer=false when:
 *   - No authenticated session
 *   - User email not in REVIEWER_EMAILS
 *   - REVIEWER_EMAILS env var is empty
 */
export async function verifyReviewer(): Promise<ReviewerVerification> {
  if (!isSupabaseConfigured()) {
    return { isReviewer: false, userId: null, email: null };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Server Components — middleware keeps session alive
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { isReviewer: false, userId: null, email: null };
  }

  const email = user.email?.toLowerCase() ?? null;
  const isReviewer = email !== null && REVIEWER_EMAILS.has(email);

  return { isReviewer, userId: user.id, email };
}
