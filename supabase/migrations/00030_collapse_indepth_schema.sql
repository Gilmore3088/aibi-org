-- 00030_collapse_indepth_schema.sql
--
-- Collapses indepth_assessment_institutions + indepth_assessment_takers
-- into a single indepth_takes table. Rationale: post-launch review
-- (simplicity reviewer) flagged the two-table split as over-normalized
-- for the actual access patterns. One table = one query for aggregates,
-- uniform RLS, simpler provisioning code.
--
-- Schema shape after this migration:
--   indepth_takes — one row per taker.
--     - Individual buyers: cohort_id NULL, is_leader FALSE, no leader/
--       institution fields. completed_at + score_* set on submit.
--     - Institution leader rows: is_leader TRUE, cohort_id = self.id,
--       institution_name + leader_email + seats_purchased + amount_paid_cents
--       set. The leader CAN take the assessment (their own row holds the
--       answers/score). leader_user_id binds on first authed visit.
--     - Institution invitees: is_leader FALSE, cohort_id = leader's id,
--       institution_name / leader_email / leader_user_id denormalized for
--       fast cohort queries. seats_purchased + amount_paid_cents NULL on
--       invitee rows (leader row is the source of truth for $).
--
-- Backfill: existing institutions become is_leader=TRUE rows; existing
-- invitee takers point cohort_id at the new leader rows. Production at the
-- time of writing has 0 institutions and 2 individual takers, so backfill
-- is effectively a no-op, but the SQL is written generically so staging
-- and any branch databases collapse correctly.

-- ── 1. Add the merged columns ──────────────────────────────────────────────

ALTER TABLE indepth_assessment_takers
  ADD COLUMN IF NOT EXISTS cohort_id        uuid REFERENCES indepth_assessment_takers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_leader        boolean NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS institution_name text,
  ADD COLUMN IF NOT EXISTS leader_email     text,
  ADD COLUMN IF NOT EXISTS leader_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seats_purchased  integer,
  ADD COLUMN IF NOT EXISTS amount_paid_cents integer,
  ADD COLUMN IF NOT EXISTS created_at       timestamptz NOT NULL DEFAULT now();

-- ── 2. Backfill leader rows from institutions ──────────────────────────────
-- For each institution, insert a leader row in takers and remember the new
-- id keyed by the old institution id so we can rewrite invitee.cohort_id.

CREATE TEMP TABLE _institution_leader_map (
  old_institution_id uuid PRIMARY KEY,
  new_leader_id      uuid NOT NULL
) ON COMMIT DROP;

WITH inserted_leaders AS (
  INSERT INTO indepth_assessment_takers (
    invite_email,
    invite_token,
    is_leader,
    cohort_id,
    institution_name,
    leader_email,
    leader_user_id,
    seats_purchased,
    amount_paid_cents,
    stripe_session_id,
    created_at
  )
  SELECT
    inst.leader_email,
    encode(gen_random_bytes(32), 'base64'),
    TRUE,
    NULL, -- cohort_id self-points; updated below
    inst.institution_name,
    inst.leader_email,
    inst.leader_user_id,
    inst.seats_purchased,
    inst.amount_paid_cents,
    inst.stripe_session_id,
    inst.created_at
  FROM indepth_assessment_institutions inst
  RETURNING id AS new_leader_id, stripe_session_id
)
INSERT INTO _institution_leader_map (old_institution_id, new_leader_id)
SELECT inst.id, il.new_leader_id
FROM inserted_leaders il
JOIN indepth_assessment_institutions inst USING (stripe_session_id);

-- Self-cohort the leader rows.
UPDATE indepth_assessment_takers t
SET cohort_id = t.id
WHERE t.is_leader = TRUE;

-- ── 3. Rewrite existing invitee rows to point at the new leader rows ──────

UPDATE indepth_assessment_takers t
SET
  cohort_id        = m.new_leader_id,
  institution_name = inst.institution_name,
  leader_email     = inst.leader_email,
  leader_user_id   = inst.leader_user_id
FROM _institution_leader_map m
JOIN indepth_assessment_institutions inst ON inst.id = m.old_institution_id
WHERE t.institution_id = m.old_institution_id
  AND t.is_leader = FALSE;

-- ── 4. Drop the now-redundant institution_id and the institutions table ───

DROP POLICY IF EXISTS "Leader reads own institution" ON indepth_assessment_institutions;
DROP POLICY IF EXISTS "Leader reads own institution takers" ON indepth_assessment_takers;

DROP INDEX IF EXISTS idx_indepth_takers_institution;
DROP INDEX IF EXISTS idx_indepth_inst_leader;

ALTER TABLE indepth_assessment_takers
  DROP CONSTRAINT IF EXISTS one_seat_per_email_per_institution;

ALTER TABLE indepth_assessment_takers
  DROP COLUMN IF EXISTS institution_id;

DROP TABLE indepth_assessment_institutions;

-- ── 5. Rename and re-establish indexes / policies ─────────────────────────

ALTER TABLE indepth_assessment_takers RENAME TO indepth_takes;

ALTER TABLE indepth_takes
  ADD CONSTRAINT one_seat_per_email_per_cohort
  UNIQUE (cohort_id, invite_email);

CREATE INDEX IF NOT EXISTS idx_indepth_takes_cohort
  ON indepth_takes(cohort_id);

CREATE INDEX IF NOT EXISTS idx_indepth_takes_leader_user
  ON indepth_takes(leader_user_id) WHERE leader_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_indepth_takes_token
  ON indepth_takes(invite_token);

-- RLS: keep enabled. A signed-in user can see:
--   1. Their own row (user_id = auth.uid())
--   2. Any row in a cohort they lead (leader_user_id = auth.uid())
-- All writes go through service-role from the server (webhook + invite
-- + submit-answers); RLS is defense-in-depth against direct anon-key
-- access.

CREATE POLICY "Read own take or led cohort" ON indepth_takes
  FOR SELECT TO authenticated
  USING (
    user_id        = (select auth.uid())
    OR leader_user_id = (select auth.uid())
  );
