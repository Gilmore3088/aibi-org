// HMAC-signed anonymous session cookie.
//
// Cookie value: `<uuid>.<hex-hmac-sha256>` where the HMAC is over the uuid
// using ANON_SESSION_COOKIE_SECRET. The uuid is opaque — it identifies a
// row in addie.anon_sessions but does NOT identify the learner.
//
// httpOnly, SameSite=Lax, Secure, 30-day sliding lifetime. The signature
// makes it tamper-evident; rotation on identity-bind (anon → lead) is
// the caller's responsibility (see leads/bind.ts).
//
// This file is consumed by both the auth/payments code and the sandbox
// service — the sandbox agent expects these exports. Keep the API stable.

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';

export const ANON_SESSION_COOKIE = 'aibi_addie_anon';
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const s = process.env.ANON_SESSION_COOKIE_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'ANON_SESSION_COOKIE_SECRET is missing or too short (need ≥16 chars).',
    );
  }
  return s;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function signAnonSessionId(uuid: string): string {
  const mac = createHmac('sha256', getSecret()).update(uuid).digest('hex');
  return `${uuid}.${mac}`;
}

/**
 * Verify a cookie value. Returns the uuid if valid, null otherwise.
 * Constant-time comparison on the HMAC to defeat timing attacks.
 */
export function verifyAnonSessionCookie(value: string | undefined | null): string | null {
  if (!value) return null;
  const dot = value.indexOf('.');
  if (dot < 0) return null;
  const uuid = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  if (!UUID_RE.test(uuid)) return null;
  if (!/^[0-9a-f]+$/i.test(mac) || mac.length !== 64) return null;
  const expected = createHmac('sha256', getSecret()).update(uuid).digest('hex');
  try {
    const a = Buffer.from(mac, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return null;
    return timingSafeEqual(a, b) ? uuid : null;
  } catch {
    return null;
  }
}

export interface AnonSessionRead {
  /** Verified uuid from the cookie, or null if absent/invalid. */
  readonly id: string | null;
}

/** Pure read — no cookie writes. Use in API routes that don't want to mint. */
export function readAnonSession(req: NextRequest): AnonSessionRead {
  const raw = req.cookies.get(ANON_SESSION_COOKIE)?.value ?? null;
  return { id: verifyAnonSessionCookie(raw) };
}

export interface EnsureAnonSession {
  readonly id: string;
  /** True when a new id was just minted. */
  readonly minted: boolean;
}

/**
 * Returns an anon session id, minting + writing the cookie on `res`
 * if absent or invalid. Caller must return `res` from the route handler
 * for the Set-Cookie to reach the browser.
 */
export function ensureAnonSession(
  req: NextRequest,
  res: NextResponse,
): EnsureAnonSession {
  const existing = readAnonSession(req).id;
  if (existing) return { id: existing, minted: false };
  const id = randomUUID();
  res.cookies.set(ANON_SESSION_COOKIE, signAnonSessionId(id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_S,
  });
  return { id, minted: true };
}

/**
 * Rotate the anon session cookie — call this after binding to a lead so a
 * stolen anon cookie can't replay onto the new identity.
 */
export function rotateAnonSession(res: NextResponse): string {
  const id = randomUUID();
  res.cookies.set(ANON_SESSION_COOKIE, signAnonSessionId(id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_S,
  });
  return id;
}

/** Clear the anon session cookie (e.g. on full sign-out). */
export function clearAnonSession(res: NextResponse): void {
  res.cookies.set(ANON_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
