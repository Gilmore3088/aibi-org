// Test fixtures: seed indepth_assessment rows directly via service role.
// Bypasses Stripe checkout. Each helper returns the fields a test needs
// to walk the magic-link path; cleanup is owner-keyed by stripe_session_id
// so reruns don't collide.

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
    .from('indepth_assessment_takers')
    .insert({
      institution_id: null,
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
  readonly institutionId: string;
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

  const { data: inst, error: instErr } = await supabase
    .from('indepth_assessment_institutions')
    .insert({
      institution_name: `E2E Bank ${stamp}`,
      leader_email: leaderEmail,
      seats_purchased: 10,
      amount_paid_cents: 79000,
      stripe_session_id: `cs_test_e2e_inst_${stamp}`,
    })
    .select('id')
    .single();

  if (instErr || !inst) {
    throw new Error(`seedInstitution failed: ${instErr?.message ?? 'no row'}`);
  }

  const { data: taker, error: takerErr } = await supabase
    .from('indepth_assessment_takers')
    .insert({
      institution_id: inst.id,
      invite_email: inviteEmail,
      invite_token: inviteToken,
    })
    .select('id')
    .single();

  if (takerErr || !taker) {
    throw new Error(`seedInvitee failed: ${takerErr?.message ?? 'no row'}`);
  }

  return { institutionId: inst.id, takerId: taker.id, inviteToken, inviteEmail };
}

export async function cleanupTaker(takerId: string): Promise<void> {
  const supabase = service();
  await supabase.from('indepth_assessment_takers').delete().eq('id', takerId);
}

export async function cleanupInstitution(institutionId: string): Promise<void> {
  const supabase = service();
  await supabase
    .from('indepth_assessment_takers')
    .delete()
    .eq('institution_id', institutionId);
  await supabase
    .from('indepth_assessment_institutions')
    .delete()
    .eq('id', institutionId);
}
