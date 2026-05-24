'use client';

// Writes the post-Stripe identity into sessionStorage so the signup form
// can read it on mount without exposing PII in the URL query string.
//
// Why not query params? URLs get logged in Vercel access logs, browser
// history, and leak to third parties via the Referer header on any
// resource the destination page loads (analytics, fonts, Sentry, etc.).
// sessionStorage stays in the tab and dies when the tab closes.
//
// Why a client component? The page that has the identity
// (/assessment/in-depth/purchased) is server-rendered and can't write
// sessionStorage. Render this component there with props; it runs the
// write on mount, then renders nothing.

import { useEffect } from 'react';

export const SIGNUP_PREFILL_KEY = 'aibi-signup-prefill';

export interface SignupPrefillIdentity {
  readonly email?: string | null;
  readonly fullName?: string | null;
  readonly institutionName?: string | null;
}

interface IdentityHandoffProps {
  readonly identity: SignupPrefillIdentity;
}

export function IdentityHandoff({ identity }: IdentityHandoffProps): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only write when at least one field is present — empty stash is
    // worse than no stash because it overwrites whatever was left from a
    // prior visit.
    const payload: { -readonly [K in keyof SignupPrefillIdentity]: SignupPrefillIdentity[K] } = {};
    if (identity.email) payload.email = identity.email;
    if (identity.fullName) payload.fullName = identity.fullName;
    if (identity.institutionName) {
      payload.institutionName = identity.institutionName;
    }
    if (Object.keys(payload).length === 0) return;
    try {
      window.sessionStorage.setItem(
        SIGNUP_PREFILL_KEY,
        JSON.stringify(payload),
      );
    } catch {
      // Private mode / disabled storage — the signup form just renders
      // empty fields. Acceptable degradation.
    }
  }, [identity.email, identity.fullName, identity.institutionName]);

  return null;
}

/** Read + clear the prefill stash. Returns an empty object when nothing
 *  is stashed or the value is malformed. The clear is deliberate: this
 *  is a one-shot hand-off; subsequent visits should not see stale data. */
export function consumeSignupPrefill(): SignupPrefillIdentity {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(SIGNUP_PREFILL_KEY);
    if (!raw) return {};
    window.sessionStorage.removeItem(SIGNUP_PREFILL_KEY);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const stringField = (key: string): string | undefined => {
      const value = parsed[key];
      return typeof value === 'string' && value.length > 0 ? value : undefined;
    };
    return {
      email: stringField('email'),
      fullName: stringField('fullName'),
      institutionName: stringField('institutionName'),
    };
  } catch {
    try {
      window.sessionStorage.removeItem(SIGNUP_PREFILL_KEY);
    } catch {
      /* ignore */
    }
    return {};
  }
}
