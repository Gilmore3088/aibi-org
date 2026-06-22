-- 00048_paid_toolbox_access_helper.sql
-- Canonical paid Toolbox RLS helper for the public launch.
--
-- The historical 00035 migration introduced the 'starter' entitlement tier for
-- In-Depth Assessment buyers. Product direction has since changed: the tier is
-- still retained for reporting, but every paid Toolbox entitlement should pass
-- the Library/Cookbook RLS check and the app/API grants Build, AiBI Lab, save,
-- and export to both In-Depth and Foundation buyers.

BEGIN;

CREATE OR REPLACE FUNCTION public.has_toolbox_access(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.entitlements
    where user_id = check_user_id
      and active = true
      and product in (
        'aibi-p',
        'aibi-s',
        'aibi-l',
        'toolbox-only',
        'foundation',
        'foundations',
        'in-depth-assessment'
      )
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  );
$$;

COMMENT ON FUNCTION public.has_toolbox_access(uuid)
  IS 'Returns true when the user has an active paid Toolbox entitlement. Includes Foundation, legacy AiBI products, toolbox-only, and In-Depth Assessment.';

COMMIT;
