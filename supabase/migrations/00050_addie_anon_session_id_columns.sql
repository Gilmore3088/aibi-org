-- 00050_addie_anon_session_id_columns.sql
-- Adds anon_session_id columns to addie.toolbox_items and addie.assessment_results
-- so the anon→lead migration (src/lib/addie/leads/bind.ts → migrateAnonToLead)
-- can rewrite ownership when a learner submits the gate email.
--
-- Without these columns the rewrite is a no-op (the function catches "column
-- does not exist" with a warning) — present columns are required for the gate's
-- "your in-flight work is kept" promise to hold.

ALTER TABLE addie.toolbox_items
  ADD COLUMN anon_session_id uuid;

ALTER TABLE addie.assessment_results
  ADD COLUMN anon_session_id uuid;

-- Loosen the "ownership" CHECK constraints so an anon-keyed row is valid.
-- (Existing CHECK was: user_id IS NOT NULL OR lead_id IS NOT NULL.)
ALTER TABLE addie.toolbox_items
  DROP CONSTRAINT toolbox_items_check;
ALTER TABLE addie.toolbox_items
  ADD CONSTRAINT addie_toolbox_items_ownership_chk
  CHECK (user_id IS NOT NULL OR lead_id IS NOT NULL OR anon_session_id IS NOT NULL);

ALTER TABLE addie.assessment_results
  DROP CONSTRAINT assessment_results_check;
ALTER TABLE addie.assessment_results
  ADD CONSTRAINT addie_assessment_results_ownership_chk
  CHECK (user_id IS NOT NULL OR lead_id IS NOT NULL OR anon_session_id IS NOT NULL);

CREATE INDEX idx_addie_toolbox_items_anon       ON addie.toolbox_items(anon_session_id);
CREATE INDEX idx_addie_assessment_results_anon  ON addie.assessment_results(anon_session_id);
