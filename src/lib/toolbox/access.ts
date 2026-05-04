import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isOwnerEmail } from '@/lib/auth/owner-access';

export interface PaidAccess {
  readonly userId: string;
  readonly products: readonly string[];
}

const PAID_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l'] as const;

export async function getPaidToolboxAccess(): Promise<PaidAccess | null> {
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
    .from('course_enrollments')
    .select('product')
    .eq('user_id', user.id)
    .in('product', [...PAID_PRODUCTS]);

  if (error) return null;

  const products = (data ?? []).map((row) => String(row.product));

  // Owner allowlist (OWNER_EMAILS env var; see src/lib/auth/owner-access.ts)
  // grants full toolbox access without requiring a paid enrollment.
  // Replaces the retired SKIP_ENROLLMENT_GATE escape hatch.
  if (products.length === 0 && isOwnerEmail(user.email)) {
    return { userId: user.id, products: [...PAID_PRODUCTS] };
  }

  if (products.length === 0) return null;

  return { userId: user.id, products };
}
