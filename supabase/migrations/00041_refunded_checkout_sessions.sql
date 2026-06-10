-- 00041_refunded_checkout_sessions.sql
-- F2 (refund/checkout audit): make refund revocation durable against Stripe
-- webhook replay.
--
-- The charge.refunded handler hard-deletes the course_enrollments row, and
-- provisionEnrollment uses row existence as its idempotency key. So a replayed
-- checkout.session.completed (Stripe retries non-2xx deliveries for ~3 days and
-- can send occasional duplicates) would find no row and re-create the
-- enrollment — silently restoring a refunded buyer's access.
--
-- This table records every refunded Checkout Session id. provisionEnrollment
-- consults it before (re)creating an enrollment and skips refunded sessions.
-- The code reads it fail-open, so deploying the handler before this migration
-- is applied does not break provisioning — it just doesn't enforce the guard
-- until the table exists.
--
-- Service-role only; no end-user access.

CREATE TABLE IF NOT EXISTS refunded_checkout_sessions (
  stripe_session_id text PRIMARY KEY,
  refunded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE refunded_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- No policies: only the service-role client (which bypasses RLS) reads and
-- writes this table, exclusively from the Stripe webhook handler.
