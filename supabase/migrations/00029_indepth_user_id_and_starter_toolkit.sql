-- 00029_indepth_user_id_and_starter_toolkit.sql
--
-- Two changes that go together:
--
--   1. Add `user_id` to indepth_assessment_takers so completed takes can be
--      bound to a Supabase Auth user (mirrors leader_user_id on
--      indepth_assessment_institutions). Bound on first authed visit; never
--      retroactively for anonymous takers.
--
--   2. Extend the entitlements.product CHECK constraint to allow
--      'indepth-starter-toolkit' — a read-only subset of the toolbox granted
--      to In-Depth Assessment buyers (individual or institution leader),
--      distinct from the full 'aibi-p' / 'aibi-s' / 'aibi-l' learner tiers.

-- ── 1. Bind takers to auth users ────────────────────────────────────────────

ALTER TABLE indepth_assessment_takers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_indepth_takers_user_id
  ON indepth_assessment_takers (user_id) WHERE user_id IS NOT NULL;

-- ── 2. New entitlement product slug ────────────────────────────────────────
--
-- CHECK constraints can't be modified in place; drop and recreate.

ALTER TABLE entitlements DROP CONSTRAINT IF EXISTS entitlements_product_check;

ALTER TABLE entitlements ADD CONSTRAINT entitlements_product_check
  CHECK (
    product IN (
      'aibi-p',
      'aibi-s',
      'aibi-l',
      'toolbox-only',
      'indepth-starter-toolkit'
    )
  );
