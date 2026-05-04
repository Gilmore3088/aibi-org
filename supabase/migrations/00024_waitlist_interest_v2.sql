-- Waitlist v2: align interest enum with the lead-list categories surfaced on
-- /coming-soon and add optional B2B fields for sales follow-up.
--
-- The original CHECK constraint allowed only ('specialist', 'leader'), which
-- silently rejected every submission since PR #17 reframed interest as
-- assessment | course | newsletter | institutional. This migration aligns the
-- DB with the live API and adds the new 'consulting' bucket called out in the
-- pre-launch landing audit.

ALTER TABLE future_course_waitlist
  DROP CONSTRAINT IF EXISTS future_course_waitlist_interest_check;

ALTER TABLE future_course_waitlist
  ADD CONSTRAINT future_course_waitlist_interest_check
  CHECK (interest IN ('assessment', 'course', 'newsletter', 'institutional', 'consulting'));

ALTER TABLE future_course_waitlist
  ADD COLUMN IF NOT EXISTS first_name        text,
  ADD COLUMN IF NOT EXISTS institution_name  text,
  ADD COLUMN IF NOT EXISTS marketing_opt_in  boolean NOT NULL DEFAULT false;
