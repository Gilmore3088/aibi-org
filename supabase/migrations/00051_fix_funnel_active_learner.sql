-- 00051_fix_funnel_active_learner.sql
--
-- 00049 treated current_module > 0 as "active learner". That is wrong because
-- Foundation enrollments default to current_module = 1 at purchase time, before
-- the buyer has completed any work. Active learner should mean demonstrated
-- course progress: at least one completed module, or a current_module advanced
-- beyond the default starting module.

BEGIN;

CREATE OR REPLACE VIEW funnel_contacts
WITH (security_invoker = true) AS
WITH contact_touchpoints AS (
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
  SELECT lower(trim(email)) AS email,
         array_agg(DISTINCT product ORDER BY product)                       AS products,
         bool_or(product IN ('foundation', 'foundations', 'aibi-p'))        AS has_foundation_purchase,
         bool_or(product = 'in-depth-assessment')                          AS has_in_depth_purchase,
         bool_or(
           product IN ('foundation', 'foundations', 'aibi-p')
           AND (
             COALESCE(array_length(completed_modules, 1), 0) > 0
             OR current_module > 1
           )
         )                                                                  AS is_active_learner,
         min(COALESCE(enrolled_at, created_at))                            AS first_purchase_at,
         max(COALESCE(enrolled_at, created_at))                            AS last_purchase_at
  FROM course_enrollments
  WHERE email IS NOT NULL AND trim(email) <> ''
  GROUP BY lower(trim(email))
),
certs AS (
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
  'Derived, read-only. One row per known contact with lifecycle stage computed from authoritative product tables. Active learner requires real course progress.';

REVOKE ALL ON funnel_contacts FROM anon, authenticated;
GRANT SELECT ON funnel_contacts TO service_role;

COMMIT;
