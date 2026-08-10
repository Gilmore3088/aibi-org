// Single front door for lead capture.
//
// Every capture path (assessment, prompt-cards, resource-gate, inquiry) calls
// this so the email system (MailerLite) and the database (Supabase `leads`)
// can never drift apart again. It:
//   1. Syncs the subscriber to the right MailerLite group with context fields
//      that ACTUALLY exist in the account (lead_source_path / lead_source /
//      requested_artifact / lead_role / company) — the old code sent fields
//      MailerLite silently dropped.
//   2. Upserts the canonical Supabase `leads` row, recording whether the
//      MailerLite sync landed.
//
// Both sides are best-effort and independently logged: one failing never
// blocks the caller, but — unlike before — a MailerLite-only or Supabase-only
// outcome is RECORDED, not silently lost.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { subscribeToGroup } from '@/lib/mailerlite';
import { resourceCategoryForSlug } from '@/lib/mailerlite/resource-category';

export type LeadSourceType = 'assessment' | 'prompt-cards' | 'resource-gate' | 'inquiry';

export type LeadDeliveryStatus = 'unknown' | 'sent' | 'delivered' | 'bounced' | 'complained';

export interface RecordLeadInput {
  readonly email: string;
  readonly source: LeadSourceType;
  readonly requestedArtifact?: string | null;
  readonly role?: string | null;
  readonly institution?: string | null;
  /** Campaign / lead-source label passed by the gate. */
  readonly leadSource?: string | null;
  readonly firstName?: string | null;
  /** Defaults to true. When false, the lead is recorded but NOT added to nurture. */
  readonly marketingOptIn?: boolean;
  readonly deliveryStatus?: LeadDeliveryStatus;
  readonly metadata?: Record<string, unknown>;
  /** Override the MailerLite group; otherwise resolved from source. */
  readonly mailerliteGroupId?: string;
  /**
   * Skip the MailerLite sync (still records the canonical row). Use when the
   * caller already handles MailerLite itself — e.g. the assessment path does
   * tier-group routing via tagAssessmentTier and must not double-subscribe.
   */
  readonly syncMailerlite?: boolean;
}

export interface RecordLeadResult {
  readonly persisted: boolean;
  readonly mailerlite: 'subscribed' | 'skipped' | 'failed';
  readonly subscriberId?: string;
}

function groupForSource(source: LeadSourceType): string | undefined {
  const assessment = process.env.MAILERLITE_GROUP_ID_ASSESSMENT;
  switch (source) {
    case 'assessment':
      return assessment;
    case 'inquiry':
      return process.env.MAILERLITE_GROUP_ID_PLAYBOOK ?? assessment;
    case 'resource-gate':
    case 'prompt-cards':
    default:
      // Dedicated Resource Library group; fall back to assessment if the env
      // var isn't set yet so capture never silently drops mid-rollout.
      return process.env.MAILERLITE_GROUP_ID_RESOURCES ?? assessment;
  }
}

export async function recordLead(input: RecordLeadInput): Promise<RecordLeadResult> {
  const email = input.email.trim().toLowerCase();
  const marketingOptIn = input.marketingOptIn ?? true;

  // 1) MailerLite sync (only when opted in to nurture).
  let mailerlite: RecordLeadResult['mailerlite'] = 'skipped';
  let subscriberId: string | undefined;
  if (marketingOptIn && (input.syncMailerlite ?? true)) {
    // resource_category drives the five resource nurture segments; null for
    // resources outside those tracks (they stay on the generic library path).
    const resourceCategory = resourceCategoryForSlug(input.requestedArtifact);
    const fields: Record<string, string | number | boolean | null> = {
      lead_source_path: input.source,
      ...(input.leadSource ? { lead_source: input.leadSource } : {}),
      ...(input.requestedArtifact ? { requested_artifact: input.requestedArtifact } : {}),
      ...(resourceCategory ? { resource_category: resourceCategory } : {}),
      ...(input.role ? { lead_role: input.role } : {}),
      ...(input.institution ? { company: input.institution } : {}),
    };
    const res = await subscribeToGroup(
      { email, ...(input.firstName ? { firstName: input.firstName } : {}), fields },
      input.mailerliteGroupId ?? groupForSource(input.source),
    ).catch((err) => {
      console.warn('[recordLead] mailerlite error', err);
      return { status: 'failed' as const };
    });
    mailerlite = res.status === 'subscribed' ? 'subscribed' : res.status === 'failed' ? 'failed' : 'skipped';
    if ('subscriberId' in res && res.subscriberId) subscriberId = res.subscriberId;
  }

  // 2) Canonical Supabase row. Omit null/undefined so a later capture never
  // clobbers richer existing data (e.g. a resource download after an
  // assessment must not null the stored role). Only flip mailerlite_synced to
  // true — never un-flag a previously synced lead on a transient failure.
  let persisted = false;
  if (isSupabaseConfigured()) {
    const row: Record<string, unknown> = {
      email,
      source: input.source,
      marketing_opt_in: marketingOptIn,
      updated_at: new Date().toISOString(),
    };
    if (input.requestedArtifact) row.requested_artifact = input.requestedArtifact;
    if (input.role) row.role = input.role;
    if (input.institution) row.institution = input.institution;
    if (input.leadSource) row.lead_source = input.leadSource;
    if (input.deliveryStatus) row.delivery_status = input.deliveryStatus;
    if (mailerlite === 'subscribed') row.mailerlite_synced = true;
    if (subscriberId) row.mailerlite_subscriber_id = subscriberId;
    if (input.metadata) row.metadata = input.metadata;

    const client = createServiceRoleClient();
    const { error } = await client.from('leads').upsert(row, { onConflict: 'email' });
    if (error) {
      console.error('[recordLead] supabase upsert failed:', error.message);
    } else {
      persisted = true;
    }
  }

  return { persisted, mailerlite, ...(subscriberId ? { subscriberId } : {}) };
}
