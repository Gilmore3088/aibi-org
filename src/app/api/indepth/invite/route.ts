// POST /api/indepth/invite — leader-only invite endpoint.
//
// The institution leader (the buyer who triggered an `is_leader=true`
// row in indepth_takes) calls this to send magic-link invitations to
// staff. On the first call, if leader_user_id is null and the
// authenticated user's email matches leader_email, the leader row + any
// existing invitee rows in the cohort are bound to that user.id.
//
// Per-email work is best-effort: an insert that hits the
// (cohort_id, invite_email) unique constraint reports "already invited"
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

  // 2. Body validation. `cohortId` is the new canonical name; `institutionId`
  //    is accepted as an alias for older clients that haven't been
  //    redeployed yet.
  const body = (await request.json().catch(() => null)) as
    | { cohortId?: unknown; institutionId?: unknown; emails?: unknown }
    | null;
  const cohortIdRaw =
    typeof body?.cohortId === 'string'
      ? body.cohortId
      : typeof body?.institutionId === 'string'
        ? body.institutionId
        : null;
  if (!cohortIdRaw) {
    return NextResponse.json(
      { error: 'cohortId required' },
      { status: 400 },
    );
  }
  if (!Array.isArray(body?.emails) || body.emails.length === 0) {
    return NextResponse.json(
      { error: 'emails required (non-empty array)' },
      { status: 400 },
    );
  }

  const cohortId = cohortIdRaw;
  const emails = body.emails as unknown[];
  const supabase = createServiceRoleClient();

  // 3. Load leader row (cohort owner)
  const { data: leader, error: leaderErr } = await supabase
    .from('indepth_takes')
    .select('id, institution_name, leader_user_id, leader_email, seats_purchased')
    .eq('id', cohortId)
    .eq('is_leader', true)
    .maybeSingle();

  if (leaderErr || !leader) {
    return NextResponse.json({ error: 'cohort not found' }, { status: 404 });
  }

  // 4. Ownership check / first-call binding
  if (leader.leader_user_id && leader.leader_user_id !== user.id) {
    return NextResponse.json(
      { error: 'forbidden — not the cohort leader' },
      { status: 403 },
    );
  }
  if (!leader.leader_user_id) {
    if (leader.leader_email !== user.email) {
      return NextResponse.json(
        { error: 'forbidden — leader email mismatch' },
        { status: 403 },
      );
    }
    // Bind on the leader row AND on any pre-existing invitee rows that
    // already point at this cohort (denormalized leader_user_id).
    const { error: bindErr } = await supabase
      .from('indepth_takes')
      .update({ leader_user_id: user.id })
      .eq('cohort_id', leader.id);
    if (bindErr) {
      return NextResponse.json(
        { error: 'failed to bind leader' },
        { status: 500 },
      );
    }
    // The leader row itself has cohort_id=self after backfill/provisioning,
    // so the previous update covered it. Belt-and-braces:
    await supabase
      .from('indepth_takes')
      .update({ leader_user_id: user.id })
      .eq('id', leader.id);
  }

  // 5. Seat capacity (count invitee rows; leader's own row counts too if
  //    they intend to take it themselves)
  const { count: usedCount } = await supabase
    .from('indepth_takes')
    .select('id', { count: 'exact', head: true })
    .eq('cohort_id', leader.id);

  // The leader row itself counts as one of the seats — they can take their
  // own assessment from it. Subtract 1 from used for the seat math? No:
  // seats_purchased includes the leader. If a leader bought 10 seats,
  // they get 10 takers including themselves.
  const remaining = (leader.seats_purchased ?? 0) - (usedCount ?? 0);
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
      .from('indepth_takes')
      .insert({
        cohort_id: leader.id,
        is_leader: false,
        invite_email: email,
        invite_token: token,
        institution_name: leader.institution_name,
        leader_email: leader.leader_email,
        leader_user_id: user.id,
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
        institutionName: leader.institution_name ?? '',
        takeUrl: `${origin}/assessment/in-depth/take?token=${token}`,
      });
    } catch {
      // Non-fatal: the row exists; the leader can re-trigger send later.
    }
    created.push(email);
  }

  return NextResponse.json({ created: created.length, errors });
}
