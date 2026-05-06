import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export type ToolboxTier = 'full' | 'starter';

export interface PaidAccess {
  readonly userId: string;
  readonly products: readonly string[];
  /**
   * 'full'    — aibi-p / aibi-s / aibi-l / toolbox-only buyers; save / export
   *             / API-proxy enabled.
   * 'starter' — In-Depth Assessment buyers; read-only browse, no save / export
   *             / API-proxy. Upsell back to a course for the full experience.
   */
  readonly tier: ToolboxTier;
}

const FULL_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only'] as const;
const STARTER_PRODUCTS = ['indepth-starter-toolkit'] as const;
const ALL_PRODUCTS = [...FULL_PRODUCTS, ...STARTER_PRODUCTS] as const;

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
    .select('product')
    .eq('user_id', user.id)
    .eq('active', true);

  if (error || !data || data.length === 0) return null;

  const products = data
    .map((row) => String(row.product))
    .filter((p) => (ALL_PRODUCTS as readonly string[]).includes(p));

  if (products.length === 0) return null;

  // Tier resolution: any full-product entitlement wins over starter-only.
  const tier: ToolboxTier = products.some((p) =>
    (FULL_PRODUCTS as readonly string[]).includes(p),
  )
    ? 'full'
    : 'starter';

  return { userId: user.id, products, tier };
}

