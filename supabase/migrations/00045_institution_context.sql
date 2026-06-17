-- 00045 — institution_context column on user_profiles (#443 item 3).
--
-- Stores intake form context collected from In-Depth buyers on the
-- /assessment/in-depth/purchased page. Written via:
--   PATCH /api/assessment/in-depth/institution-context
-- Read via load-response.ts (already included in COLUMNS; fail-open until now).
--
-- Shape mirrors InstitutionContext in src/lib/assessment/load-response.ts.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS institution_context jsonb;

COMMENT ON COLUMN public.user_profiles.institution_context IS
  'Institution context intake for In-Depth buyers. JSON object with keys:
  first_name, last_name, institution_name, asset_band (sub-300M | 300M-1B |
  1B-10B | 10B-plus), state (2-letter), regulator (OCC | FDIC | FRB | NCUA |
  state), dept_fte. Written on /assessment/in-depth/purchased page. #443';
