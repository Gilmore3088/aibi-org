// Admin access gate for the internal /admin/* surfaces.
//
// There is no admin role in the data model — user_profiles.role holds the
// banker's job function (operator, executive, …), not an internal permission.
// Internal access is an explicit env allowlist, FUNNEL_ADMIN_EMAILS, checked
// server-side against the Supabase session email.
//
// Fail-closed by construction: an unset allowlist, an empty email, or no match
// all deny access. Emails are compared canonically (see canonicalEmail) so a
// Gmail "+alias"/dotted form on the allowlist still matches the session email.

import { canonicalEmail } from '@/lib/email/canonicalize';

/**
 * Parse the FUNNEL_ADMIN_EMAILS value (comma / whitespace / newline separated)
 * into a deduped list of canonical emails. Unset or empty → [] (fail-closed).
 */
export function parseAdminEmails(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,\s]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => canonicalEmail(entry)),
    ),
  );
}

/**
 * True when `email` is on the FUNNEL_ADMIN_EMAILS allowlist. Fail-closed on a
 * null/empty email or an empty allowlist. Comparison is canonical, so it is
 * case-insensitive and tolerant of Gmail alias forms.
 *
 * `rawAllowlist` defaults to the env var but is injectable for tests.
 */
export function isAdminEmail(
  email: string | null | undefined,
  rawAllowlist: string | undefined = process.env.FUNNEL_ADMIN_EMAILS,
): boolean {
  if (!email || !email.trim()) return false;
  const allow = parseAdminEmails(rawAllowlist);
  if (allow.length === 0) return false;
  return allow.includes(canonicalEmail(email));
}
