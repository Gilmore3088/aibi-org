-- Phase 09 Fix (IN-02): unblock AiBI-S enrollment
-- Finding: src/app/courses/aibi-s/_lib/getEnrollment.ts and EnrollButton.tsx
-- reference role_track, cohort_id, cohort_start_date — none of which exist
-- in any prior migration. The .select() fails with 42703 column does not
-- exist, getEnrollment returns null, and AiBI-S has no working enrollment
-- path in production.
--
-- This migration adds the three columns as NULL-able so existing rows
-- (none yet, but defensive) and future self-paced enrollments can have
-- NULL cohort_id/cohort_start_date. role_track is the AiBI-S specialist
-- track ('operations'|'lending'|'compliance'|'finance'|'retail') — see
-- src/app/courses/aibi-s/_components/RoleTrackBadge.tsx for the enum.
--
-- Note: The cohort_* columns reflect a prior cohort-based design that has
-- since shifted to self-paced (per project memory + 036e631 design spec).
-- They are added here only to unblock the existing app code; a follow-up
-- backlog item should remove cohort_id, cohort_start_date and any code
-- that writes to them once the self-paced refactor is complete.

ALTER TABLE course_enrollments
  ADD COLUMN IF NOT EXISTS role_track        text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cohort_id         uuid        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cohort_start_date timestamptz DEFAULT NULL;

-- Constrain role_track to the known enum values (NULL still allowed for
-- AiBI-P enrollments which don't use this column).
ALTER TABLE course_enrollments
  ADD CONSTRAINT course_enrollments_role_track_valid
  CHECK (role_track IS NULL OR role_track IN
    ('operations', 'lending', 'compliance', 'finance', 'retail'));
