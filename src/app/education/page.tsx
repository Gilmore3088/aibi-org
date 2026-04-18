// /education — Unified education hub
// Replaces /courses and /certifications with a single page covering both
// free entry points ("Classes") and the paid certification tracks.
//
// Decision log: 2026-04-17 — Merged /courses + /certifications into /education
// to reduce nav clutter and clarify the free → paid funnel.

import type { Metadata } from 'next';
import Link from 'next/link';
import { modules } from '@content/courses/aibi-p';
import { weeks } from '@content/courses/aibi-s';
import { sessions } from '@content/courses/aibi-l';
import { getEnrollment as getPEnrollment } from '@/app/courses/aibi-p/_lib/getEnrollment';
import { getEnrollment as getSEnrollment } from '@/app/courses/aibi-s/_lib/getEnrollment';
import { SampleQuestion } from '@/components/sections/SampleQuestion';
import { InquiryForm } from '@/app/certifications/_components/InquiryForm';

export const metadata: Metadata = {
  title: 'Education | The AI Banking Institute',
  description:
    'Free classes and three certification tracks for community banks and credit unions. Start with the AI Readiness Assessment, then earn AiBI-P, AiBI-S, or AiBI-L credentials.',
};

interface CertificationTrack {
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

interface FreeClass {
  readonly title: string;
  readonly subtitle: string;
  readonly cta: string;
  readonly href: string;
  readonly available: boolean;
}

export default async function EducationPage() {
  // Resolve enrollment status for logged-in learners (null when unauthenticated).
  const pEnrollment = await getPEnrollment();
  const sEnrollment = await getSEnrollment();

  const freeClasses: readonly FreeClass[] = [
    {
      title: 'AI Readiness Assessment',
      subtitle:
        'Eight questions, three minutes. Get your readiness score and a tailored next-step recommendation.',
      cta: 'Take the assessment',
      href: '/assessment',
      available: true,
    },
    {
      title: 'The AI Banking Brief',
      subtitle:
        'Weekly digest of regulatory updates, vendor moves, and practical AI use cases for community FIs.',
      cta: 'Subscribe',
      href: '/resources',
      available: true,
    },
    {
      title: 'Short-form classes',
      subtitle:
        'Five-minute video lessons on regulatory framing, vendor evaluation, and Acceptable Use practices.',
      cta: 'Coming soon',
      href: '#',
      available: false,
    },
  ];

  const tracks: readonly CertificationTrack[] = [
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
      colorBg: 'var(--color-cobalt-pale)',
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
      duration: '4 sessions',
      price: 'From $2,800',
      colorVar: 'var(--color-sage)',
      colorBg: 'var(--color-sage-pale)',
      href: '/courses/aibi-l',
      totalUnits: sessions.length,
      unitLabel: 'sessions',
      completedUnits: 0,
      isEnrolled: false,
      prerequisite: 'AiBI-S',
    },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Build the capability that endures.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Tools change. The judgment to deploy AI responsibly inside a
            regulated institution does not. Start free, then earn the
            credentials that prove your team is ready.
          </p>
        </div>
      </section>

      {/* Free Classes section */}
      <section
        id="classes"
        aria-labelledby="classes-heading"
        className="px-6 py-12 md:py-16 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
              Classes · Free
            </p>
            <h2
              id="classes-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-3"
            >
              Start where you are.
            </h2>
            <p className="text-base text-[color:var(--color-slate)] leading-relaxed">
              Short, free entry points. No purchase required. Designed to give
              you a clear answer in under five minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {freeClasses.map((cls) => {
              const card = (
                <article
                  className={`h-full bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 flex flex-col ${
                    cls.available
                      ? 'hover:border-[color:var(--color-terra)]/40 transition-colors'
                      : 'opacity-70'
                  }`}
                >
                  <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-3">
                    {cls.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed flex-1 mb-5">
                    {cls.subtitle}
                  </p>
                  <span
                    className={`font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 self-start ${
                      cls.available
                        ? 'text-[color:var(--color-terra)] border-[color:var(--color-terra)]'
                        : 'text-[color:var(--color-ink)]/40 border-[color:var(--color-ink)]/20'
                    }`}
                  >
                    {cls.cta}
                  </span>
                </article>
              );

              return cls.available ? (
                <Link key={cls.title} href={cls.href} className="block">
                  {card}
                </Link>
              ) : (
                <div key={cls.title}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications section */}
      <section
        id="certifications"
        aria-labelledby="certifications-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Certifications · Paid
            </p>
            <h2
              id="certifications-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-3"
            >
              Three credentials, one ladder.
            </h2>
            <p className="text-base text-[color:var(--color-slate)] leading-relaxed">
              Each certification builds on the previous. Earn the credential
              that matches your role today and advance when you are ready.
            </p>
          </div>

          <div className="space-y-6">
            {tracks.map((track) => {
              const pct =
                track.totalUnits > 0 && track.isEnrolled
                  ? Math.round((track.completedUnits / track.totalUnits) * 100)
                  : null;
              const isComplete = pct === 100;

              return (
                <Link
                  key={track.code}
                  href={track.href}
                  className="group block rounded-[3px] border border-[color:var(--color-ink)]/10 hover:border-[color:var(--color-ink)]/20 transition-all duration-200 overflow-hidden"
                >
                  <div className="flex">
                    <div
                      className="w-1.5 shrink-0"
                      style={{ backgroundColor: track.colorVar }}
                      aria-hidden="true"
                    />
                    <div className="flex-1 bg-[color:var(--color-parch)] p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        {/* Left: track info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <span
                              className="font-serif-sc text-[11px] uppercase tracking-[0.2em]"
                              style={{ color: track.colorVar }}
                            >
                              {track.code}
                            </span>
                            <div
                              className="h-px w-4"
                              style={{
                                backgroundColor: track.colorVar,
                                opacity: 0.3,
                              }}
                              aria-hidden="true"
                            />
                            <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50">
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

                          <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-2 group-hover:text-[color:var(--color-terra)] transition-colors">
                            {track.title}
                          </h3>
                          <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed mb-4">
                            {track.subtitle}
                          </p>

                          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                            {[
                              { label: 'Audience', value: track.audience },
                              { label: 'Format', value: track.format },
                              { label: 'Duration', value: track.duration },
                              { label: 'Price', value: track.price },
                            ].map(({ label, value }) => (
                              <div
                                key={label}
                                className="flex items-center gap-1.5"
                              >
                                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50">
                                  {label}
                                </span>
                                <span className="font-mono text-[9px] tabular-nums text-[color:var(--color-ink)]/75">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {track.prerequisite && (
                            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50">
                              Prerequisite: {track.prerequisite}
                            </p>
                          )}
                        </div>

                        {/* Right: progress or CTA */}
                        <div className="shrink-0 flex flex-col items-start md:items-end gap-3 md:min-w-[140px]">
                          {track.isEnrolled && pct !== null ? (
                            <>
                              <div className="md:text-right">
                                <p
                                  className="font-mono text-2xl tabular-nums leading-none"
                                  style={{ color: track.colorVar }}
                                >
                                  {pct}%
                                </p>
                                <p className="font-mono text-[9px] text-[color:var(--color-slate)] mt-1 tabular-nums">
                                  {track.completedUnits}/{track.totalUnits}{' '}
                                  {track.unitLabel}
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
                                style={{
                                  color: track.colorVar,
                                  borderColor: track.colorVar,
                                }}
                              >
                                {isComplete ? 'Review' : 'Continue'}
                              </span>
                            </>
                          ) : (
                            <span
                              className="font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 group-hover:opacity-80 transition-opacity"
                              style={{
                                color: track.colorVar,
                                borderColor: track.colorVar,
                              }}
                            >
                              Learn more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample question — try a real exam item */}
      <SampleQuestion />

      {/* Inquiry form */}
      <section
        id="inquiry-form"
        aria-labelledby="inquiry-heading"
        className="px-6 py-16 md:py-20 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
              Talk to us
            </p>
            <h2
              id="inquiry-heading"
              className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight"
            >
              Questions before you commit?
            </h2>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* Enterprise / bulk CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
            Team and institutional enrollment
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            Need team certification or executive workshops?
          </h2>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Institutional pricing for teams of 5 or more, with cohort
            scheduling, group reporting, and a dedicated program lead. The
            AiBI-L Leader certification is available as a 1-day on-site
            workshop for up to 8 executives.
          </p>
          <a
            href="#inquiry-form"
            className="inline-block px-8 py-4 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] transition-colors"
          >
            Contact us for institutional solutions
          </a>
        </div>
      </section>
    </main>
  );
}
