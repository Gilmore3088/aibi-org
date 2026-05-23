// POST /api/addie/gate/decline
// Auth Spec §4.3. Records the decision without persisting identity.

import { NextResponse, type NextRequest } from 'next/server';
import { ensureAnonSession } from '@/lib/addie/auth/anonSession';
import { emit } from '@/lib/addie/events/emit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  const anon = ensureAnonSession(req, res);
  await emit({
    action: 'gate_decision',
    anon_session_id: anon.id,
    payload: { fork: 'decline' },
  });
  return NextResponse.json({ ok: true }, { headers: res.headers });
}
