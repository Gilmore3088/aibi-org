// /courses/aibi-s/purchase — Enrollment landing page
// Server Component: checks existing enrollment + AiBI-Practitioner prerequisite + user auth
// AiBI-S: $1,495 per seat · Prerequisite: AiBI-Practitioner credential · Role track selection

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { getEnrollment } from '@/app/courses/aibi-s/_lib/getEnrollment';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { ROLE_TRACK_META } from '@content/courses/aibi-s';
import type { RoleTrack } from '@content/courses/aibi-s';
import { EnrollButton } from './EnrollButton';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-S | The AI Banking Institute',
  description:
    'Enroll in the Banking AI Specialist course. Six weeks, live cohort, for department managers at community banks and credit unions. Prerequisite: AiBI-Practitioner certification.',
};

const COURSE_FEATURES = [
  '6-week live cohort with 90-minute weekly Zoom sessions — same day and time every week',
  'Five role tracks: Operations, Lending, Compliance, Finance, and Retail — with track-specific platform deep dives',
  'Weekly assignments: work audit, departmental workspace, first deployment, time savings measurement, skill library, and capstone',
  'Peer review at Weeks 1, 3, and 5 — feedback from colleagues across all five role tracks',
  'Assessed capstone: submitted process improvement package with measured time savings, not a test',
  'AiBI-S credential upon passing with role track designation — e.g., AiBI-S/Ops · The AI Banking Institute',
  'Access to the full cohort session recordings for 12 months after course completion',
] as const;

const ROLE_TRACK_ORDER: RoleTrack[] = ['operations', 'lending', 'compliance', 'finance', 'retail'];

async function getUserData(): Promise<{ email: string | null; hasAiBIP: boolean }> {
  if (!isSupabaseConfigured()) {
    return { email: null, hasAiBIP: false };
  }

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

    if (!user) {
      return { email: null, hasAiBIP: false };
    }

    // Check AiBI-Practitioner enrollment with approved credential
    const { data: aibipEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('product', 'aibi-p')
      .maybeSingle();

    // AiBI-Practitioner enrollment exists — this is the prerequisite check
    // In Phase 2+, this should also verify the work submission was approved
    const hasAiBIP = aibipEnrollment !== null;

    return { email: user.email ?? null, hasAiBIP };
  } catch {
    return { email: null, hasAiBIP: false };
  }
}

export default async function AiBISPurchasePage() {
  // Already enrolled — send directly to course
  const enrollment = await getEnrollment();
  if (enrollment) {
    redirect('/courses/aibi-s');
  }

  const { email: userEmail, hasAiBIP } = await getUserData();

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-cobalt)]">
          AiBI-S
        </span>
        <div className="h-px w-8 bg-[color:var(--color-cobalt)]/30" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-slate)]">
          Banking AI Specialist
        </span>
      </div>

      {/* Heading */}
      <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-6 text-[color:var(--color-ink)]">
        Enroll in{' '}
        <span className="text-[color:var(--color-cobalt)] italic">AiBI-S</span>
      </h1>

      <p className="font-serif italic text-lg text-[color:var(--color-slate)] leading-relaxed mb-10">
        The Banking AI Specialist course is for department managers who are ready to move from personal
        AI proficiency to departmental AI capability — deployed, measured, and governed.
      </p>

      {/* Prerequisite check */}
      {userEmail && !hasAiBIP && (
        <div
          className="mb-8 rounded-sm p-5"
          style={{
            backgroundColor: 'var(--color-parch)',
            border: '1px solid rgba(155,34,38,0.2)',
            borderLeft: '3px solid var(--color-error)',
          }}
          role="alert"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-error)] mb-2">
            Prerequisite Required
          </p>
          <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-4">
            AiBI-S requires completion of the AiBI-Practitioner (Banking AI Practitioner) course. You must earn
            your AiBI-Practitioner credential before enrolling in AiBI-S.
          </p>
          <Link
            href="/courses/aibi-p/purchase"
            className="inline-block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2 rounded-sm"
          >
            Enroll in AiBI-Practitioner first
          </Link>
        </div>
      )}

      {/* Pricing block */}
      <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-cobalt)]/20 rounded-sm p-8 mb-10">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="font-mono text-5xl font-bold text-[color:var(--color-ink)] tabular-nums"
            aria-label="1495 dollars"
          >
            $1,495
          </span>
          <span className="font-mono text-sm text-[color:var(--color-slate)] uppercase tracking-widest">
            per seat
          </span>
        </div>
        <p className="font-mono text-[11px] text-[color:var(--color-slate)] mb-6">
          Institution cohort (8+ seats): custom pricing — contact us.
        </p>

        {/* Role track selection */}
        <div className="mb-6">
          <label
            htmlFor="role-track-select"
            className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)] mb-3"
          >
            Select your role track
            <span className="text-[color:var(--color-cobalt)] ml-1" aria-label="required">*</span>
          </label>
          <p className="font-sans text-xs text-[color:var(--color-slate)] mb-3">
            Your track determines platform-specific content in Week 2 and the designation on your credential.
            It cannot be changed after Week 1.
          </p>
          <select
            id="role-track-select"
            name="role_track"
            className="w-full px-4 py-3 bg-[color:var(--color-linen)] border border-[color:var(--color-cobalt)]/20 rounded-sm font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1"
            required
            defaultValue=""
          >
            <option value="" disabled>Choose a track</option>
            {ROLE_TRACK_ORDER.map((track) => {
              const meta = ROLE_TRACK_META[track];
              return (
                <option key={track} value={track}>
                  AiBI-S{meta.code} — {meta.label}
                </option>
              );
            })}
          </select>

          {/* Track descriptions */}
          <div className="mt-4 space-y-2">
            {ROLE_TRACK_ORDER.map((track) => {
              const meta = ROLE_TRACK_META[track];
              return (
                <div key={track} className="flex items-start gap-2">
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-cobalt)] mt-0.5 w-20">
                    {meta.code.replace('/', '')}
                  </span>
                  <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enroll button — disabled when prerequisite not met */}
        {hasAiBIP || !userEmail ? (
          <EnrollButton userEmail={userEmail ?? undefined} />
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full px-8 py-4 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] bg-[color:var(--color-cobalt)]/30 text-[color:var(--color-linen)]/50 cursor-not-allowed"
          >
            Complete AiBI-Practitioner First
          </button>
        )}
      </div>

      {/* Cohort info */}
      <section className="mb-10" aria-labelledby="cohort-heading">
        <h2
          id="cohort-heading"
          className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-4"
        >
          Cohort <span className="italic">Details</span>
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Next cohort start', value: 'May 5, 2026' },
            { label: 'Session day and time', value: 'Tuesdays, 12:00–1:30 PM ET' },
            { label: 'Enrollment deadline', value: 'April 28, 2026' },
            { label: 'Cohort size', value: '12–25 learners across all five role tracks' },
            { label: 'Format', value: 'Live Zoom + weekly asynchronous assignment' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-slate)] w-36">
                {label}
              </span>
              <span className="font-sans text-sm text-[color:var(--color-slate)]">{value}</span>
            </div>
          ))}
        </div>
      </section>

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
                className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-cobalt)] flex-shrink-0"
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
      <div className="pt-6 border-t border-[color:var(--color-cobalt)]/10">
        <Link
          href="/courses/aibi-s"
          className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          Back to Course Overview
        </Link>
      </div>

    </div>
  );
}
