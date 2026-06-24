-- 00055_resource_download_attribution_metrics.sql
--
-- Derived attribution rollups for /admin/funnel. The raw event table now logs
-- source surface plus remembered free-assessment context. This view makes the
-- common launch questions cheap without turning resource_downloads into a
-- general event stream.

BEGIN;

CREATE OR REPLACE VIEW resource_download_attribution_metrics
WITH (security_invoker = true) AS
  SELECT
    'source_surface'::text                                                  AS segment_type,
    source_surface                                                          AS segment_value,
    source_surface                                                          AS segment_label,
    count(*)                                                                AS downloads,
    count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days')      AS last_7d,
    count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours')    AS last_24h,
    count(DISTINCT ip_hash)                                                 AS unique_visitors,
    count(DISTINCT lower(trim(email))) FILTER (
      WHERE email IS NOT NULL AND trim(email) <> ''
    )                                                                       AS known_downloaders,
    max(downloaded_at)                                                      AS last_download
  FROM resource_downloads
  WHERE source_surface IS NOT NULL AND trim(source_surface) <> ''
  GROUP BY source_surface

  UNION ALL

  SELECT
    'assessment_role'::text,
    assessment_role,
    assessment_role,
    count(*),
    count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days'),
    count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours'),
    count(DISTINCT ip_hash),
    count(DISTINCT lower(trim(email))) FILTER (
      WHERE email IS NOT NULL AND trim(email) <> ''
    ),
    max(downloaded_at)
  FROM resource_downloads
  WHERE assessment_role IS NOT NULL AND trim(assessment_role) <> ''
  GROUP BY assessment_role

  UNION ALL

  SELECT
    'assessment_tier'::text,
    assessment_tier_id,
    COALESCE(NULLIF(trim(assessment_tier_label), ''), assessment_tier_id),
    count(*),
    count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days'),
    count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours'),
    count(DISTINCT ip_hash),
    count(DISTINCT lower(trim(email))) FILTER (
      WHERE email IS NOT NULL AND trim(email) <> ''
    ),
    max(downloaded_at)
  FROM resource_downloads
  WHERE assessment_tier_id IS NOT NULL AND trim(assessment_tier_id) <> ''
  GROUP BY assessment_tier_id, assessment_tier_label

  UNION ALL

  SELECT
    'assessment_top_gap'::text,
    assessment_top_gap,
    assessment_top_gap,
    count(*),
    count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days'),
    count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours'),
    count(DISTINCT ip_hash),
    count(DISTINCT lower(trim(email))) FILTER (
      WHERE email IS NOT NULL AND trim(email) <> ''
    ),
    max(downloaded_at)
  FROM resource_downloads
  WHERE assessment_top_gap IS NOT NULL AND trim(assessment_top_gap) <> ''
  GROUP BY assessment_top_gap;

COMMENT ON VIEW resource_download_attribution_metrics IS
  'Derived, read-only. Download rollups by source surface and remembered free-assessment role, tier, and top gap. Service-role only.';

REVOKE ALL ON resource_download_attribution_metrics FROM anon, authenticated;
GRANT SELECT ON resource_download_attribution_metrics TO service_role;

COMMIT;
