-- User Profiles Table Migration
-- Stores assessment results and proficiency scores keyed by email.
-- No Supabase Auth dependency — any visitor who completes the assessment
-- gets a profile row. Auth integration (linking user_id) can be added later.

-- ============================================================
-- TABLE: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text        NOT NULL UNIQUE,
  -- Readiness assessment result (8–48 point scale, v2 assessment)
  readiness_score   integer     DEFAULT NULL CHECK (readiness_score BETWEEN 8 AND 48),
  readiness_tier_id text        DEFAULT NULL,
  readiness_tier_label text     DEFAULT NULL,
  readiness_answers jsonb       DEFAULT NULL,
  readiness_at      timestamptz DEFAULT NULL,
  -- Proficiency exam result (AiBI-P practitioner assessment)
  proficiency_pct   integer     DEFAULT NULL CHECK (proficiency_pct BETWEEN 0 AND 100),
  proficiency_level_id   text   DEFAULT NULL,
  proficiency_level_label text  DEFAULT NULL,
  proficiency_topic_scores jsonb DEFAULT NULL,
  proficiency_at    timestamptz DEFAULT NULL,
  -- Supabase Auth linkage — optional, populated when/if user creates an account
  user_id           uuid        REFERENCES auth.users(id) DEFAULT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- Service role writes (INSERT/UPDATE) from API routes — no user RLS needed for writes.
-- Authenticated users can read their own profile if user_id is linked.
-- Email-only users (no account) read via server-side service role queries.
-- ============================================================

-- Authenticated users read their own row once auth.users.id is linked
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id
  );

-- ============================================================
-- INDEXES
-- ============================================================

-- Primary lookup: email (used by API routes to upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles(email);

-- Secondary lookup: user_id (used once auth is wired)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON user_profiles(user_id);

-- ============================================================
-- updated_at trigger — keeps updated_at current on every row change
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
