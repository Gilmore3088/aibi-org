-- 00038_resources_and_downloads.sql
--
-- Move the 22 downloadable artifacts in /public/downloads/ into Supabase
-- Storage and add metadata + per-download logging tables.
--
-- Goals (per 2026-05-28 audit):
--   1. Binary files leave Vercel's static bundle and live in Storage.
--   2. Every download gets a row in resource_downloads (user_id or hashed IP).
--   3. Entitlement-gated resources can be added later via tier_required.
--
-- All current 22 files are free-tier (lead-gen artifacts); the column is
-- still added so paid resources (e.g. AiBI-S-only briefings) can be
-- gated later without another migration.

BEGIN;

CREATE TABLE IF NOT EXISTS public.resources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text NOT NULL DEFAULT '',
  category        text NOT NULL,
  file_path       text NOT NULL,
  file_type       text NOT NULL,
  file_size_bytes bigint,
  tier_required   text NOT NULL DEFAULT 'free',
  published       boolean NOT NULL DEFAULT true,
  display_order   integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resources_file_type_check
    CHECK (file_type IN ('pdf', 'zip')),
  CONSTRAINT resources_tier_check
    CHECK (tier_required IN ('free', 'foundation', 'aibi-s', 'aibi-l', 'in-depth-assessment')),
  CONSTRAINT resources_category_check
    CHECK (category IN ('playbook', 'starter-kit', 'template', 'desk-card', 'artifact', 'paid-preview'))
);

CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category) WHERE published = true;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Anyone can read published free-tier resource metadata. The actual file
-- bytes are protected — Storage objects are private and only accessible
-- via signed URLs generated server-side after entitlement check.
DROP POLICY IF EXISTS "Public read free resources" ON public.resources;
CREATE POLICY "Public read free resources" ON public.resources
  FOR SELECT TO anon, authenticated
  USING (published = true AND tier_required = 'free');

-- Authenticated users with entitlements can also see gated resources
-- (read-only); enforcement of the actual download happens in the API.
DROP POLICY IF EXISTS "Authenticated read gated resources" ON public.resources;
CREATE POLICY "Authenticated read gated resources" ON public.resources
  FOR SELECT TO authenticated
  USING (
    published = true
    AND (
      tier_required = 'free'
      OR EXISTS (
        SELECT 1 FROM public.entitlements e
        WHERE e.user_id = (select auth.uid())
          AND e.active = true
          AND e.revoked_at IS NULL
          AND (e.expires_at IS NULL OR e.expires_at > now())
          AND (
            (resources.tier_required = 'foundation' AND e.product IN ('foundation','foundations','aibi-p'))
            OR (resources.tier_required = 'aibi-s' AND e.product = 'aibi-s')
            OR (resources.tier_required = 'aibi-l' AND e.product = 'aibi-l')
            OR (resources.tier_required = 'in-depth-assessment' AND e.product = 'in-depth-assessment')
          )
      )
    )
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resources_set_updated_at ON public.resources;
CREATE TRIGGER trg_resources_set_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------
-- resource_downloads — append-only log
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id     uuid REFERENCES public.resources(id) ON DELETE SET NULL,
  resource_slug   text NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email           text,
  ip_hash         text,
  user_agent      text,
  referrer        text,
  downloaded_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_downloads_slug
  ON public.resource_downloads(resource_slug, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_user
  ON public.resource_downloads(user_id, downloaded_at DESC) WHERE user_id IS NOT NULL;

ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;
-- service-role only; no policies. The download API writes rows.

-- ------------------------------------------------------------------
-- Storage bucket: resources
-- ------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket policies: service-role only. Public access is mediated by the
-- /api/resources/[slug]/download API, which checks entitlements and
-- returns a short-lived signed URL.

COMMIT;
