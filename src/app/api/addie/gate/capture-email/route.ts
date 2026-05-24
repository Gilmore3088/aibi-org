// POST /api/addie/gate/capture-email
// Auth Spec §4.2. Anon → lead transition.

import { NextResponse, type NextRequest } from 'next/server';
import { ensureAnonSession } from '@/lib/addie/auth/anonSession';
import { upsertLead, type Track } from '@/lib/addie/leads/upsert';
import { migrateAnonToLead } from '@/lib/addie/leads/bind';
import { isValidEmail } from '@/lib/addie/supabase/service';
import { emit } from '@/lib/addie/events/emit';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import { subscribeToGateEmail } from '@/lib/mailerlite';

export const runtime = 'nodejs';

interface Body {
  email?: unknown;
  marketing_opt_in?: unknown;
  track?: unknown;
}

const VALID_TRACKS: ReadonlySet<string> = new Set([
  'risk_compliance',
  'customer_facing',
  'back_office',
  'technical',
  'leadership',
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-capture-email',
    limit: 30,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  const marketing_opt_in = body.marketing_opt_in === true;
  const track =
    typeof body.track === 'string' && VALID_TRACKS.has(body.track)
      ? (body.track as Track)
      : null;

  // Prepare response now so we can set cookies (anon-session ensure).
  const res = NextResponse.json({ ok: true });
  const anon = ensureAnonSession(req, res);

  try {
    const lead = await upsertLead({
      email: body.email,
      source: 'gate',
      marketing_opt_in,
      track,
    });
    await migrateAnonToLead({
      anon_session_id: anon.id,
      lead_id: lead.id,
    });
    await emit({
      action: 'gate_decision',
      lead_id: lead.id,
      anon_session_id: anon.id,
      payload: { fork: 'email', tier: 'free', created: lead.created },
    });

    // Lifecycle trigger: dedicated gate-email nurture group. Best-effort —
    // failures are logged inside the adapter and do not block the response.
    // No-op when MAILERLITE_GROUP_ID_GATE_EMAIL is unset or SKIP_MAILERLITE=true.
    try {
      await subscribeToGateEmail({ email: body.email });
    } catch (err) {
      console.warn(
        '[addie/gate/capture-email] mailerlite gate-email sync failed:',
        err instanceof Error ? err.message : 'unknown',
      );
    }

    return NextResponse.json(
      { ok: true, lead_id: lead.id },
      { headers: res.headers },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/gate/capture-email] failed:', message);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
