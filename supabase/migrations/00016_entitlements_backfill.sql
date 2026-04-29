-- 00016_entitlements_backfill.sql
-- One-time backfill: every existing paid course_enrollments row gets a
-- corresponding entitlements row. Idempotent — safe to re-run thanks to
-- the unique index on (user_id, product, source, COALESCE(source_ref, '')).

INSERT INTO entitlements (user_id, product, source, source_ref, active, granted_at)
SELECT
  ce.user_id,
  ce.product,
  'course_enrollment',
  ce.id::text,
  true,
  COALESCE(ce.created_at, now())
FROM course_enrollments ce
WHERE ce.product IN ('aibi-p', 'aibi-s', 'aibi-l')
ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
DO NOTHING;
