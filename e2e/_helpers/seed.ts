// Test fixtures: seed indepth_takes rows directly via service role.
// Bypasses Stripe checkout. Each helper returns the fields a test needs
// to walk the magic-link path; cleanup is owner-keyed by stripe_session_id
// or cohort_id so reruns don't collide.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

function service(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('e2e: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function token(): string {
  return randomBytes(32).toString('base64url');
}

export interface SeededIndividual {
  readonly takerId: string;
  readonly inviteToken: string;
  readonly inviteEmail: string;
  readonly stripeSessionId: string;
}

export async function seedIndividualTaker(): Promise<SeededIndividual> {
  const supabase = service();
  const inviteToken = token();
  const inviteEmail = `e2e-individual-${Date.now()}@example.test`;
  const stripeSessionId = `cs_test_e2e_${Date.now()}`;

  const { data, error } = await supabase
    .from('indepth_takes')
    .insert({
      cohort_id: null,
      is_leader: false,
      invite_email: inviteEmail,
      invite_token: inviteToken,
      stripe_session_id: stripeSessionId,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`seedIndividualTaker failed: ${error?.message ?? 'no row'}`);
  }

  return { takerId: data.id, inviteToken, inviteEmail, stripeSessionId };
}

export interface SeededInvitee {
  readonly cohortId: string;
  readonly takerId: string;
  readonly inviteToken: string;
  readonly inviteEmail: string;
}

export async function seedInstitutionInvitee(): Promise<SeededInvitee> {
  const supabase = service();
  const stamp = Date.now();
  const leaderEmail = `e2e-leader-${stamp}@example.test`;
  const inviteEmail = `e2e-invitee-${stamp}@example.test`;
  const inviteToken = token();
  const leaderToken = token();

  // Insert leader row first; cohort_id self-points after the second update.
  const { data: leader, error: leaderErr } = await supabase
    .from('indepth_takes')
    .insert({
      is_leader: true,
      invite_email: leaderEmail,
      invite_token: leaderToken,
      institution_name: `E2E Bank ${stamp}`,
      leader_email: leaderEmail,
      seats_purchased: 10,
      amount_paid_cents: 79000,
      stripe_session_id: `cs_test_e2e_inst_${stamp}`,
    })
    .select('id')
    .single();

  if (leaderErr || !leader) {
    throw new Error(`seedLeader failed: ${leaderErr?.message ?? 'no row'}`);
  }

  await supabase
    .from('indepth_takes')
    .update({ cohort_id: leader.id })
    .eq('id', leader.id);

  // Now invitee row pointing at the leader.
  const { data: taker, error: takerErr } = await supabase
    .from('indepth_takes')
    .insert({
      cohort_id: leader.id,
      is_leader: false,
      invite_email: inviteEmail,
      invite_token: inviteToken,
      institution_name: `E2E Bank ${stamp}`,
      leader_email: leaderEmail,
    })
    .select('id')
    .single();

  if (takerErr || !taker) {
    throw new Error(`seedInvitee failed: ${takerErr?.message ?? 'no row'}`);
  }

  return { cohortId: leader.id, takerId: taker.id, inviteToken, inviteEmail };
}

export async function cleanupTaker(takerId: string): Promise<void> {
  const supabase = service();
  await supabase.from('indepth_takes').delete().eq('id', takerId);
}

export async function cleanupCohort(cohortId: string): Promise<void> {
  const supabase = service();
  // Delete invitees first, then leader.
  await supabase
    .from('indepth_takes')
    .delete()
    .eq('cohort_id', cohortId)
    .neq('id', cohortId);
  await supabase.from('indepth_takes').delete().eq('id', cohortId);
}
