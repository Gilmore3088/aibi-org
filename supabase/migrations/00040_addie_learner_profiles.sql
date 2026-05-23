-- 00040_addie_learner_profiles.sql
-- Course-specific profile for authenticated learners. Spec §5.1.
-- IMPORTANT: coexists with public.user_profiles (existing). Both get a row
-- on auth.users insert via separate triggers — no conflict.

CREATE TABLE addie.learner_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            citext UNIQUE NOT NULL,
  track            addie.track,
  tool_exposure    addie.tool_exposure,
  comfort_level    addie.comfort_level,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addie_learner_profiles_email ON addie.learner_profiles(email);

ALTER TABLE addie.learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner reads own addie profile"
  ON addie.learner_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "learner updates own addie profile"
  ON addie.learner_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);
-- INSERT happens server-side (trigger below or admin endpoint) — no client policy.

-- Auto-create profile on auth.users insert. SECURITY DEFINER so it can write
-- regardless of caller's role. ON CONFLICT DO NOTHING is the idempotency guard
-- in case a future migration backfills profiles.
CREATE OR REPLACE FUNCTION addie.create_learner_profile() RETURNS trigger AS $$
BEGIN
  INSERT INTO addie.learner_profiles (user_id, email)
  VALUES (NEW.id, LOWER(NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger name namespaced with addie_ to avoid colliding with the existing
-- public.user_profiles trigger on auth.users.
CREATE TRIGGER trg_addie_create_learner_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION addie.create_learner_profile();

CREATE TRIGGER trg_addie_learner_profiles_touch
  BEFORE UPDATE ON addie.learner_profiles
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();
