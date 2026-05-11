// GET /api/user-profile?email=<email>
// Returns the Supabase user_profiles row for the given email.
//
// Auth model (2026-05-11 C2 audit fix):
//   - If the request carries an authenticated Supabase session, the
//     session email must match the requested email. Closes the
//     enumeration vector for logged-in users.
//   - If no session is present, fall back to the legacy email-only
//     lookup so the "email-gate visitor returns on a new device"
//     flow keeps working. This path is rate-limited per IP and
//     should be replaced with an emailed bearer token once Upstash
//     is wired (tracked in tasks/api-auth-audit-2026-05-11.md).
//
// A valid-format email that has no matching profile returns 404.

import { NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/supabase/user-profiles';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAuthUser } from '@/lib/api/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-IP rate limit for unauthenticated lookups. In-memory: lost on
// cold start, not shared across regions. Best-effort deterrent, not a
// hard cap. The proper fix is Upstash sliding-window via
// @upstash/ratelimit; until then this raises the bar enough that
// casual enumeration is impractical.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestLog = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (requestLog.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) return false;
  recent.push(now);
  requestLog.set(ip, recent);
  return true;
}

function getRequestIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim() ?? '';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const sessionUser = await getAuthUser();
  if (sessionUser) {
    // Authenticated path: session email must match requested email.
    if (sessionUser.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
  } else {
    // Unauthenticated fallback: rate-limited by IP. Documented residual
    // risk until Upstash lands.
    const ip = getRequestIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again in a minute.' },
        { status: 429 },
      );
    }
  }

  try {
    const profile = await getProfileByEmail(email);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }
    return NextResponse.json(profile, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[user-profile] fetch error', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
