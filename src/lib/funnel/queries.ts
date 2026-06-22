// Server-only readers for the derived funnel reporting views
// (funnel_scorecard, funnel_stage_distribution, funnel_contacts — migration
// 00049). The views are service-role only (REVOKEd from anon/authenticated),
// so every read goes through the service-role client.
//
// Never import this module in a Client Component — it uses the service role key.

import { createServiceRoleClient } from '@/lib/supabase/client';

export interface FunnelScorecardRow {
  metric_key: string;
  metric_label: string;
  sort_order: number;
  all_time: number;
  last_7d: number;
  last_24h: number;
}

export interface FunnelStageRow {
  lifecycle_stage: string;
  stage_rank: number;
  contacts: number;
  pct_of_contacts: number | null;
}

export interface FunnelContactRow {
  email: string;
  display_email: string;
  first_seen: string | null;
  last_seen: string | null;
  role: string | null;
  institution: string | null;
  readiness_tier_label: string | null;
  has_free_assessment: boolean;
  has_in_depth_purchase: boolean;
  has_in_depth_completed: boolean;
  has_foundation_purchase: boolean;
  has_certificate: boolean;
  products: string[];
  lifecycle_stage: string;
}

export async function getFunnelScorecard(): Promise<FunnelScorecardRow[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('funnel_scorecard')
    .select('metric_key, metric_label, sort_order, all_time, last_7d, last_24h')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`funnel_scorecard read failed: ${error.message}`);
  return (data ?? []) as FunnelScorecardRow[];
}

export async function getFunnelStageDistribution(): Promise<FunnelStageRow[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('funnel_stage_distribution')
    .select('lifecycle_stage, stage_rank, contacts, pct_of_contacts')
    .order('stage_rank', { ascending: true });
  if (error) throw new Error(`funnel_stage_distribution read failed: ${error.message}`);
  return (data ?? []) as FunnelStageRow[];
}

/**
 * Most-recently-active known contacts. Capped (default 500) because the admin
 * table is for eyeballing/exporting at launch scale, not paging millions of
 * rows. If the cap is hit, the page surfaces that the list is truncated.
 */
export async function getFunnelContacts(limit = 500): Promise<FunnelContactRow[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('funnel_contacts')
    .select(
      'email, display_email, first_seen, last_seen, role, institution, readiness_tier_label, has_free_assessment, has_in_depth_purchase, has_in_depth_completed, has_foundation_purchase, has_certificate, products, lifecycle_stage',
    )
    .order('last_seen', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(`funnel_contacts read failed: ${error.message}`);
  return (data ?? []) as FunnelContactRow[];
}
