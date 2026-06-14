// Trusted-device gate (#187 PR 2). After a successful email + password
// sign-in, we only let the user through to protected surfaces if their
// browser carries an aibi-trusted-device cookie whose token resolves to
// a non-expired row in public.trusted_devices for THIS user.
//
// If the cookie is missing, expired, or owned by a different user, the
// API flow issues a short-lived device_confirmations row, emails the
// user a one-time link, and the client routes to
// /auth/confirm-device-pending. When the user clicks the link,
// /auth/confirm-device consumes the token, writes the trusted_devices
// row, and sets the cookie.
//
// Tokens stored in the DB are SHA-256 hashes of the plaintext tokens
// kept in the cookie / email link — same pattern as
// webauthn_recovery_codes and the rate_limits cookie tokens elsewhere
// in the codebase.

import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions } from '@supabase/ssr';

import { createServiceRoleClient } from '@/lib/supabase/client';

export const TRUSTED_DEVICE_COOKIE = 'aibi-trusted-device';
export const TRUSTED_DEVICE_TTL_DAYS = 90;
export const DEVICE_CONFIRMATION_TTL_MINUTES = 10;

const SECONDS_PER_DAY = 60 * 60 * 24;

// Auto-trust allowlist. A verified-email round-trip (signup confirmation,
// magic link, or email OTP) proves the user controls the inbox, so the
// /auth/callback route mints a trusted-device cookie for these OTP types.
// `recovery` is deliberately EXCLUDED — a password reset must never silently
// trust a device. This is an ALLOWLIST (not a denylist): any future/unknown
// OTP type fails closed (no auto-trust). `generateMagicLink` emits type
// `email`, so `email` MUST stay in this set or the welcome link re-locks buyers.
const AUTO_TRUST_OTP_TYPES = new Set<string>(['signup', 'magiclink', 'email']);

export function isAutoTrustableType(type: string | null | undefined): boolean {
  return type != null && AUTO_TRUST_OTP_TYPES.has(type);
}

export function trustedDeviceCookieOptions(): CookieOptions {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TRUSTED_DEVICE_TTL_DAYS * SECONDS_PER_DAY,
  };
}

/** Generate a 32-byte (256-bit) URL-safe random token. */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

/** SHA-256 hash, hex-encoded — same shape used elsewhere in the codebase. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Returns true if the cookie token resolves to a non-expired trusted
 * device row owned by the specified user. Also bumps last_seen_at on a
 * successful check (best-effort; failures are non-fatal). */
export async function isDeviceTrusted(args: {
  readonly userId: string;
  readonly cookieToken: string | undefined;
}): Promise<boolean> {
  if (!args.cookieToken) return false;

  const service = createServiceRoleClient();
  const tokenHash = hashToken(args.cookieToken);

  const { data, error } = await service
    .from('trusted_devices')
    .select('id, user_id, expires_at')
    .eq('cookie_token_hash', tokenHash)
    .maybeSingle();

  if (error || !data) return false;
  if (data.user_id !== args.userId) return false;
  if (new Date(data.expires_at).getTime() <= Date.now()) return false;

  // Best-effort touch; ignore failures.
  void service
    .from('trusted_devices')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', data.id);

  return true;
}

/** Create a single-use confirmation token and return the plaintext.
 * The caller emails the plaintext to the user; the DB only ever sees
 * its SHA-256 hash. */
export async function createDeviceConfirmation(args: {
  readonly userId: string;
  readonly redirectTo: string;
  readonly ipHash: string | null;
  readonly userAgent: string | null;
}): Promise<{ token: string; expiresAt: Date } | { error: string }> {
  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + DEVICE_CONFIRMATION_TTL_MINUTES * 60 * 1000);

  const service = createServiceRoleClient();
  const { error } = await service.from('device_confirmations').insert({
    user_id: args.userId,
    token_hash: hashToken(token),
    redirect_to: args.redirectTo,
    ip_hash: args.ipHash,
    user_agent: args.userAgent,
    expires_at: expiresAt.toISOString(),
  });

  if (error) return { error: error.message };
  return { token, expiresAt };
}

/** Consume a confirmation token: validate, mark consumed, return the
 * matching user_id + redirectTo so the caller can issue the trusted
 * device row and redirect the browser. */
export async function consumeDeviceConfirmation(
  token: string,
): Promise<
  | { userId: string; redirectTo: string }
  | { error: 'not_found' | 'expired' | 'already_used' | 'db_error' }
> {
  const service = createServiceRoleClient();
  const tokenHash = hashToken(token);

  const { data: row, error } = await service
    .from('device_confirmations')
    .select('id, user_id, redirect_to, expires_at, consumed_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) return { error: 'db_error' };
  if (!row) return { error: 'not_found' };
  if (row.consumed_at) return { error: 'already_used' };
  if (new Date(row.expires_at).getTime() <= Date.now()) return { error: 'expired' };

  const { error: updateError } = await service
    .from('device_confirmations')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id);

  if (updateError) return { error: 'db_error' };

  return { userId: row.user_id, redirectTo: row.redirect_to };
}

/** After consuming a confirmation, persist the trusted-device row and
 * return the plaintext cookie token the caller should set in the browser. */
export async function issueTrustedDevice(args: {
  readonly userId: string;
  readonly ipHash: string | null;
  readonly userAgent: string | null;
  readonly label?: string;
}): Promise<{ cookieToken: string; expiresAt: Date } | { error: string }> {
  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_TTL_DAYS * SECONDS_PER_DAY * 1000);

  const service = createServiceRoleClient();
  const { error } = await service.from('trusted_devices').insert({
    user_id: args.userId,
    cookie_token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    ip_hash_first: args.ipHash,
    user_agent: args.userAgent,
    label: args.label ?? null,
  });

  if (error) return { error: error.message };
  return { cookieToken: token, expiresAt };
}
