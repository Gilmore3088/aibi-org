-- Storage RLS Policies for work-products bucket
--
-- Path convention (from src/lib/supabase/storage.ts):
--   <enrollment_id>/<timestamp>-<filename>
-- The first path segment identifies which enrollment owns the file.
--
-- These policies govern direct browser access. Server-side code uses
-- the service role client, which bypasses RLS — so uploads via presigned
-- URLs (the standard path) work regardless of these policies.

-- ============================================================
-- READ: users read files from their own enrollment folder
-- ============================================================
DROP POLICY IF EXISTS "Users read own enrollment files" ON storage.objects;

CREATE POLICY "Users read own enrollment files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'work-products'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.course_enrollments
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================
-- INSERT: users upload to their own enrollment folder
-- ============================================================
-- Direct browser uploads (bypasses presigned URL flow). The same
-- folder-membership check applies.
DROP POLICY IF EXISTS "Users insert into own enrollment folder" ON storage.objects;

CREATE POLICY "Users insert into own enrollment folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'work-products'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.course_enrollments
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================
-- UPDATE / DELETE intentionally not granted to users.
-- Submissions are immutable from the user's perspective once uploaded;
-- the service role handles any administrative changes.
-- ============================================================

-- Reviewer policies will be added in a follow-up migration once the
-- reviewer identity model is finalized (Phase 7).
