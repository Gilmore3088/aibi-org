import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Toolbox entitlement tier.
 *
 *   - 'full'    — Foundation course buyers (AiBI-Foundation, AiBI-S, AiBI-L,
 *                 toolbox-only). Library + Cookbook + Build + Playground.
 *   - 'starter' — In-Depth Assessment ($99) buyers. Library + Cookbook only;
 *                 Build, Playground, Save, Run gated at the API layer.
 *
 * See issue #219 for the full design + acceptance criteria.
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
  // Otherwise fall back to the per-row tier column (which defaults to
  // 'full' in the schema, so legacy rows continue to behave correctly).
  const hasFullProduct = products.some((p) => FULL_TIER_PRODUCTS.includes(p));
  const tier: ToolboxTier = hasFullProduct
    ? 'full'
    : rows.some((row) => (row.tier ?? 'full') !== 'starter')
      ? 'full'
      : 'starter';

  return { userId: user.id, products, tier };
}

/**
 * True when the access record allows write/run operations — Save, Run,
 * Run/Stream, Skills CRUD. Used by every mutating /api/toolbox/** route
 * to reject Starter-tier requests with 403 BEFORE the Supabase call.
 *
 * Critical: this is the only protection against a Starter user opening
 * DevTools and POSTing directly to /api/toolbox/save. RLS does not catch
 * this because toolbox_skills is gated on auth.uid() = user_id, not on
 * tier.
 */
export function canBuildOrRun(access: PaidAccess | null): boolean {
  return access?.tier === 'full';
}
