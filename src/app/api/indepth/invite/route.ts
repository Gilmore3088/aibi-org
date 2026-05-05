// POST /api/indepth/invite — leader-only invite endpoint.
//
// The institution leader (the buyer of a 10+ seat indepth_assessment_institutions
// row) calls this to send magic-link invitations to staff. On the first call,
// if leader_user_id is null and the authenticated user's email matches
// leader_email, the row is bound to that user.id. Subsequent calls require the
// caller to BE that user.
//
// Per-email work is best-effort: a row insert that hits the
// (institution_id, invite_email) unique constraint reports "already invited"
// in the errors[] payload rather than failing the whole request.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  createServiceRoleClient,
} from '@/lib/supabase/client';
import { generateInviteToken } from '@/lib/indepth/tokens';
import { sendIndepthInstitutionInvite } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteError {
  email: string;
  reason: string;
}

export async function POST(request: Request): Promise<Response> {
  // 1. Auth
  const supabaseAuth = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error: authErr,
  } = await supabaseAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. Body validation
  const body = (await request.json().catch(() => null)) as
    | { institutionId?: unknown; emails?: unknown }
    | null;
  if (!body || typeof body.institutionId !== 'string') {
    return NextResponse.json(
      { error: 'institutionId required' },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.emails) || body.emails.length === 0) {
    return NextResponse.json(
      { error: 'emails required (non-empty array)' },
      { status: 400 },
    );
  }

  const institutionId = body.institutionId;
  const emails = body.emails as unknown[];
  const supabase = createServiceRoleClient();

  // 3. Load institution row
  const { data: inst, error: instErr } = await supabase
    .from('indepth_assessment_institutions')
    .select('id, institution_name, leader_user_id, leader_email, seats_purchased')
    .eq('id', institutionId)
    .maybeSingle();

  if (instErr || !inst) {
    return NextResponse.json({ error: 'institution not found' }, { status: 404 });
  }

  // 4. Ownership check / first-call binding
  if (inst.leader_user_id && inst.leader_user_id !== user.id) {
    return NextResponse.json(
      { error: 'forbidden — not the institution leader' },
      { status: 403 },
    );
  }
  if (!inst.leader_user_id) {
    if (inst.leader_email !== user.email) {
      return NextResponse.json(
        { error: 'forbidden — leader email mismatch' },
        { status: 403 },
      );
    }
    const { error: bindErr } = await supabase
      .from('indepth_assessment_institutions')
      .update({ leader_user_id: user.id })
      .eq('id', inst.id);
    if (bindErr) {
      return NextResponse.json(
        { error: 'failed to bind leader' },
        { status: 500 },
      );
    }
  }

  // 5. Seat capacity
  const { count: usedCount } = await supabase
    .from('indepth_assessment_takers')
    .select('id', { count: 'exact', head: true })
    .eq('institution_id', inst.id);

  const remaining = inst.seats_purchased - (usedCount ?? 0);
  if (emails.length > remaining) {
    return NextResponse.json(
      {
        error: `too many emails: ${emails.length} requested but only ${remaining} seats remaining`,
      },
      { status: 400 },
    );
  }

  // 6. Per-email: validate, insert, send
  const created: string[] = [];
  const errors: InviteError[] = [];
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';
  const leaderName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    'Your colleague';

  for (const rawEmail of emails) {
    const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
    const displayEmail = typeof rawEmail === 'string' ? rawEmail : String(rawEmail);
    if (!email || !EMAIL_RE.test(email)) {
      errors.push({ email: displayEmail, reason: 'invalid email format' });
      continue;
    }

    const token = generateInviteToken();
    const { error: insertErr } = await supabase
      .from('indepth_assessment_takers')
      .insert({
        institution_id: inst.id,
        invite_email: email,
        invite_token: token,
      });

    if (insertErr) {
      const code = (insertErr as { code?: string }).code;
      if (code === '23505') {
        errors.push({ email, reason: 'already invited' });
      } else {
        errors.push({ email, reason: 'database error' });
      }
      continue;
    }

    try {
      await sendIndepthInstitutionInvite({
        inviteeEmail: email,
        leaderName,
        institutionName: inst.institution_name,
        takeUrl: `${origin}/assessment/in-depth/take?token=${token}`,
      });
    } catch {
      // Non-fatal: the row exists; the leader can re-trigger send later.
    }
    created.push(email);
  }

  return NextResponse.json({ created: created.length, errors });
}
