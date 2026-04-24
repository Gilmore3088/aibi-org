-- Reusable LMS primitives for AiBI-P and future courses.
-- Static course content remains in the repo; these tables store learner state.

CREATE TABLE IF NOT EXISTS practice_rep_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  rep_id text NOT NULL,
  response jsonb DEFAULT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, rep_id)
);

CREATE TABLE IF NOT EXISTS saved_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  prompt_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, prompt_id)
);

CREATE TABLE IF NOT EXISTS user_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  artifact_id text NOT NULL,
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'in-progress', 'completed', 'locked')),
  source_activity_id text DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, artifact_id)
);

ALTER TABLE practice_rep_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own practice completions" ON practice_rep_completions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert own practice completions" ON practice_rep_completions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own practice completions" ON practice_rep_completions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users read own saved prompts" ON saved_prompts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert own saved prompts" ON saved_prompts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own saved prompts" ON saved_prompts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users read own artifacts" ON user_artifacts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users upsert own artifacts" ON user_artifacts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own artifacts" ON user_artifacts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_practice_rep_completions_user_course
  ON practice_rep_completions(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_course
  ON saved_prompts(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_user_artifacts_user_course
  ON user_artifacts(user_id, course_id);
