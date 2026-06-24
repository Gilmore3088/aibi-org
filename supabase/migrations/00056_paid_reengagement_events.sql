-- 00056_paid_reengagement_events.sql
-- Service-role-only send log for paid-product re-engagement reminders.
-- The cron uses this table to dedupe transactional reminders without
-- depending on MailerLite automation timing.

CREATE TABLE IF NOT EXISTS public.paid_reengagement_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign        text        NOT NULL CHECK (
    campaign IN ('foundation_not_started', 'foundation_stalled', 'in_depth_waiting')
  ),
  enrollment_id   uuid        REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email           text        NOT NULL,
  product         text        NOT NULL,
  status          text        NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  dedupe_key      text        NOT NULL,
  failure_reason  text        DEFAULT NULL,
  metadata        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  sent_at         timestamptz DEFAULT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.paid_reengagement_events ENABLE ROW LEVEL SECURITY;

-- No RLS policies: writes and reads are service-role only, matching
-- support_cases and assessment_drafts.

CREATE UNIQUE INDEX IF NOT EXISTS uq_paid_reengagement_events_sent_dedupe
  ON public.paid_reengagement_events (dedupe_key)
  WHERE status = 'sent';

CREATE INDEX IF NOT EXISTS idx_paid_reengagement_events_campaign_created
  ON public.paid_reengagement_events (campaign, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_paid_reengagement_events_enrollment
  ON public.paid_reengagement_events (enrollment_id)
  WHERE enrollment_id IS NOT NULL;
