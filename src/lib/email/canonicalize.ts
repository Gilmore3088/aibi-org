// Email canonicalization for entitlement lookups.
//
// Problem: users routinely test with Gmail "+alias" forms
// (jlgilmore2+stripe-test-1@gmail.com) which deliver to the same inbox
// as the base address but are stored verbatim in the database. Stripe
// sends back whatever was typed at checkout. Without canonicalization,
// a user who paid as alias+1@gmail.com and signs in as user@gmail.com
// has no findable entitlement.
//
// What we do:
//   - Lowercase everything (RFC 5321 says local-part is technically
//     case-sensitive but in practice every major provider treats it
//     case-insensitively, and Supabase Auth lowercases at signup).
//   - For gmail.com and googlemail.com, strip the +tag suffix and
//     strip dots from the local part. Both are provider-documented
//     ignored characters.
//   - Other providers: just lowercase. Some (Outlook, ProtonMail) use
//     +tag too but their canonicalization rules are less universal;
//     keep them verbatim to avoid false collisions.
//
// Use canonicalEmail(raw) at every entitlement-row write site, and
// emailMatchClause(rawSession) at every read site that wants to find
// rows under both the canonical and the as-typed form.

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

export function canonicalEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0) return trimmed;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (!GMAIL_DOMAINS.has(domain)) return trimmed;

  const plusIndex = local.indexOf('+');
  const beforePlus = plusIndex === -1 ? local : local.slice(0, plusIndex);
  const dotless = beforePlus.replace(/\./g, '');
  return `${dotless}@gmail.com`;
}

/**
 * Returns the set of email variants to query against for a given
 * session email. Includes both the raw and canonical form, deduped.
 * Use as: `.in('email', emailVariants(user.email))`
 */
export function emailVariants(raw: string): string[] {
  const lower = raw.trim().toLowerCase();
  const canonical = canonicalEmail(raw);
  return Array.from(new Set([lower, canonical]));
}
