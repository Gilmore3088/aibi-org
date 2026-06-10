-- 00042_user_profiles_previous_id_and_v3_archive.sql
-- Journey audit 2026-06-10, F5 + F10.
--
-- F5 — previous_id: back-fill-profile.ts re-keys user_profiles.id to the
-- auth.users id when a lead later creates an account. The /results/{id}
-- bearer link emailed after the free assessment still carries the OLD id,
-- so it 404'd the moment the lead converted. Record the old id here so the
-- results loader can fall back to it and keep emailed links alive.
--
-- F10 — readiness_v3_archive: the In-Depth (v4) submit upserts the same
-- user_profiles row by email, silently overwriting the free (v3) readiness
-- result. Archive the v3 fields before the overwrite so the free baseline
-- survives (a paid buyer's "where I started" score).
--
-- Both columns are read/written fail-open in code: if this migration has
-- not been applied yet, the writes degrade to the old behavior instead of
-- erroring.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS previous_id uuid,
  ADD COLUMN IF NOT EXISTS readiness_v3_archive jsonb;

-- The results loader looks rows up by previous_id when the primary id
-- misses (old emailed bearer links).
CREATE INDEX IF NOT EXISTS idx_user_profiles_previous_id
  ON user_profiles (previous_id)
  WHERE previous_id IS NOT NULL;
