-- 00051_addie_stripe_events_ledger.sql
-- Idempotency ledger for the addie Stripe webhook. Without this table the
-- handler falls back to in-memory dedup (which doesn't survive function
-- cold-starts on Vercel and is process-local). See Auth Spec §6.2.

CREATE TABLE addie.stripe_events (
  stripe_event_id text PRIMARY KEY,           -- evt_*
  type            text NOT NULL,              -- e.g. checkout.session.completed
  livemode        boolean NOT NULL,
  processed_at    timestamptz NOT NULL DEFAULT now(),
  payload_summary jsonb                       -- minimal extract for audit; full payload not stored
);

CREATE INDEX idx_addie_stripe_events_type_processed
  ON addie.stripe_events(type, processed_at DESC);

ALTER TABLE addie.stripe_events ENABLE ROW LEVEL SECURITY;
-- Writes are server-only (service_role). No client policies.

-- Pending entitlements — for the case where a Stripe checkout completes but
-- the buyer hasn't created an auth.users account yet (paid by email, signs
-- up later). On signup, addie.leads bind flow drains pending rows into real
-- entitlements. See Auth Spec §6.3.
CREATE TABLE addie.pending_entitlements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext NOT NULL,
  product           text NOT NULL CHECK (product IN (
                      'foundation_individual',
                      'foundation_team_seat',
                      'assessment_in_depth'
                    )),
  stripe_session_id text NOT NULL UNIQUE,
  seat_id           uuid REFERENCES addie.seats(id) ON DELETE SET NULL,
  payload           jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  drained_at        timestamptz
);

CREATE INDEX idx_addie_pending_entitlements_email   ON addie.pending_entitlements(email) WHERE drained_at IS NULL;
CREATE INDEX idx_addie_pending_entitlements_undrained ON addie.pending_entitlements(created_at DESC) WHERE drained_at IS NULL;

ALTER TABLE addie.pending_entitlements ENABLE ROW LEVEL SECURITY;
-- Server-only.
