-- 00035_entitlements_tier_and_indepth.sql
-- Adds the AI Starter Toolkit tier (read-only) for In-Depth Assessment
-- buyers ($99 product), per issue #219.
--
-- Three layered changes, all forward-compatible with existing
-- entitlements + the 00028/00030 product CHECK and the 00015 trigger:
--
-- 1. entitlements.tier column — 'full' | 'starter', default 'full'.
--    Existing rows are 'full' (Foundation, AiBI-S, AiBI-L). New
--    In-Depth Assessment rows insert as 'starter'.
-- 2. entitlements.product CHECK — extended to accept 'in-depth-assessment'.
-- 3. sync_entitlement_from_enrollment() trigger — extended to fire on
--    course_enrollments rows where product='in-depth-assessment', and
--    to write tier='starter' for those (rather than 'full').
-- 4. Backfill — every existing course_enrollments row with
--    product='in-depth-assessment' that lacks a matching entitlement
--    gets one (idempotent UPSERT, tier='starter').
--
-- Safety: BEGIN/COMMIT envelope. Re-running this migration is a no-op
-- on a database where it has already been applied; column add uses
-- IF NOT EXISTS, CHECK constraint is dropped+recreated, function is
-- CREATE OR REPLACE, backfill uses the existing UNIQUE INDEX.
--
-- See:
--   00014_entitlements_table.sql  (base table + CHECK)
--   00015_entitlements_trigger.sql (original trigger shape)
--   00028_add_foundation_product_value.sql (foundation rollout)
--   00030_widen_foundation_product_and_backfill_plural.sql (current CHECK)

BEGIN;

-- 1. tier column -------------------------------------------------------

ALTER TABLE entitlements
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'full';

-- Drop+recreate the CHECK so reruns succeed even after partial application.
ALTER TABLE entitlements
  DROP CONSTRAINT IF EXISTS entitlements_tier_check;

ALTER TABLE entitlements
  ADD CONSTRAINT entitlements_tier_check
  CHECK (tier IN ('full', 'starter'));

-- 2. product CHECK — accept 'in-depth-assessment' --------------------

ALTER TABLE entitlements
  DROP CONSTRAINT IF EXISTS entitlements_product_check;

-- Mirrors the 00030 widened set plus 'in-depth-assessment'. The legacy
-- 'aibi-p' slug stays in the set forever — Stripe webhook retries from
-- 2026-Q1 may still arrive with metadata.product='aibi-p'.
ALTER TABLE entitlements
  ADD CONSTRAINT entitlements_product_check
  CHECK (
    product IN (
      'aibi-p',
      'aibi-s',
      'aibi-l',
      'toolbox-only',
      'foundation',
      'foundations',
      'in-depth-assessment'
    )
  );

-- 3. Trigger — sync entitlements from course_enrollments ---------------

CREATE OR REPLACE FUNCTION public.sync_entitlement_from_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product text;
  v_tier text;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_product := OLD.product;
  ELSE
    v_product := NEW.product;
  END IF;

  -- Accept Foundation (singular + plural legacy), AiBI-S, AiBI-L, and
  -- In-Depth Assessment. 'toolbox-only' is gated through subscription,
  -- not enrollment, so it is intentionally excluded here.
  IF v_product NOT IN (
    'aibi-p',
    'aibi-s',
    'aibi-l',
    'foundation',
    'foundations',
    'in-depth-assessment'
  ) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Tier mapping:
  --   - 'in-depth-assessment' → 'starter' (read-only Library + Cookbook)
  --   - everything else       → 'full'    (Library + Cookbook + Build + Playground)
  v_tier := CASE
    WHEN v_product = 'in-depth-assessment' THEN 'starter'
    ELSE 'full'
  END;

  IF (TG_OP = 'DELETE') THEN
    UPDATE entitlements
       SET active = false,
           revoked_at = now()
     WHERE user_id = OLD.user_id
       AND source = 'course_enrollment'
       AND source_ref = OLD.id::text
       AND active = true;
    RETURN OLD;
  END IF;

  INSERT INTO entitlements (
    user_id, product, source, source_ref, tier,
    active, granted_at, expires_at
  )
  VALUES (
    NEW.user_id,
    NEW.product,
    'course_enrollment',
    NEW.id::text,
    v_tier,
    true,
    COALESCE(NEW.created_at, now()),
    NULL
  )
  ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
  DO UPDATE SET
    active = true,
    revoked_at = NULL,
    tier = EXCLUDED.tier,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- The trigger itself is unchanged (still wired AFTER INSERT OR UPDATE OR
-- DELETE on course_enrollments — see 00015). Recreating it here is
-- idempotent and protects against environments where the original was
-- dropped manually.
DROP TRIGGER IF EXISTS trg_course_enrollments_sync_entitlement ON course_enrollments;
CREATE TRIGGER trg_course_enrollments_sync_entitlement
  AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.sync_entitlement_from_enrollment();

-- 4. has_toolbox_access() helper — include 'in-depth-assessment' -------
--
-- Including In-Depth buyers unlocks Library + Cookbook RLS predicates
-- (toolbox_library_skills, toolbox_library_skill_versions, toolbox_recipes).
-- This is intentional — Starter tier IS read-only Library + Cookbook.
-- The Build / Playground / Run gates live in the API layer (canBuildOrRun)
-- so a Starter user can read but cannot write or run.

CREATE OR REPLACE FUNCTION public.has_toolbox_access(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.entitlements
    where user_id = check_user_id
      and active = true
      and product in (
        'aibi-p',
        'aibi-s',
        'aibi-l',
        'toolbox-only',
        'foundation',
        'foundations',
        'in-depth-assessment'
      )
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  );
$$;

-- 5. Backfill ---------------------------------------------------------
--
-- Insert a Starter entitlement for every existing In-Depth course_enrollments
-- row that doesn't already have a matching entitlement. Idempotent — the
-- UNIQUE INDEX (user_id, product, source, COALESCE(source_ref, ''))
-- catches duplicates.

INSERT INTO entitlements (
  user_id, product, source, source_ref, tier,
  active, granted_at, expires_at
)
SELECT
  ce.user_id,
  ce.product,
  'course_enrollment',
  ce.id::text,
  'starter',
  true,
  COALESCE(ce.enrolled_at, ce.created_at, now()),
  NULL
FROM course_enrollments ce
WHERE ce.product = 'in-depth-assessment'
  AND ce.user_id IS NOT NULL
ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
DO NOTHING;

COMMIT;
