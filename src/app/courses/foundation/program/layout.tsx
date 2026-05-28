// /courses/foundation/program layout — auth + onboarding gate.
//
// The legacy CourseSidebar + MobileSidebarDrawer chrome was retired
// when the LMS prototype reskin landed (PR #52–#56). The new chrome
// lives inside <CourseShell>, which each page in this tree wraps
// individually. Keeping a second sidebar here produced the documented
// double-sidebar artifact during the migration.
//
// Gates this layout enforces:
//   AUTH-01  — unauthenticated visitors are redirected to /auth/login
//              with ?next= capture, matching the /dashboard pattern.
//              /purchase is exempt so the buy funnel works for visitors
//              without accounts (account is created post-Stripe).
//   ONBD-02  — enrolled users with null onboarding_answers are
//              redirected to /onboarding before they can reach any module.

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';
import { isDeviceTrusted, TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';
import { getEnrollment } from './_lib/getEnrollment';

interface CourseLayoutProps {
  readonly children: ReactNode;
}

// Paths that must never trigger the auth or onboarding redirects.
//   /purchase   — public buy funnel; account creation happens after Stripe
//   /purchased  — Stripe success URL; buyer hasn't signed in yet by definition.
//                 The page itself validates the session_id server-side against
//                 Stripe and shows the Create-Account / Sign-In CTA ladder. If
//                 auth-gated here, a fresh buyer dead-ends on "Welcome back."
//                 with no path to the course they just paid for. Issue #310.
//   /onboarding — destination of the onboarding redirect; exempting it
//                 prevents an infinite loop
//   /settings  — onboarding edit surface, must be reachable mid-onboarding
const AUTH_EXEMPT_SUFFIXES = ['/purchase', '/purchased'] as const;
const ONBOARDING_EXEMPT_SUFFIXES = ['/onboarding', '/settings', '/purchase', '/purchased'] as const;

export default async function CourseLayout({ children }: CourseLayoutProps) {
  // Preview/local bypass — skip auth + onboarding gates entirely when
  // PREVIEW_AUTH_BYPASS=true on a non-production environment.
  if (isPreviewAuthBypassEnabled()) {
    return (
      <div className="mockup-scope">
        {children}
      </div>
    );
  }

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // AUTH-01: redirect unauthenticated visitors to /auth/login, preserving
  // the deep-link target via ?next=. /purchase is exempt — visitors must
  // be able to reach the buy funnel without an account.
  const isAuthExempt = AUTH_EXEMPT_SUFFIXES.some((suffix) =>
    pathname.endsWith(suffix),
  );

  if (!isAuthExempt) {
    const loginHref = `/auth/login?next=${encodeURIComponent(
      pathname || '/courses/foundation/program',
    )}`;

    // No Supabase configured (e.g. preview without env vars) — fail closed
    // and send the visitor to the login page. They'll see the "Auth is not
    // configured" error there if the deployment itself is broken; better
    // than rendering course content with no recovery path.
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

    // #187 PR 2 — new-device trust gate, mirrors /dashboard/layout. If the
    // session is valid but this browser doesn't carry a non-expired
    // aibi-trusted-device cookie bound to this user, bounce to the
    // confirmation holding page.
    const trustedCookie = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
    if (!(await isDeviceTrusted({ userId: user.id, cookieToken: trustedCookie }))) {
      redirect(`/auth/confirm-device-pending?email=${encodeURIComponent(user.email ?? '')}`);
    }
  }

  // ONBD-02: enrolled users mid-onboarding go to /onboarding.
  const enrollment = await getEnrollment();

  if (enrollment !== null && enrollment.onboarding_answers === null) {
    const isOnboardingExempt = ONBOARDING_EXEMPT_SUFFIXES.some((suffix) =>
      pathname.endsWith(suffix),
    );

    if (!isOnboardingExempt) {
      redirect('/courses/foundation/program/onboarding');
    }
  }

  return (
    <div className="mockup-scope">
      {children}
    </div>
  );
}
