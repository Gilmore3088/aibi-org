-- Audit A13 (2026-05-24): tag the eleven knowledge checks Pair 3 (Lena)
-- flagged as testing UI / policy / housekeeping rather than the lesson's
-- learning construct. Default kind is 'construct'; these eleven flip to
-- 'orientation' so the LMS surface can render them as the optional
-- housekeeping group and exclude them from the lesson's mastery score.
--
-- Identified via (lesson_id, ordinal) so the update is stable across
-- UUID re-generations.

UPDATE addie.knowledge_checks
SET kind = 'orientation'
WHERE (lesson_id, ordinal) IN (
  ('m0.1', 1),  -- "How long is the longest lesson…" — UI duration
  ('m0.1', 2),  -- "What do you have to do to keep something…" — policy
  ('m0.1', 3),  -- "Can you change your role track later…" — UI
  ('m1.3', 2),  -- "Can you switch tracks later…" — UI
  ('m2.3', 3),  -- "What is the point of saving…" — UI / Toolbox policy
  ('m3.2', 2),  -- gating / payment policy
  ('m3.5', 1),  -- gate policy
  ('m3.5', 2),  -- gate policy
  ('m4.3', 1),  -- UI nav
  ('m5.2', 2),  -- UI / artifact policy
  ('m5.5', 2)   -- UI / artifact policy
);
