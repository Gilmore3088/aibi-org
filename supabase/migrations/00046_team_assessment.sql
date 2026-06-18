-- 00046 — paid team assessment cohorts and participant responses.
--
-- Team assessment data is intentionally separate from user_profiles. A
-- participant can receive a full personal report without overwriting their
-- individual free or paid assessment history.

CREATE TABLE IF NOT EXISTS public.team_assessment_cohorts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name    text        NOT NULL,
  buyer_email         text        NOT NULL,
  buyer_user_id       uuid        REFERENCES auth.users(id) DEFAULT NULL,
  seats_purchased     integer     NOT NULL CHECK (seats_purchased >= 10),
  public_token        text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  stripe_session_id   text        UNIQUE DEFAULT NULL,
  status              text        NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'closed', 'refunded')),
  report_unlocked_at  timestamptz DEFAULT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_assessment_responses (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id             uuid        NOT NULL REFERENCES public.team_assessment_cohorts(id) ON DELETE CASCADE,
  participant_email     text        NOT NULL,
  department            text        NOT NULL,
  department_other      text        DEFAULT NULL,
  role                  text        NOT NULL,
  answers               jsonb       NOT NULL,
  question_ids          jsonb       NOT NULL,
  score                 integer     NOT NULL CHECK (score >= 0 AND score <= 100),
  maturity_band_id      text        NOT NULL,
  maturity_band_label   text        NOT NULL,
  dimension_breakdown   jsonb       NOT NULL,
  personal_report_token text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  completed_at          timestamptz NOT NULL DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_assessment_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_assessment_responses ENABLE ROW LEVEL SECURITY;

-- No direct anon/authenticated policies. Route handlers use service role after
-- validating the cohort token or authenticated buyer/admin session.

CREATE INDEX IF NOT EXISTS idx_team_assessment_cohorts_buyer_user_id
  ON public.team_assessment_cohorts(buyer_user_id);

CREATE INDEX IF NOT EXISTS idx_team_assessment_cohorts_buyer_email
  ON public.team_assessment_cohorts(lower(buyer_email));

CREATE INDEX IF NOT EXISTS idx_team_assessment_cohorts_public_token
  ON public.team_assessment_cohorts(public_token);

CREATE INDEX IF NOT EXISTS idx_team_assessment_responses_cohort_id
  ON public.team_assessment_responses(cohort_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_assessment_responses_cohort_email_unique
  ON public.team_assessment_responses(cohort_id, lower(participant_email));

CREATE INDEX IF NOT EXISTS idx_team_assessment_responses_report_token
  ON public.team_assessment_responses(personal_report_token);

COMMENT ON TABLE public.team_assessment_cohorts IS
  'Paid team assessment cohort created from Stripe checkout. Holds buyer/admin, institution, seat count, shared participant token, and unlock state.';

COMMENT ON TABLE public.team_assessment_responses IS
  'One completed 48-question v4 response within a paid team assessment cohort. Kept separate from user_profiles so personal reports do not overwrite individual assessment history.';
