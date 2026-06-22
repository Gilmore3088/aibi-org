-- AiBI-Foundation now uses 18 bite-sized modules.
-- Earlier migrations widened activity_responses.module_number from 1..9 to
-- 1..12. A paid learner saving module 13-18 artifacts still needs the same
-- persisted activity response path.

ALTER TABLE activity_responses
  DROP CONSTRAINT IF EXISTS activity_responses_module_number_check;

ALTER TABLE activity_responses
  ADD CONSTRAINT activity_responses_module_number_check
  CHECK (module_number BETWEEN 1 AND 18);
