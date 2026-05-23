// POST /api/addie/team/seats/revoke — admin only. Auth Spec §7.4.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { revokeSeat } from '@/lib/addie/team/seats';

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
  if (userErr || !userRes?.user) {
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
    await revokeSeat({
      seat_id: body.seat_id,
      admin_user_id: userRes.user.id,
    });
    return NextResponse.json({ revoked: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const status = /forbidden|not team admin/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: 'revoke_failed', detail: message }, { status });
  }
}
