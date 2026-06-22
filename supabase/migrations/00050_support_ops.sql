-- 00050 — Support ops console, case timeline, and intake rate limiting.
-- (Renumbered from 00049 to avoid collision with 00049_funnel_reporting_views.sql.)
--
-- Service-role only by default. Public/admin route handlers validate access,
-- then write through the service role client.

BEGIN;

CREATE TABLE IF NOT EXISTS public.support_cases (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_email         text        NOT NULL,
  subject             text        NOT NULL,
  summary             text        NOT NULL DEFAULT '',
  category            text        NOT NULL DEFAULT 'other'
                        CHECK (category IN (
                          'access',
                          'missing_email',
                          'refund_request',
                          'failed_payment',
                          'provisioning_failure',
                          'email_failure',
                          'webhook_error',
                          'team_seats',
                          'ops_alert',
                          'other'
                        )),
  status              text        NOT NULL DEFAULT 'new'
                        CHECK (status IN (
                          'new',
                          'open',
                          'waiting_customer',
                          'waiting_internal',
                          'resolved',
                          'refunded',
                          'closed_no_action'
                        )),
  priority            text        NOT NULL DEFAULT 'normal'
                        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  source              text        NOT NULL DEFAULT 'admin'
                        CHECK (source IN (
                          'buyer_form',
                          'ops_alert',
                          'admin',
                          'webhook',
                          'reconciliation'
                        )),
  product             text        DEFAULT NULL,
  stripe_session_id   text        DEFAULT NULL,
  enrollment_id       uuid        DEFAULT NULL,
  user_id             uuid        DEFAULT NULL,
  team_cohort_id      uuid        DEFAULT NULL,
  assigned_to_email   text        NOT NULL DEFAULT 'hello@aibankinginstitute.com',
  dedupe_key          text        UNIQUE DEFAULT NULL,
  first_response_at   timestamptz DEFAULT NULL,
  resolved_at         timestamptz DEFAULT NULL,
  metadata            jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_case_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid        NOT NULL REFERENCES public.support_cases(id) ON DELETE CASCADE,
  event_type    text        NOT NULL,
  actor_type    text        NOT NULL DEFAULT 'system'
                  CHECK (actor_type IN ('system', 'admin', 'customer')),
  actor_email   text        DEFAULT NULL,
  message       text        NOT NULL DEFAULT '',
  metadata      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_intake_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_intake_log ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS support_cases_updated_at ON public.support_cases;
CREATE TRIGGER support_cases_updated_at
  BEFORE UPDATE ON public.support_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_support_cases_buyer_email_lower
  ON public.support_cases (lower(buyer_email));

CREATE INDEX IF NOT EXISTS idx_support_cases_status_created
  ON public.support_cases (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_cases_category_created
  ON public.support_cases (category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_cases_stripe_session_id
  ON public.support_cases (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_case_events_case_created
  ON public.support_case_events (case_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_support_case_events_type_created
  ON public.support_case_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_intake_log_ip_created
  ON public.support_intake_log (ip_hash, created_at DESC);

COMMENT ON TABLE public.support_cases IS
  'Operator-owned support queue for paid launch: intake, access rescue, refund eligibility, and ops alert follow-up.';

COMMENT ON TABLE public.support_case_events IS
  'Append-only support case timeline. Admin actions, customer intake, email sends, refund decisions, and ops alerts are recorded here.';

COMMIT;
