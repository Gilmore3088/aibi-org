-- 00015_entitlements_trigger.sql
-- Keep entitlements in sync with course_enrollments without lag.
-- INSERT/UPDATE/DELETE on course_enrollments triggers an upsert into
-- entitlements. Only the three paid products map to Toolbox entitlements.

CREATE OR REPLACE FUNCTION public.sync_entitlement_from_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product text;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_product := OLD.product;
  ELSE
    v_product := NEW.product;
  END IF;

  IF v_product NOT IN ('aibi-p', 'aibi-s', 'aibi-l') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF (TG_OP = 'DELETE') THEN
    UPDATE entitlements
       SET active = false,
           revoked_at = now()
     WHERE user_id = OLD.user_id
       AND source = 'course_enrollment'
       AND source_ref = OLD.id::text
       AND active = true;
    RETURN OLD;
  END IF;

  INSERT INTO entitlements (user_id, product, source, source_ref, active, granted_at, expires_at)
  VALUES (
    NEW.user_id,
    NEW.product,
    'course_enrollment',
    NEW.id::text,
    true,
    COALESCE(NEW.created_at, now()),
    NULL
  )
  ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
  DO UPDATE SET
    active = true,
    revoked_at = NULL,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_enrollments_sync_entitlement ON course_enrollments;
CREATE TRIGGER trg_course_enrollments_sync_entitlement
  AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.sync_entitlement_from_enrollment();
