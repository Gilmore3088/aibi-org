// /courses — Course discovery hub
// Server Component: shows all three certification tracks with enrollment status
// Links to individual course overview pages for P, S, and L

import type { Metadata } from 'next';
import Link from 'next/link';
import { modules } from '@content/courses/aibi-p';
import { weeks } from '@content/courses/aibi-s';
import { sessions } from '@content/courses/aibi-l';
import { getEnrollment as getPEnrollment } from './aibi-p/_lib/getEnrollment';
import { getEnrollment as getSEnrollment } from './aibi-s/_lib/getEnrollment';

export const metadata: Metadata = {
  title: 'Courses | The AI Banking Institute',
  description:
    'Three certification tracks for community banks and credit unions. From individual practitioner skills to department-wide automation to institution-level AI strategy.',
};

interface TrackCard {
  readonly code: string;
  readonly credential: string;
  readonly title: string;
  readonly subtitle: string;
  readonly audience: string;
  readonly format: string;
  readonly duration: string;
  readonly price: string;
  readonly colorVar: string;
  readonly colorBg: string;
  readonly href: string;
  readonly totalUnits: number;
  readonly unitLabel: string;
  readonly completedUnits: number;
  readonly isEnrolled: boolean;
  readonly prerequisite: string | null;
}

export default async function CoursesPage() {
  const pEnrollment = await getPEnrollment();
  const sEnrollment = await getSEnrollment();

  const tracks: readonly TrackCard[] = [
    {
      code: 'AiBI-P',
      credential: 'Practitioner',
      title: 'Banking AI Practitioner',
      subtitle: 'Personal AI proficiency for every staff member',
      audience: 'All staff',
      format: 'Self-paced online',
      duration: '9 modules',
      price: '$79/seat',
      colorVar: 'var(--color-terra)',
      colorBg: 'var(--color-terra-pale)',
      href: '/courses/aibi-p',
      totalUnits: modules.length,
      unitLabel: 'modules',
      completedUnits: pEnrollment?.completed_modules?.length ?? 0,
      isEnrolled: pEnrollment !== null,
      prerequisite: null,
    },
    {
      code: 'AiBI-S',
      credential: 'Specialist',
      title: 'Banking AI Specialist',
      subtitle: 'Department-wide AI automation for managers',
      audience: 'Department managers',
      format: '6-week live cohort',
      duration: '6 weeks',
      price: '$1,495/seat',
      colorVar: 'var(--color-cobalt)',
      colorBg: '#dce6f5',
      href: '/courses/aibi-s',
      totalUnits: weeks.length,
      unitLabel: 'weeks',
      completedUnits: sEnrollment?.completed_modules?.length ?? 0,
      isEnrolled: sEnrollment !== null,
      prerequisite: 'AiBI-P',
    },
    {
      code: 'AiBI-L',
      credential: 'Leader',
      title: 'Banking AI Leader',
      subtitle: 'Institution-level AI strategy for executives',
      audience: 'C-suite and board',
      format: '1-day in-person workshop',
      duration: `${sessions.length} sessions`,
      price: 'From $2,800',
      colorVar: 'var(--color-sage)',
      colorBg: '#d8e8d5',
      href: '/courses/aibi-l',
      totalUnits: sessions.length,
      unitLabel: 'sessions',
      completedUnits: 0,
      isEnrolled: false,
      prerequisite: 'AiBI-S',
    },
  ];

  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <header className="mb-16 max-w-2xl">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Courses
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight mb-4">
            Three levels. One transformation.
          </h1>
          <p className="text-base text-[color:var(--color-slate)] leading-relaxed">
            Each certification builds on the previous — from personal proficiency to
            departmental automation to institution-wide strategy. Start where you are,
            advance when you are ready.
          </p>
        </header>

        {/* Progression arrow bar */}
        <div className="flex items-center gap-0 mb-12" aria-hidden="true">
          {tracks.map((track, idx) => (
            <div key={track.code} className="flex items-center flex-1 min-w-0">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0"
                style={{
                  borderColor: track.colorVar,
                  backgroundColor: track.isEnrolled ? track.colorBg : 'transparent',
                }}
              >
                <span
                  className="font-serif-sc text-[9px] font-semibold tracking-wider"
                  style={{ color: track.colorVar }}
                >
                  {track.code.split('-')[1]}
                </span>
              </div>
              {idx < tracks.length - 1 && (
                <div
                  className="h-px flex-1 mx-2"
                  style={{
                    backgroundColor: tracks[idx + 1].isEnrolled
                      ? tracks[idx + 1].colorVar
                      : 'var(--color-ink)',
                    opacity: tracks[idx + 1].isEnrolled ? 0.4 : 0.1,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Track cards */}
        <div className="space-y-6">
          {tracks.map((track) => {
            const pct = track.totalUnits > 0 && track.isEnrolled
              ? Math.round((track.completedUnits / track.totalUnits) * 100)
              : null;
            const isComplete = pct === 100;

            return (
              <Link
                key={track.code}
                href={track.href}
                className="group block bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 hover:border-[color:var(--color-ink)]/20 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Left: course info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="font-serif-sc text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: track.colorVar }}
                      >
                        {track.code}
                      </span>
                      <span
                        className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/40"
                      >
                        {track.credential}
                      </span>
                      {track.isEnrolled && (
                        <span
                          className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
                          style={{
                            color: track.colorVar,
                            backgroundColor: track.colorBg,
                          }}
                        >
                          {isComplete ? 'Complete' : 'Enrolled'}
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-2 group-hover:text-[color:var(--color-terra)] transition-colors">
                      {track.title}
                    </h2>
                    <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed mb-4">
                      {track.subtitle}
                    </p>

                    {/* Meta strip */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                      {[
                        { label: 'Audience', value: track.audience },
                        { label: 'Format', value: track.format },
                        { label: 'Duration', value: track.duration },
                        { label: 'Investment', value: track.price },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/40">
                            {label}
                          </span>
                          <span className="font-mono text-[9px] tabular-nums text-[color:var(--color-ink)]/70">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Prerequisite note */}
                    {track.prerequisite && (
                      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/40">
                        Prerequisite: {track.prerequisite} certification
                      </p>
                    )}
                  </div>

                  {/* Right: progress or CTA */}
                  <div className="shrink-0 flex flex-col items-end gap-3 md:min-w-[160px]">
                    {track.isEnrolled && pct !== null ? (
                      <>
                        <div className="text-right">
                          <p
                            className="font-mono text-2xl tabular-nums leading-none"
                            style={{ color: track.colorVar }}
                          >
                            {pct}%
                          </p>
                          <p className="font-mono text-[9px] text-[color:var(--color-slate)] mt-1 tabular-nums">
                            {track.completedUnits}/{track.totalUnits} {track.unitLabel}
                          </p>
                        </div>
                        <div className="w-full h-1.5 bg-[color:var(--color-ink)]/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: track.colorVar,
                            }}
                          />
                        </div>
                        <span
                          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5"
                          style={{ color: track.colorVar, borderColor: track.colorVar }}
                        >
                          {isComplete ? 'Review' : 'Continue'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="font-mono text-xl tabular-nums"
                          style={{ color: track.colorVar }}
                        >
                          {track.price}
                        </span>
                        <span
                          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 group-hover:opacity-80 transition-opacity"
                          style={{ color: track.colorVar, borderColor: track.colorVar }}
                        >
                          Learn more
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <section className="mt-16 text-center">
          <p className="font-serif italic text-[color:var(--color-slate)] mb-4 max-w-md mx-auto">
            Not sure where to start? Take the free assessment and
            we will recommend a path based on your score.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Take the Free Assessment
          </Link>
        </section>

      </div>
    </main>
  );
}
