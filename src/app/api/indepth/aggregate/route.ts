// GET /api/indepth/aggregate?cohortId=...
//
// Returns the anonymized aggregate report for an institution leader.
// Auth-gated: caller must be the leader_user_id bound to the leader row
// of the cohort. All anonymization rules live in computeAggregate
// (pure-logic, well-tested). This route only loads rows and delegates.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  createServiceRoleClient,
} from '@/lib/supabase/client';
import { computeAggregate } from '@/lib/indepth/aggregate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cohortId =
    url.searchParams.get('cohortId') ?? url.searchParams.get('institutionId');

  if (!cohortId) {
    return NextResponse.json({ error: 'cohortId required' }, { status: 400 });
  }

  // 1. Auth — confirm a logged-in user
  const supabaseAuth = createServerClientWithCookies(cookies());
  const {
    data: { user },
    error: authErr,
  } = await supabaseAuth.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. Service role for the actual data load (RLS would also work; service
  //    role keeps the API simple and the leader-binding check explicit).
  const supabase = createServiceRoleClient();

  const { data: leader, error: leaderErr } = await supabase
    .from('indepth_takes')
    .select('id, institution_name, leader_user_id, seats_purchased')
    .eq('id', cohortId)
    .eq('is_leader', true)
    .maybeSingle();

  if (leaderErr) {
    return NextResponse.json({ error: 'load failed' }, { status: 500 });
  }
  if (!leader) {
    return NextResponse.json({ error: 'cohort not found' }, { status: 404 });
  }
  if (leader.leader_user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Pull every member of the cohort. The leader row carries cohort_id =
  // self.id after provisioning, so this query covers them too — and if
  // the leader took the assessment from their own row, their answers
  // contribute to the aggregate.
  const { data: takers, error: takersErr } = await supabase
    .from('indepth_takes')
    .select(
      'invite_email, invite_consumed_at, completed_at, score_total, score_per_dimension'
    )
    .eq('cohort_id', leader.id);

  if (takersErr) {
    return NextResponse.json({ error: 'load failed' }, { status: 500 });
  }

  const aggregate = computeAggregate({
    institutionName: leader.institution_name ?? '',
    seatsPurchased: leader.seats_purchased ?? 0,
    takers: takers ?? [],
  });

  return NextResponse.json(aggregate);
}
