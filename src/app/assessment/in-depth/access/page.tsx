// /assessment/in-depth/access — legacy institution/cohort access URL.
// Until the cohort dashboard is fully productized, entitled individual buyers
// are routed to the real assessment dashboard instead of seeing "Coming soon"
// scaffolding.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';
import { isDeviceTrusted, TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';
import { getInDepthEnrollment } from '../_lib/getInDepthEnrollment';

export const metadata: Metadata = {
  title: 'In-Depth Assessment Access | The AI Banking Institute',
  description: 'Redirects paid In-Depth Assessment buyers to their assessment dashboard.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function InDepthDashboardPage() {
  // Preview/local bypass — parity with /dashboard and /my-toolbox.
  if (!isPreviewAuthBypassEnabled()) {
    if (!isSupabaseConfigured()) {
      redirect('/auth/login?next=/assessment/in-depth/access');
    }

    // #187 PR 2 — trusted-device defense-in-depth. The /api/auth/check-device
    // path at sign-in time fails open on transient errors; this layer-level
    // check covers that gap and any session cookie that arrived by another
    // route. Mirrors the /dashboard layout pattern.
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
      redirect('/auth/login?next=/assessment/in-depth/access');
    }
    const trustedCookie = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
    if (!(await isDeviceTrusted({ userId: user.id, cookieToken: trustedCookie }))) {
      // Forward the paid destination so device confirmation lands the buyer on
      // the assessment itself (check-device honors next via sanitizeNext)
      // rather than the generic dashboard.
      redirect(
        `/auth/confirm-device-pending?email=${encodeURIComponent(user.email ?? '')}` +
          `&next=${encodeURIComponent('/assessment/in-depth/take')}`,
      );
    }
  }

  const enrollment = await getInDepthEnrollment();
  if (!enrollment) {
    redirect('/assessment/in-depth?reason=no-purchase');
  }

  redirect('/dashboard/assessments');
}
