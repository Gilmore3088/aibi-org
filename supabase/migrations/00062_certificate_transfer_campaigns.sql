-- 00062: allow certificate transfer campaigns in paid_reengagement_events.
--
-- The 30/60/90-day post-certificate transfer loop reuses the paid
-- re-engagement event log (same dedupe index, same ops visibility). This
-- migration only widens the campaign CHECK constraint.

ALTER TABLE public.paid_reengagement_events
  DROP CONSTRAINT IF EXISTS paid_reengagement_events_campaign_check;

ALTER TABLE public.paid_reengagement_events
  ADD CONSTRAINT paid_reengagement_events_campaign_check CHECK (
    campaign IN (
      'foundation_not_started',
      'foundation_stalled',
      'in_depth_waiting',
      'certificate_transfer_30',
      'certificate_transfer_60',
      'certificate_transfer_90'
    )
  );
