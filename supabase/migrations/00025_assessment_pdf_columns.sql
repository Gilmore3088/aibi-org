-- Migration: 00025_assessment_pdf_columns.sql
-- Purpose: Add columns tracking the PDF storage path and generation
-- timestamp on user_profiles, used by Spec 2 (PDF Download).

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS pdf_storage_path text,
  ADD COLUMN IF NOT EXISTS pdf_generated_at timestamptz;

-- Index supports cron cleanup ("delete PDFs older than 30 days") and
-- ops queries ("how many PDFs have been generated this week").
CREATE INDEX IF NOT EXISTS idx_user_profiles_pdf_generated_at
  ON public.user_profiles (pdf_generated_at)
  WHERE pdf_generated_at IS NOT NULL;

COMMENT ON COLUMN public.user_profiles.pdf_storage_path IS
  'Relative path within the assessment-pdfs Storage bucket. NULL if no PDF generated yet.';
COMMENT ON COLUMN public.user_profiles.pdf_generated_at IS
  'Timestamp when the most recent PDF generation completed for this profile.';
