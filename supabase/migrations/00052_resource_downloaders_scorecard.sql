-- 00052_resource_downloaders_scorecard.sql
--
-- The funnel scorecard should not treat raw resource_downloads rows as buyer
-- demand. Most rows are anonymous redirects/PDF generations, and repeated
-- downloads by the same person inflate the count. Report unique known-email
-- downloaders instead.

BEGIN;

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
  SELECT 'resource_downloaders',
         'Resource downloaders (known email)',
         40,
         count(DISTINCT lower(trim(email))) FILTER (WHERE email IS NOT NULL AND trim(email) <> ''),
         count(DISTINCT lower(trim(email))) FILTER (
           WHERE email IS NOT NULL AND trim(email) <> ''
             AND downloaded_at >= now() - interval '7 days'
         ),
         count(DISTINCT lower(trim(email))) FILTER (
           WHERE email IS NOT NULL AND trim(email) <> ''
             AND downloaded_at >= now() - interval '24 hours'
         )
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
  'Derived, read-only. Daily launch funnel counts. Resource downloads are unique known-email downloaders, not raw anonymous hit counts. Revenue dollars live in Stripe.';

REVOKE ALL ON funnel_scorecard FROM anon, authenticated;
GRANT SELECT ON funnel_scorecard TO service_role;

COMMIT;
