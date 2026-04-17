-- Quick Wins Table Migration
-- Stores post-course quick win entries logged by AiBI-P course completers.
-- Each row ties to a course_enrollment so users read/insert only their own data.

-- ============================================================
-- TABLE: quick_wins
-- ============================================================
CREATE TABLE IF NOT EXISTS quick_wins (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id       uuid        NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  description         text        NOT NULL,
  tool                text        NOT NULL
                        CHECK (tool IN ('chatgpt', 'claude', 'copilot', 'gemini', 'notebooklm', 'perplexity')),
  skill_name          text        NOT NULL,
  frequency           text        NOT NULL
                        CHECK (frequency IN ('daily', '2-3x/week', 'weekly', 'monthly')),
  time_saved_minutes  integer     NOT NULL CHECK (time_saved_minutes > 0),
  department          text        NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE quick_wins ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- Users read/insert their own wins via enrollment ownership.
-- All auth.uid() calls wrapped in (select auth.uid()) per CLAUDE.md
-- performance pattern — ~95% improvement over bare auth.uid().
-- ============================================================

CREATE POLICY "Users read own quick wins" ON quick_wins
  FOR SELECT TO authenticated
  USING (enrollment_id IN (
    SELECT id FROM course_enrollments WHERE user_id = (select auth.uid())
  ));

CREATE POLICY "Users insert own quick wins" ON quick_wins
  FOR INSERT TO authenticated
  WITH CHECK (enrollment_id IN (
    SELECT id FROM course_enrollments WHERE user_id = (select auth.uid())
  ));

-- ============================================================
-- INDEXES
-- ============================================================

-- Primary lookup: by enrollment (used for list and aggregate queries)
CREATE INDEX IF NOT EXISTS idx_quick_wins_enrollment_id
  ON quick_wins(enrollment_id);

-- Secondary: chronological listing
CREATE INDEX IF NOT EXISTS idx_quick_wins_created_at
  ON quick_wins(created_at DESC);
