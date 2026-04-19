-- Phase 09 Fix (IN-02): unblock the AiBI-S read path (SELECT crash).
-- Finding: src/app/courses/aibi-s/_lib/getEnrollment.ts references
-- role_track, cohort_id, cohort_start_date — none of which existed in any
-- prior migration. The .select() failed with 42703 column does not exist,
-- so getEnrollment returned null on every call.
--
-- This migration adds the three columns as NULL-able so the SELECT no
-- longer crashes. role_track is the AiBI-S specialist track
-- ('operations'|'lending'|'compliance'|'finance'|'retail') — see
-- src/app/courses/aibi-s/_components/RoleTrackBadge.tsx for the enum.
--
-- IMPORTANT — read-path only. The AiBI-S WRITE path is still broken:
--   - src/app/api/create-checkout/route.ts hardcodes product='aibi-p' and
--     does not accept the AiBI-S EnrollButton payload (no `mode` field).
--   - src/lib/stripe/provision-enrollment.ts:108 hardcodes
--     product:'aibi-p' on insert and never writes role_track/cohort_id.
-- Once Stripe is live, the first AiBI-S purchase will silently provision
-- an AiBI-P row. See backlog item 999.13 for the full write-path fix.
--
-- The cohort_* columns reflect a prior cohort-based design that has
-- since shifted to self-paced. They are added here to keep the schema
-- compatible with current EnrollButton/purchase code; a follow-up
-- backlog item should remove them once the self-paced refactor lands.

ALTER TABLE course_enrollments
  ADD COLUMN IF NOT EXISTS role_track        text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cohort_id         uuid        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cohort_start_date timestamptz DEFAULT NULL;

-- Constrain role_track to the known enum values (NULL still allowed for
-- AiBI-P enrollments which don't use this column).
-- Wrapped in DO block so the migration is idempotent on re-apply
-- (Postgres ADD CONSTRAINT does not support IF NOT EXISTS for CHECK).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'course_enrollments_role_track_valid'
      AND conrelid = 'public.course_enrollments'::regclass
  ) THEN
    ALTER TABLE course_enrollments
      ADD CONSTRAINT course_enrollments_role_track_valid
      CHECK (role_track IS NULL OR role_track IN
        ('operations', 'lending', 'compliance', 'finance', 'retail'));
  END IF;
END $$;
