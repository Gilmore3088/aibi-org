-- Seed objective_md + transfer_md for M0 lessons.
-- Objective: verb-first observable behavior the lesson builds toward.
-- Transfer: Monday-morning action the lesson points to.
-- Consumed by LessonObjectiveBeat + LessonTransferBeat (LessonPlayer.tsx).
-- Applied via Supabase MCP on 2026-05-24; mirrored here for migration
-- history consistency.

UPDATE addie.lessons
SET
  objective_md = 'Locate the course shape (six modules, 24 lessons), confirm your role track, and recognize what the Toolbox saves on your behalf.',
  transfer_md  = 'Open one expectation about the course (free vs paid, anonymous saves, track switching) with a teammate this week.'
WHERE id = 'm0.1';

UPDATE addie.lessons
SET
  objective_md = 'Strip identifying details from a real-shaped AI ask, classify common banking inputs as Allowed / Needs Review / Off-Limits, and save the Data Discipline Card.',
  transfer_md  = 'Before your next AI ask this week: pick one routine task, strip names + account numbers + specifics, and rewrite it as a situation. Then ask.'
WHERE id = 'm0.2';
