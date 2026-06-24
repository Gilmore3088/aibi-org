-- 00055 — Abandoned free-assessment draft reminder tracking.
--
-- Kept separate from 00054 so environments that applied the draft table before
-- reminder tracking was added can migrate forward safely.

BEGIN;

ALTER TABLE public.assessment_drafts
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0 CHECK (reminder_count >= 0);

CREATE INDEX IF NOT EXISTS idx_assessment_drafts_abandoned
  ON public.assessment_drafts (updated_at, expires_at)
  WHERE phase = 'questions' AND reminder_sent_at IS NULL;

COMMIT;
