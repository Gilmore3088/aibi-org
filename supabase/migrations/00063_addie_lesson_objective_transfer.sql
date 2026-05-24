-- Audit A8 (2026-05-24): KCs skew Remember/Understand and Gagné event 9
-- (retention/transfer) is systematically absent from lesson closes. Add
-- two structured fields to addie.lessons so every lesson carries:
--   1. An ## Objective line — verb-first observable behavior the learner
--      should be able to do after the lesson. This is the missing apex
--      of the alignment triangle Pair 2 named.
--   2. A "transfer" / Monday-morning line that ties the lesson outcome
--      to a concrete action in the learner's actual job — Gagné's
--      ninth event of instruction.
--
-- Both columns are nullable so existing tooling (migrations, seeders,
-- the LessonPlayer surface) does not crash on unmigrated rows. The
-- 00064 seed migration backfills all 24 published lessons.

ALTER TABLE addie.lessons
  ADD COLUMN IF NOT EXISTS objective_md text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS transfer_md  text DEFAULT NULL;

COMMENT ON COLUMN addie.lessons.objective_md IS
  'Verb-first observable behavior the learner should be able to do after this lesson. Rendered at lesson open. A8 audit fix 2026-05-24.';
COMMENT ON COLUMN addie.lessons.transfer_md IS
  'Concrete Monday-morning action that converts the lesson outcome into the learner''s real job. Rendered at lesson close (Gagné event 9). A8 audit fix 2026-05-24.';
