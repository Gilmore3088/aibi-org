// POST /api/indepth/resend — re-send an invite for an existing taker row.
//
// The leader calls this from the dashboard's per-row "Resend" button when a
// staffer cannot find their original invite email. It looks up the existing
// invite_token (no new row) and triggers the same Resend email used at first
// invite. Auth is identical to /api/indepth/invite: caller must be the bound
// leader of the institution.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  createServiceRoleClient,
} from '@/lib/supabase/client';
import { sendIndepthInstitutionInvite } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  const supabaseAuth = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error: authErr,
  } = await supabaseAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { institutionId?: unknown; email?: unknown }
    | null;
  if (!body || typeof body.institutionId !== 'string') {
    return NextResponse.json({ error: 'institutionId required' }, { status: 400 });
  }
  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email.trim())) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  const institutionId = body.institutionId;
  const email = body.email.trim();
  const supabase = createServiceRoleClient();

  const { data: inst } = await supabase
    .from('indepth_assessment_institutions')
    .select('id, institution_name, leader_user_id')
    .eq('id', institutionId)
    .maybeSingle();

  if (!inst) {
    return NextResponse.json({ error: 'institution not found' }, { status: 404 });
  }
  if (inst.leader_user_id !== user.id) {
    return NextResponse.json(
      { error: 'forbidden — not the institution leader' },
      { status: 403 },
    );
  }

  const { data: taker } = await supabase
    .from('indepth_assessment_takers')
    .select('invite_token, completed_at')
    .eq('institution_id', inst.id)
    .eq('invite_email', email)
    .maybeSingle();

  if (!taker) {
    return NextResponse.json({ error: 'invitee not found' }, { status: 404 });
  }
  if (taker.completed_at) {
    return NextResponse.json({ error: 'already completed' }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';
  const leaderName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    'Your colleague';

  try {
    await sendIndepthInstitutionInvite({
      inviteeEmail: email,
      leaderName,
      institutionName: inst.institution_name,
      takeUrl: `${origin}/assessment/in-depth/take?token=${taker.invite_token}`,
    });
  } catch {
    return NextResponse.json({ error: 'email send failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
