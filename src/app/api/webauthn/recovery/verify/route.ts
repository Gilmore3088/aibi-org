// POST /api/webauthn/recovery/verify — "lost my passkey" escape hatch.
// Accepts { email, code }; on success, marks the code consumed and
// issues a Supabase cookie session for the matched user. The next thing
// the client should do is push them into /auth/passkey/enroll to add a
// new credential for the device they're recovering from.
//
// Anonymous endpoint (no session required) — the email + code IS the
// auth factor here. Rate-limited to slow down brute-force.

import { NextRequest, NextResponse } from 'next/server';
import { verifyRecoveryCode } from '@/lib/webauthn/recovery-codes';
import { issueSessionForEmail } from '@/lib/webauthn/issue-session';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 10 attempts per IP per hour. Enough for a legitimate "I'm typing
  // it wrong" user; nowhere near enough for brute-force given 80 bits
  // of entropy per code.
  const limited = await rateLimitOrFail({
    key: 'webauthn-recovery',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; code?: unknown }
    | null;
  if (
    !body ||
    typeof body.email !== 'string' ||
    !EMAIL_RE.test(body.email) ||
    typeof body.code !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const verifyResult = await verifyRecoveryCode(body.email, body.code);
  if (!verifyResult.ok || !verifyResult.email) {
    // Same error string for "no such email" and "bad code" — don't
    // leak which accounts exist.
    return NextResponse.json(
      { error: 'Code not recognized.' },
      { status: 401 },
    );
  }

  const sessionResult = await issueSessionForEmail(verifyResult.email);
  if (!sessionResult.ok) {
    return NextResponse.json(
      { error: sessionResult.error ?? 'Could not issue session.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, email: verifyResult.email });
}
