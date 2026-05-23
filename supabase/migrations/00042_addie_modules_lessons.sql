-- 00042_addie_modules_lessons.sql
-- Content engine — modules, lessons, per-track variants. Spec §5.5.
-- Public-read (tier-gated for paid); server-write only.

CREATE TABLE addie.modules (
  id          text PRIMARY KEY,            -- 'm0', 'm1', ..., 'm5'
  ordinal     smallint NOT NULL UNIQUE,
  title       text NOT NULL,
  tier        addie.tier NOT NULL,
  summary     text,
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE addie.lessons (
  id                     text PRIMARY KEY,   -- 'm0.1', 'm3.2', ...
  module_id              text NOT NULL REFERENCES addie.modules(id) ON DELETE RESTRICT,
  ordinal                smallint NOT NULL,
  title                  text NOT NULL,
  modality               addie.lesson_modality NOT NULL,
  duration_min           smallint NOT NULL CHECK (duration_min <= 15),
  is_branched            boolean NOT NULL DEFAULT false,
  exercise_id            text,               -- → addie.exercises.id (no FK; sandbox spec owns the table)
  takeaway_artifact_type addie.artifact_type,
  body_md                text,               -- non-branched lessons store content here
  published              boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, ordinal)
);

CREATE INDEX idx_addie_lessons_module ON addie.lessons(module_id);

CREATE TABLE addie.lesson_track_variants (
  lesson_id  text NOT NULL REFERENCES addie.lessons(id) ON DELETE CASCADE,
  track      addie.track NOT NULL,
  body_md    text NOT NULL,
  media_ref  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lesson_id, track)
);

ALTER TABLE addie.modules               ENABLE ROW LEVEL SECURITY;
ALTER TABLE addie.lessons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE addie.lesson_track_variants ENABLE ROW LEVEL SECURITY;

-- Anyone reads published modules (the catalogue).
CREATE POLICY "public reads published addie modules"
  ON addie.modules FOR SELECT
  TO anon, authenticated
  USING (published);

-- Anyone reads published free lessons. Authenticated with active entitlement
-- reads paid lessons. Entitlements table arrives in 00043 — the policy below
-- references addie.entitlements; we create a placeholder-permissive policy now
-- and tighten it inside 00043 once the table exists.
CREATE POLICY "public reads published free addie lessons"
  ON addie.lessons FOR SELECT
  TO anon, authenticated
  USING (
    published
    AND module_id IN (SELECT id FROM addie.modules WHERE tier = 'free' AND published)
  );

-- Track variants follow the parent lesson's accessibility. The lessons policy
-- above filters by tier; this policy only checks that the lesson is published.
CREATE POLICY "reads addie track variant of accessible lesson"
  ON addie.lesson_track_variants FOR SELECT
  TO anon, authenticated
  USING (
    lesson_id IN (SELECT id FROM addie.lessons WHERE published)
  );

-- All writes are server-only via service_role.

CREATE TRIGGER trg_addie_modules_touch
  BEFORE UPDATE ON addie.modules
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();

CREATE TRIGGER trg_addie_lessons_touch
  BEFORE UPDATE ON addie.lessons
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();

CREATE TRIGGER trg_addie_track_variants_touch
  BEFORE UPDATE ON addie.lesson_track_variants
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();
