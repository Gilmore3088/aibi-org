// Thin writer for addie.billing_audit. Non-blocking — telemetry must
// never break a billing flow. Errors are logged, not thrown.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export type BillingAuditAction =
  | 'portal_session_opened'
  | 'seat_revoked_with_refund'
  | 'seat_revoked_no_refund'
  | 'team_cancelled'
  | 'invoice_listed';

export type BillingAuditStatus = 'ok' | 'error' | 'skipped';

export interface BillingAuditArgs {
  readonly action: BillingAuditAction;
  readonly user_id?: string | null;
  readonly team_id?: string | null;
  readonly stripe_event_id?: string | null;
  readonly amount_cents?: number | null;
  readonly currency?: string | null;
  readonly status?: BillingAuditStatus;
  readonly detail?: Record<string, unknown> | null;
}

export async function recordBillingAudit(args: BillingAuditArgs): Promise<void> {
  try {
    const supa = getAddieServiceClient();
    const { error } = await supa.from('billing_audit').insert({
      action: args.action,
      user_id: args.user_id ?? null,
      team_id: args.team_id ?? null,
      stripe_event_id: args.stripe_event_id ?? null,
      amount_cents: args.amount_cents ?? null,
      currency: args.currency ?? null,
      status: args.status ?? 'ok',
      detail: args.detail ?? null,
    });
    if (error) {
      console.warn('[addie/billing/audit] insert failed:', error.message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[addie/billing/audit] write error:', message);
  }
}
