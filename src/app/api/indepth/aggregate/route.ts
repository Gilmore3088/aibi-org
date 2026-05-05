// GET /api/indepth/aggregate?institutionId=...
//
// Returns the anonymized aggregate report for an institution leader.
// Auth-gated: caller must be the leader_user_id bound to the institution.
// All anonymization rules live in computeAggregate (pure-logic, well-tested).
// This route only loads rows and delegates.

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
  const institutionId = url.searchParams.get('institutionId');

  if (!institutionId) {
    return NextResponse.json(
      { error: 'institutionId required' },
      { status: 400 }
    );
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

  const { data: inst, error: instErr } = await supabase
    .from('indepth_assessment_institutions')
    .select('id, institution_name, leader_user_id, seats_purchased')
    .eq('id', institutionId)
    .maybeSingle();

  if (instErr) {
    return NextResponse.json({ error: 'load failed' }, { status: 500 });
  }
  if (!inst) {
    return NextResponse.json(
      { error: 'institution not found' },
      { status: 404 }
    );
  }
  if (inst.leader_user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { data: takers, error: takersErr } = await supabase
    .from('indepth_assessment_takers')
    .select(
      'invite_email, invite_consumed_at, completed_at, score_total, score_per_dimension'
    )
    .eq('institution_id', institutionId);

  if (takersErr) {
    return NextResponse.json({ error: 'load failed' }, { status: 500 });
  }

  const aggregate = computeAggregate({
    institutionName: inst.institution_name,
    seatsPurchased: inst.seats_purchased,
    takers: takers ?? [],
  });

  return NextResponse.json(aggregate);
}
