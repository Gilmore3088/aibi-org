// Server-side gate for the entire /admin tree.
//
// Internal operator surface. Unlike /dashboard there is deliberately NO
// preview-auth bypass: admin pages render contact PII and revenue counts, so
// they must require a real Supabase session AND a FUNNEL_ADMIN_EMAILS match.
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

  if (!isAdminEmail(user.email)) {
    notFound();
  }

  return <>{children}</>;
}
