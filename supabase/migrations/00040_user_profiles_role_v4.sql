-- 00040 — extend user_profiles.role CHECK for In-Depth v4 role taxonomy.
--
-- v4 (spec 2026-05-28) adds three roles the v2 list did not have:
--   it-infosec      (splits the v2 'it' role into IT vs IT/InfoSec — keep
--                    'it' as a valid legacy value so existing rows survive)
--   retail-branch   (new — branch operations role)
--   lending-credit  (renames v2 'lending' — keep 'lending' as a valid
--                    legacy value so existing rows survive)
--   bsa-aml         (new — BSA/AML surveillance role)
--   marketing-product (renames v2 'marketing' — keep 'marketing' valid)
--
-- This migration replaces the constraint with the UNION of v2 + v4 role
-- ids so existing rows continue to validate while new v4 takes can write
-- v4-shaped role values. Application code (parseRoleV4) is the source of
-- truth for which values new submissions may use.
--
-- See content/assessments/v4/roles.ts (ROLES_V4) for the canonical v4 list.

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (
    role IS NULL OR role IN (
      -- v2 legacy values (kept valid so existing rows do not need backfill).
      'operator',
      'compliance-risk',
      'training-hr',
      'executive',
      'lending',
      'marketing',
      'it',
      'other',
      -- v4 additions.
      'it-infosec',
      'retail-branch',
      'lending-credit',
      'bsa-aml',
      'marketing-product',
      'operations'
    )
  );

COMMENT ON COLUMN public.user_profiles.role IS
  'In-Depth Assessment buyer role for personalized Briefing framing. '
  'Optional — null is valid and renders the un-roled default. '
  'Source of truth for allowed values: content/assessments/v4/roles.ts '
  'ROLES_V4 tuple. v2 ids are also accepted for backward compatibility.';
