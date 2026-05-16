// /assessment/in-depth/take
// The 48-question paid In-Depth AI Readiness Assessment.
//
// Server component — gates on:
//   1. Supabase auth (must be logged in)
//   2. course_enrollments entitlement (product='in-depth-assessment')
//
// On both gates passing, renders the client InDepthRunner which uses the
// useAssessmentInDepth hook to step through all 48 questions.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { emailVariants } from '@/lib/email/canonicalize';
import { InDepthRunner } from './_components/InDepthRunner';

export const metadata: Metadata = {
  title: 'In-Depth AI Readiness Assessment | The AI Banking Institute',
  description:
    'Forty-eight questions across the eight readiness dimensions. Returns a personalized Briefing with peer-band comparison, a deep-dive on your lowest-scoring dimensions, and an action register scaffold.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function InDepthTakePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-3xl text-[color:var(--color-ink)] mb-4">
            Service unavailable
          </h1>
          <p className="text-[color:var(--color-ink)]/75">
            The assessment isn&rsquo;t configured in this environment. Try again
            shortly.
          </p>
        </div>
      </main>
    );
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

  if (!user || !user.email) {
    redirect('/auth/login?next=/assessment/in-depth/take');
  }

  // Email variants cover Gmail-style "+alias" forms that Stripe stores
  // verbatim. Without this, paying as user+1@gmail.com but signing in
  // as user@gmail.com leaves the entitlement unfindable.
  const variants = emailVariants(user.email);
  const emailClause = variants.map((e) => `email.eq.${e}`).join(',');
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, enrolled_at')
    .eq('product', 'in-depth-assessment')
    .or(`user_id.eq.${user.id},${emailClause}`)
    .limit(1)
    .maybeSingle();

  if (!enrollment) {
    redirect('/assessment/in-depth?reason=no-purchase');
  }

  return <InDepthRunner />;
}
