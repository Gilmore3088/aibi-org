// Operator gate. The /admin/* surface is reference-only and invisible
// to anyone whose signed-in email is not on the OPERATOR_EMAILS allow-list.
//
// Returns 404 (not 403) at the route layer so the surface never advertises
// its existence. This helper is the single source of truth for that check.
//
// OPERATOR_EMAILS is a comma-separated list of lower-cased emails:
//   OPERATOR_EMAILS=ops@example.com,founder@example.com
//
// Server-only — never imported from a client component. (Enforced
// by next/headers + cookies usage; importing this from a client
// component would fail to compile.)

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export interface OperatorContext {
  readonly isOperator: boolean;
  readonly email: string | null;
}

/** Parses the OPERATOR_EMAILS env var into a lower-cased Set. */
export function parseOperatorAllowlist(raw: string | undefined): ReadonlySet<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0),
  );
}

/** Pure check — exported for tests. */
export function emailIsOperator(
  email: string | null | undefined,
  allowlist: ReadonlySet<string>,
): boolean {
  if (!email) return false;
  if (allowlist.size === 0) return false;
  return allowlist.has(email.trim().toLowerCase());
}

/**
 * Resolves the signed-in Supabase user and checks their email against
 * the OPERATOR_EMAILS allow-list. Returns `{isOperator: false}` for
 * any failure (no session, missing env, allow-list empty).
 */
export async function getOperatorContext(): Promise<OperatorContext> {
  const allowlist = parseOperatorAllowlist(process.env.OPERATOR_EMAILS);
  if (allowlist.size === 0) {
    return { isOperator: false, email: null };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { isOperator: false, email: null };
  }

  try {
    const cookieStore = await cookies();
    const supa = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* no-op — admin pages do not refresh session cookies */
        },
      },
    });
    const { data } = await supa.auth.getUser();
    const email = data.user?.email ?? null;
    return { isOperator: emailIsOperator(email, allowlist), email };
  } catch {
    return { isOperator: false, email: null };
  }
}
