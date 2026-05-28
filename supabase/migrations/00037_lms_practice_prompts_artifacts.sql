-- 00037_lms_practice_prompts_artifacts.sql
--
-- Creates the three LMS tables referenced by code but missing from the
-- remote database (discovered in the 2026-05-28 Supabase audit):
--
--   practice_rep_completions  — one row per (user, course, rep) practice rep
--   saved_prompts             — bookmarks of toolbox prompts within a course
--   user_artifacts            — persisted artifact state (4-state machine)
--
-- All three are scoped by (user_id, course_id). Each has a unique constraint
-- matching the onConflict clause used by the upserting routes. RLS is enabled
-- and policies grant a user full CRUD on their own rows. The service-role
-- key bypasses RLS for server-side writes from submit-activity etc.

BEGIN;

-- 1. practice_rep_completions ----------------------------------------

CREATE TABLE IF NOT EXISTS public.practice_rep_completions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id     text NOT NULL,
  rep_id        text NOT NULL,
  response      jsonb,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT practice_rep_completions_unique UNIQUE (user_id, course_id, rep_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_rep_completions_user
  ON public.practice_rep_completions(user_id);

ALTER TABLE public.practice_rep_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own practice reps" ON public.practice_rep_completions;
CREATE POLICY "Users read own practice reps" ON public.practice_rep_completions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users write own practice reps" ON public.practice_rep_completions;
CREATE POLICY "Users write own practice reps" ON public.practice_rep_completions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users update own practice reps" ON public.practice_rep_completions;
CREATE POLICY "Users update own practice reps" ON public.practice_rep_completions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 2. saved_prompts ---------------------------------------------------

CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   text NOT NULL,
  prompt_id   text NOT NULL,
  saved_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_prompts_unique UNIQUE (user_id, course_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_prompts_user
  ON public.saved_prompts(user_id);

ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own saved prompts" ON public.saved_prompts;
CREATE POLICY "Users read own saved prompts" ON public.saved_prompts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users write own saved prompts" ON public.saved_prompts;
CREATE POLICY "Users write own saved prompts" ON public.saved_prompts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users delete own saved prompts" ON public.saved_prompts;
CREATE POLICY "Users delete own saved prompts" ON public.saved_prompts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- 3. user_artifacts --------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_artifacts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id           text NOT NULL,
  artifact_id         text NOT NULL,
  status              text NOT NULL DEFAULT 'available',
  source_activity_id  text,
  metadata            jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_artifacts_unique UNIQUE (user_id, course_id, artifact_id),
  CONSTRAINT user_artifacts_status_check
    CHECK (status IN ('available', 'in-progress', 'completed', 'locked'))
);

CREATE INDEX IF NOT EXISTS idx_user_artifacts_user
  ON public.user_artifacts(user_id);

ALTER TABLE public.user_artifacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own artifacts" ON public.user_artifacts;
CREATE POLICY "Users read own artifacts" ON public.user_artifacts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users write own artifacts" ON public.user_artifacts;
CREATE POLICY "Users write own artifacts" ON public.user_artifacts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users update own artifacts" ON public.user_artifacts;
CREATE POLICY "Users update own artifacts" ON public.user_artifacts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

COMMIT;
