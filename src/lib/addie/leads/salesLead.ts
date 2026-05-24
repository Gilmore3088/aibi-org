// addie.sales_leads insert + downstream sync.
//
// Used by /api/addie/contact-sales. Persists the intake row, then fires
// (best-effort) a MailerLite group-add and an internal notification email
// via Resend. Side effects are suppressed when SKIP_MAILERLITE / SKIP_RESEND
// are set so previews and tests stay quiet.

import { getAddieServiceClient, normalizeEmail } from '@/lib/addie/supabase/service';

export const FI_TYPES = ['community_bank', 'credit_union', 'consulting_firm', 'other'] as const;
export type FiType = (typeof FI_TYPES)[number];

export const ASSET_SIZES = [
  'under_500m',
  '500m_to_1b',
  '1b_to_5b',
  '5b_to_10b',
  'over_10b',
  'na',
] as const;
export type AssetSize = (typeof ASSET_SIZES)[number];

export const TIMELINES = ['this_quarter', 'next_quarter', 'exploring', 'not_yet'] as const;
export type Timeline = (typeof TIMELINES)[number];

export interface SalesLeadInput {
  readonly fi_name: string;
  readonly fi_type: FiType;
  readonly asset_size: AssetSize;
  readonly seats: number;
  readonly timeline: Timeline;
  readonly contact_name: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly notes?: string | null;
  readonly source_route?: string;
}

export interface SalesLeadResult {
  readonly id: string;
  readonly email: string;
}

const ML_API_BASE = 'https://connect.mailerlite.com/api';

const FI_TYPE_LABELS: Record<FiType, string> = {
  community_bank: 'Community bank',
  credit_union: 'Credit union',
  consulting_firm: 'Consulting firm',
  other: 'Other',
};

const ASSET_SIZE_LABELS: Record<AssetSize, string> = {
  under_500m: 'Under $500M',
  '500m_to_1b': '$500M–$1B',
  '1b_to_5b': '$1B–$5B',
  '5b_to_10b': '$5B–$10B',
  over_10b: 'Over $10B',
  na: 'N/A',
};

const TIMELINE_LABELS: Record<Timeline, string> = {
  this_quarter: 'This quarter',
  next_quarter: 'Next quarter',
  exploring: 'Exploring',
  not_yet: 'Not yet',
};

export async function insertSalesLead(input: SalesLeadInput): Promise<SalesLeadResult> {
  const email = normalizeEmail(input.email);
  const supa = getAddieServiceClient();
  const { data, error } = await supa
    .from('sales_leads')
    .insert({
      fi_name: input.fi_name.trim(),
      fi_type: input.fi_type,
      asset_size: input.asset_size,
      seats: input.seats,
      timeline: input.timeline,
      contact_name: input.contact_name.trim(),
      email,
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
      source_route: input.source_route ?? '/foundation/contact-sales',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`sales_leads insert failed: ${error?.message ?? 'no row'}`);
  }
  return { id: data.id as string, email };
}

/**
 * Best-effort MailerLite group-add for sales leads. No-ops when env vars
 * are unset or SKIP_MAILERLITE is true. Errors are swallowed so the
 * request flow is never blocked by an outbound email problem.
 */
export async function syncSalesLeadToMailerLite(input: SalesLeadInput): Promise<void> {
  if (process.env.SKIP_MAILERLITE === 'true') {
    console.info('[addie/sales-leads] SKIP_MAILERLITE — would sync', { email: input.email });
    return;
  }
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID_SALES_LEADS;
  if (!apiKey || !groupId) {
    console.info('[addie/sales-leads] MailerLite env not configured — skipping group-add');
    return;
  }
  try {
    const res = await fetch(`${ML_API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: normalizeEmail(input.email),
        fields: {
          name: input.contact_name,
          fi_name: input.fi_name,
          fi_type: FI_TYPE_LABELS[input.fi_type],
          asset_size: ASSET_SIZE_LABELS[input.asset_size],
          seats: String(input.seats),
          timeline: TIMELINE_LABELS[input.timeline],
        },
        groups: [groupId],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(`[addie/sales-leads] mailerlite ${res.status}: ${detail.slice(0, 300)}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[addie/sales-leads] mailerlite error:', message);
  }
}

/**
 * Best-effort internal notification email so the operator sees the lead
 * land in their inbox without watching the DB. No-op when SKIP_RESEND is
 * true or RESEND_API_KEY is unset.
 */
export async function notifySalesLeadInternal(input: SalesLeadInput): Promise<void> {
  if (process.env.SKIP_RESEND === 'true') {
    console.info('[addie/sales-leads] SKIP_RESEND — would notify');
    return;
  }
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SALES_LEAD_NOTIFY_EMAIL ?? process.env.RESEND_FROM ?? null;
  if (!apiKey || !to) {
    console.info('[addie/sales-leads] Resend env not configured — skipping notification');
    return;
  }
  const fromAddress = process.env.RESEND_FROM ?? 'hello@aibankinginstitute.com';
  const fromName = process.env.RESEND_FROM_NAME ?? 'The AI Banking Institute';
  const subject = `New sales lead — ${input.fi_name} (${input.seats} seats)`;
  const text = [
    `Institution:    ${input.fi_name}`,
    `Type:           ${FI_TYPE_LABELS[input.fi_type]}`,
    `Asset size:     ${ASSET_SIZE_LABELS[input.asset_size]}`,
    `Estimated seats:${String(input.seats).padStart(7)}`,
    `Timeline:       ${TIMELINE_LABELS[input.timeline]}`,
    '',
    `Contact:        ${input.contact_name}`,
    `Email:          ${input.email}`,
    `Phone:          ${input.phone?.trim() || '—'}`,
    '',
    'Notes:',
    input.notes?.trim() || '(none)',
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [to],
        reply_to: input.email,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[addie/sales-leads] resend ${res.status}: ${body.slice(0, 300)}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[addie/sales-leads] resend error:', message);
  }
}
