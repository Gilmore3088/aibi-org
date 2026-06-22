// Funnel-specific gate. The parent /admin gate admits either a funnel or a
// support admin; /admin/funnel exposes contact PII + revenue counts, so it
// additionally requires FUNNEL_ADMIN_EMAILS specifically. Fail-closed.

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin/access';

export default async function AdminFunnelLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = ssrCreateServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    notFound();
  }

  return <>{children}</>;
}
