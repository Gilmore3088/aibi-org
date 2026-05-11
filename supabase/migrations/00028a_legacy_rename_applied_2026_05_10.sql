-- 2026-05-09 brand refresh — rename product 'aibi-p' to 'foundations' (plural)
--
-- HISTORICAL — DO NOT RE-APPLY. Original number was 00028 (collided with
-- 00028_add_foundation_product_value.sql from PR #45). Renamed to 00028a
-- on 2026-05-11 to break the on-disk collision; the migration itself was
-- applied directly via Supabase MCP on 2026-05-10 and is recorded in the
-- supabase migration log as `rename_aibi_p_product_to_foundations`.
--
-- The plural `'foundations'` rows it produced have since been re-flipped
-- to canonical singular `'foundation'` by migration 00030
-- (widen_foundation_product_and_backfill_plural). Do not re-run this
-- file — it would re-introduce the plural value the recovery migration
-- removed.
--
-- Kept for migration history only.
--
-- Backfill rows from the legacy product identifier ('aibi-p') to the
-- new canonical identifier ('foundations'). Production schema only has
-- two tables that store this value: course_enrollments.product and
-- entitlements.product. The entitlements table also has a CHECK
-- constraint that enforces the allowed product values, so the
-- constraint is widened to accept 'foundations' before the UPDATE
-- (ALTER...DROP/ADD wrapped so a re-run sees the constraint already
-- in its widened form and raises a non-fatal error that's caught by
-- the IF EXISTS / IF NOT EXISTS guards in the actual production run).
--
-- The application code accepts both values during the migration window
-- (see .in('product', ['foundations', 'aibi-p']) filters), so the
-- order of code-deploy vs migration-apply does not matter.
--
-- 'aibi-p' is left in the entitlements_product_check allowed list so
-- the legacy app code (still on main pre-merge) continues to work.
-- A follow-up cleanup migration after merge can drop it.

BEGIN;

-- Widen the entitlements check constraint to allow 'foundations'.
ALTER TABLE entitlements DROP CONSTRAINT IF EXISTS entitlements_product_check;
ALTER TABLE entitlements ADD CONSTRAINT entitlements_product_check
  CHECK (product = ANY (ARRAY[
    'foundations'::text,
    'aibi-p'::text,
    'aibi-s'::text,
    'aibi-l'::text,
    'toolbox-only'::text,
    'indepth-starter-toolkit'::text
  ]));

-- Backfill product values.
UPDATE course_enrollments SET product = 'foundations' WHERE product = 'aibi-p';
UPDATE entitlements       SET product = 'foundations' WHERE product = 'aibi-p';

COMMIT;

-- Verification (run after applying):
--   SELECT product, COUNT(*) FROM course_enrollments GROUP BY product;
--   SELECT product, COUNT(*) FROM entitlements       GROUP BY product;
--     → 0 rows with product = 'aibi-p' in either table after a clean run
