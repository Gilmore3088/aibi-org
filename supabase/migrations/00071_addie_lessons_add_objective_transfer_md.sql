-- Add nullable objective_md + transfer_md to addie.lessons.
-- Consumed by src/components/addie/lesson/LessonPlayer.tsx
-- (LessonObjectiveBeat + LessonTransferBeat).
--
-- Without these columns the PostgREST select in
-- src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx errors with
-- 'column lessons.objective_md does not exist' and every lesson route
-- 404s. Applied via Supabase MCP on 2026-05-24; this file mirrors the
-- applied state so subsequent migration runs are consistent.

ALTER TABLE addie.lessons
  ADD COLUMN IF NOT EXISTS objective_md text,
  ADD COLUMN IF NOT EXISTS transfer_md text;

COMMENT ON COLUMN addie.lessons.objective_md IS 'Verb-first observable behavior the lesson builds toward (LessonObjectiveBeat).';
COMMENT ON COLUMN addie.lessons.transfer_md IS 'Monday-morning action the lesson points to (LessonTransferBeat).';
