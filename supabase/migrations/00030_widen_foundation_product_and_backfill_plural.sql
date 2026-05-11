-- 2026-05-11 recovery: unify product naming on canonical 'foundation' singular.
--
-- Background
-- ----------
-- Two earlier renames left production in an inconsistent state:
--   1. brand-refresh's 00028a_legacy_rename_applied_2026_05_10.sql (formerly
--      00028_rename_aibi_p_product_to_foundations.sql) was applied via MCP
--      on 2026-05-10. It flipped every 'aibi-p' product row to 'foundations'
--      (plural) and widened the entitlements_product_check constraint to
--      accept the plural value.
--   2. PR #45 (merged 2026-05-11) introduced canonical 'foundation' singular
--      naming on the application code side, plus 00028_add_foundation_product_value.sql
--      (would widen CHECK to accept singular) and 00029_backfill_foundation_product.sql
--      (would flip 'aibi-p' rows to singular). Neither was ever applied to
--      production, because the brand-refresh migration had already moved the
--      data to plural; there were no 'aibi-p' rows left for 00029 to flip.
--
-- Symptom at 2026-05-11
-- ---------------------
-- - 5 course_enrollments + 6 entitlements rows had product='foundations' (plural)
-- - entitlements_product_check accepted 'foundations' but NOT 'foundation'
-- - The application's normalizeProduct() shim returned null for 'foundations'
--   (only handles 'aibi-p' → 'foundation'), making those users' entitlements
--   invisible to the entitlement system.
-- - The sync_entitlement_from_enrollment() trigger guard rejected 'foundation',
--   so new writes from PR #45's write-side code path would have failed to
--   propagate from course_enrollments to entitlements.
--
-- This migration
-- --------------
-- Step 1: widen CHECK to accept 'foundation' (and keep 'foundations' for the
--         duration of the backfill so we don't violate the constraint mid-run).
-- Step 2: recreate the sync trigger so its guard accepts 'foundation'.
-- Step 3a: backfill entitlements 'foundations' → 'foundation' FIRST. (Order
--          matters: doing 3b before 3a triggers an insert during the
--          course_enrollments update that collides with the entitlements
--          update's destination row.)
-- Step 3b: backfill course_enrollments 'foundations' → 'foundation'. The
--          trigger fires per row; the ON CONFLICT path now matches the
--          entitlements row 3a renamed, so it becomes a no-op DO UPDATE
--          instead of an INSERT.
--
-- 'foundations' (plural) is intentionally LEFT in the CHECK allowlist as a
-- safety net. A follow-up migration may drop it once we have confidence no
-- legacy code path tries to write the plural value.
--
-- Applied via Supabase MCP 2026-05-11 (recorded as
-- `widen_foundation_product_and_backfill_plural_v2`). This file is kept for
-- repo history; re-applying it is idempotent.

-- Step 1: widen CHECK constraint.
ALTER TABLE entitlements DROP CONSTRAINT IF EXISTS entitlements_product_check;
ALTER TABLE entitlements ADD CONSTRAINT entitlements_product_check
  CHECK (product = ANY (ARRAY[
    'foundation'::text,
    'foundations'::text,
    'aibi-p'::text,
    'aibi-s'::text,
    'aibi-l'::text,
    'toolbox-only'::text,
    'indepth-starter-toolkit'::text
  ]));

-- Step 2: recreate trigger to accept 'foundation' in its guard.
CREATE OR REPLACE FUNCTION public.sync_entitlement_from_enrollment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_product text;
BEGIN
  IF (TG_OP = 'DELETE') THEN v_product := OLD.product; ELSE v_product := NEW.product; END IF;
  IF v_product NOT IN ('aibi-p', 'aibi-s', 'aibi-l', 'foundation') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF (TG_OP = 'DELETE') THEN
    UPDATE entitlements SET active=false, revoked_at=now()
     WHERE user_id=OLD.user_id AND source='course_enrollment' AND source_ref=OLD.id::text AND active=true;
    RETURN OLD;
  END IF;
  INSERT INTO entitlements (user_id, product, source, source_ref, active, granted_at, expires_at)
  VALUES (NEW.user_id, NEW.product, 'course_enrollment', NEW.id::text, true, COALESCE(NEW.created_at, now()), NULL)
  ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
  DO UPDATE SET active=true, revoked_at=NULL, updated_at=now();
  RETURN NEW;
END; $$;

-- Step 3a: backfill entitlements first.
UPDATE entitlements SET product = 'foundation' WHERE product = 'foundations';

-- Step 3b: backfill course_enrollments. Trigger fires; ON CONFLICT matches
-- the row 3a updated, becomes a DO UPDATE no-op.
UPDATE course_enrollments SET product = 'foundation' WHERE product = 'foundations';
