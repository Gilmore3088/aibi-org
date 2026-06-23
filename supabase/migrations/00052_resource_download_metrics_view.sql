-- 00051_resource_download_metrics_view.sql
--
-- Per-resource download KPIs for the /admin/funnel dashboard.
--
-- The funnel_scorecard view (00049) already exposes ONE aggregate row for
-- resource_downloads ("Resource downloads (incl. anonymous)"). This adds the
-- per-resource breakdown the admin dashboard needs: one row per
-- resource_slug with all-time / 7d / 24h counts, a unique-visitor estimate
-- (distinct hashed IP), and the most recent download date.
--
-- Same instinct as 00049: DERIVED, read-only, no new write path. Aggregation
-- happens DB-side so the surface stays cheap as resource_downloads grows
-- (it is an append-only audit table).
--
-- Slug -> human label / category mapping is intentionally NOT done here: the
-- canonical names live in the resources catalog (src/app/resources/data.ts)
-- and several slugs are produced by routes with no `resources` row
-- (starter-*, skill-template-*, card-*). The mapping is resolved in TS
-- (src/lib/resources/resourceMeta.ts) so it stays in sync with the catalog.
--
-- Security: SECURITY INVOKER + REVOKE from anon/authenticated, GRANT to
-- service_role only — identical posture to the funnel views. resource_downloads
-- has RLS enabled with no policies (service-role only); this view inherits that.

BEGIN;

CREATE OR REPLACE VIEW resource_download_metrics
WITH (security_invoker = true) AS
  SELECT
    resource_slug,
    count(*)                                                              AS downloads,
    count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days')    AS last_7d,
    count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours')  AS last_24h,
    count(DISTINCT ip_hash)                                               AS unique_visitors,
    max(downloaded_at)                                                    AS last_download
  FROM resource_downloads
  GROUP BY resource_slug;

COMMENT ON VIEW resource_download_metrics IS
  'Derived, read-only. One row per resource_slug with download counts '
  '(all-time / 7d / 24h), a distinct-hashed-IP unique-visitor estimate, and '
  'the last download timestamp. Slug labels/categories resolved in TS. '
  'Service-role only.';

REVOKE ALL ON resource_download_metrics FROM anon, authenticated;
GRANT SELECT ON resource_download_metrics TO service_role;

-- Single-row roll-up for the dashboard headline tiles. Computed directly from
-- resource_downloads (NOT by summing the per-slug view) so unique_visitors is a
-- true distinct-IP count rather than a double-counting per-resource sum.
CREATE OR REPLACE VIEW resource_download_totals
WITH (security_invoker = true) AS
  SELECT
    count(*)                                                              AS downloads,
    count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days')    AS last_7d,
    count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours')  AS last_24h,
    count(DISTINCT ip_hash)                                               AS unique_visitors,
    count(DISTINCT resource_slug)                                         AS resources_tracked
  FROM resource_downloads;

COMMENT ON VIEW resource_download_totals IS
  'Derived, read-only. Single-row roll-up of resource_downloads for the admin '
  'headline tiles (total / 7d / 24h, distinct-IP unique visitors, distinct '
  'resources tracked). Service-role only.';

REVOKE ALL ON resource_download_totals FROM anon, authenticated;
GRANT SELECT ON resource_download_totals TO service_role;

COMMIT;
