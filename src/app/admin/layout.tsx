// Server-side gate for the entire /admin tree.
//
// Internal operator surface. Unlike /dashboard there is deliberately NO
// preview-auth bypass: admin pages render PII, so they require a real Supabase
// session AND membership in an internal admin allowlist. This top gate admits
// EITHER a funnel admin (FUNNEL_ADMIN_EMAILS) or a support admin
// (ADMIN_SUPPORT_EMAILS); each section re-checks its own list below
// (/admin/funnel → FUNNEL_ADMIN_EMAILS, /admin/support → ADMIN_SUPPORT_EMAILS).
// Fail-closed at every branch.
//
//   not configured        → 404 (admin is unavailable on this deployment)
//   not signed in         → redirect to /auth/login?next=…
//   signed in, not admin  → 404 (don't acknowledge the surface)

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin/access';
import { isSupportAdminEmail } from '@/lib/support/admin';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    notFound();
  }

  const headerList = await headers();
  const nextPath = headerList.get('x-pathname') ?? '/admin';
  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

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

  // Admit any internal admin past the top gate; each section enforces its own
  // allowlist (see /admin/funnel/layout.tsx and /admin/support/layout.tsx).
  if (!isAdminEmail(user.email) && !isSupportAdminEmail(user.email)) {
    notFound();
  }

  return <>{children}</>;
}
