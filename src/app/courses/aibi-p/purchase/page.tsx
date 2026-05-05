// /courses/aibi-p/purchase — Enrollment landing page
// Server Component: fetches auth session, checks existing enrollment, renders EnrollButton.
// Redirect target for non-enrolled users attempting to access module pages (SHELL-12)

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { getEnrollment } from '@/app/courses/aibi-p/_lib/getEnrollment';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EnrollButton } from './EnrollButton';
import { aibiPCourseConfig } from '@content/courses/aibi-p';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-P | The AI Banking Institute',
  description:
    'Enroll in the Banking AI Practitioner course. Twelve modules, practical artifacts, and the AiBI-P credential upon completion.',
};

const COURSE_FEATURES = [
  '12 foundation modules for practical AI use at work',
  'Practice reps that build safe daily habits',
  'Prompt library for reusable banking workflows',
  'Artifacts including safe-use, review, prompt, and AI personal system templates',
  'Certification path with practical work product submission',
] as const;

async function getUserEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const cookieStore = cookies();

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

    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function PurchasePage() {
  // Already enrolled — send directly to course
  const enrollment = await getEnrollment();
  if (enrollment) {
    redirect('/courses/aibi-p');
  }

  const userEmail = await getUserEmail();

  return (
    <div className="mx-auto px-8 lg:px-16 py-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/education" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors">
          Education
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <Link href="/courses/aibi-p" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] hover:opacity-80 transition-opacity">
          AiBI-P
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50">
          Enroll
        </span>
      </nav>

      <section className="mb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight text-[color:var(--color-ink)] mb-2">
          Banking AI <span className="text-[color:var(--color-terra)] italic">Practitioner</span>
        </h1>
        <p className="text-sm text-[color:var(--color-ink)]/75 mb-4 max-w-2xl">
          {aibiPCourseConfig.promise} In less than two weeks, learn how to
          write better, summarize faster, think clearer, and avoid risky AI
          mistakes.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="w-full sm:w-auto min-w-[220px]">
            <EnrollButton userEmail={userEmail ?? undefined} />
          </div>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            12 modules
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            Learn / Practice / Apply
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            {aibiPCourseConfig.estimatedMinutes} min total
          </span>
        </div>
      </section>

      {/* Pricing block */}
      <section className="grid md:grid-cols-[0.8fr_1.2fr] gap-6 mb-8 border border-[color:var(--color-terra)]/20 bg-[color:var(--color-parch)] rounded-[3px] p-6">
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Pricing
          </p>
          <h2 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight">
            AiBI-P Practitioner
          </h2>
          <div className="mt-4 space-y-2">
            <p className="font-mono text-sm text-[color:var(--color-ink)] tabular-nums">
              $295 per individual
            </p>
            <p className="font-mono text-sm text-[color:var(--color-ink)] tabular-nums">
              $199 per seat for 10+ seats
            </p>
          </div>
        </div>
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
            Includes
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSE_FEATURES.map((feature) => (
              <div key={feature} className="flex gap-3 text-sm text-[color:var(--color-ink)]/75">
                <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is included */}
      <section aria-labelledby="includes-heading" className="mb-10 grid lg:grid-cols-[0.8fr_1.2fr] gap-6 border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
        <h2
          id="includes-heading"
          className="font-serif text-2xl font-bold text-[color:var(--color-ink)]"
        >
          Enrollment includes the full practitioner path.
        </h2>
        <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
          Team purchases use a single checkout with manual onboarding follow-up.
          This checkout enrolls learners in AiBI-P; additional advanced tracks
          are in development.
        </p>
      </section>

      {/* Back link */}
      <div className="pt-6 border-t border-[color:var(--color-terra)]/10">
        <Link
          href="/courses/aibi-p"
          className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          Back to Course Overview
        </Link>
      </div>

    </div>
  );
}
