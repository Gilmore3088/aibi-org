-- 00045_addie_assessment_results.sql
-- $99 Readiness Assessment results: 48 Q, 10+ dimensions, four deliverables.
-- Spec §5.8. Distinct from public.assessment_responses (existing 12-Q flow);
-- this is the ADDIE In-Depth rebuild. Reconciliation with content/assessments/v2/
-- is flagged in DB Spec §13 item 5 — handled at Wave 3b.

CREATE TABLE addie.assessment_results (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id           uuid REFERENCES addie.leads(id) ON DELETE CASCADE,
  email             citext NOT NULL,
  raw_answers       jsonb NOT NULL,        -- [{question_id, value}]
  dimension_scores  jsonb NOT NULL,        -- {dim_id: score} (10+ dims)
  plan_md           text,                  -- personalized plan
  ideas_prompts_md  text,                  -- curated ideas + prompts
  ctas_md           text,                  -- recommended next steps
  stripe_session_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR lead_id IS NOT NULL)
);

CREATE INDEX idx_addie_ar_user  ON addie.assessment_results(user_id);
CREATE INDEX idx_addie_ar_lead  ON addie.assessment_results(lead_id);
CREATE INDEX idx_addie_ar_email ON addie.assessment_results(email);

ALTER TABLE addie.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learner reads own addie assessment"
  ON addie.assessment_results FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
-- INSERT only from server (post Stripe webhook + assessment completion).
