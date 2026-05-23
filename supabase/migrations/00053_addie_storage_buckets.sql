-- 00053_addie_storage_buckets.sql
-- Three Supabase Storage buckets per supabase/STORAGE_BUCKETS.md + DB Spec §8.
-- All buckets are private at the Supabase level; access goes through either
-- (a) RLS policies on storage.objects for direct reads, or (b) server-minted
-- signed URLs for time-limited paid access. Service role bypasses RLS for
-- all writes.
--
-- Path convention: <user_id_or_segment>/...  — RLS uses storage.foldername()
-- to scope per-owner. For course media we use 'free/...' and 'paid/...' as
-- the first segment instead of a user id (course content is shared, not per-
-- learner).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'addie-course-media',
  'addie-course-media',
  false,
  524288000,    -- 500 MB cap per object (chunked video segments)
  ARRAY[
    'video/mp4','video/webm','audio/mpeg','audio/mp4','audio/webm',
    'text/vtt','application/x-subrip',
    'image/jpeg','image/png','image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'addie-toolbox-exports',
  'addie-toolbox-exports',
  false,
  1048576,      -- 1 MB; .md exports are small
  ARRAY['text/markdown','text/plain']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'addie-assessment-deliverables',
  'addie-assessment-deliverables',
  false,
  10485760,     -- 10 MB; PDFs can be a few MB
  ARRAY['application/pdf','text/markdown','text/plain']
) ON CONFLICT (id) DO NOTHING;

-- ─── RLS policies on storage.objects ───────────────────────────────────────

-- addie-course-media: 'free/...' is readable by anyone (anon + authenticated);
-- 'paid/...' requires an active foundation entitlement. Writes are server-only.
CREATE POLICY "anon reads addie free course media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'addie-course-media'
    AND (storage.foldername(name))[1] = 'free'
  );

CREATE POLICY "paid reads addie paid course media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'addie-course-media'
    AND (storage.foldername(name))[1] = 'paid'
    AND EXISTS (
      SELECT 1 FROM addie.entitlements
      WHERE user_id = (select auth.uid())
        AND status  = 'active'
        AND product IN ('foundation_individual','foundation_team_seat')
    )
  );

-- addie-toolbox-exports: owner-only by path prefix = user_id::text
CREATE POLICY "learner reads own addie toolbox export"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'addie-toolbox-exports'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- addie-assessment-deliverables: owner-only by path prefix = user_id::text
CREATE POLICY "learner reads own addie assessment deliverable"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'addie-assessment-deliverables'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- All INSERT/UPDATE/DELETE on storage.objects go through service_role from
-- server endpoints; no client-side write policies.
