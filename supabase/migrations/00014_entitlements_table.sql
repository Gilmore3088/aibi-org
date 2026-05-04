-- 00014_entitlements_table.sql
-- Source of truth for whether a user has access to a paid product surface.
-- Populated by trigger from course_enrollments (00015) and idempotent
-- backfill (00016). Phase 2 standalone Toolbox subscriptions will write
-- rows here directly with source='subscription'.

CREATE TABLE IF NOT EXISTS entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product text NOT NULL CHECK (
    product IN ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only')
  ),
  source text NOT NULL CHECK (
    source IN ('course_enrollment', 'subscription', 'manual')
  ),
  source_ref text,
  active boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_active
  ON entitlements (user_id) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_entitlements_source_ref
  ON entitlements (source, source_ref);

CREATE UNIQUE INDEX IF NOT EXISTS uq_entitlements_user_product_source_ref
  ON entitlements (user_id, product, source, COALESCE(source_ref, ''));

CREATE TRIGGER trg_entitlements_set_updated_at
  BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own entitlements.
CREATE POLICY "Users read own entitlements" ON entitlements
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- No INSERT/UPDATE/DELETE policy for authenticated users; writes happen
-- via the trigger (00015) or service-role contexts only.
