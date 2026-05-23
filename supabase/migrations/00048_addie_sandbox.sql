-- 00048_addie_sandbox.sql
-- Sandbox Service tables. Owned by Sandbox Spec §10.
-- CRITICAL: exercises.system_prompt and exercises.lever_directives MUST NEVER
-- reach a client. PostgREST exposure of addie schema is off; access flows
-- through Next.js API routes (service_role) which in turn proxy to the
-- sandbox-service/ Vercel Function. A server-only view (client_exercise_v)
-- returns only the client-safe fields for /api/exercise/:id.

CREATE TABLE addie.exercises (
  id                    text PRIMARY KEY,            -- e.g. 'm3-2-ab'
  lesson_id             text REFERENCES addie.lessons(id) ON DELETE SET NULL,
  mode                  text NOT NULL CHECK (mode IN ('single','ab','skill')),
  track_variant         addie.track,                 -- for branched lessons (×5)

  -- SERVER-ONLY — never returned to the client
  system_prompt         text NOT NULL,               -- includes hardened preamble + canary
  lever_directives      jsonb NOT NULL DEFAULT '{}'::jsonb,
                        -- shape: { leverKey: { optionId: directiveString } }

  -- CLIENT-SAFE — returned by client_exercise_v
  task_scaffold         text NOT NULL,
  levers                jsonb NOT NULL DEFAULT '[]'::jsonb,
                        -- shape: [{ key, label, type:'toggle'|'select', options:[{id,label}] }]
  data_slots            jsonb NOT NULL DEFAULT '[]'::jsonb,
                        -- shape: [{ key, label, maxChars, required, piiCheck:true }]
  preset_context_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
                        -- shape: [{ id, label, body }]  -- body is server-side material
  default_provider      text NOT NULL DEFAULT 'anthropic'
                        CHECK (default_provider IN ('anthropic','openai','google')),
  allow_provider_switch boolean NOT NULL DEFAULT true,
  gating                jsonb NOT NULL,              -- {maxOutputTokens, maxOutputChars}
  entitlement           addie.tier NOT NULL DEFAULT 'free',

  published             boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addie_exercises_lesson ON addie.exercises(lesson_id);

ALTER TABLE addie.exercises ENABLE ROW LEVEL SECURITY;
-- No client policies — all access through server (service_role) only.
-- The client-safe descriptor is delivered via the view below.

CREATE VIEW addie.client_exercise_v AS
SELECT
  id, lesson_id, mode, track_variant, task_scaffold,
  levers, data_slots,
  -- strip body from preset_context_blocks; clients only see ids + labels
  (
    SELECT jsonb_agg(jsonb_build_object('id', b->>'id', 'label', b->>'label'))
    FROM jsonb_array_elements(preset_context_blocks) b
  ) AS preset_context_blocks,
  default_provider, allow_provider_switch, gating, entitlement, published
FROM addie.exercises;

-- View permissions: server-only by default (no GRANT to anon/authenticated).
-- Client traffic must go through /api/exercise/:id which uses service_role.

CREATE TRIGGER trg_addie_exercises_touch
  BEFORE UPDATE ON addie.exercises
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();

-- Sandbox session log — one row per /sandbox/run, /sandbox/ab, /skill/run.
-- NEVER stores API keys, system prompts, or raw sensitive learner data.
CREATE TABLE addie.sandbox_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_session_id  uuid,
  exercise_id      text NOT NULL REFERENCES addie.exercises(id) ON DELETE RESTRICT,
  lesson_id        text REFERENCES addie.lessons(id) ON DELETE SET NULL,
  mode             text NOT NULL CHECK (mode IN ('single','ab','skill')),
  provider         text NOT NULL CHECK (provider IN ('anthropic','openai','google')),
  lever_selections jsonb NOT NULL DEFAULT '{}'::jsonb,
  preset_ids       jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_ref       text,            -- storage key when output is persisted (Toolbox save), null otherwise
  tokens           integer,
  est_cost_usd     numeric(10,6),
  flagged          boolean NOT NULL DEFAULT false,
  flag_reasons     jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (learner_id IS NOT NULL OR anon_session_id IS NOT NULL)
);

CREATE INDEX idx_addie_sandbox_sessions_learner  ON addie.sandbox_sessions(learner_id, created_at DESC);
CREATE INDEX idx_addie_sandbox_sessions_anon     ON addie.sandbox_sessions(anon_session_id, created_at DESC);
CREATE INDEX idx_addie_sandbox_sessions_exercise ON addie.sandbox_sessions(exercise_id, created_at DESC);
CREATE INDEX idx_addie_sandbox_sessions_flagged  ON addie.sandbox_sessions(created_at DESC) WHERE flagged;

ALTER TABLE addie.sandbox_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner reads own addie sandbox sessions"
  ON addie.sandbox_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = learner_id);
-- INSERT is server-only (sandbox-service writes via service_role).
