// POST /api/addie/team/seats/:seatId/resend
// Re-fires an invitation email for an outstanding seat. Admin-only.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { resendSeatInvitation } from '@/lib/addie/team/seats';

export const runtime = 'nodejs';

interface RouteParams {
  readonly params: { readonly seatId: string };
}

export async function POST(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'auth_unconfigured' }, { status: 503 });
  }
  const supabase = createServerClientWithCookies(cookies());
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const seatId = params?.seatId;
  if (typeof seatId !== 'string' || seatId.length === 0) {
    return NextResponse.json({ error: 'seat_id_required' }, { status: 400 });
  }

  try {
    const result = await resendSeatInvitation({
      seat_id: seatId,
      admin_user_id: userRes.user.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const status = /forbidden|not team admin/i.test(message)
      ? 403
      : /not found/i.test(message)
        ? 404
        : 400;
    return NextResponse.json({ error: 'resend_failed', detail: message }, { status });
  }
}
