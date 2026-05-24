// POST /api/webauthn/signin/complete — verifies the assertion produced
// by navigator.credentials.get and, on success, issues a Supabase
// cookie session for the matched user.
//
// Body: { response: AuthenticationResponseJSON }
// Response: { ok: true, email } or { error }
//
// Magic-link generation is used internally by issueSessionForEmail to
// bootstrap the session. The magic link URL is never sent to the user —
// see lib/webauthn/issue-session.ts.

import { NextRequest, NextResponse } from 'next/server';
import { completeAuthentication } from '@/lib/webauthn/server';
import { issueSessionForEmail } from '@/lib/webauthn/issue-session';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as
    | { response?: AuthenticationResponseJSON }
    | null;
  if (!body?.response) {
    return NextResponse.json({ error: 'Missing response.' }, { status: 400 });
  }

  const originOverride = request.headers.get('origin') ?? undefined;

  const verifyResult = await completeAuthentication({
    response: body.response,
    originOverride,
    hostOverride: request.headers.get('host') ?? undefined,
  });

  if (!verifyResult.verified || !verifyResult.email) {
    return NextResponse.json(
      { error: verifyResult.error ?? 'Verification failed.' },
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
