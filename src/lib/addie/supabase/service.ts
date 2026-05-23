// ADDIE service-role Supabase client — server-only.
//
// All writes to the addie.* schema MUST go through this client. The schema
// is NOT exposed via PostgREST to anon/authenticated keys (see 00037),
// so service_role is the only viable path for writes outside RLS-bound
// reads via SECURITY DEFINER functions.
//
// Throws if SUPABASE_SERVICE_ROLE_KEY is missing — fail fast rather than
// silently fall back to the anon client.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// We do not (yet) generate types for the `addie.*` schema, so the
// service clients are loosely typed. Call sites take responsibility for
// shape via explicit interfaces.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedAddie: AnySupabase | null = null;
let cachedAdmin: AnySupabase | null = null;

function assertEnv(): void {
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set — addie writes require service_role');
  }
}

/**
 * Returns a service-role Supabase client scoped to the `addie` schema.
 * Cached as a module-level singleton — Supabase clients are safe to reuse.
 */
export function getAddieServiceClient(): AnySupabase {
  if (cachedAddie) return cachedAddie;
  assertEnv();
  cachedAddie = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'addie' },
  });
  return cachedAddie;
}

/**
 * Service-role client without a schema override — use for auth.admin
 * calls (auth.users lookups, user creation) and for any cross-schema
 * read that addie.* can't satisfy.
 */
export function getAdminServiceClient(): AnySupabase {
  if (cachedAdmin) return cachedAdmin;
  assertEnv();
  cachedAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedAdmin;
}

/** RFC 5321 caps localpart at 64, full address at 254. Conservative cap below. */
const MAX_EMAIL_LEN = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(raw: unknown): raw is string {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LEN) return false;
  return EMAIL_RE.test(trimmed);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
