-- Migration: 00026_assessment_pdfs_bucket.sql
-- Purpose: Create the Storage bucket for warmed PDFs. RLS allows read
-- only to the auth user matching the user_profiles.id derived from the
-- storage path.
--
-- Apply note (2026-05-05):
-- The bucket INSERT applied via Supabase MCP execute_sql. The
-- CREATE POLICY statements on storage.objects FAILED via MCP because
-- "must be owner of relation objects" — Supabase's MCP role lacks
-- direct ownership of the storage.objects table. The 3 policies were
-- applied manually via the Supabase dashboard SQL Editor (which runs
-- as the postgres superuser). Future Storage policy migrations on this
-- project should plan for the same workflow.

-- Bucket creation. Storage's Postgres-side metadata table.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-pdfs',
  'assessment-pdfs',
  false,
  10485760,  -- 10 MB hard cap per PDF
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: the path scheme is `{user_profiles.id}.pdf`. A reader is
-- allowed if their auth.uid() equals the user_profiles.id whose
-- pdf_storage_path matches the requested object name.
CREATE POLICY "Owner can read own assessment PDF"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assessment-pdfs'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid())
        AND up.pdf_storage_path = name
    )
  );

-- INSERT policy: only the service role writes (warm endpoint runs with
-- service-role client). No authenticated-user writes.
CREATE POLICY "Service role writes assessment PDFs"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'assessment-pdfs');

-- DELETE policy: service role only (cron cleanup).
CREATE POLICY "Service role deletes old assessment PDFs"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'assessment-pdfs');

COMMENT ON POLICY "Owner can read own assessment PDF" ON storage.objects IS
  'Spec 2: PDF download is owner-only. Path scheme {user_profiles.id}.pdf links the storage row to the assessment owner.';
