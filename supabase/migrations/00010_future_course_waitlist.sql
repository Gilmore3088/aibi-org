-- Future course waitlist for AiBI-S and AiBI-L.
-- V4 keeps enrollment and checkout locked to AiBI-P only; this table captures
-- interest without creating purchasable or enrollable advanced products.

CREATE TABLE IF NOT EXISTS future_course_waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  interest    text NOT NULL CHECK (interest IN ('specialist', 'leader')),
  source      text NOT NULL DEFAULT 'coming-soon',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT future_course_waitlist_email_interest_unique UNIQUE (email, interest)
);

ALTER TABLE future_course_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages future course waitlist"
  ON future_course_waitlist
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
