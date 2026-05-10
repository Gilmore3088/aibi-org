-- 00029_backfill_foundation_product.sql
-- Phase 7 of the aibi-p -> foundation rename migration.
--
-- DEPLOY ORDER MATTERS. Apply this migration ONLY after:
--   1. 00028_add_foundation_product_value.sql is applied (CHECK constraint accepts both)
--   2. The application code from Phase 3 is deployed (dual-read queries via .in())
--   3. The application code from Phase 6 is deployed (webhook handler accepts both
--      legacy 'aibi-p' and canonical 'foundation' on metadata.product)
--
-- Why this order: while the rolling deploy is in flight, an old web instance may
-- still be writing 'aibi-p' to course_enrollments. If we backfill before the
-- writers flip, those new rows immediately become orphaned 'aibi-p' values that
-- need a second backfill. Order matters.

BEGIN;

-- 1. course_enrollments.product backfill
UPDATE course_enrollments
   SET product = 'foundation'
 WHERE product = 'aibi-p';

-- 2. entitlements.product backfill (mirror)
UPDATE entitlements
   SET product = 'foundation'
 WHERE product = 'aibi-p';

-- 3. prompt_library.course_source_ref values rewritten
-- These are slugs like 'aibi-p/module-3' that point back at the source course.
UPDATE prompt_library
   SET course_source_ref = REPLACE(course_source_ref, 'aibi-p/', 'foundation/')
 WHERE course_source_ref LIKE 'aibi-p/%';

-- Verification queries (these are not run as part of the migration; they are
-- here for the operator to run manually after the migration applies):
--
--   SELECT COUNT(*) FROM course_enrollments WHERE product = 'aibi-p'; -- expect 0
--   SELECT COUNT(*) FROM entitlements        WHERE product = 'aibi-p'; -- expect 0
--   SELECT COUNT(*) FROM prompt_library
--    WHERE course_source_ref LIKE 'aibi-p/%';                          -- expect 0

COMMIT;

-- ROLLBACK note:
-- If this migration causes an issue, the inverse is:
--   UPDATE course_enrollments SET product = 'aibi-p' WHERE product = 'foundation';
--   UPDATE entitlements        SET product = 'aibi-p' WHERE product = 'foundation';
--   UPDATE prompt_library
--      SET course_source_ref = REPLACE(course_source_ref, 'foundation/', 'aibi-p/')
--    WHERE course_source_ref LIKE 'foundation/%';
-- BUT: this loses any genuinely-new 'foundation' rows written by the post-Phase 6
-- writer code. Coordinate with operator before rolling back.
