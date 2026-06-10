import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Toolbox entitlement tier.
 *
 *   - 'full'    — Foundation course buyers (AiBI-Foundation, AiBI-S, AiBI-L,
 *                 toolbox-only). Library + Cookbook + Build + Playground.
 *   - 'starter' — In-Depth Assessment ($99) buyers. Retained in the data
 *                 layer, but per the 2026-06-02 operator decision it no longer
 *                 gates Build/Run — canBuildOrRun unlocks all paid tiers.
 *
 * See issue #219 for the original design; the 2026-06-02 decision (commit
 * 02aa158a) unlocked Build/Run for In-Depth buyers too.
 */
export type ToolboxTier = 'full' | 'starter';

export interface PaidAccess {
  readonly userId: string;
  readonly products: readonly string[];
  /**
   * Resolved tier across all of this user's active entitlements. Any
   * full-tier product collapses the user to 'full'. A user with only an
   * In-Depth entitlement gets 'starter'.
   */
  readonly tier: ToolboxTier;
}

// Includes both 'foundation' (canonical post-rename, 2026-05-11) and
// 'aibi-p' (legacy slug kept defensively per the forever-shim pattern in
// src/lib/products/normalize.ts). A paying Foundation user whose entitlement
// row was created under either slug should still pass the toolbox gate.
//
// 'in-depth-assessment' joins the set per #219 — those rows are Starter tier
// and grant read-only Library + Cookbook access. Write/run gating happens
// in canBuildOrRun() at the API layer (and in the UI for cosmetics).
const PAID_PRODUCTS = [
  'foundation',
  'foundations',
  'aibi-p',
  'aibi-s',
  'aibi-l',
  'toolbox-only',
  'in-depth-assessment',
] as const;

// Products that resolve to the 'full' Toolbox tier when present in the
// user's active entitlement set. Everything else falls back to 'starter'.
const FULL_TIER_PRODUCTS: readonly string[] = [
  'foundation',
  'foundations',
  'aibi-p',
  'aibi-s',
  'aibi-l',
  'toolbox-only',
];

export async function getPaidToolboxAccess(): Promise<PaidAccess | null> {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_ENROLLMENT_GATE === 'true'
  ) {
    return { userId: 'dev-bypass', products: ['dev-bypass'], tier: 'full' };
  }

  if (!isSupabaseConfigured()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('entitlements')
    .select('product, tier')
    .eq('user_id', user.id)
    .eq('active', true);

  if (error || !data || data.length === 0) return null;

  const rows = data as ReadonlyArray<{ product: string; tier?: string | null }>;

  const products = rows
    .map((row) => String(row.product))
    .filter((p) => (PAID_PRODUCTS as readonly string[]).includes(p));

  if (products.length === 0) return null;

  // Tier resolution: any full-tier product collapses the user to 'full'.
  // Otherwise fall back to the per-row tier column. Fail-closed default:
  // a row without an explicit tier value resolves to 'starter', so a
  // missing backfill in migration 00035 can never silently grant Full
  // access to an In-Depth-only ($99) buyer.
  const hasFullProduct = products.some((p) => FULL_TIER_PRODUCTS.includes(p));
  const tier: ToolboxTier = hasFullProduct
    ? 'full'
    : rows.some((row) => (row.tier ?? 'starter') === 'full')
      ? 'full'
      : 'starter';

  return { userId: user.id, products, tier };
}

/**
 * True when the access record allows write/run operations — Save, Run,
 * Run/Stream, Skills CRUD. Used by every mutating /api/toolbox/** route as
 * the paid-access gate BEFORE the Supabase call.
 *
 * Per the 2026-06-02 operator decision, ALL paid buyers (Foundation AND
 * In-Depth Assessment) may build/run, so this returns true for any non-null
 * paid access and false only when there is no paid entitlement. The
 * starter/full split is retained in the data layer for a possible future free
 * read-only tier. This stays the single paid-access checkpoint: RLS does not
 * gate on tier — toolbox_skills is keyed on auth.uid() = user_id.
 */
export function canBuildOrRun(access: PaidAccess | null): boolean {
  // 2026-06-02: Toolbox build/save unlocked for BOTH Foundation and
  // In-Depth Assessment buyers. The starter/full tier model is retained
  // in the data layer in case a free read-only tier is re-introduced.
  return access !== null;
}
