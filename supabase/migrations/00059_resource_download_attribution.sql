-- 00054_resource_download_attribution.sql
--
-- Add funnel attribution fields to resource_downloads so free-resource demand
-- can be segmented by the surface that triggered the download and, when the
-- visitor came from the free assessment, by role, tier, and top gap.

BEGIN;

ALTER TABLE public.resource_downloads
  ADD COLUMN IF NOT EXISTS source_surface text,
  ADD COLUMN IF NOT EXISTS assessment_role text,
  ADD COLUMN IF NOT EXISTS assessment_tier_id text,
  ADD COLUMN IF NOT EXISTS assessment_tier_label text,
  ADD COLUMN IF NOT EXISTS assessment_top_gap text;

COMMENT ON COLUMN public.resource_downloads.source_surface IS
  'Client-provided surface that initiated the download, e.g. resources-role-playbook-card.';
COMMENT ON COLUMN public.resource_downloads.assessment_role IS
  'Free-assessment role context remembered in the browser session when available.';
COMMENT ON COLUMN public.resource_downloads.assessment_tier_id IS
  'Free-assessment tier id remembered in the browser session when available.';
COMMENT ON COLUMN public.resource_downloads.assessment_tier_label IS
  'Free-assessment tier label remembered in the browser session when available.';
COMMENT ON COLUMN public.resource_downloads.assessment_top_gap IS
  'Free-assessment lowest-signal/top-gap id remembered in the browser session when available.';

CREATE INDEX IF NOT EXISTS idx_resource_downloads_source_surface
  ON public.resource_downloads(source_surface, downloaded_at DESC)
  WHERE source_surface IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_resource_downloads_assessment_role
  ON public.resource_downloads(assessment_role, downloaded_at DESC)
  WHERE assessment_role IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_resource_downloads_assessment_tier
  ON public.resource_downloads(assessment_tier_id, downloaded_at DESC)
  WHERE assessment_tier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_resource_downloads_assessment_top_gap
  ON public.resource_downloads(assessment_top_gap, downloaded_at DESC)
  WHERE assessment_top_gap IS NOT NULL;

COMMIT;
