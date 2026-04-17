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

export const metadata: Metadata = {
  title: 'Enroll in AiBI-P | The AI Banking Institute',
  description:
    'Enroll in the Banking AI Practitioner course. Nine modules, five downloadable artifacts, and the AiBI-P credential upon completion.',
};

const COURSE_FEATURES = [
  '9 modules across four pillars: Awareness, Understanding, Creation, Application',
  '5 downloadable artifacts you keep: Regulatory Cheatsheet, Acceptable Use Card, Skill Template Library, Platform Reference Card, and your completed AiBI-P Skill',
  'Forward-only progression designed for focused, mobile-first completion',
  'Assessed work product reviewed by a certified AiBI reviewer — not a multiple-choice test',
  'AiBI-P credential upon passing, with LinkedIn badge and Accredible verification',
  'Completable in under 5.5 hours on any device, including iPhone Safari',
] as const;

async function getUserEmail(): Promise<string | null> {
  // Dev bypass — skip Supabase auth in development
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return 'dev@example.com';
  }
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
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-terra)]">
          AiBI-P
        </span>
        <div className="h-px w-8 bg-[color:var(--color-terra)]/30" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-dust)]">
          Banking AI Practitioner
        </span>
      </div>

      {/* Heading */}
      <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-6 text-[color:var(--color-ink)]">
        Enroll in{' '}
        <span className="text-[color:var(--color-terra)] italic">AiBI-P</span>
      </h1>

      <p className="font-serif italic text-lg text-[color:var(--color-slate)] leading-relaxed mb-10">
        The Banking AI Practitioner course prepares every staff member at a community bank
        or credit union to use AI tools safely, professionally, and with regulatory confidence.
      </p>

      {/* Pricing block */}
      <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm p-8 mb-10">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="font-mono text-5xl font-bold text-[color:var(--color-ink)] tabular-nums"
            aria-label="79 dollars"
          >
            $79
          </span>
          <span className="font-mono text-sm text-[color:var(--color-dust)] uppercase tracking-widest">
            per seat
          </span>
        </div>
        <p className="font-mono text-[11px] text-[color:var(--color-slate)] mb-6">
          Institution pricing (5+ seats): approx. $63/seat — contact us.
        </p>

        <EnrollButton userEmail={userEmail ?? undefined} />
      </div>

      {/* What is included */}
      <section aria-labelledby="includes-heading" className="mb-10">
        <h2
          id="includes-heading"
          className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6"
        >
          What is <span className="italic">included</span>
        </h2>
        <ul className="space-y-4" role="list">
          {COURSE_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-terra)] flex-shrink-0"
                aria-hidden="true"
              />
              <span className="font-serif text-[color:var(--color-slate)] leading-relaxed text-sm">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Back link */}
      <div className="pt-6 border-t border-[color:var(--color-terra)]/10">
        <Link
          href="/courses/aibi-p"
          className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-dust)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          Back to Course Overview
        </Link>
      </div>

    </div>
  );
}
