-- 00049_funnel_reporting_views.sql
--
-- Launch funnel visibility — DERIVED, not a parallel write-path ledger.
--
-- Why views, not new tables
-- -------------------------
-- A reviewed plan proposed a Supabase "funnel ledger" (funnel_contacts +
-- funnel_events tables, a track.ts write helper, ~10 instrumentation points,
-- a backfill, and an /admin/funnel dashboard). Three independent reviews
-- converged on the same conclusion: every funnel signal the plan wanted to
-- capture ALREADY lands a timestamped row in an authoritative table today
-- (user_profiles, course_enrollments, certificates, resource_downloads,
-- prompt_card_leads, future_course_waitlist, team_assessment_cohorts,
-- refunded_checkout_sessions). There is no missing-data problem — only a
-- missing READ layer.
--
-- A second write-path would (a) duplicate data, (b) need fail-open helpers at
-- every route, (c) drift from the source tables the first time a write is
-- swallowed, (d) carry idempotency/race/email-canonicalization correctness
-- risks that would produce WRONG dashboard numbers, and (e) need a backfill.
-- Deriving the funnel on read removes all five problems: the views cannot
-- drift, cannot double-count, cannot race, and have nothing to backfill.
--
-- This mirrors the precedent already in this schema: `entitlements` is kept in
-- sync from `course_enrollments` by a trigger (00015), not by making every
-- checkout route remember to write an entitlement. Same instinct, taken one
-- step further — pure read-time derivation.
--
-- Source-of-truth boundaries (unchanged by this migration):
--   * Stripe        — authoritative for revenue and refunds (dollar amounts
--                     are intentionally NOT computed here; read Stripe).
--   * Vercel/Plausible — authoritative for anonymous traffic and pre-email
--                     intent signals (assessment_start, briefing CTA clicks).
--   * Supabase      — authoritative for KNOWN-contact funnel state, which is
--                     exactly what these views expose.
--
-- Three single-purpose views:
--   1. funnel_contacts          — one row per known contact, with a derived
--                                 lifecycle stage. Contains PII (emails).
--   2. funnel_scorecard         — event counts with all-time / 7d / 24h
--                                 windows. The daily launch numbers.
--   3. funnel_stage_distribution — contacts per lifecycle stage + percentage.
--
-- Email canonicalization
-- ----------------------
-- Contacts are deduped on lower(trim(email)). This matches what most write
-- paths already store and is deliberately SIMPLE — it does NOT replicate the
-- Gmail dot/+tag stripping in src/lib/email/canonicalize.ts, because
-- replicating app logic in SQL creates a second definition that can drift.
-- Practical consequence: a person who used a Gmail "+tag" or dotted alias on
-- one form and the plain address on another may appear as two contacts. At
-- launch scale this is negligible and is documented in docs/funnel-reporting.md.
--
-- Security
-- --------
-- All three views are SECURITY INVOKER (Postgres 15+), so the underlying
-- tables' RLS is enforced against the querying role. As belt-and-suspenders we
-- also REVOKE all access from anon + authenticated: these reporting surfaces
-- are service-role only, matching the existing append-only audit tables
-- (resource_downloads, refunded_checkout_sessions — "RLS enabled, no policy,
-- service-role only"). The future /admin reader must use the service-role
-- client server-side, never the anon/authenticated client.

BEGIN;

-- ============================================================
-- VIEW 1: funnel_contacts
-- One row per known contact (deduped on lower(trim(email))), with a derived,
-- forward-only lifecycle stage. Forward-only is automatic here because the
-- stage is a top-down CASE over the authoritative rows — it cannot regress
-- below the furthest milestone the contact has actually reached.
-- ============================================================
CREATE OR REPLACE VIEW funnel_contacts
WITH (security_invoker = true) AS
WITH contact_touchpoints AS (
  -- Every known-email touchpoint, normalized to (email, seen_at, source).
  SELECT lower(trim(email)) AS email, created_at AS seen_at
  FROM prompt_card_leads
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION ALL
  SELECT lower(trim(email)), COALESCE(readiness_at, created_at)
  FROM user_profiles
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION ALL
  SELECT lower(trim(email)), downloaded_at
  FROM resource_downloads
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION ALL
  SELECT lower(trim(email)), created_at
  FROM future_course_waitlist
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION ALL
  SELECT lower(trim(email)), COALESCE(enrolled_at, created_at)
  FROM course_enrollments
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION ALL
  SELECT lower(trim(buyer_email)), created_at
  FROM team_assessment_cohorts
  WHERE buyer_email IS NOT NULL AND trim(buyer_email) <> ''
),
contact_base AS (
  SELECT email,
         min(seen_at) AS first_seen,
         max(seen_at) AS last_seen
  FROM contact_touchpoints
  GROUP BY email
),
profiles AS (
  -- Collapse user_profiles to one row per canonical email (UNIQUE is on the
  -- raw string, so case variants are theoretically possible — take the most
  -- recently updated row).
  SELECT DISTINCT ON (lower(trim(email)))
         lower(trim(email))                       AS email,
         email                                    AS raw_email,
         readiness_score,
         readiness_tier_id,
         readiness_tier_label,
         readiness_at,
         proficiency_pct,
         proficiency_level_id,
         proficiency_level_label,
         proficiency_at,
         role,
         institution_context ->> 'institution_name' AS institution_name,
         user_id
  FROM user_profiles
  WHERE email IS NOT NULL AND trim(email) <> ''
  ORDER BY lower(trim(email)), updated_at DESC NULLS LAST
),
purchases AS (
  -- Paid products per contact. Fully-refunded buyers are already excluded:
  -- the charge.refunded handler hard-deletes the course_enrollments row, so a
  -- surviving row means access is still active (partial refunds retain access).
  SELECT lower(trim(email)) AS email,
         array_agg(DISTINCT product ORDER BY product)                       AS products,
         bool_or(product IN ('foundation', 'foundations', 'aibi-p'))        AS has_foundation_purchase,
         bool_or(product = 'in-depth-assessment')                          AS has_in_depth_purchase,
         bool_or(
           product IN ('foundation', 'foundations', 'aibi-p')
           AND (COALESCE(array_length(completed_modules, 1), 0) > 0 OR current_module > 0)
         )                                                                  AS is_active_learner,
         min(COALESCE(enrolled_at, created_at))                            AS first_purchase_at,
         max(COALESCE(enrolled_at, created_at))                            AS last_purchase_at
  FROM course_enrollments
  WHERE email IS NOT NULL AND trim(email) <> ''
  GROUP BY lower(trim(email))
),
certs AS (
  -- certificates has no email column; resolve it through the enrollment.
  SELECT lower(trim(ce.email)) AS email,
         count(*)              AS certificate_count,
         max(c.issued_at)      AS last_certificate_at
  FROM certificates c
  JOIN course_enrollments ce ON ce.id = c.enrollment_id
  WHERE ce.email IS NOT NULL AND trim(ce.email) <> ''
  GROUP BY lower(trim(ce.email))
)
SELECT
  cb.email,
  COALESCE(p.raw_email, cb.email)                       AS display_email,
  cb.first_seen,
  cb.last_seen,
  p.role,
  p.institution_name                                    AS institution,
  p.readiness_score,
  p.readiness_tier_id,
  p.readiness_tier_label,
  (p.readiness_at IS NOT NULL)                          AS has_free_assessment,
  p.readiness_at,
  (p.proficiency_at IS NOT NULL)                        AS has_in_depth_completed,
  p.proficiency_at,
  COALESCE(pur.products, ARRAY[]::text[])               AS products,
  COALESCE(pur.has_foundation_purchase, false)          AS has_foundation_purchase,
  COALESCE(pur.has_in_depth_purchase, false)            AS has_in_depth_purchase,
  pur.first_purchase_at,
  pur.last_purchase_at,
  COALESCE(ct.certificate_count, 0)                     AS certificate_count,
  (COALESCE(ct.certificate_count, 0) > 0)               AS has_certificate,
  ct.last_certificate_at,
  -- Derived lifecycle stage (top-down = naturally forward-only).
  -- 'high_intent' from the original plan is intentionally absent: it has no
  -- durable signal in these tables. Pre-purchase intent (briefing CTA clicks,
  -- checkout starts) lives in Vercel/Plausible and Stripe, not here.
  CASE
    WHEN COALESCE(ct.certificate_count, 0) > 0          THEN 'certified'
    WHEN COALESCE(pur.is_active_learner, false)         THEN 'active_learner'
    WHEN COALESCE(pur.has_foundation_purchase, false)   THEN 'foundation_buyer'
    WHEN p.proficiency_at IS NOT NULL                   THEN 'in_depth_completed'
    WHEN COALESCE(pur.has_in_depth_purchase, false)     THEN 'in_depth_buyer'
    WHEN p.readiness_at IS NOT NULL                     THEN 'free_assessed'
    ELSE                                                     'lead'
  END                                                   AS lifecycle_stage
FROM contact_base cb
LEFT JOIN profiles  p   ON p.email  = cb.email
LEFT JOIN purchases pur ON pur.email = cb.email
LEFT JOIN certs     ct  ON ct.email  = cb.email;

COMMENT ON VIEW funnel_contacts IS
  'Derived, read-only. One row per known contact (deduped on lower(trim(email))) '
  'with a lifecycle stage computed from the authoritative product tables. '
  'Service-role only. Contains PII. See docs/funnel-reporting.md.';

-- ============================================================
-- VIEW 2: funnel_scorecard
-- Event counts with all-time / last-7-days / last-24-hours windows.
-- The daily launch numbers. Long format (one row per metric) so it reads
-- cleanly in the Supabase SQL editor and exports straight to CSV.
-- Revenue dollars are intentionally absent — Stripe is authoritative there.
-- ============================================================
CREATE OR REPLACE VIEW funnel_scorecard
WITH (security_invoker = true) AS
  SELECT 'known_contacts'              AS metric_key,
         'Known contacts (total)'      AS metric_label,
         10                            AS sort_order,
         count(*)                                                                 AS all_time,
         count(*) FILTER (WHERE first_seen >= now() - interval '7 days')          AS last_7d,
         count(*) FILTER (WHERE first_seen >= now() - interval '24 hours')        AS last_24h
  FROM funnel_contacts

  UNION ALL
  SELECT 'free_assessments_completed',
         'Free assessments completed',
         20,
         count(*),
         count(*) FILTER (WHERE readiness_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE readiness_at >= now() - interval '24 hours')
  FROM user_profiles WHERE readiness_at IS NOT NULL

  UNION ALL
  SELECT 'prompt_card_leads',
         'Prompt-card leads',
         30,
         count(*),
         count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE created_at >= now() - interval '24 hours')
  FROM prompt_card_leads

  UNION ALL
  SELECT 'resource_downloads',
         'Resource downloads (incl. anonymous)',
         40,
         count(*),
         count(*) FILTER (WHERE downloaded_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE downloaded_at >= now() - interval '24 hours')
  FROM resource_downloads

  UNION ALL
  SELECT 'waitlist_signups',
         'Future-course waitlist signups',
         50,
         count(*),
         count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE created_at >= now() - interval '24 hours')
  FROM future_course_waitlist

  UNION ALL
  SELECT 'in_depth_purchases',
         'In-Depth Assessment purchases ($99)',
         60,
         count(*),
         count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE created_at >= now() - interval '24 hours')
  FROM course_enrollments WHERE product = 'in-depth-assessment'

  UNION ALL
  SELECT 'in_depth_completed',
         'In-Depth Assessment completed',
         70,
         count(*),
         count(*) FILTER (WHERE proficiency_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE proficiency_at >= now() - interval '24 hours')
  FROM user_profiles WHERE proficiency_at IS NOT NULL

  UNION ALL
  SELECT 'foundation_purchases',
         'Foundation course purchases ($295)',
         80,
         count(*),
         count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE created_at >= now() - interval '24 hours')
  FROM course_enrollments WHERE product IN ('foundation', 'foundations', 'aibi-p')

  UNION ALL
  SELECT 'team_cohorts',
         'Team assessment cohorts purchased',
         90,
         count(*),
         count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE created_at >= now() - interval '24 hours')
  FROM team_assessment_cohorts

  UNION ALL
  SELECT 'certificates_issued',
         'Foundation certificates issued',
         100,
         count(*),
         count(*) FILTER (WHERE issued_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE issued_at >= now() - interval '24 hours')
  FROM certificates

  UNION ALL
  SELECT 'full_refunds',
         'Full refunds (Stripe sessions) — see Stripe for $',
         110,
         count(*),
         count(*) FILTER (WHERE refunded_at >= now() - interval '7 days'),
         count(*) FILTER (WHERE refunded_at >= now() - interval '24 hours')
  FROM refunded_checkout_sessions;

COMMENT ON VIEW funnel_scorecard IS
  'Derived, read-only. Daily launch funnel counts (all-time / 7d / 24h) in long '
  'format, ordered by sort_order. Revenue dollars live in Stripe. Service-role only.';

-- ============================================================
-- VIEW 3: funnel_stage_distribution
-- Contacts per lifecycle stage + percentage. All seven stages always present
-- (zero-filled) and ordered by stage_rank so the funnel reads top-to-bottom.
-- ============================================================
CREATE OR REPLACE VIEW funnel_stage_distribution
WITH (security_invoker = true) AS
WITH stages(lifecycle_stage, stage_rank) AS (
  VALUES
    ('lead',               1),
    ('free_assessed',      2),
    ('in_depth_buyer',     3),
    ('in_depth_completed', 4),
    ('foundation_buyer',   5),
    ('active_learner',     6),
    ('certified',          7)
),
counts AS (
  SELECT lifecycle_stage, count(*) AS contacts
  FROM funnel_contacts
  GROUP BY lifecycle_stage
)
SELECT
  s.lifecycle_stage,
  s.stage_rank,
  COALESCE(c.contacts, 0) AS contacts,
  round(
    100.0 * COALESCE(c.contacts, 0)
    / NULLIF((SELECT count(*) FROM funnel_contacts), 0),
    1
  ) AS pct_of_contacts
FROM stages s
LEFT JOIN counts c USING (lifecycle_stage)
ORDER BY s.stage_rank;

COMMENT ON VIEW funnel_stage_distribution IS
  'Derived, read-only. Known contacts per lifecycle stage (zero-filled, ordered '
  'by stage_rank) with percentage of all contacts. Service-role only.';

-- ============================================================
-- Access control — service-role only (defense in depth alongside
-- SECURITY INVOKER). These surfaces aggregate PII; they must never be
-- reachable from the anon or authenticated PostgREST roles.
-- ============================================================
REVOKE ALL ON funnel_contacts            FROM anon, authenticated;
REVOKE ALL ON funnel_scorecard           FROM anon, authenticated;
REVOKE ALL ON funnel_stage_distribution  FROM anon, authenticated;

GRANT SELECT ON funnel_contacts, funnel_scorecard, funnel_stage_distribution
  TO service_role;

COMMIT;
