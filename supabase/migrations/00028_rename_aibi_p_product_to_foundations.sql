-- 2026-05-09 brand refresh — rename product 'aibi-p' to 'foundations'
--
-- Backfill existing course_enrollments rows from the legacy product
-- identifier ('aibi-p') to the new canonical identifier ('foundations'),
-- and rewrite the same prefix in library_links.source_ref values that
-- key Toolbox source backlinks to the course.
--
-- The application code accepts both values during the migration window
-- (see .in('product', ['foundations', 'aibi-p']) filters), so this
-- migration is safe to apply at any time relative to the deploy. After
-- it runs, the legacy matchers in code become dead code and can be
-- dropped in a follow-up cleanup commit.
--
-- Idempotent — safe to run multiple times.

BEGIN;

-- 1. course_enrollments.product
UPDATE course_enrollments
   SET product = 'foundations'
 WHERE product = 'aibi-p';

-- 2. library_links.source_ref — pattern is 'aibi-p/module-{N}/{prompt-id}'
--    See src/app/dashboard/toolbox/_components/SourceBacklink.tsx for the
--    consumer regex (also rewritten in this commit to accept both prefixes).
UPDATE library_links
   SET source_ref = REGEXP_REPLACE(source_ref, '^aibi-p/', 'foundations/')
 WHERE source = 'course'
   AND source_ref LIKE 'aibi-p/%';

-- 3. course_id columns on practice_rep_completions, saved_prompts, user_artifacts
UPDATE practice_rep_completions SET course_id = 'foundations' WHERE course_id = 'aibi-p';
UPDATE saved_prompts            SET course_id = 'foundations' WHERE course_id = 'aibi-p';
UPDATE user_artifacts           SET course_id = 'foundations' WHERE course_id = 'aibi-p';

COMMIT;

-- Verification (run after applying):
--   SELECT product, COUNT(*) FROM course_enrollments GROUP BY product;
--     → 0 rows with product = 'aibi-p'
--   SELECT COUNT(*) FROM library_links WHERE source_ref LIKE 'aibi-p/%';
--     → 0
