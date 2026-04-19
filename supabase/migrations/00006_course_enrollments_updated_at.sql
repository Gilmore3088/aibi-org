-- Phase 09 Fix 1: updated_at on course_enrollments
-- Finding: Phase 04 UAT noticed no updated_at timestamp on course_enrollments,
-- making it hard to audit when progress was last saved. Column added; trigger
-- reuses the hardened public.set_updated_at() from migration 00004.

-- Add the column (nullable initially so the ALTER does not fail on existing rows).
ALTER TABLE course_enrollments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Backfill existing rows to created_at so the column is fully populated.
UPDATE course_enrollments
  SET updated_at = created_at
  WHERE updated_at IS NULL;

-- Now make it NOT NULL with a default for future inserts.
ALTER TABLE course_enrollments
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

-- Trigger: auto-set updated_at on any UPDATE.
DROP TRIGGER IF EXISTS set_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER set_course_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
