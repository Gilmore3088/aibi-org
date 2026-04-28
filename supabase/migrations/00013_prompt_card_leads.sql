-- Free top-of-funnel lead capture for AiBI Prompt Cards.

CREATE TABLE IF NOT EXISTS prompt_card_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL,
  institution_type text DEFAULT NULL,
  asset_size text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prompt_card_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages prompt card leads"
  ON prompt_card_leads
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_prompt_card_leads_created
  ON prompt_card_leads(created_at DESC);

