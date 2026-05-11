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

-- 4. LMS-primitive tables (00009): course_id is a tenant slug, not a FK.
-- Each table has UNIQUE (user_id, course_id, <item_id>). If a user has both
-- an 'aibi-p' row and a 'foundation' row for the same item (possible when
-- the writer flip happened mid-session), the UPDATE would violate UNIQUE.
-- Pre-flight DELETE the legacy 'aibi-p' row in that collision case — the
-- canonical 'foundation' row wins because it reflects the post-flip writer
-- state. Then UPDATE the remaining 'aibi-p' rows to 'foundation'.
--
-- This mirrors the upsert-on-conflict behavior of the write-side code:
-- pre-flip writes would have updated the 'aibi-p' row; post-flip writes
-- create the 'foundation' row separately when no upsert key matches.

DELETE FROM user_artifacts u1
 WHERE u1.course_id = 'aibi-p'
   AND EXISTS (
     SELECT 1 FROM user_artifacts u2
      WHERE u2.user_id = u1.user_id
        AND u2.course_id = 'foundation'
        AND u2.artifact_id = u1.artifact_id
   );
UPDATE user_artifacts SET course_id = 'foundation' WHERE course_id = 'aibi-p';

DELETE FROM saved_prompts s1
 WHERE s1.course_id = 'aibi-p'
   AND EXISTS (
     SELECT 1 FROM saved_prompts s2
      WHERE s2.user_id = s1.user_id
        AND s2.course_id = 'foundation'
        AND s2.prompt_id = s1.prompt_id
   );
UPDATE saved_prompts SET course_id = 'foundation' WHERE course_id = 'aibi-p';

DELETE FROM practice_rep_completions p1
 WHERE p1.course_id = 'aibi-p'
   AND EXISTS (
     SELECT 1 FROM practice_rep_completions p2
      WHERE p2.user_id = p1.user_id
        AND p2.course_id = 'foundation'
        AND p2.rep_id = p1.rep_id
   );
UPDATE practice_rep_completions SET course_id = 'foundation' WHERE course_id = 'aibi-p';

-- Verification queries (these are not run as part of the migration; they are
-- here for the operator to run manually after the migration applies):
--
--   SELECT COUNT(*) FROM course_enrollments WHERE product = 'aibi-p'; -- expect 0
--   SELECT COUNT(*) FROM entitlements        WHERE product = 'aibi-p'; -- expect 0
--   SELECT COUNT(*) FROM prompt_library
--    WHERE course_source_ref LIKE 'aibi-p/%';                          -- expect 0
--   SELECT COUNT(*) FROM user_artifacts          WHERE course_id = 'aibi-p'; -- expect 0
--   SELECT COUNT(*) FROM saved_prompts           WHERE course_id = 'aibi-p'; -- expect 0
--   SELECT COUNT(*) FROM practice_rep_completions WHERE course_id = 'aibi-p'; -- expect 0

COMMIT;

-- ROLLBACK note:
-- If this migration causes an issue, the inverse is:
--   UPDATE course_enrollments SET product = 'aibi-p' WHERE product = 'foundation';
--   UPDATE entitlements        SET product = 'aibi-p' WHERE product = 'foundation';
--   UPDATE prompt_library
--      SET course_source_ref = REPLACE(course_source_ref, 'foundation/', 'aibi-p/')
--    WHERE course_source_ref LIKE 'foundation/%';
--   UPDATE user_artifacts          SET course_id = 'aibi-p' WHERE course_id = 'foundation';
--   UPDATE saved_prompts           SET course_id = 'aibi-p' WHERE course_id = 'foundation';
--   UPDATE practice_rep_completions SET course_id = 'aibi-p' WHERE course_id = 'foundation';
-- BUT: this loses any genuinely-new 'foundation' rows written by the post-Phase 6
-- writer code, AND the DELETE-on-conflict step above is not reversible (legacy
-- duplicate rows are gone). Coordinate with operator before rolling back.
