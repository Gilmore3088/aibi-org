-- 00028_indepth_assessment_tables.sql
-- Adds the two tables backing the paid In-Depth AI Readiness Assessment.
-- See docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md

CREATE TABLE indepth_assessment_institutions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name    text NOT NULL,
  leader_user_id      uuid REFERENCES auth.users(id),
  leader_email        text NOT NULL,
  seats_purchased     int  NOT NULL CHECK (seats_purchased >= 10),
  stripe_session_id   text UNIQUE NOT NULL,
  amount_paid_cents   int  NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE indepth_assessment_takers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      uuid REFERENCES indepth_assessment_institutions(id) ON DELETE CASCADE,
  invite_email        text NOT NULL,
  invite_token        text UNIQUE NOT NULL,
  invite_sent_at      timestamptz NOT NULL DEFAULT now(),
  invite_consumed_at  timestamptz,
  completed_at        timestamptz,
  score_total         int,
  score_per_dimension jsonb,
  answers             jsonb,
  -- For individual ($99) buyers, this is the originating Stripe Checkout
  -- Session id; provides idempotency against duplicate webhook deliveries.
  -- NULL for invite-driven institution takers (their idempotency comes
  -- from the (institution_id, invite_email) unique constraint).
  stripe_session_id   text,
  CONSTRAINT one_seat_per_email_per_institution
    UNIQUE (institution_id, invite_email),
  CONSTRAINT individual_session_unique
    UNIQUE (stripe_session_id)
);

CREATE INDEX idx_indepth_takers_institution ON indepth_assessment_takers(institution_id);
CREATE INDEX idx_indepth_takers_token ON indepth_assessment_takers(invite_token);
CREATE INDEX idx_indepth_inst_leader ON indepth_assessment_institutions(leader_user_id);

ALTER TABLE indepth_assessment_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indepth_assessment_takers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leader reads own institution" ON indepth_assessment_institutions
  FOR SELECT TO authenticated
  USING (leader_user_id = (select auth.uid()));

CREATE POLICY "Leader reads own institution takers" ON indepth_assessment_takers
  FOR SELECT TO authenticated
  USING (institution_id IN (
    SELECT id FROM indepth_assessment_institutions
    WHERE leader_user_id = (select auth.uid())
  ));

-- Service role bypasses RLS for webhook inserts and token-based take flow.
