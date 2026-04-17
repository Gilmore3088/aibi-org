// /courses/aibi-s — Course overview page
// Server Component: static phase/week map + enrollment state
// Cobalt accent color throughout (AiBI-S uses --color-cobalt, not terra)

import type { Metadata } from 'next';
import Link from 'next/link';
import { weeks, PHASE_META, ROLE_TRACK_META } from '@content/courses/aibi-s';
import type { Phase, RoleTrack } from '@content/courses/aibi-s';
import { RoleTrackBadge } from './_components/RoleTrackBadge';
import { getEnrollment } from './_lib/getEnrollment';

export const metadata: Metadata = {
  title: 'AiBI-S: Banking AI Specialist | The AI Banking Institute',
  description:
    'The Banking AI Specialist course is a 6-week live cohort for department managers at community banks and credit unions. Build, deploy, and measure departmental AI automation with peer accountability and instructor guidance.',
};

const PHASE_ORDER: Phase[] = ['foundation', 'first-build', 'scale-and-orchestrate'];

// Approximate cohort dates — replace with live data when Supabase cohort table is wired
const COHORT_INFO = {
  startDate: 'May 5, 2026',
  sessionDay: 'Tuesdays',
  sessionTime: '12:00–1:30 PM ET',
  instructor: 'The AI Banking Institute',
  enrollDeadline: 'April 28, 2026',
} as const;

export default async function AiBISOverviewPage() {
  const enrollment = await getEnrollment();
  const completedWeeks = enrollment?.completed_modules ?? [];
  const currentWeek = enrollment?.current_module ?? 1;
  const roleTrack = (enrollment?.role_track as RoleTrack | null) ?? null;
  const isEnrolled = enrollment !== null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/courses"
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-cobalt)] transition-colors"
        >
          Courses
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-cobalt)]">
          AiBI-S
        </span>
      </nav>

      {/* Hero */}
      <section className="mb-24" aria-labelledby="course-heading">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-cobalt)]">
            AiBI-S
          </span>
          <div className="h-px w-8 bg-[color:var(--color-cobalt)]/30" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-dust)]">
            Banking AI Specialist
          </span>
        </div>

        <h1
          id="course-heading"
          className="font-serif text-5xl lg:text-6xl font-bold leading-[1.05] mb-8 text-[color:var(--color-ink)]"
        >
          Banking AI<br />
          <span className="text-[color:var(--color-cobalt)] italic">Specialist</span>
        </h1>

        <p className="font-serif italic text-lg text-[color:var(--color-slate)] max-w-xl leading-relaxed mb-6">
          Six weeks. Live cohort. Department managers at community banks and credit unions who complete
          this course deploy governed, measured AI automation to their teams — and earn the AiBI-S credential.
        </p>

        {/* Cohort info strip */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 mb-10">
          {[
            { label: 'Next cohort', value: COHORT_INFO.startDate },
            { label: 'Sessions', value: `${COHORT_INFO.sessionDay}, ${COHORT_INFO.sessionTime}` },
            { label: 'Format', value: 'Live Zoom + weekly assignment' },
            { label: 'Prerequisite', value: 'AiBI-P certification' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)]">
                {label}
              </span>
              <span
                className="font-mono text-[9px] text-[color:var(--color-cobalt)] tabular-nums"
                aria-label={`${label}: ${value}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Role track badge if enrolled */}
        {isEnrolled && roleTrack && (
          <div className="mb-8">
            <RoleTrackBadge track={roleTrack} size="md" />
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {isEnrolled ? (
            <Link
              href={`/courses/aibi-s/${currentWeek}`}
              className="bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] transition-opacity flex items-center gap-3 font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
            >
              Continue Week {currentWeek}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/courses/aibi-s/purchase"
              className="bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] transition-opacity flex items-center gap-3 font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
            >
              Enroll in AiBI-S
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
          <a
            href="#week-map-heading"
            className="border border-[color:var(--color-cobalt)]/20 text-[color:var(--color-ink)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-parch)] transition-colors font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
          >
            View Syllabus
          </a>
        </div>
      </section>

      {/* Three Phases */}
      <section className="mb-24" aria-labelledby="phases-heading">
        <div className="flex justify-between items-end mb-12 border-b border-[color:var(--color-cobalt)]/10 pb-6">
          <div>
            <h2
              id="phases-heading"
              className="font-serif text-4xl font-bold mb-2 text-[color:var(--color-ink)]"
            >
              The Three <span className="italic">Phases</span>
            </h2>
            <p className="font-serif italic text-[color:var(--color-slate)] text-sm">
              Foundation — First Build — Scale and Orchestrate
            </p>
          </div>
          <span
            className="font-mono text-[10px] tracking-[0.3em] text-[color:var(--color-dust)] hidden md:block"
            aria-hidden="true"
          >
            6 WEEKS · LIVE COHORT
          </span>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[color:var(--color-cobalt)]/10 border border-[color:var(--color-cobalt)]/10 rounded-sm overflow-hidden"
          role="list"
          aria-label="Course phases"
        >
          {PHASE_ORDER.map((phase, index) => {
            const meta = PHASE_META[phase];
            const phaseWeeks = weeks.filter((w) => w.phase === phase);
            const phaseComplete = phaseWeeks.every((w) => completedWeeks.includes(w.number));
            const phaseActive = !phaseComplete && phaseWeeks.some((w) => completedWeeks.includes(w.number) || w.number === currentWeek);

            return (
              <div
                key={phase}
                role="listitem"
                className="bg-[color:var(--color-linen)] p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-mono text-[11px] tabular-nums text-[color:var(--color-cobalt)]"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <div className="h-px flex-1 bg-[color:var(--color-cobalt)]/20" aria-hidden="true" />
                  {phaseComplete && (
                    <svg className="w-4 h-4 text-[color:var(--color-cobalt)]" fill="currentColor" viewBox="0 0 20 20" aria-label="Phase complete">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-2">
                  {meta.label}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-dust)] mb-4">
                  Weeks {meta.weeks[0]}–{meta.weeks[meta.weeks.length - 1]}
                </p>
                <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed mb-4">
                  {meta.coreQuestion}
                </p>
                <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                  {meta.learnerGets}
                </p>

                {phaseActive && (
                  <div
                    className="mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-cobalt)]"
                    aria-label="Current phase"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-cobalt)]"
                      aria-hidden="true"
                    />
                    In Progress
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Five Role Tracks */}
      <section className="mb-24" aria-labelledby="tracks-heading">
        <div className="mb-10">
          <h2
            id="tracks-heading"
            className="font-serif text-4xl font-bold mb-2 text-[color:var(--color-ink)]"
          >
            Five <span className="italic">Role Tracks</span>
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-cobalt)] mb-4" aria-hidden="true" />
          <p className="font-serif italic text-[color:var(--color-slate)] text-sm max-w-xl">
            Every learner enrolls in one track. The track determines platform-specific content in Week 2,
            example workflows throughout the course, and the designation on the AiBI-S credential.
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Role tracks"
        >
          {(Object.entries(ROLE_TRACK_META) as [RoleTrack, typeof ROLE_TRACK_META[RoleTrack]][]).map(
            ([track, meta]) => (
              <div
                key={track}
                role="listitem"
                className={`bg-[color:var(--color-parch)] border rounded-sm p-6 ${
                  roleTrack === track
                    ? 'border-[color:var(--color-cobalt)]/40'
                    : 'border-[color:var(--color-cobalt)]/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <RoleTrackBadge track={track} size="sm" />
                  {roleTrack === track && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-cobalt)]">
                      Your Track
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed mb-3">
                  {meta.description}
                </p>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-dust)] mb-1.5">
                    Primary Platforms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.primaryPlatforms.map((platform) => (
                      <span
                        key={platform}
                        className="font-mono text-[9px] px-2 py-0.5 bg-[color:var(--color-linen)] border border-[color:var(--color-cobalt)]/15 rounded-sm text-[color:var(--color-cobalt)]"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Week Map */}
      <section
        className="bg-[color:var(--color-parch)] p-8 sm:p-12 border border-[color:var(--color-cobalt)]/10 rounded-sm"
        aria-labelledby="week-map-heading"
      >
        <div className="mb-12">
          <h2
            id="week-map-heading"
            className="font-serif text-4xl font-bold mb-2 text-[color:var(--color-ink)]"
          >
            The Week <span className="italic">Map</span>
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-cobalt)] mb-4" aria-hidden="true" />
          <p className="font-serif italic text-[color:var(--color-slate)] text-sm">
            Sequential progression across six weeks and three phases
          </p>
        </div>

        <div className="space-y-3" role="list" aria-label="Course weeks">
          {weeks.map((week) => {
            const isCompleted = completedWeeks.includes(week.number);
            const isCurrent = week.number === currentWeek && !isCompleted;
            const isLocked = !isCompleted && !isCurrent;
            const phaseMeta = PHASE_META[week.phase];

            return (
              <div
                key={week.number}
                role="listitem"
                className={`flex items-start gap-4 p-4 rounded-sm border transition-colors ${
                  isCurrent
                    ? 'border-[color:var(--color-cobalt)]/30 bg-[color:var(--color-linen)]'
                    : isCompleted
                    ? 'border-[color:var(--color-cobalt)]/10 bg-[color:var(--color-linen)]'
                    : 'border-transparent bg-[color:var(--color-linen)]/50 opacity-60'
                }`}
              >
                {/* Week number + status icon */}
                <div className="shrink-0 flex flex-col items-center gap-1 mt-0.5">
                  <span
                    className="font-mono text-[11px] tabular-nums text-[color:var(--color-cobalt)]"
                    aria-label={`Week ${week.number}`}
                  >
                    W{week.number}
                  </span>
                  {isCompleted && (
                    <svg className="w-3.5 h-3.5 text-[color:var(--color-cobalt)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-cobalt)]" aria-hidden="true" />
                  )}
                  {isLocked && (
                    <svg className="w-3 h-3 text-[color:var(--color-dust)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-base font-bold text-[color:var(--color-ink)] leading-tight">
                      {week.title}
                    </h3>
                    <span
                      className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-dust)]"
                      style={{ color: phaseMeta.colorVar }}
                    >
                      {phaseMeta.label}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                    {week.keyOutput}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-mono text-[9px] text-[color:var(--color-dust)] tabular-nums">
                      {week.estimatedLiveMinutes} min live
                    </span>
                    <span className="font-mono text-[9px] text-[color:var(--color-dust)] tabular-nums">
                      {week.estimatedAssignmentMinutes} min assignment
                    </span>
                  </div>
                </div>

                {/* Link if accessible */}
                {(isCompleted || isCurrent) && (
                  <Link
                    href={`/courses/aibi-s/${week.number}`}
                    className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-cobalt)] hover:opacity-70 transition-opacity mt-1 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2 rounded-sm"
                    aria-label={`Go to Week ${week.number}`}
                  >
                    Open
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
