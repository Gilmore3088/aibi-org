// POST /api/addie/gate/decline
// Auth Spec §4.3. Records the decision without persisting identity.
//
// Audit A22 (2026-05-24): the route now accepts an optional remindEmail
// in the body. When present, it is logged with the gate-decision event
// so the Day-11 nurture sequence has somewhere to land. The address is
// NOT persisted to user_profiles — it travels into the event payload
// and any future MailerLite handoff. No silent CRM creation.

import { NextResponse, type NextRequest } from 'next/server';
import { ensureAnonSession } from '@/lib/addie/auth/anonSession';
import { emit } from '@/lib/addie/events/emit';

export const runtime = 'nodejs';

interface DeclinePayload {
  remindEmail?: unknown;
}

// Minimal email shape gate — server-side check that we got an
// approximately-valid address. The MailerLite handoff does its own
// validation; this guard just keeps the event log clean.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  const anon = ensureAnonSession(req, res);
  let remindEmail: string | undefined;
  try {
    const body = (await req.json().catch(() => ({}))) as DeclinePayload;
    if (typeof body.remindEmail === 'string') {
      const trimmed = body.remindEmail.trim();
      if (trimmed.length > 0 && trimmed.length <= 254 && EMAIL_PATTERN.test(trimmed)) {
        remindEmail = trimmed.toLowerCase();
      }
    }
  } catch {
    /* swallow — bad json reads as no remind email */
  }
  await emit({
    action: 'gate_decision',
    anon_session_id: anon.id,
    payload: {
      fork: 'decline',
      ...(remindEmail ? { remindEmail } : {}),
    },
  });
  return NextResponse.json({ ok: true }, { headers: res.headers });
}
