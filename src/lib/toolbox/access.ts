// Entitlement check for toolbox surfaces.
//
// The toolbox is one product split across two routes:
//   /dashboard/toolbox          — full app (build, playground, save, export);
//                                 requires a course or toolbox-only entitlement.
//   /dashboard/toolbox/starter  — read-only landing for In-Depth buyers;
//                                 hands them to the Library and an upsell card.
//
// Library + cookbook are read-only and accessible to either tier; API
// routes that mutate gate on `hasFullToolboxAccess`.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface ToolboxAccess {
  readonly userId: string;
  readonly products: readonly string[];
}

const FULL_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only'] as const;
const STARTER_PRODUCT = 'indepth-starter-toolkit';
const ALL_PRODUCTS = [...FULL_PRODUCTS, STARTER_PRODUCT] as const;

export async function getPaidToolboxAccess(): Promise<ToolboxAccess | null> {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_ENROLLMENT_GATE === 'true'
  ) {
    return { userId: 'dev-bypass', products: ['dev-bypass', ...FULL_PRODUCTS] };
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

  return { userId: user.id, products };
}

export function hasFullToolboxAccess(
  access: ToolboxAccess | null,
): access is ToolboxAccess {
  if (!access) return false;
  return access.products.some((p) =>
    (FULL_PRODUCTS as readonly string[]).includes(p),
  );
}

export function hasStarterToolkitAccess(
  access: ToolboxAccess | null,
): access is ToolboxAccess {
  if (!access) return false;
  return access.products.includes(STARTER_PRODUCT);
}
