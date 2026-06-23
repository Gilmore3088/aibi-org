// Server-only readers for the derived funnel reporting views
// (funnel_scorecard, funnel_stage_distribution, funnel_contacts — migration
// 00049). The views are service-role only (REVOKEd from anon/authenticated),
// so every read goes through the service-role client.
//
// Never import this module in a Client Component — it uses the service role key.

import { createServiceRoleClient } from '@/lib/supabase/client';
import { filterMetricRowsByEmail } from '@/lib/admin/metric-exclusions';
import { canonicalEmail } from '@/lib/email/canonicalize';

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

interface TimestampedEmailRow {
  email: string | null;
  created_at?: string | null;
  downloaded_at?: string | null;
  readiness_at?: string | null;
  proficiency_at?: string | null;
}

interface EnrollmentScoreRow {
  id: string;
  email: string | null;
  product: string;
  created_at: string | null;
  enrolled_at: string | null;
}

interface CertificateScoreRow {
  id: string;
  enrollment_id: string;
  issued_at: string | null;
}

interface TeamCohortScoreRow {
  buyer_email: string | null;
  created_at: string | null;
}

interface RefundScoreRow {
  refunded_at: string | null;
}

const CONTACT_READ_LIMIT = 5000;

const STAGE_ORDER = [
  'lead',
  'free_assessed',
  'in_depth_buyer',
  'in_depth_completed',
  'foundation_buyer',
  'active_learner',
  'certified',
] as const;

const STAGE_RANK = new Map(STAGE_ORDER.map((stage, index) => [stage, index + 1]));

function rangeCounts<T>(rows: readonly T[], getIso: (row: T) => string | null | undefined) {
  const now = Date.now();
  const last7d = now - 7 * 24 * 60 * 60 * 1000;
  const last24h = now - 24 * 60 * 60 * 1000;
  let in7d = 0;
  let in24h = 0;

  for (const row of rows) {
    const iso = getIso(row);
    if (!iso) continue;
    const time = Date.parse(iso);
    if (time >= last7d) in7d += 1;
    if (time >= last24h) in24h += 1;
  }

  return {
    all_time: rows.length,
    last_7d: in7d,
    last_24h: in24h,
  };
}

function uniqueEmailRangeCounts<T>(
  rows: readonly T[],
  getEmail: (row: T) => string | null | undefined,
  getIso: (row: T) => string | null | undefined,
) {
  const now = Date.now();
  const last7d = now - 7 * 24 * 60 * 60 * 1000;
  const last24h = now - 24 * 60 * 60 * 1000;
  const all = new Set<string>();
  const in7d = new Set<string>();
  const in24h = new Set<string>();

  for (const row of rows) {
    const rawEmail = getEmail(row)?.trim();
    if (!rawEmail) continue;
    const email = canonicalEmail(rawEmail);
    all.add(email);

    const iso = getIso(row);
    if (!iso) continue;
    const time = Date.parse(iso);
    if (time >= last7d) in7d.add(email);
    if (time >= last24h) in24h.add(email);
  }

  return {
    all_time: all.size,
    last_7d: in7d.size,
    last_24h: in24h.size,
  };
}

function scoreRow<T>(
  metric_key: string,
  metric_label: string,
  sort_order: number,
  rows: readonly T[],
  getIso: (row: T) => string | null | undefined,
): FunnelScorecardRow {
  return {
    metric_key,
    metric_label,
    sort_order,
    ...rangeCounts(rows, getIso),
  };
}

function uniqueEmailScoreRow<T>(
  metric_key: string,
  metric_label: string,
  sort_order: number,
  rows: readonly T[],
  getEmail: (row: T) => string | null | undefined,
  getIso: (row: T) => string | null | undefined,
): FunnelScorecardRow {
  return {
    metric_key,
    metric_label,
    sort_order,
    ...uniqueEmailRangeCounts(rows, getEmail, getIso),
  };
}

async function readRows<T>(
  label: string,
  query: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(`${label} read failed: ${error.message}`);
  return (data ?? []) as T[];
}

export async function getFunnelScorecard(): Promise<FunnelScorecardRow[]> {
  const client = createServiceRoleClient();
  const [
    contacts,
    profiles,
    promptLeads,
    resourceDownloads,
    waitlist,
    enrollments,
    teamCohorts,
    certificates,
    refunds,
  ] = await Promise.all([
    getFunnelContacts(CONTACT_READ_LIMIT),
    readRows<TimestampedEmailRow>(
      'user_profiles',
      client.from('user_profiles').select('email, readiness_at, proficiency_at'),
    ),
    readRows<TimestampedEmailRow>(
      'prompt_card_leads',
      client.from('prompt_card_leads').select('email, created_at'),
    ),
    readRows<TimestampedEmailRow>(
      'resource_downloads',
      client.from('resource_downloads').select('email, downloaded_at'),
    ),
    readRows<TimestampedEmailRow>(
      'future_course_waitlist',
      client.from('future_course_waitlist').select('email, created_at'),
    ),
    readRows<EnrollmentScoreRow>(
      'course_enrollments',
      client.from('course_enrollments').select('id, email, product, created_at, enrolled_at'),
    ),
    readRows<TeamCohortScoreRow>(
      'team_assessment_cohorts',
      client.from('team_assessment_cohorts').select('buyer_email, created_at'),
    ),
    readRows<CertificateScoreRow>(
      'certificates',
      client.from('certificates').select('id, enrollment_id, issued_at'),
    ),
    readRows<RefundScoreRow>(
      'refunded_checkout_sessions',
      client.from('refunded_checkout_sessions').select('refunded_at'),
    ),
  ]);

  const includedProfiles = filterMetricRowsByEmail(profiles, (row) => row.email);
  const includedPromptLeads = filterMetricRowsByEmail(promptLeads, (row) => row.email);
  const includedResourceDownloads = filterMetricRowsByEmail(resourceDownloads, (row) => row.email);
  const includedWaitlist = filterMetricRowsByEmail(waitlist, (row) => row.email);
  const includedEnrollments = filterMetricRowsByEmail(enrollments, (row) => row.email);
  const includedEnrollmentIds = new Set(includedEnrollments.map((row) => row.id));
  const includedTeamCohorts = filterMetricRowsByEmail(teamCohorts, (row) => row.buyer_email);
  const freeAssessments = includedProfiles.filter((row) => row.readiness_at);
  const completedIndepth = includedProfiles.filter((row) => row.proficiency_at);
  const inDepthPurchases = includedEnrollments.filter((row) => row.product === 'in-depth-assessment');
  const foundationPurchases = includedEnrollments.filter((row) =>
    ['foundation', 'foundations', 'aibi-p'].includes(row.product),
  );
  const includedCertificates = certificates.filter((row) => includedEnrollmentIds.has(row.enrollment_id));

  return [
    scoreRow('known_contacts', 'Known contacts (total)', 10, contacts, (row) => row.first_seen),
    scoreRow('free_assessments_completed', 'Free assessments completed', 20, freeAssessments, (row) => row.readiness_at),
    scoreRow('prompt_card_leads', 'Prompt-card leads', 30, includedPromptLeads, (row) => row.created_at),
    uniqueEmailScoreRow(
      'resource_downloads',
      'Resource downloaders (known email)',
      40,
      includedResourceDownloads,
      (row) => row.email,
      (row) => row.downloaded_at,
    ),
    scoreRow('waitlist_signups', 'Future-course waitlist signups', 50, includedWaitlist, (row) => row.created_at),
    scoreRow(
      'in_depth_purchases',
      'In-Depth Assessment purchases ($99)',
      60,
      inDepthPurchases,
      (row) => row.created_at,
    ),
    scoreRow('in_depth_completed', 'In-Depth Assessment completed', 70, completedIndepth, (row) => row.proficiency_at),
    scoreRow(
      'foundation_purchases',
      'Foundation course purchases ($295)',
      80,
      foundationPurchases,
      (row) => row.created_at ?? row.enrolled_at,
    ),
    scoreRow(
      'team_cohorts',
      'Team assessment cohorts purchased',
      90,
      includedTeamCohorts,
      (row) => row.created_at,
    ),
    scoreRow(
      'certificates_issued',
      'Foundation certificates issued',
      100,
      includedCertificates,
      (row) => row.issued_at,
    ),
    scoreRow(
      'full_refunds',
      'Full refunds (Stripe sessions) — see Stripe for $',
      110,
      refunds,
      (row) => row.refunded_at,
    ),
  ];
}

export async function getFunnelStageDistribution(): Promise<FunnelStageRow[]> {
  const contacts = await getFunnelContacts(CONTACT_READ_LIMIT);
  const counts = new Map<string, number>();
  for (const contact of contacts) {
    counts.set(contact.lifecycle_stage, (counts.get(contact.lifecycle_stage) ?? 0) + 1);
  }
  const total = contacts.length;
  return STAGE_ORDER.map((stage) => {
    const count = counts.get(stage) ?? 0;
    return {
      lifecycle_stage: stage,
      stage_rank: STAGE_RANK.get(stage) ?? 999,
      contacts: count,
      pct_of_contacts: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    };
  });
}

/**
 * Most-recently-active known contacts. Capped (default 500) because the admin
 * table is for eyeballing/exporting at launch scale, not paging millions of
 * rows. If the cap is hit, the page surfaces that the list is truncated.
 */
export async function getFunnelContacts(limit = 500): Promise<FunnelContactRow[]> {
  const client = createServiceRoleClient();
  const readLimit = Math.min(CONTACT_READ_LIMIT, Math.max(limit * 10, limit));
  const { data, error } = await client
    .from('funnel_contacts')
    .select(
      'email, display_email, first_seen, last_seen, role, institution, readiness_tier_label, has_free_assessment, has_in_depth_purchase, has_in_depth_completed, has_foundation_purchase, has_certificate, products, lifecycle_stage',
    )
    .order('last_seen', { ascending: false, nullsFirst: false })
    .limit(readLimit);
  if (error) throw new Error(`funnel_contacts read failed: ${error.message}`);
  return filterMetricRowsByEmail((data ?? []) as FunnelContactRow[], (row) => row.email).slice(0, limit);
}

export interface ResourceDownloadMetricRow {
  resource_slug: string;
  downloads: number;
  last_7d: number;
  last_24h: number;
  /** Distinct hashed-IP count — an approximate unique-visitor estimate. */
  unique_visitors: number;
  last_download: string | null;
}

/**
 * Per-resource download counts (all-time / 7d / 24h) with a unique-visitor
 * estimate and last-download date, from the resource_download_metrics view
 * (migration 00052). Service-role only. Ordered most-downloaded first; the
 * admin page regroups by category via resourceMeta().
 */
export async function getResourceDownloadMetrics(): Promise<ResourceDownloadMetricRow[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('resource_download_metrics')
    .select('resource_slug, downloads, last_7d, last_24h, unique_visitors, last_download')
    .order('downloads', { ascending: false });
  if (error) throw new Error(`resource_download_metrics read failed: ${error.message}`);
  return (data ?? []) as ResourceDownloadMetricRow[];
}

export interface ResourceDownloadTotalsRow {
  downloads: number;
  last_7d: number;
  last_24h: number;
  /** Distinct hashed-IP across ALL downloads (true unique, not a per-slug sum). */
  unique_visitors: number;
  resources_tracked: number;
}

/**
 * Single-row roll-up for the dashboard headline tiles, from the
 * resource_download_totals view (migration 00052). Service-role only.
 */
export async function getResourceDownloadTotals(): Promise<ResourceDownloadTotalsRow | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('resource_download_totals')
    .select('downloads, last_7d, last_24h, unique_visitors, resources_tracked')
    .maybeSingle();
  if (error) throw new Error(`resource_download_totals read failed: ${error.message}`);
  return (data as ResourceDownloadTotalsRow | null) ?? null;
}
