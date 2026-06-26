-- Unified lead-capture record. Single canonical row per email across ALL
-- capture paths (assessment, prompt-cards, resource-gate, inquiry) so the
-- email system (MailerLite) and the database (Supabase) can never drift apart
-- again. Assessment scores still live in user_profiles; this is the
-- "who came in the door + how + did we reach them" contact record.
--
-- Deliberately NO CHECK constraints on source/delivery_status: the
-- user_profiles role CHECK has repeatedly broken seeding when a new value
-- appears. Allowed values are documented here and enforced in app code.
--   source:           'assessment' | 'prompt-cards' | 'resource-gate' | 'inquiry'
--   delivery_status:  'unknown' | 'sent' | 'delivered' | 'bounced' | 'complained'

CREATE TABLE IF NOT EXISTS leads (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   text NOT NULL UNIQUE,
  source                  text NOT NULL,
  requested_artifact      text DEFAULT NULL,
  role                    text DEFAULT NULL,
  institution             text DEFAULT NULL,
  lead_source             text DEFAULT NULL,
  marketing_opt_in        boolean NOT NULL DEFAULT false,
  delivery_status         text NOT NULL DEFAULT 'unknown',
  mailerlite_synced       boolean NOT NULL DEFAULT false,
  mailerlite_subscriber_id text DEFAULT NULL,
  -- Bound when/if the lead later creates an account. SET NULL on user delete
  -- so removing an auth user never strands this row (the NO ACTION trap that
  -- previously blocked seeded-user cleanup).
  user_id                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata                jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- PII contact data: service-role writes only. RLS on, and NO anon/authenticated
-- policies — service_role bypasses RLS, everyone else is denied. Do not expose
-- this table to the Data API.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages leads" ON leads;
CREATE POLICY "Service role manages leads"
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_delivery_status ON leads(delivery_status);
