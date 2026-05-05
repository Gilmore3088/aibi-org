-- 00027_readiness_convertkit_tagged_at.sql
-- Spec 3: ConvertKit-driven 3-email × 4-tier sequence.
--
-- Records when the user_profiles row was tagged into the appropriate tier
-- sequence in ConvertKit. NULL means: never tagged (e.g. marketing_opt_in
-- was false, or the assessment predates Spec 3, or the CK call failed).
--
-- Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS readiness_convertkit_tier_tagged_at timestamptz;

COMMENT ON COLUMN public.user_profiles.readiness_convertkit_tier_tagged_at IS
  'Timestamp when ConvertKit tier-sequence tag was last added for this user. NULL = never tagged.';
