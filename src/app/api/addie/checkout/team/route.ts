// POST /api/addie/checkout/team — $199/seat × N (N≥10). Auth Spec §6.1.

import { NextResponse, type NextRequest } from 'next/server';
import { MIN_TEAM_SEATS, createTeamCheckout } from '@/lib/addie/stripe/checkout';
import { isValidEmail } from '@/lib/addie/supabase/service';
import { emit } from '@/lib/addie/events/emit';
import { readAnonSession } from '@/lib/addie/auth/anonSession';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';

export const runtime = 'nodejs';

interface Body {
  email?: unknown;
  seats?: unknown;
  team_name?: unknown;
  success_url?: unknown;
  cancel_url?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-checkout-team',
    limit: 10,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  const seats = Number(body.seats);
  if (!Number.isInteger(seats) || seats < MIN_TEAM_SEATS) {
    return NextResponse.json(
      { error: 'invalid_seats', detail: `seats must be an integer >= ${MIN_TEAM_SEATS}` },
      { status: 400 },
    );
  }
  const team_name =
    typeof body.team_name === 'string' && body.team_name.trim().length > 0
      ? body.team_name.trim().slice(0, 200)
      : `${body.email} team`;

  try {
    const session = await createTeamCheckout({
      email: body.email as string,
      seats,
      team_name,
      success_url: typeof body.success_url === 'string' ? body.success_url : undefined,
      cancel_url: typeof body.cancel_url === 'string' ? body.cancel_url : undefined,
    });
    await emit({
      action: 'checkout_started',
      anon_session_id: readAnonSession(req).id,
      object_type: 'checkout_session',
      object_id: session.id,
      payload: { product: 'foundation_team_seat', seats, team_name, email: body.email },
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/checkout/team] failed:', message);
    return NextResponse.json({ error: 'checkout_failed', detail: message }, { status: 500 });
  }
}
