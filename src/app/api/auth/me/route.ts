// GET /api/auth/me — small server endpoint that returns the current
// authenticated user (or null) for client-side gating. Used to pre-fill
// email fields and gate CTAs without exposing the service-role key to
// the browser. Originally scoped in PR #44 (carried forward via #48).
//
// Returns:
//   200 { user: { id, email } | null }
//
// Never errors on missing config — clients should treat null as
// "not logged in or service unavailable" and behave accordingly.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ user: null });
  }

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

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
    },
  });
}
