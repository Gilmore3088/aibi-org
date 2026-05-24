-- Audit A1 (2026-05-24): backfill readiness_tier_id and readiness_tier_label
-- from the authoritative readiness_dimension_breakdown so the stored tier
-- matches what the In-Depth Briefing displays.
--
-- Why this is needed: historically, in-depth submissions (pre-PR #82,
-- 2026-05-12 runner fix) stored a scaled 12-48 readiness_score and the
-- corresponding free-flow tier_id, while the dimension breakdown stored
-- the raw 0-24 per-dimension scores summing to 48-192. The Briefing
-- recomputes display from the dimension breakdown, but consumers that
-- read readiness_tier_id directly (dashboard, MailerLite tier routing,
-- transactional emails) saw the stale free-flow tier.
--
-- After this migration: for every row that has a dimension breakdown,
-- recompute readiness_tier_id / readiness_tier_label using the same
-- 50/75/90 percent-of-max thresholds the Briefing view applies. Rows
-- without a breakdown are left untouched.
--
-- Thresholds (must match content/assessments/v2/scoring.ts tierFromPct):
--   < 50%  → starting-point  (label: Starting Point)
--   ≥ 50%  → early-stage     (label: Early Stage)
--   ≥ 75%  → building-momentum (label: Building Momentum)
--   ≥ 90%  → ready-to-scale  (label: Ready to Scale)
--
-- Idempotent: re-running produces the same result. Safe to apply on a
-- prod DB that already had earlier (correct) submissions; rows where
-- stored == computed are no-ops.

WITH dim_sums AS (
  SELECT
    p.id,
    -- Sum the .score and .maxScore values across all dimension entries
    -- in the readiness_dimension_breakdown JSONB column. The shape is
    -- { dimension_key: { score: integer, maxScore: integer, ... }, ... }
    SUM((v.value ->> 'score')::numeric)    AS raw_score,
    SUM((v.value ->> 'maxScore')::numeric) AS raw_max
  FROM public.user_profiles p
  CROSS JOIN LATERAL jsonb_each(p.readiness_dimension_breakdown) AS v
  WHERE p.readiness_dimension_breakdown IS NOT NULL
    AND jsonb_typeof(p.readiness_dimension_breakdown) = 'object'
  GROUP BY p.id
),
computed AS (
  SELECT
    id,
    raw_score,
    raw_max,
    CASE
      WHEN raw_max <= 0 THEN 0
      ELSE LEAST(100, GREATEST(0, (raw_score / raw_max) * 100))
    END AS pct
  FROM dim_sums
),
target AS (
  SELECT
    id,
    raw_score::integer AS new_score,
    raw_max::integer   AS new_max,
    CASE
      WHEN pct >= 90 THEN 'ready-to-scale'
      WHEN pct >= 75 THEN 'building-momentum'
      WHEN pct >= 50 THEN 'early-stage'
      ELSE 'starting-point'
    END AS new_tier_id,
    CASE
      WHEN pct >= 90 THEN 'Ready to Scale'
      WHEN pct >= 75 THEN 'Building Momentum'
      WHEN pct >= 50 THEN 'Early Stage'
      ELSE 'Starting Point'
    END AS new_tier_label
  FROM computed
)
UPDATE public.user_profiles p
SET
  readiness_tier_id    = t.new_tier_id,
  readiness_tier_label = t.new_tier_label,
  readiness_score      = t.new_score,
  readiness_max_score  = t.new_max
FROM target t
WHERE p.id = t.id
  AND (
    p.readiness_tier_id    IS DISTINCT FROM t.new_tier_id
    OR p.readiness_tier_label IS DISTINCT FROM t.new_tier_label
    OR p.readiness_score      IS DISTINCT FROM t.new_score
    OR p.readiness_max_score  IS DISTINCT FROM t.new_max
  );

-- Sanity invariant: after backfill, every row with a breakdown has a
-- tier_id that matches the breakdown-derived percentage. This block
-- raises if the invariant fails, blocking deploy on bad data.
DO $$
DECLARE
  drift_count integer;
BEGIN
  WITH dim_sums AS (
    SELECT
      p.id,
      p.readiness_tier_id AS stored_tier,
      SUM((v.value ->> 'score')::numeric)    AS raw_score,
      SUM((v.value ->> 'maxScore')::numeric) AS raw_max
    FROM public.user_profiles p
    CROSS JOIN LATERAL jsonb_each(p.readiness_dimension_breakdown) AS v
    WHERE p.readiness_dimension_breakdown IS NOT NULL
      AND jsonb_typeof(p.readiness_dimension_breakdown) = 'object'
    GROUP BY p.id, p.readiness_tier_id
  ),
  computed AS (
    SELECT
      id,
      stored_tier,
      CASE
        WHEN raw_max <= 0 THEN 'starting-point'
        WHEN (raw_score / raw_max) * 100 >= 90 THEN 'ready-to-scale'
        WHEN (raw_score / raw_max) * 100 >= 75 THEN 'building-momentum'
        WHEN (raw_score / raw_max) * 100 >= 50 THEN 'early-stage'
        ELSE 'starting-point'
      END AS computed_tier
    FROM dim_sums
  )
  SELECT COUNT(*) INTO drift_count
  FROM computed
  WHERE stored_tier IS DISTINCT FROM computed_tier;

  IF drift_count > 0 THEN
    RAISE EXCEPTION
      'A1 reconciliation: % rows still have stored readiness_tier_id that disagrees with breakdown after backfill', drift_count;
  END IF;
END $$;
