-- AiBI-P V4 expands the Practitioner course from 9 to 12 modules.
-- The original activity_responses check constraint still limited module_number
-- to 1..9, which blocks Apply submissions for modules 10-12.

ALTER TABLE activity_responses
  DROP CONSTRAINT IF EXISTS activity_responses_module_number_check;

ALTER TABLE activity_responses
  ADD CONSTRAINT activity_responses_module_number_check
  CHECK (module_number BETWEEN 1 AND 12);
