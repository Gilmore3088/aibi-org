-- 00054 — Free-assessment resume drafts.
--
-- Public route handlers validate input and write through the service role
-- client. RLS remains enabled with no policies so browser/anon clients cannot
-- enumerate or mutate drafts directly.

BEGIN;

CREATE TABLE IF NOT EXISTS public.assessment_drafts (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text        NOT NULL,
  token_hash            text        NOT NULL UNIQUE,
  selected_question_ids text[]      NOT NULL,
  answers               jsonb       NOT NULL DEFAULT '[]'::jsonb,
  current_question      integer     NOT NULL DEFAULT 0 CHECK (current_question >= 0 AND current_question < 12),
  phase                 text        NOT NULL DEFAULT 'questions'
                          CHECK (phase IN ('questions', 'score', 'results')),
  source                text        NOT NULL DEFAULT 'free_assessment',
  last_sent_at          timestamptz DEFAULT NULL,
  last_resumed_at       timestamptz DEFAULT NULL,
  reminder_sent_at      timestamptz DEFAULT NULL,
  reminder_count        integer     NOT NULL DEFAULT 0 CHECK (reminder_count >= 0),
  expires_at            timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_drafts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS assessment_drafts_updated_at ON public.assessment_drafts;
CREATE TRIGGER assessment_drafts_updated_at
  BEFORE UPDATE ON public.assessment_drafts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_assessment_drafts_email_updated
  ON public.assessment_drafts (lower(email), updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_drafts_expires_at
  ON public.assessment_drafts (expires_at);

CREATE INDEX IF NOT EXISTS idx_assessment_drafts_abandoned
  ON public.assessment_drafts (updated_at, expires_at)
  WHERE phase = 'questions' AND reminder_sent_at IS NULL;

COMMENT ON TABLE public.assessment_drafts IS
  'Service-role-only resume drafts for free assessment abandon/recovery links.';

COMMIT;
