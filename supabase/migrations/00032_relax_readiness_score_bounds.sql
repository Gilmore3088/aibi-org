-- Relax the readiness_score CHECK constraint.
--
-- Prior: CHECK (readiness_score >= 8 AND readiness_score <= 48). Written
-- when only the v1 free flow existed (8-32 then 12-48). The In-Depth
-- 48-question assessment stores raw scores in 48–192 range (post-2026-05-12
-- runner fix), which the old constraint rejected — every paid In-Depth
-- submission since PR #82 deployed was silently failing at the DB layer.
--
-- New: CHECK (readiness_score >= 0 AND readiness_score <= COALESCE(
-- readiness_max_score, 200)). Allows both free and in-depth ranges,
-- pinned to the per-row max with a safety ceiling. The COALESCE handles
-- legacy rows that did not record readiness_max_score; the 200 ceiling
-- comfortably covers the 192 raw max plus future expansion.

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_readiness_score_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_readiness_score_check
  CHECK (
    readiness_score IS NULL
    OR (
      readiness_score >= 0
      AND readiness_score <= COALESCE(readiness_max_score, 200)
    )
  );
