// Dynamic week page — /courses/aibi-s/[week]
// Server Component: content from typed files, enrollment-gated
// Role-track-aware: passes learner's track to WeekContent for personalized display

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { weeks, getWeekByNumber } from '@content/courses/aibi-s';
import type { RoleTrack } from '@content/courses/aibi-s';
import { WeekContent } from '../_components/WeekContent';
import { WeekCompletionCTA } from '../_components/WeekCompletionCTA';
import { RoleTrackBadge } from '../_components/RoleTrackBadge';
import { CourseTabs } from '@/components/CourseTabs';
import { getEnrollment } from '../_lib/getEnrollment';

interface WeekPageParams {
  readonly params: { week: string };
}

export function generateStaticParams() {
  return weeks.map((w) => ({ week: String(w.number) }));
}

export async function generateMetadata({ params }: WeekPageParams): Promise<Metadata> {
  const weekNum = parseInt(params.week, 10);
  const week = getWeekByNumber(weekNum);
  if (!week) {
    return { title: 'Week Not Found | AiBI-S' };
  }
  return {
    title: `Week ${week.number}: ${week.title} | AiBI-S`,
  };
}

// Phase color map for the header band
const PHASE_COLORS: Record<string, string> = {
  foundation:           'var(--color-cobalt)',
  'first-build':        'var(--color-cobalt)',
  'scale-and-orchestrate': 'var(--color-cobalt)',
} as const;

export default async function WeekPage({ params }: WeekPageParams) {
  const weekNum = parseInt(params.week, 10);

  if (isNaN(weekNum) || weekNum < 1 || weekNum > 6) {
    notFound();
  }

  const week = getWeekByNumber(weekNum);
  if (!week) {
    notFound();
  }

  // Enrollment gate — redirect to purchase if not enrolled
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/aibi-s/purchase');
  }

  // Forward-only enforcement — cannot access a week beyond current progress
  const maxAccessible = Math.max(enrollment.current_module, ...enrollment.completed_modules);
  if (weekNum > maxAccessible) {
    redirect(`/courses/aibi-s/${enrollment.current_module}`);
  }

  const roleTrack = (enrollment.role_track as RoleTrack | null) ?? null;
  const isLastWeek = week.number === 6;
  const isCompleted = enrollment.completed_modules.includes(weekNum);

  const phaseLabelMap: Record<string, string> = {
    foundation:             'Foundation',
    'first-build':          'First Build',
    'scale-and-orchestrate': 'Scale and Orchestrate',
  };

  return (
    <>
      {/* Cobalt header band */}
      <div
        className="text-[color:var(--color-linen)] py-10 px-6"
        style={{ backgroundColor: PHASE_COLORS[week.phase] ?? 'var(--color-cobalt)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-linen)]/60">
              AiBI-S
            </span>
            <span className="font-mono text-[9px] text-[color:var(--color-linen)]/40" aria-hidden="true">·</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-linen)]/60">
              {phaseLabelMap[week.phase]}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-linen)]/60 mb-2">
                Week {week.number}
              </p>
              <h1 className="font-serif text-3xl font-bold mb-2">{week.title}</h1>
              <p className="font-sans text-sm text-[color:var(--color-linen)]/75 leading-relaxed max-w-2xl">
                {week.whyThisWeekExists.split('\n')[0]}
              </p>
            </div>

            {roleTrack && (
              <div className="shrink-0 mt-1">
                <RoleTrackBadge track={roleTrack} size="sm" />
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[color:var(--color-linen)]/15">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-linen)]/50 mb-0.5">
                Live session
              </p>
              <p className="font-mono text-sm font-bold tabular-nums">
                {week.estimatedLiveMinutes} min
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-linen)]/50 mb-0.5">
                Assignment
              </p>
              <p className="font-mono text-sm font-bold tabular-nums">
                {week.estimatedAssignmentMinutes} min
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-linen)]/50 mb-0.5">
                Key output
              </p>
              <p className="font-sans text-xs text-[color:var(--color-linen)]/75 max-w-xs">
                {week.keyOutput}
              </p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 ml-auto">
                <svg className="w-4 h-4 text-[color:var(--color-linen)]/75" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]/75">
                  Completed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <article className="mx-auto px-8 lg:px-16 py-10">
        <CourseTabs
          storagePrefix="aibi-s-w"
          segmentNumber={weekNum}
          accentColor="var(--color-cobalt)"
          learnContent={
            <WeekContent week={week} roleTrack={roleTrack} />
          }
          practiceContent={null}
          applyContent={
            <>
              {/* Activities */}
              {week.activities.length > 0 && (
                <section aria-labelledby="activities-heading">
                  <h2
                    id="activities-heading"
                    className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-8"
                  >
                    Week {week.number} <span className="italic">Activities</span>
                  </h2>

                  {week.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="mb-10 bg-[color:var(--color-parch)] border border-[color:var(--color-cobalt)]/15 rounded-sm p-6 lg:p-8"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)] mb-1">
                            Activity {activity.id}
                          </p>
                          <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)]">
                            {activity.title}
                          </h3>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-[9px] text-[color:var(--color-slate)] tabular-nums">
                            {activity.estimatedMinutes} min
                          </p>
                          <p className="font-mono text-[9px] text-[color:var(--color-slate)] uppercase tracking-widest mt-0.5">
                            Due: {activity.dueBy}
                          </p>
                        </div>
                      </div>

                      <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-6">
                        {activity.description}
                      </p>

                      {/* Peer review indicator */}
                      {activity.peerReview && activity.peerReviewPrompt && (
                        <div
                          className="mb-6 flex items-start gap-3 p-4 rounded-sm"
                          style={{
                            backgroundColor: 'rgba(45,74,122,0.05)',
                            border: '1px solid rgba(45,74,122,0.15)',
                          }}
                          role="note"
                          aria-label="Peer review required"
                        >
                          <svg
                            className="shrink-0 w-4 h-4 mt-0.5 text-[color:var(--color-cobalt)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                          </svg>
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-cobalt)] mb-1">
                              Peer Review Required
                            </p>
                            <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                              {activity.peerReviewPrompt}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Activity form fields */}
                      <form className="space-y-6" aria-label={`Activity ${activity.id} submission form`}>
                        {activity.fields.map((field) => (
                          <div key={field.id}>
                            <label
                              htmlFor={`field-${activity.id}-${field.id}`}
                              className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)] mb-2"
                            >
                              {field.label}
                              {field.required && (
                                <span className="text-[color:var(--color-cobalt)] ml-1" aria-label="required">
                                  *
                                </span>
                              )}
                            </label>

                            {field.type === 'textarea' && (
                              <textarea
                                id={`field-${activity.id}-${field.id}`}
                                name={field.id}
                                placeholder={field.placeholder}
                                required={field.required}
                                minLength={field.minLength}
                                rows={5}
                                className="w-full px-4 py-3 bg-[color:var(--color-linen)] border border-[color:var(--color-cobalt)]/20 rounded-sm font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1 resize-y min-h-[120px]"
                              />
                            )}

                            {field.type === 'text' && (
                              <input
                                type="text"
                                id={`field-${activity.id}-${field.id}`}
                                name={field.id}
                                placeholder={field.placeholder}
                                required={field.required}
                                minLength={field.minLength}
                                className="w-full px-4 py-3 bg-[color:var(--color-linen)] border border-[color:var(--color-cobalt)]/20 rounded-sm font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1"
                              />
                            )}

                            {field.type === 'select' && field.options && (
                              <select
                                id={`field-${activity.id}-${field.id}`}
                                name={field.id}
                                required={field.required}
                                className="w-full px-4 py-3 bg-[color:var(--color-linen)] border border-[color:var(--color-cobalt)]/20 rounded-sm font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-1"
                              >
                                <option value="">Select an option</option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center gap-4 pt-2">
                          <button
                            type="submit"
                            className="bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] px-6 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
                          >
                            Save Response
                          </button>
                          <span className="font-mono text-[9px] text-[color:var(--color-slate)]">
                            {activity.submissionFormat}
                          </span>
                        </div>
                      </form>
                    </div>
                  ))}
                </section>
              )}

              {/* Week completion CTA */}
              <WeekCompletionCTA weekNumber={week.number} isLastWeek={isLastWeek} />

              {/* Navigation footer */}
              <div className="mt-16 pt-8 border-t border-[color:var(--color-cobalt)]/10 flex items-center justify-between gap-4">
                {week.number > 1 ? (
                  <a
                    href={`/courses/aibi-s/${week.number - 1}`}
                    className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors"
                  >
                    Week {week.number - 1}
                  </a>
                ) : (
                  <a
                    href="/courses/aibi-s"
                    className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors"
                  >
                    Overview
                  </a>
                )}

                {isLastWeek ? (
                  <a
                    href="/courses/aibi-s/submit"
                    className="bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] px-6 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
                  >
                    Submit Capstone
                  </a>
                ) : (
                  <a
                    href={`/courses/aibi-s/${week.number + 1}`}
                    className={`flex items-center gap-2 px-6 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2 ${
                      isCompleted
                        ? 'bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)]'
                        : 'border border-[color:var(--color-cobalt)]/20 text-[color:var(--color-slate)] cursor-not-allowed opacity-50'
                    }`}
                    aria-disabled={!isCompleted}
                  >
                    Week {week.number + 1}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </>
          }
        />
      </article>
    </>
  );
}
