-- 00046_addie_toolbox.sql
-- Versioned .md artifacts. Spec §5.7.
-- Free side stores by lead_id; paid side by user_id. Lead→user binding
-- (rewrite lead_id to user_id) happens in a server flow at signup.
-- Free-tier 4-artifact cap is enforced server-side (count + reject).

CREATE TABLE addie.toolbox_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id    uuid REFERENCES addie.leads(id) ON DELETE CASCADE,
  type       addie.artifact_type NOT NULL,
  title      text NOT NULL,
  lesson_id  text REFERENCES addie.lessons(id) ON DELETE SET NULL,
  track      addie.track,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR lead_id IS NOT NULL)
);

CREATE INDEX idx_addie_toolbox_items_user ON addie.toolbox_items(user_id);
CREATE INDEX idx_addie_toolbox_items_lead ON addie.toolbox_items(lead_id);

CREATE TABLE addie.toolbox_item_versions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    uuid NOT NULL REFERENCES addie.toolbox_items(id) ON DELETE CASCADE,
  version    smallint NOT NULL,
  body_md    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, version)
);

CREATE INDEX idx_addie_tiv_item ON addie.toolbox_item_versions(item_id);

ALTER TABLE addie.toolbox_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE addie.toolbox_item_versions ENABLE ROW LEVEL SECURITY;

-- Authenticated owner
CREATE POLICY "learner reads own addie items"
  ON addie.toolbox_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "learner writes own addie items"
  ON addie.toolbox_items FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Lead-keyed items (free tier, pre-signup) are server-only via service_role.
-- The lead→user bind flow (Auth Spec §5) rewrites lead_id → user_id at signup.

-- Versions mirror the parent
CREATE POLICY "learner reads own addie item versions"
  ON addie.toolbox_item_versions FOR SELECT
  TO authenticated
  USING (
    item_id IN (SELECT id FROM addie.toolbox_items WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "learner writes own addie item versions"
  ON addie.toolbox_item_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    item_id IN (SELECT id FROM addie.toolbox_items WHERE user_id = (select auth.uid()))
  );

CREATE TRIGGER trg_addie_toolbox_items_touch
  BEFORE UPDATE ON addie.toolbox_items
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();
