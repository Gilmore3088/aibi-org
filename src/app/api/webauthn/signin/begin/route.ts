// POST /api/webauthn/signin/begin — issues WebAuthn authentication options.
// Anonymous endpoint (no session required) — that's the point: the
// caller is trying to sign in.
//
// Body: { email?: string } — optional. When supplied, server scopes
//   allowCredentials to the user's enrolled keys, speeding up the
//   device picker. When omitted, falls back to the discoverable-
//   credential flow (authenticator surfaces all matching passkeys).

import { NextRequest, NextResponse } from 'next/server';
import { beginAuthentication } from '@/lib/webauthn/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email =
    typeof body.email === 'string' && EMAIL_RE.test(body.email)
      ? body.email.trim().toLowerCase()
      : undefined;

  const options = await beginAuthentication({ email });
  return NextResponse.json(options);
}
