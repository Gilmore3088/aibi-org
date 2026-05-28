// Password policy — single source of truth for both /auth/signup and
// /auth/reset-password. Aligned with issue #187 and the current NIST
// SP 800-63B guidance:
//
//   - Minimum 12 characters (length is the dominant strength factor)
//   - At least one digit or non-alphanumeric symbol (cheap defense against
//     dictionary words used in isolation)
//   - No upper/lower/special-class mandates beyond that — NIST 2017
//     guidance retired complexity rules because they push users toward
//     predictable substitutions and shared passwords across sites
//   - No maximum length — UTF-8 supported (Supabase Auth permits 6–72;
//     we cap at 72 to match the underlying bcrypt limit)
//
// Validation is best-effort UX: the server (Supabase Auth) also enforces
// its own minimum (configured in the Supabase dashboard). This helper
// catches issues client-side so users do not bounce back from the
// network round-trip with a generic 422.

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 72;

const DIGIT_OR_SYMBOL = /[^a-zA-Z]/;

export interface PasswordCheckResult {
  readonly ok: boolean;
  readonly error: string | null;
}

export function validatePassword(password: string): PasswordCheckResult {
  if (typeof password !== 'string' || password.length === 0) {
    return { ok: false, error: 'Password is required.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`,
    };
  }
  if (!DIGIT_OR_SYMBOL.test(password)) {
    return {
      ok: false,
      error: 'Password must include at least one number or symbol.',
    };
  }
  return { ok: true, error: null };
}

/** User-facing description of the password requirements, for use as
 * helper text under a password field. */
export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters, including at least one number or symbol.`;
