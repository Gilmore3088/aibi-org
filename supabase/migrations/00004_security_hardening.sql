-- Security Hardening Migration
-- Addresses Supabase security advisor warnings.

-- Fix 1: function_search_path_mutable on public.set_updated_at
-- Functions without an explicit search_path can be hijacked via schema
-- injection. Pinning to pg_catalog, public makes resolution explicit.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: rls_enabled_no_policy on public.institution_enrollments
-- The table is service-role-only by design (per 00001 migration comment T-01-05).
-- service_role bypasses RLS, so this policy only governs authenticated/anon
-- access — explicitly denying both makes intent clear and silences the advisor.
DROP POLICY IF EXISTS "No user access — service role only"
  ON institution_enrollments;

CREATE POLICY "No user access — service role only"
  ON institution_enrollments
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
