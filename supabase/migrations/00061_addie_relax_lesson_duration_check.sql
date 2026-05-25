-- 00061_addie_relax_lesson_duration_check.sql
-- Relax the addie.lessons.duration_min check constraint from <=15 to <=60.
--
-- Context: the original constraint enforced the "every lesson is 15 minutes
-- or less" promise made in M0.1. The 2026-05-24 Pair 1 UX×ID critique
-- (foundation-pair1-cogload-id-2026-05-24.md, finding P1.4) showed that
-- M3.5 and M5.3 are real ~25–30 min build lessons; pretending otherwise
-- pushes abandonment at the conversion finale (M3.5). M0.1 stat and
-- knowledge-check were updated to "8–30 min" honesty; this migration lets
-- M3.5 (25) and M5.3 (30) actually persist with their honest duration.
--
-- Upper bound 60 keeps a sanity ceiling — anything longer than an hour is
-- a sign the lesson should be split.
--
-- Idempotent: drops and re-adds the same-named constraint.

ALTER TABLE addie.lessons DROP CONSTRAINT IF EXISTS lessons_duration_min_check;
ALTER TABLE addie.lessons
  ADD CONSTRAINT lessons_duration_min_check CHECK (duration_min > 0 AND duration_min <= 60);
