-- Migration: 00011_readiness_dimension_columns.sql
-- Purpose: persist v2 assessment metadata on user_profiles so the gated
-- breakdown (8 dimensions, version, max score) survives the email handoff
-- and is available for downstream uses (CRM enrichment, future emails,
-- dashboard views).
--
-- Decision log: 2026-04-27 — option 2 (partly gated). Score + tier are
-- visible without email; the dimension breakdown is gated and persists
-- the substance behind the gate.
--
-- All columns nullable. Existing rows are unaffected. The application
-- writes these only when present (see lib/supabase/user-profiles.ts).
-- Safe to run on a populated table; no backfill required.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS readiness_version text,
  ADD COLUMN IF NOT EXISTS readiness_max_score smallint,
  ADD COLUMN IF NOT EXISTS readiness_dimension_breakdown jsonb;

-- Optional sanity constraint — version must be one of the supported strings
-- when present. Drop if you need to introduce a new version family.
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_readiness_version_check
    CHECK (readiness_version IS NULL OR readiness_version IN ('v1', 'v2'));

-- Helpful for future analytics queries that filter by version. Partial
-- index keeps it cheap.
CREATE INDEX IF NOT EXISTS idx_user_profiles_readiness_version
  ON public.user_profiles (readiness_version)
  WHERE readiness_version IS NOT NULL;

COMMENT ON COLUMN public.user_profiles.readiness_dimension_breakdown IS
  'Per-dimension scores from v2 assessment. JSON shape: { [dimensionId]: { score, maxScore, label } }.';
