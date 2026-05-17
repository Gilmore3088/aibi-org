// Server-only entitlement lookup for the In-Depth Assessment.
//
// Thin wrapper around the shared findEnrollmentByEmailOrUserId helper
// (src/lib/enrollment/findEnrollment.ts) scoped to
// product='in-depth-assessment'. Returns null when Supabase isn't
// configured, when the request has no auth session, or when the
// authenticated user has no in-depth enrollment row.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { findEnrollmentByEmailOrUserId } from '@/lib/enrollment/findEnrollment';

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

  return findEnrollmentByEmailOrUserId<InDepthEnrollment>(supabase, {
    user,
    products: ['in-depth-assessment'],
    columns: 'id, user_id, email, enrolled_at, stripe_session_id',
    orderByEnrolledAtDesc: true,
  });
}
