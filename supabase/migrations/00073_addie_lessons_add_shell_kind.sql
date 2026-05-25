-- 00073_addie_lessons_add_shell_kind.sql
-- Add shell_kind to addie.lessons so the foundation lesson route can switch
-- between the long-scroll LessonPlayer (legacy) and the focused step-by-step
-- LessonStepShell (step) per lesson.
--
-- Consumed by:
--   src/app/(addie)/foundation/[moduleId]/[lessonId]/page.tsx
--   src/components/addie/lesson/LessonStepPlayer.tsx (new in this PR)
--
-- Default 'legacy' keeps every existing lesson on the current LessonPlayer
-- render. Flipping a lesson to 'step' opts it into LessonStepShell — no
-- code change, just a one-row UPDATE per migrated lesson.
--
-- Aligns with Plans/aibi-foundations-ux-recovery-2026-05-25.md Phase 1 +
-- docs/superpowers/specs/2026-05-25-foundation-phase-1-shell-design.md.

ALTER TABLE addie.lessons
  ADD COLUMN IF NOT EXISTS shell_kind text NOT NULL DEFAULT 'legacy'
    CHECK (shell_kind IN ('step', 'legacy'));

COMMENT ON COLUMN addie.lessons.shell_kind IS
  'Which lesson renderer to use: ''legacy'' = LessonPlayer (long-scroll); ''step'' = LessonStepShell (focused step-by-step). Flipped per lesson during the Phase 1 Guided Lesson Shell migration. M01Experience and M02Experience routes branch on lesson_id and do not consult this column.';
