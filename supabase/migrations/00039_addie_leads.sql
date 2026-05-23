-- 00039_addie_leads.sql
-- Email-captured identity BEFORE auth.users exists. Spec §5.2.
-- Server-only: no anon/authenticated policies. Service_role writes.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE addie.leads (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            citext UNIQUE NOT NULL,
  source           text NOT NULL CHECK (source IN ('gate','assessment','newsletter','other')),
  track            addie.track,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  bound_user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nurture_state    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addie_leads_email      ON addie.leads(email);
CREATE INDEX idx_addie_leads_bound_user ON addie.leads(bound_user_id);

ALTER TABLE addie.leads ENABLE ROW LEVEL SECURITY;
-- No policies = deny all for anon/authenticated; service_role bypasses RLS.

-- updated_at maintenance — function defined once, attached per-table.
CREATE OR REPLACE FUNCTION addie.touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_addie_leads_touch
  BEFORE UPDATE ON addie.leads
  FOR EACH ROW EXECUTE FUNCTION addie.touch_updated_at();
