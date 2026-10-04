-- 00064: "Did this work?" feedback on banker skills (/playbooks/<role>).
-- One row per click. No email, no prompt text, no user id: just which skill,
-- whether it worked, and an optional short note. The weekly skills refresh
-- reads these to decide which skills to improve first
-- (scripts/skills-feedback-report.mjs, .claude/skills/refresh-skills).
--
-- Service-role writes and reads only (the API route inserts); RLS on with no
-- anon/authenticated policies.

CREATE TABLE IF NOT EXISTS skill_feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id    text NOT NULL,
  skill_slug  text NOT NULL,
  skill_version integer NOT NULL,
  worked      boolean NOT NULL,
  note        text DEFAULT NULL CHECK (note IS NULL OR char_length(note) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS skill_feedback_skill_idx ON skill_feedback (skill_id, created_at DESC);

ALTER TABLE skill_feedback ENABLE ROW LEVEL SECURITY;
