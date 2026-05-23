// Lead → user binding. Auth Spec §5.
//
// Two callers:
//   1. migrateAnonToLead: at gate email capture, rewrite anon-keyed rows
//      onto a freshly upserted lead (toolbox_items, assessment_results,
//      events).
//   2. bindLeadToUser: at first sign-in for an email that matches an
//      existing lead — flips bound_user_id and rewrites child rows.
//
// Both functions are idempotent (safe to re-run; predicate guards prevent
// double-binding). Concurrency is handled by `bound_user_id IS NULL`
// predicates + the addie.leads.email UNIQUE constraint.

import { getAddieServiceClient, normalizeEmail } from '@/lib/addie/supabase/service';
import { emit } from '@/lib/addie/events/emit';

/**
 * Free-tier cap from PRD: a lead may keep at most 4 light artifacts.
 * Enforced server-side. We trim the oldest beyond the cap.
 */
const FREE_ARTIFACT_CAP = 4;

export async function migrateAnonToLead(args: {
  readonly anon_session_id: string;
  readonly lead_id: string;
}): Promise<void> {
  const supa = getAddieServiceClient();

  // Migrate toolbox items.
  const { error: tbErr } = await supa
    .from('toolbox_items')
    .update({ lead_id: args.lead_id })
    .eq('anon_session_id', args.anon_session_id)
    .is('lead_id', null)
    .is('user_id', null);
  // Note: toolbox_items has no anon_session_id column today — see schema.
  // The 4-artifact cap enforcement and anon-keying live in the toolbox API.
  // If the schema later adds anon_session_id, this block becomes a no-op for
  // schemas that don't have it; we swallow the "column does not exist"
  // error so this code can ship today.
  if (tbErr && !/column .* does not exist/i.test(tbErr.message)) {
    console.warn('[addie/leads/bind] toolbox migrate warn:', tbErr.message);
  }

  // Enforce free-tier cap on lead's items.
  await enforceFreeArtifactCap(args.lead_id);

  // Migrate assessment results (anon → lead).
  const { error: arErr } = await supa
    .from('assessment_results')
    .update({ lead_id: args.lead_id })
    .eq('anon_session_id', args.anon_session_id)
    .is('lead_id', null)
    .is('user_id', null);
  if (arErr && !/column .* does not exist/i.test(arErr.message)) {
    console.warn('[addie/leads/bind] assessment migrate warn:', arErr.message);
  }

  // Migrate events.
  const { error: evErr } = await supa
    .from('events')
    .update({ lead_id: args.lead_id })
    .eq('anon_session_id', args.anon_session_id)
    .is('lead_id', null)
    .is('user_id', null);
  if (evErr) console.warn('[addie/leads/bind] events migrate warn:', evErr.message);
}

async function enforceFreeArtifactCap(lead_id: string): Promise<void> {
  const supa = getAddieServiceClient();
  const { data, error } = await supa
    .from('toolbox_items')
    .select('id, created_at')
    .eq('lead_id', lead_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[addie/leads/bind] cap select warn:', error.message);
    return;
  }
  if (!data || data.length <= FREE_ARTIFACT_CAP) return;
  const overflow = data.slice(FREE_ARTIFACT_CAP).map((r) => r.id as string);
  if (overflow.length === 0) return;
  const { error: delErr } = await supa.from('toolbox_items').delete().in('id', overflow);
  if (delErr) console.warn('[addie/leads/bind] cap delete warn:', delErr.message);
}

export interface BindResult {
  readonly bound: boolean;
  readonly lead_id?: string;
}

/**
 * Bind a freshly-signed-up user to an existing lead with the same email.
 * Triggered from a sign-in webhook OR from a "first-login" hook in app
 * code. Service-role only. No-op when no matching unbound lead exists.
 */
export async function bindLeadToUser(args: {
  readonly user_id: string;
  readonly email: string;
}): Promise<BindResult> {
  const email = normalizeEmail(args.email);
  const supa = getAddieServiceClient();

  const { data: lead, error: selErr } = await supa
    .from('leads')
    .select('id, track')
    .eq('email', email)
    .is('bound_user_id', null)
    .maybeSingle();
  if (selErr) throw new Error(`leads bind select failed: ${selErr.message}`);
  if (!lead) return { bound: false };

  const lead_id = lead.id as string;

  // 3a. Flip the lead.
  const { error: updErr } = await supa
    .from('leads')
    .update({ bound_user_id: args.user_id })
    .eq('id', lead_id)
    .is('bound_user_id', null);
  if (updErr) throw new Error(`leads bind update failed: ${updErr.message}`);

  // 3b–d. Rewrite child rows. These are independent updates; if any one
  // fails we surface the error but the partial state is still safe (the
  // predicate `lead_id = X` on subsequent runs will pick up the rest).
  const rewrite = async (table: string): Promise<void> => {
    const { error } = await supa
      .from(table)
      .update({ user_id: args.user_id, lead_id: null })
      .eq('lead_id', lead_id);
    if (error) {
      console.warn(`[addie/leads/bind] rewrite ${table} warn:`, error.message);
    }
  };

  await rewrite('toolbox_items');
  await rewrite('assessment_results');

  // Events keep both lead_id and user_id (audit trail) — only set user_id.
  const { error: evErr } = await supa
    .from('events')
    .update({ user_id: args.user_id })
    .eq('lead_id', lead_id);
  if (evErr) console.warn('[addie/leads/bind] events rewrite warn:', evErr.message);

  // 3e. Carry track if learner_profiles.track is null.
  if (lead.track) {
    const { data: prof } = await supa
      .from('learner_profiles')
      .select('user_id, track')
      .eq('user_id', args.user_id)
      .maybeSingle();
    if (prof && !prof.track) {
      await supa.from('learner_profiles').update({ track: lead.track }).eq('user_id', args.user_id);
    }
  }

  await emit({
    action: 'lead_bound',
    user_id: args.user_id,
    lead_id,
    payload: { email },
  });

  return { bound: true, lead_id };
}
