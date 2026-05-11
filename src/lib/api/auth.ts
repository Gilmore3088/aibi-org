// Auth helper for Route Handlers. Returns the authenticated user from
// the request's Supabase session cookie, or null if no valid session.
//
// Usage:
//   const user = await getAuthUser();
//   if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//
// The pattern is duplicated across ~15 route handlers; centralizing it
// reduces drift if Supabase changes the SSR API shape.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export async function getAuthUser(): Promise<User | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = cookies();
  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers — session kept alive by middleware
      },
    },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}
