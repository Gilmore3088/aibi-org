// Server-side helper — used by /auth/login and /auth/signup layouts to
// redirect already-authenticated visitors away from the public auth
// forms. Mirrors the inverse of the /dashboard layout pattern.
//
// Decision target: if the visitor has a session, send them to ?next=
// (when safe — see sanitizeNext) or /dashboard. Otherwise return so the
// page renders normally.
//
// Why a helper vs inline in each layout: /auth/login and /auth/signup
// need the exact same check. Inlining duplicates ~25 lines twice. This
// keeps the layouts thin and the auth contract in one place.

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeNext } from '@/lib/supabase/auth';

export async function requireGuestOrRedirect(): Promise<void> {
  // No Supabase configured (e.g. preview without env vars) — let the
  // page render so the visitor sees the "not configured" error in the
  // form rather than bouncing into nowhere.
  if (!isSupabaseConfigured()) {
    return;
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

  if (!user) return;

  // Already authenticated — figure out where to send them. The ?next=
  // param survives across the redirect (the visitor likely came from
  // a deep-link → /auth/login?next=/foo flow and is now hitting it
  // again with a live session).
  // x-search carries the raw query string set by middleware; x-pathname
  // is path-only so nav active checks stay correct.
  const headerList = await headers();
  const search = headerList.get('x-search') ?? '';
  const params = new URLSearchParams(search);
  const nextParam = params.get('next');
  const destination = sanitizeNext(nextParam);
  redirect(destination);
}
