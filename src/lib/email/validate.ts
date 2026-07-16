// Canonical email-shape validation.
//
// The regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` was copy-pasted into ~24 files
// (as EMAIL_RE / EMAIL_SHAPE / EMAIL_RE_LOGIN / SUPPORT_EMAIL_RE). This is
// the single source. It is a *shape* check (one @, a dot in the domain, no
// spaces) — not full RFC 5322 validation, which is the deliverability layer's
// job (see ./deliverability.ts).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when `value` looks like an email address (trimmed). */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
