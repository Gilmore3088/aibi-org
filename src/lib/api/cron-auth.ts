import { NextResponse } from 'next/server';

// Shared Vercel-cron authorization. Consolidates the block copy-pasted across
// the cron routes. Fails CLOSED when CRON_SECRET is unset — an empty Bearer
// token must never authenticate. `SKIP_CRON_AUTH=true` bypasses (dev only;
// never set in production).
//
// Note: /api/ops/alert-test intentionally uses a different contract (no SKIP
// bypass, 503 when the secret is unset) and does NOT use this helper.

export function isCronAuthorized(request: Request): boolean {
  if (process.env.SKIP_CRON_AUTH === 'true') return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/** Returns a 401 response when unauthorized, or null when the caller may proceed. */
export function assertCronAuth(request: Request): NextResponse | null {
  return isCronAuthorized(request)
    ? null
    : NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
