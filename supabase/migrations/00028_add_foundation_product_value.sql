-- 00028_add_foundation_product_value.sql
-- Phase 2 of the aibi-p -> foundation rename migration (Plan: refactor-aibi-p-to-foundation-migration.md)
--
-- OBSOLETE — DO NOT APPLY. This migration was never run against production:
-- the brand-refresh rename (see 00028a_legacy_rename_applied_2026_05_10.sql)
-- had already moved the data to 'foundations' (plural) by the time PR #45
-- landed in git, and PR #45's migrations were therefore never invoked.
-- Migration 00030_widen_foundation_product_and_backfill_plural.sql superseded
-- this file by widening the CHECK constraint to accept both singular and
-- plural (then immediately backfilling plural -> singular).
--
-- Kept for repo history. Re-running it is a no-op safely (the constraint
-- and trigger are already at the post-00030 shape).
--
-- ADDITIVE: extends the allowed `product` values from
--   ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only')
-- to
--   ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only', 'foundation')
-- across every constraint and helper that gates on this column.
--
-- 'aibi-p' stays in the allowed set forever — Stripe webhook retries from
-- 2026-Q1 may arrive with metadata.product='aibi-p' at any future date,
-- and the application's normalizeProduct() shim will read both values
-- as the same canonical product.
--
-- Backfill (UPDATE existing rows from 'aibi-p' to 'foundation') happens
-- in 00029 AFTER the application's dual-read code is deployed, so writers
-- and readers don't race during the rolling deploy.

BEGIN;

-- 1. entitlements.product CHECK constraint (was 00014).
ALTER TABLE entitlements
  DROP CONSTRAINT IF EXISTS entitlements_product_check;

ALTER TABLE entitlements
  ADD CONSTRAINT entitlements_product_check
  CHECK (product IN ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only', 'foundation'));

-- 2. sync_entitlement_from_enrollment() trigger (was 00015).
-- Recreate so v_product check accepts 'foundation' alongside the legacy three.
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

  -- 'foundation' added 2026-05-10 alongside the legacy 'aibi-p' value.
  -- Both map to the same Toolbox entitlement; normalizeProduct() in the
  -- app layer collapses them. 'toolbox-only' is intentionally excluded
  -- here because that product is gated through subscription, not enrollment.
  IF v_product NOT IN ('aibi-p', 'aibi-s', 'aibi-l', 'foundation') THEN
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

-- 3. Toolbox library access helper (was 00018).
-- has_toolbox_access(check_user_id) — accept 'foundation' as paid access.
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
      and product in ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only', 'foundation')
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  );
$$;

COMMIT;
