// POST /api/addie/team/seats/invite — admin only. Auth Spec §7.2.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { inviteSeats } from '@/lib/addie/team/seats';

export const runtime = 'nodejs';

interface Body {
  team_id?: unknown;
  emails?: unknown;
}

const MAX_EMAILS_PER_REQUEST = 100;

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
  if (typeof body.team_id !== 'string' || body.team_id.length === 0) {
    return NextResponse.json({ error: 'team_id_required' }, { status: 400 });
  }
  if (!Array.isArray(body.emails) || body.emails.length === 0) {
    return NextResponse.json({ error: 'emails_required' }, { status: 400 });
  }
  if (body.emails.length > MAX_EMAILS_PER_REQUEST) {
    return NextResponse.json(
      { error: 'too_many_emails', detail: `max ${MAX_EMAILS_PER_REQUEST} per request` },
      { status: 400 },
    );
  }
  const emails = body.emails.filter((e): e is string => typeof e === 'string');

  try {
    const result = await inviteSeats({
      team_id: body.team_id,
      admin_user_id: userRes.user.id,
      emails,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const status = /forbidden|not team admin/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: 'invite_failed', detail: message }, { status });
  }
}
