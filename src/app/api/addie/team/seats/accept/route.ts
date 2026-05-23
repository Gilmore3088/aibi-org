// POST /api/addie/team/seats/accept
//
// Invitee accepts an outstanding seat. Auth Spec §7.3.
// Caller must be signed in; seat.invited_email must match user's email.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { acceptSeat } from '@/lib/addie/team/seats';

export const runtime = 'nodejs';

interface Body {
  seat_id?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'auth_unconfigured' }, { status: 503 });
  }
  const supabase = createServerClientWithCookies(cookies());
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user || !userRes.user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (typeof body.seat_id !== 'string' || body.seat_id.length === 0) {
    return NextResponse.json({ error: 'seat_id_required' }, { status: 400 });
  }

  try {
    const result = await acceptSeat({
      seat_id: body.seat_id,
      user_id: userRes.user.id,
      user_email: userRes.user.email,
    });
    if (!result.accepted) {
      const status = result.reason === 'email_mismatch' ? 403 : 400;
      return NextResponse.json({ error: result.reason ?? 'accept_failed' }, { status });
    }
    return NextResponse.json({ accepted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: 'accept_failed', detail: message }, { status: 500 });
  }
}
