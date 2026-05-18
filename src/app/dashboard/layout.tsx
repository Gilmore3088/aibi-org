// Server-side auth gate for the entire /dashboard tree.
//
// Issue #121 §3.62 — Playwright E2E expected `/dashboard` to redirect
// logged-out users to /auth/login with a `?next=` capture, the same
// pattern protecting course module routes. The page itself was a client
// component that quietly rendered a fallback empty state for unauth,
// which isn't what a dashboard should do — it's the wrong default for
// "your data" surfaces because it hides the sign-in path. This layout
// runs before any /dashboard/* page and forces the redirect.
//
// Sub-routes that need additional gating (paid Toolbox access,
// enrolled-course access) continue to enforce their own checks on top.

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';

// Authed surface — never index dashboard pages in search engines.
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Preview/local bypass — skip the gate entirely when PREVIEW_AUTH_BYPASS=true
  // is set on a non-production environment. Lets us click into /dashboard on
  // a Vercel preview without provisioning Supabase. See lib/auth/previewBypass.
  if (isPreviewAuthBypassEnabled()) {
    return <>{children}</>;
  }

  // Preserve the originally-requested path so the post-login redirect lands
  // the visitor on the page they tried to reach (e.g. /dashboard/assessments)
  // rather than always the top-level /dashboard. Middleware sets x-pathname.
  const headerList = await headers();
  const nextPath = headerList.get('x-pathname') ?? '/dashboard';
  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

  // No Supabase configured (e.g. preview without env vars) — fail closed and
  // send the visitor to the login page. They'll see the "Auth is not
  // configured" error there if the deployment itself is broken; better that
  // than rendering an empty dashboard with no recovery path.
  if (!isSupabaseConfigured()) {
    redirect(loginHref);
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
    redirect(loginHref);
  }

  return <>{children}</>;
}
