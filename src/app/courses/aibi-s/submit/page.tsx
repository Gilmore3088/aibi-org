// /courses/aibi-s/submit — Capstone submission page
// Server Component: enrollment check + week completion check
// Five required items: work audit, deployed automation, skill library, time savings report, training materials

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { RoleTrack } from '@content/courses/aibi-s';
import { ROLE_TRACK_META } from '@content/courses/aibi-s';
import { RoleTrackBadge } from '../_components/RoleTrackBadge';

export const metadata: Metadata = {
  title: 'Capstone Submission | AiBI-S',
};

const ALL_WEEKS = [1, 2, 3, 4, 5, 6] as const;

function allWeeksComplete(completedWeeks: readonly number[]): boolean {
  return ALL_WEEKS.every((w) => completedWeeks.includes(w));
}

// The five required capstone submission items
const CAPSTONE_ITEMS = [
  {
    id: 'work_audit',
    number: '01',
    label: 'Work Audit',
    description:
      'Your W1 submission (updated if applicable): the ranked list of department workflows with your scoring and rationale for selecting your primary automation candidate.',
    fromWeek: 1,
  },
  {
    id: 'deployed_automation',
    number: '02',
    label: 'Deployed Automation Description',
    description:
      'Your W3 submission with W4 enhancements applied: description of the deployed automation, who uses it, how it is governed, and what changed after the W4 quality evaluation.',
    fromWeek: 3,
  },
  {
    id: 'skill_library',
    number: '03',
    label: 'Skill Library',
    description:
      'Your W5 submission: three-automation library with library entries (name, purpose, owner, data tier, maintenance schedule) for all three automations.',
    fromWeek: 5,
  },
  {
    id: 'time_savings_report',
    number: '04',
    label: 'Time Savings Report',
    description:
      'Your W4 submission: calculated time savings with before/after timing data, output quality evaluation scores with evidence, and annualized value estimate.',
    fromWeek: 4,
  },
  {
    id: 'training_materials',
    number: '05',
    label: 'Training Materials',
    description:
      'The one-page job aids from W5 for all three automations in your skill library. Each job aid must include purpose, required inputs, step-by-step instructions, verification steps, and owner contact.',
    fromWeek: 5,
  },
] as const;

type SubmissionStatus = 'pending' | 'approved' | 'failed' | 'resubmitted' | null;

interface CapstoneSubmission {
  readonly id: string;
  readonly enrollment_id: string;
  readonly submitted_at: string;
  readonly review_status: SubmissionStatus;
  readonly review_feedback: string | null;
  readonly reviewed_at: string | null;
}

export default async function AiBISSubmitPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/courses/aibi-s/purchase');
  }

  const roleTrack = (enrollment.role_track as RoleTrack | null) ?? null;

  // Check for existing capstone submission
  let submission: CapstoneSubmission | null = null;
  if (isSupabaseConfigured()) {
    const serviceClient = createServiceRoleClient();
    const { data } = await serviceClient
      .from('work_submissions')
      .select('id, enrollment_id, submitted_at, review_status, review_feedback, reviewed_at')
      .eq('enrollment_id', enrollment.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      submission = data as CapstoneSubmission;
    }
  }

  const weeksComplete = allWeeksComplete(enrollment.completed_modules);

  const trackMeta = roleTrack ? ROLE_TRACK_META[roleTrack] : null;

  return (
    <>
      {/* Cobalt header band */}
      <div className="bg-[color:var(--color-cobalt)] text-[color:var(--color-linen)] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]/60 mb-2">
                AiBI-S Certification
              </p>
              <h1 className="font-serif text-3xl font-bold mb-2">Capstone Submission</h1>
              <p className="font-sans text-sm text-[color:var(--color-linen)]/75 leading-relaxed max-w-2xl">
                Submit your five-item capstone package to earn the AiBI-S credential. A reviewer will
                assess your submission against the five-dimension rubric within 10 business days.
              </p>
            </div>
            {roleTrack && (
              <div className="shrink-0 mt-1">
                <RoleTrackBadge track={roleTrack} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 lg:px-8 py-10">

        {/* Five items explanation */}
        <section className="mb-10" aria-labelledby="items-heading">
          <h2
            id="items-heading"
            className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6"
          >
            Five Required <span className="italic">Items</span>
          </h2>
          <div className="w-10 h-px bg-[color:var(--color-cobalt)] mb-6" aria-hidden="true" />

          <div className="space-y-4" role="list">
            {CAPSTONE_ITEMS.map((item) => {
              const weekComplete = enrollment.completed_modules.includes(item.fromWeek);
              return (
                <div
                  key={item.id}
                  role="listitem"
                  className={`flex items-start gap-4 p-5 rounded-sm border ${
                    weekComplete
                      ? 'border-[color:var(--color-cobalt)]/15 bg-[color:var(--color-parch)]'
                      : 'border-[color:var(--color-cobalt)]/10 bg-[color:var(--color-parch)]/50 opacity-60'
                  }`}
                >
                  <span
                    className="shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--color-cobalt)] mt-0.5"
                    aria-hidden="true"
                  >
                    {item.number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-[color:var(--color-ink)]">{item.label}</h3>
                      {!weekComplete && (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)]">
                          Complete Week {item.fromWeek} first
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {weekComplete && (
                    <svg
                      className="shrink-0 w-4 h-4 mt-0.5 text-[color:var(--color-cobalt)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Source week complete"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Course incomplete gate */}
        {!weeksComplete && (
          <div
            className="border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)] mb-8"
            style={{ borderLeftColor: 'var(--color-cobalt)', borderWidth: '1px' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-2">
              Course Incomplete
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-4">
              Complete all six weeks before submitting your capstone package.
            </p>
            <Link
              href="/courses/aibi-s"
              className="inline-block px-5 py-2 border border-[color:var(--color-cobalt)] text-[color:var(--color-cobalt)] hover:bg-[color:var(--color-cobalt)] hover:text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
            >
              Return to Course
            </Link>
          </div>
        )}

        {/* Under review */}
        {weeksComplete && submission &&
          (submission.review_status === 'pending' || submission.review_status === 'resubmitted') && (
          <div
            className="border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)] mb-8"
            style={{ borderLeftColor: 'var(--color-cobalt)', borderWidth: '1px' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-2">
              Under Review
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-2">
              Your capstone submission is under review.
            </p>
            <p className="font-sans text-sm text-[color:var(--color-slate)]">
              Submitted{' '}
              {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              . You will receive feedback within 10 business days.
            </p>
          </div>
        )}

        {/* Approved */}
        {weeksComplete && submission && submission.review_status === 'approved' && (
          <div
            className="border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)] mb-8"
            style={{ borderLeftColor: 'var(--color-sage)', borderWidth: '1px' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-sage)] mb-2">
              Approved
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-2">
              Your capstone has been approved.{' '}
              {trackMeta ? `Your AiBI-S${trackMeta.code} credential has been issued.` : 'Your AiBI-S credential has been issued.'}
            </p>
            {submission.reviewed_at && (
              <p className="font-sans text-sm text-[color:var(--color-slate)] mb-4">
                Reviewed{' '}
                {new Date(submission.reviewed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                .
              </p>
            )}
            <Link
              href="/courses/aibi-s/certificate"
              className="inline-block px-5 py-2 bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
            >
              View Certificate
            </Link>
          </div>
        )}

        {/* Failed with feedback */}
        {weeksComplete && submission && submission.review_status === 'failed' && submission.review_feedback && (
          <div
            className="border-l-4 rounded-sm p-6 bg-[color:var(--color-parch)] mb-8"
            style={{ borderLeftColor: 'var(--color-error)', borderWidth: '1px' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-error)] mb-2">
              Resubmission Required
            </p>
            <p className="font-sans text-base text-[color:var(--color-ink)] mb-3">
              Your submission did not meet the certification standard. Reviewer feedback is below.
            </p>
            <blockquote className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed pl-4 border-l-2 border-[color:var(--color-cobalt)]/30 mb-4">
              {submission.review_feedback}
            </blockquote>
            <p className="font-sans text-xs text-[color:var(--color-slate)]">
              Address the feedback in all five items and resubmit below. One resubmission is permitted per enrollment.
            </p>
          </div>
        )}

        {/* Submission form */}
        {weeksComplete && (!submission || submission.review_status === 'failed') && (
          <section aria-labelledby="form-heading">
            <h2
              id="form-heading"
              className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-2"
            >
              {submission?.review_status === 'failed' ? 'Resubmit' : 'Submit'}{' '}
              <span className="italic">Capstone</span>
            </h2>
            <div className="w-10 h-px bg-[color:var(--color-cobalt)] mb-8" aria-hidden="true" />

            <form className="space-y-8" aria-label="Capstone submission form">
              {CAPSTONE_ITEMS.map((item) => (
                <div key={item.id}>
                  <label
                    htmlFor={`field-${item.id}`}
                    className="block mb-1"
                  >
                    <span className="font-mono text-[10px] text-[color:var(--color-cobalt)] mr-2" aria-hidden="true">
                      {item.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]">
                      {item.label}
                    </span>
                    <span className="text-[color:var(--color-cobalt)] ml-1" aria-label="required">*</span>
                  </label>
                  <p className="font-sans text-xs text-[color:var(--color-slate)] mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  <textarea
                    id={`field-${item.id}`}
                    name={item.id}
                    required
                    rows={6}
                    minLength={100}
                    placeholder={`Enter your ${item.label.toLowerCase()} here...`}
                    className="w-full px-4 py-3 bg-[color:var(--color-linen)] border border-[color:var(--color-cobalt)]/20 rounded-sm font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1 resize-y min-h-[140px]"
                  />
                </div>
              ))}

              {/* Role track confirmation */}
              {roleTrack && (
                <div
                  className="p-4 rounded-sm flex items-center gap-3"
                  style={{ backgroundColor: 'rgba(45,74,122,0.05)', border: '1px solid rgba(45,74,122,0.15)' }}
                >
                  <RoleTrackBadge track={roleTrack} size="sm" />
                  <p className="font-sans text-xs text-[color:var(--color-slate)]">
                    Your credential designation upon approval:{' '}
                    <strong className="font-bold text-[color:var(--color-ink)]">
                      AiBI-S{ROLE_TRACK_META[roleTrack].code} · The AI Banking Institute
                    </strong>
                  </p>
                </div>
              )}

              {/* Certification statement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="certify"
                  name="certify"
                  required
                  className="mt-1 h-4 w-4 border border-[color:var(--color-cobalt)]/30 rounded-sm accent-[color:var(--color-cobalt)] focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1"
                />
                <label htmlFor="certify" className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
                  I certify that this submission describes work I actually deployed in my department.
                  The time savings figures are based on real timing data, not estimates.
                  The automations described are in use by at least one colleague other than myself.
                </label>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
              >
                {submission?.review_status === 'failed' ? 'Resubmit Capstone' : 'Submit Capstone'}
              </button>

              <p className="font-mono text-[10px] text-[color:var(--color-slate)]">
                Reviews are completed within 10 business days. You will be notified by email when your
                submission is reviewed.
              </p>
            </form>
          </section>
        )}

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-[color:var(--color-cobalt)]/10">
          <Link
            href="/courses/aibi-s"
            className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors"
          >
            Back to Course Overview
          </Link>
        </div>

      </article>
    </>
  );
}
