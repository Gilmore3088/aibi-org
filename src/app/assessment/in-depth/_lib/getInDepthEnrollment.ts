// Server-only entitlement lookup for the In-Depth Assessment.
// Mirrors src/app/courses/foundations/_lib/getEnrollment.ts but matches against
// product='in-depth-assessment' instead of 'aibi-p'.
//
// Returns null when:
//   - Supabase isn't configured
//   - The request has no auth session
//   - The auth'd user has no in-depth enrollment row

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface InDepthEnrollment {
  readonly id: string;
  readonly user_id: string | null;
  readonly email: string;
  readonly enrolled_at: string;
  readonly stripe_session_id: string | null;
}

export async function getInDepthEnrollment(): Promise<InDepthEnrollment | null> {
  if (!isSupabaseConfigured()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

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

  // Match by user_id when bound, else by email — purchases happen pre-login,
  // so the row may have user_id=null until first login binds it.
  const email = user.email ?? null;
  const orFilter = email
    ? `user_id.eq.${user.id},email.eq.${email}`
    : `user_id.eq.${user.id}`;

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, user_id, email, enrolled_at, stripe_session_id')
    .eq('product', 'in-depth-assessment')
    .or(orFilter)
    .order('enrolled_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getInDepthEnrollment] supabase error:', error);
    return null;
  }

  return (data as InDepthEnrollment | null) ?? null;
}
