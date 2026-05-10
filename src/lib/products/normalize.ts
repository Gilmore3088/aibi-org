// Forever-shim. Collapses the legacy 'aibi-p' product slug to its canonical
// successor 'foundation' at every read boundary that touches external state
// (Stripe webhook payloads, DB rows written before Phase 7 backfill,
// in-flight transactional emails).
//
// Do not remove. Stripe event retries from 2026-Q1 enrollments can arrive
// at any future date with metadata.product='aibi-p'; the app must normalize
// them to 'foundation' so downstream code only sees the canonical value.
//
// Plan: Plans/refactor-aibi-p-to-foundation-migration.md (Phase 3 + Phase 6)
// Migration: supabase/migrations/00028_add_foundation_product_value.sql
//
// Companion DB-side: 'aibi-p' stays in the entitlements CHECK constraint and
// the sync_entitlement_from_enrollment() trigger forever, mirroring this
// shim. Both must be removed together if either is ever removed.

/**
 * Canonical product slugs (post-rename). Use this type for new code.
 */
export type ProductSlug = 'foundation' | 'aibi-s' | 'aibi-l' | 'toolbox-only';

/**
 * Legacy product slugs accepted at boundaries (Stripe webhook, DB rows,
 * email payload). The normalizer collapses these to ProductSlug.
 */
export type LegacyProductSlug = ProductSlug | 'aibi-p';

const VALID_CANONICAL: ReadonlySet<ProductSlug> = new Set<ProductSlug>([
  'foundation',
  'aibi-s',
  'aibi-l',
  'toolbox-only',
]);

/**
 * Map an incoming product slug (canonical or legacy) to the canonical form.
 *
 * - `'aibi-p'`  -> `'foundation'`  (the rename)
 * - canonical values pass through unchanged
 * - unknown / null / undefined  -> `null`
 *
 * Use at every read boundary:
 * - Stripe webhook handler: `normalizeProduct(session.metadata?.product)`
 * - DB row reads: `normalizeProduct(row.product)`
 * - Email job consumers: `normalizeProduct(payload.product)`
 *
 * Do NOT use at write boundaries — new writes should emit canonical values
 * directly (`'foundation'`, not `'aibi-p'`).
 */
export function normalizeProduct(
  slug: string | null | undefined,
): ProductSlug | null {
  if (slug == null) return null;
  if (slug === 'aibi-p') return 'foundation';
  if (VALID_CANONICAL.has(slug as ProductSlug)) {
    return slug as ProductSlug;
  }
  return null;
}

/**
 * Returns the SQL `IN (...)` list of all values to read from the DB for a
 * given canonical product. For 'foundation', this is `['aibi-p', 'foundation']`
 * during the transition window (Phase 3 → Phase 7). After the backfill
 * completes the legacy values become harmless tail rows but the list stays
 * unchanged because we never drop legacy values from the CHECK constraint.
 *
 * Use in dual-read queries:
 *   .in('product', dbReadValues('foundation'))
 */
export function dbReadValues(canonical: ProductSlug): readonly string[] {
  if (canonical === 'foundation') {
    return ['aibi-p', 'foundation'] as const;
  }
  return [canonical] as const;
}

/**
 * The canonical value to write to the DB for a given product. Always returns
 * the canonical slug — write-side never emits legacy values.
 */
export function dbWriteValue(canonical: ProductSlug): ProductSlug {
  return canonical;
}
