-- 00044_addie_knowledge_checks.sql
-- 2–3 checks per lesson, logged for L2. Spec §5.6.

CREATE TABLE addie.knowledge_checks (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL REFERENCES addie.lessons(id) ON DELETE CASCADE,
  ordinal   smallint NOT NULL,
  prompt    text NOT NULL,
  options   jsonb NOT NULL,   -- [{id, label, correct: bool}]
  UNIQUE (lesson_id, ordinal)
);

CREATE INDEX idx_addie_kc_lesson ON addie.knowledge_checks(lesson_id);

CREATE TABLE addie.knowledge_check_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_session_id uuid,
  check_id        uuid NOT NULL REFERENCES addie.knowledge_checks(id) ON DELETE CASCADE,
  selected_option text NOT NULL,
  correct         boolean NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR anon_session_id IS NOT NULL)
);

CREATE INDEX idx_addie_kcr_user  ON addie.knowledge_check_results(user_id);
CREATE INDEX idx_addie_kcr_check ON addie.knowledge_check_results(check_id);
CREATE INDEX idx_addie_kcr_anon  ON addie.knowledge_check_results(anon_session_id);

ALTER TABLE addie.knowledge_checks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE addie.knowledge_check_results  ENABLE ROW LEVEL SECURITY;

-- Checks: visible if the parent lesson is published. Tier filtering is
-- enforced by the lessons RLS (00042/00043).
CREATE POLICY "reads addie checks for accessible lessons"
  ON addie.knowledge_checks FOR SELECT
  TO anon, authenticated
  USING (lesson_id IN (SELECT id FROM addie.lessons WHERE published));

-- Results: learner reads their own. Inserts go through server endpoints
-- (validate correctness, prevent tampering, write anon_session_id where
-- there's no user).
CREATE POLICY "learner reads own addie check results"
  ON addie.knowledge_check_results FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
