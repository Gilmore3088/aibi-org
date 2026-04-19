-- Phase 09 follow-up (bug_002 from ultrareview): collapse the UI/API
-- divergence on course_enrollments.current_module.
--
-- Background: migration 00001 set current_module DEFAULT 0 (meaning
-- "enrolled, not started"). Phase 09 commit fbda667 added a Math.max(1, ...)
-- normalization in getEnrollment.ts so the UI never builds a /0 URL — but
-- the API routes (api/courses/save-progress, submit-activity) re-query
-- the raw column for forward-only enforcement. Any row with raw
-- current_module=0 would now get the UI saying "module 1" while every
-- save POST returns 400 "Module out of sequence." Stuck loop.
--
-- The application-level insert paths today (provision-enrollment.ts:108)
-- explicitly set current_module=1, so production rows are likely already
-- safe. This migration is defensive: backfill any 0-rows to 1 and shift
-- the default so new manual/admin/SQL inserts can never reintroduce the
-- trigger condition.
--
-- The getEnrollment.ts Math.max coercion stays in place as belt-and-
-- suspenders for any legacy data this misses.

-- Backfill any existing rows that still hold the old default.
UPDATE course_enrollments
  SET current_module = 1
  WHERE current_module = 0;

-- Shift the schema default to match the application contract.
ALTER TABLE course_enrollments
  ALTER COLUMN current_module SET DEFAULT 1;
