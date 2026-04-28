-- Standalone paid-user Toolbox.
-- Users save skill definitions server-side and can export them as Markdown.

CREATE TABLE IF NOT EXISTS toolbox_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id text DEFAULT NULL,
  command text NOT NULL,
  name text NOT NULL,
  maturity text NOT NULL DEFAULT 'draft'
    CHECK (maturity IN ('draft', 'pilot', 'production')),
  skill jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, command)
);

ALTER TABLE toolbox_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own toolbox skills" ON toolbox_skills
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert own toolbox skills" ON toolbox_skills
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own toolbox skills" ON toolbox_skills
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own toolbox skills" ON toolbox_skills
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_user_updated
  ON toolbox_skills(user_id, updated_at DESC);

-- AI usage logging used by the shared ai-harness rate limiter.
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  course_slug text NOT NULL,
  feature_id text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  input_tokens integer DEFAULT NULL,
  output_tokens integer DEFAULT NULL,
  cost_cents numeric DEFAULT NULL,
  status text NOT NULL CHECK (status IN ('succeeded', 'rate-limited', 'errored')),
  error_kind text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ai usage" ON ai_usage_log
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_feature_day
  ON ai_usage_log(user_id, feature_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_course_day
  ON ai_usage_log(course_slug, status, created_at DESC);

