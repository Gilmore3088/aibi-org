// Dynamic session page — /courses/aibi-l/[session]
// Server Component: content from typed session files
// No enrollment gating — these are informational pages

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { sessions, getSessionByNumber } from '@content/courses/aibi-l';
import MaturityScorecard from '../_components/MaturityScorecard';
import { ROICalculator } from '../_components/ROICalculator';
import { CourseTabs } from '@/components/CourseTabs';
import { CourseHeader } from '@/components/courses/CourseHeader';
import { LearnSection } from '@/components/courses/LearnSection';

interface SessionPageParams {
  readonly params: Promise<{ session: string }>;
}

export function generateStaticParams() {
  return sessions.map((s) => ({ session: String(s.number) }));
}

export async function generateMetadata({ params }: SessionPageParams): Promise<Metadata> {
  const { session } = await params;
  const sessionNum = parseInt(session, 10);
  const workshopSession = getSessionByNumber(sessionNum);
  if (!workshopSession) {
    return { title: 'Session Not Found | AiBI-L' };
  }
  return {
    title: `Session ${workshopSession.number}: ${workshopSession.title} | AiBI-L`,
    description: workshopSession.purpose,
  };
}

export default async function SessionPage({ params }: SessionPageParams) {
  const { session } = await params;
  const sessionNum = parseInt(session, 10);

  if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 4) {
    notFound();
  }

  const workshopSession = getSessionByNumber(sessionNum);
  if (!workshopSession) {
    notFound();
  }

  const prevSession = sessionNum > 1 ? getSessionByNumber(sessionNum - 1) : null;
  const nextSession = sessionNum < 4 ? getSessionByNumber(sessionNum + 1) : null;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mx-auto px-8 lg:px-16 pt-6 mb-2" aria-label="Breadcrumb">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
          <Link
            href="/courses/aibi-l"
            className="text-[color:var(--color-sage)] hover:opacity-70 transition-opacity"
          >
            AiBI-L
          </Link>
          <span className="text-[color:var(--color-slate)]" aria-hidden="true">/</span>
          <span className="text-[color:var(--color-slate)]">
            Session {workshopSession.number}
          </span>
        </div>
      </nav>

      {/* Compact sticky header */}
      <CourseHeader
        unitLabel="Session"
        unitNumber={workshopSession.number}
        title={workshopSession.title}
        accentColor="var(--color-sage)"
        meta={[
          { label: 'duration', value: `${workshopSession.durationMinutes} min` },
          { label: 'time', value: workshopSession.startTime },
        ]}
      />

      {/* Content area */}
      <article className="mx-auto px-8 lg:px-16 py-4">
        <CourseTabs
          storagePrefix="aibi-l-s"
          segmentNumber={sessionNum}
          accentColor="var(--color-sage)"
          learnContent={
            <>
              {/* Core question */}
              <p className="font-serif italic text-lg text-[color:var(--color-slate)] leading-relaxed mb-8 max-w-xl">
                {workshopSession.coreQuestion}
              </p>

              {/* Collapsible sections */}
              <LearnSection
                sections={workshopSession.sections}
                accentColor="var(--color-sage)"
                unitLabel="session"
              />

              {/* Sourced statistics */}
              {workshopSession.statistics && workshopSession.statistics.length > 0 && (
                <section
                  className="mb-16 border-t border-[color:var(--color-sage)]/10 pt-8"
                  aria-labelledby="sources-heading"
                >
                  <h2
                    id="sources-heading"
                    className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-slate)] mb-4"
                  >
                    Sources
                  </h2>
                  <div className="space-y-2">
                    {workshopSession.statistics.map((stat) => (
                      <div key={stat.value} className="flex items-baseline gap-3">
                        <p className="font-sans text-xs text-[color:var(--color-slate)]">
                          {stat.value}
                        </p>
                        <span className="font-mono text-[9px] text-[color:var(--color-slate)]">
                          {stat.source} ({stat.year})
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          }
          practiceContent={
          sessionNum === 1 ? (
            <section aria-labelledby="exercise-heading-1">
              <h2
                id="exercise-heading-1"
                className="font-serif-sc text-2xl font-bold text-[color:var(--color-ink)] mb-6"
              >
                Interactive Exercise
              </h2>
              <MaturityScorecard />
            </section>
          ) : sessionNum === 3 ? (
            <section aria-labelledby="exercise-heading-3">
              <h2
                id="exercise-heading-3"
                className="font-serif-sc text-2xl font-bold text-[color:var(--color-ink)] mb-6"
              >
                Interactive Exercise
              </h2>
              <ROICalculator />
            </section>
          ) : null
        }
        applyContent={
          <>
            {/* Activity / Deliverable */}
            <section
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm p-8 sm:p-10 mb-16"
              aria-labelledby="activity-heading"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-sage)]">
                  Facilitated Activity
                </span>
                <div className="h-px flex-1 bg-[color:var(--color-sage)]/15" aria-hidden="true" />
                <span className="font-mono text-[9px] tabular-nums text-[color:var(--color-slate)]">
                  {workshopSession.activity.estimatedMinutes} min
                </span>
              </div>

              <h2
                id="activity-heading"
                className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-3"
              >
                {workshopSession.activity.title}
              </h2>

              <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-6">
                {workshopSession.activity.description}
              </p>

              <div className="border-t border-[color:var(--color-sage)]/10 pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)] mb-1">
                  Deliverable
                </p>
                <p className="font-serif text-base font-bold text-[color:var(--color-ink)]">
                  {workshopSession.activity.deliverable}
                </p>
              </div>
            </section>

            {/* Navigation */}
            <nav className="flex items-center justify-between pt-8 border-t border-[color:var(--color-sage)]/10">
              {prevSession ? (
                <Link
                  href={`/courses/aibi-l/${prevSession.number}`}
                  className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2 rounded-sm"
                >
                  <svg className="w-3 h-3 rotate-180" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  S{prevSession.number}: {prevSession.title}
                </Link>
              ) : (
                <Link
                  href="/courses/aibi-l"
                  className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2 rounded-sm"
                >
                  <svg className="w-3 h-3 rotate-180" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Workshop Overview
                </Link>
              )}

              {nextSession ? (
                <Link
                  href={`/courses/aibi-l/${nextSession.number}`}
                  className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2 rounded-sm"
                >
                  S{nextSession.number}: {nextSession.title}
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/courses/aibi-l/request"
                  className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2 rounded-sm"
                >
                  Request Workshop
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </nav>
          </>
        }
        />
      </article>
    </>
  );
}
