-- 00033 — user_profiles.role for the In-Depth Briefing personalization (#97).
--
-- One column captured optionally at the start of the paid 48-question
-- In-Depth Assessment. Powers role-aware framing of the Briefing's
-- diagnosis (compliance leader vs operator vs executive see the same
-- weakest dimension translated into their seat's language).
--
-- Nullable on purpose: the Briefing renderer accepts null and falls back
-- to the un-roled default. Capture is non-blocking — never gates the
-- assessment.
--
-- CHECK constraint mirrors the ROLES tuple in content/assessments/v2/role.ts.
-- If that list changes, update this check in a follow-up migration.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role text;

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (
    role IS NULL OR role IN (
      'operator',
      'compliance-risk',
      'training-hr',
      'executive',
      'lending',
      'marketing',
      'it',
      'other'
    )
  );

COMMENT ON COLUMN public.user_profiles.role IS
  'In-Depth Assessment buyer role for personalized Briefing framing (#97). '
  'Optional — null is valid and renders the un-roled default. '
  'Source of truth for allowed values: content/assessments/v2/role.ts ROLES tuple.';
