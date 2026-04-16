-- AiBI-P Course Tables Migration
-- Plan: 01-01 — Database schema, RLS policies, and indexes
-- Tables: institution_enrollments, course_enrollments (extended), activity_responses, work_submissions, certificates
--
-- Order matters: institution_enrollments must exist before course_enrollments references it.

-- ============================================================
-- TABLE 1: institution_enrollments (DB-05)
-- Created first so course_enrollments can reference it.
-- ============================================================
CREATE TABLE IF NOT EXISTS institution_enrollments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name  text        NOT NULL,
  seats_purchased   integer     NOT NULL CHECK (seats_purchased > 0),
  seats_used        integer     NOT NULL DEFAULT 0 CHECK (seats_used >= 0),
  stripe_session_id text        DEFAULT NULL,
  discount_locked   boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 2: course_enrollments (DB-01)
-- Original columns preserved; new columns added via ALTER TABLE.
-- Use CREATE TABLE IF NOT EXISTS to be safe for fresh environments.
-- ============================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     text        NOT NULL,
  product                   text        NOT NULL,
  stripe_session_id         text        DEFAULT NULL,
  kajabi_user_id            text        DEFAULT NULL,
  created_at                timestamptz NOT NULL DEFAULT now(),
  -- New columns added in 01-01 migration:
  user_id                   uuid        REFERENCES auth.users(id),
  onboarding_answers        jsonb       DEFAULT NULL,
  completed_modules         integer[]   NOT NULL DEFAULT '{}',
  current_module            integer     NOT NULL DEFAULT 0,
  enrolled_at               timestamptz NOT NULL DEFAULT now(),
  institution_enrollment_id uuid        REFERENCES institution_enrollments(id) DEFAULT NULL
);

-- If course_enrollments already existed (from prior prototype phase), add columns if missing.
-- These are idempotent: DO $$ blocks are safe to run multiple times.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE course_enrollments
      ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'onboarding_answers'
  ) THEN
    ALTER TABLE course_enrollments
      ADD COLUMN onboarding_answers jsonb DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'completed_modules'
  ) THEN
    ALTER TABLE course_enrollments
      ADD COLUMN completed_modules integer[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'current_module'
  ) THEN
    ALTER TABLE course_enrollments
      ADD COLUMN current_module integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'enrolled_at'
  ) THEN
    ALTER TABLE course_enrollments
      ADD COLUMN enrolled_at timestamptz NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'institution_enrollment_id'
  ) THEN
    ALTER TABLE course_enrollments
      ADD COLUMN institution_enrollment_id uuid REFERENCES institution_enrollments(id) DEFAULT NULL;
  END IF;
END $$;

-- ============================================================
-- TABLE 3: activity_responses (DB-02, CONT-04)
-- UNIQUE (enrollment_id, activity_id) enforces CONT-04:
-- activities cannot be re-submitted after advancing.
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_responses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid        NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  module_number integer     NOT NULL CHECK (module_number BETWEEN 1 AND 9),
  activity_id   text        NOT NULL,
  response      jsonb       NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, activity_id)
);

-- ============================================================
-- TABLE 4: work_submissions (DB-03)
-- review_scores and review_status have no user UPDATE policy —
-- only the service role client can modify review fields (T-01-02).
-- ============================================================
CREATE TABLE IF NOT EXISTS work_submissions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id       uuid        NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  skill_file_url      text        NOT NULL,
  input_text          text        NOT NULL,
  raw_output_text     text        NOT NULL,
  edited_output_text  text        NOT NULL,
  annotation_text     text        NOT NULL,
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  reviewer_id         uuid        REFERENCES auth.users(id) DEFAULT NULL,
  review_scores       jsonb       DEFAULT NULL,
  review_feedback     text        DEFAULT NULL,
  review_status       text        NOT NULL DEFAULT 'pending'
                        CHECK (review_status IN ('pending', 'approved', 'failed', 'resubmitted')),
  reviewed_at         timestamptz DEFAULT NULL
);

-- ============================================================
-- TABLE 5: certificates (DB-04)
-- UNIQUE on enrollment_id prevents duplicate certificates.
-- Public read intentional: certificate verification is public (T-01-03).
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  uuid        NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  certificate_id text        NOT NULL UNIQUE,
  holder_name    text        NOT NULL,
  designation    text        NOT NULL DEFAULT 'AiBI-P',
  issued_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id)
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY on all 5 tables
-- ============================================================
ALTER TABLE course_enrollments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_responses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_submissions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (DB-06)
-- All auth.uid() calls wrapped in (select auth.uid()) per CLAUDE.md
-- performance pattern — ~95% improvement over bare auth.uid().
-- ============================================================

-- course_enrollments: users read/update their own enrollment (T-01-04)
-- user_id is set by service role on enrollment creation; user UPDATE policy
-- intentionally omits user_id from WITH CHECK to prevent privilege escalation.
CREATE POLICY "Users read own enrollment" ON course_enrollments
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users update own enrollment" ON course_enrollments
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- activity_responses: users CRUD their own responses via enrollment ownership (T-01-01)
-- Subquery join validates that the enrollment belongs to the authenticated user.
CREATE POLICY "Users read own activity responses" ON activity_responses
  FOR SELECT TO authenticated
  USING (enrollment_id IN (
    SELECT id FROM course_enrollments WHERE user_id = (select auth.uid())
  ));

CREATE POLICY "Users insert own activity responses" ON activity_responses
  FOR INSERT TO authenticated
  WITH CHECK (enrollment_id IN (
    SELECT id FROM course_enrollments WHERE user_id = (select auth.uid())
  ));

-- work_submissions: users read/insert their own; reviewers read all (T-01-02)
-- No UPDATE policy for users — review fields (review_scores, review_status, reviewed_at)
-- are only writable by the service role. Reviewer policies added in Phase 7.
CREATE POLICY "Users read own submissions" ON work_submissions
  FOR SELECT TO authenticated
  USING (enrollment_id IN (
    SELECT id FROM course_enrollments WHERE user_id = (select auth.uid())
  ));

CREATE POLICY "Users insert own submissions" ON work_submissions
  FOR INSERT TO authenticated
  WITH CHECK (enrollment_id IN (
    SELECT id FROM course_enrollments WHERE user_id = (select auth.uid())
  ));

-- certificates: public read for verification endpoint (T-01-03)
-- Certificate data is intentionally public: name, designation, date.
-- No PII beyond holder_name which the certificate holder has consented to display.
CREATE POLICY "Public read certificates" ON certificates
  FOR SELECT TO anon, authenticated
  USING (true);

-- institution_enrollments: service role only (T-01-05)
-- No user-facing policies — all access goes through server-side service role client.
-- Reviewer policies for work_submissions added in Phase 7 once identity model is decided.

-- ============================================================
-- INDEXES (DB-07)
-- Every foreign key column and every column used in RLS policies.
-- ============================================================

-- course_enrollments foreign key and policy columns
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id
  ON course_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_institution_enrollment_id
  ON course_enrollments(institution_enrollment_id);

-- activity_responses foreign key
CREATE INDEX IF NOT EXISTS idx_activity_responses_enrollment_id
  ON activity_responses(enrollment_id);

-- work_submissions foreign keys and review query column
CREATE INDEX IF NOT EXISTS idx_work_submissions_enrollment_id
  ON work_submissions(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_work_submissions_reviewer_id
  ON work_submissions(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_work_submissions_review_status
  ON work_submissions(review_status);

-- certificates foreign key and lookup column
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id
  ON certificates(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id
  ON certificates(certificate_id);
