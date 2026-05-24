-- 00057_addie_billing_audit.sql
-- Append-only audit log for self-service billing actions taken from
-- /account/billing and /account/billing/team. Every portal-session open,
-- seat revoke with refund, and team cancellation lands here so we can
-- reconstruct what happened from the customer's side without having to
-- correlate Stripe events to UI clicks after the fact.
--
-- Service-role writes only. RLS is enabled with no policies so anon and
-- authenticated keys cannot read or write this table. The /api/addie/
-- billing/* routes use getAddieServiceClient() which bypasses RLS.

CREATE TABLE addie.billing_audit (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id          uuid REFERENCES addie.teams(id) ON DELETE SET NULL,
  action           text NOT NULL CHECK (action IN (
                     'portal_session_opened',
                     'seat_revoked_with_refund',
                     'seat_revoked_no_refund',
                     'team_cancelled',
                     'invoice_listed'
                   )),
  stripe_event_id  text,
  amount_cents     integer,
  currency         text,
  status           text NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','error','skipped')),
  detail           jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX billing_audit_user_idx       ON addie.billing_audit (user_id);
CREATE INDEX billing_audit_team_idx       ON addie.billing_audit (team_id);
CREATE INDEX billing_audit_created_at_idx ON addie.billing_audit (created_at DESC);

ALTER TABLE addie.billing_audit ENABLE ROW LEVEL SECURITY;
-- No policies. Service_role bypasses RLS.

GRANT SELECT, INSERT ON addie.billing_audit TO service_role;
