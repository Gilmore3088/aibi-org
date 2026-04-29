'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserDataWithSupabaseFallback, type UserData } from '@/lib/user-data';

// ── Types ────────────────────────────────────────────────────────────────────

interface CertLevel {
  readonly code: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly label: string;
  readonly fullName: string;
  readonly color: string;
  readonly colorBg: string;
  readonly product: string;
  readonly totalUnits: number;
  readonly unitName: string;
}

const CERT_LEVELS: readonly CertLevel[] = [
  {
    code: 'aibi-p',
    label: 'AiBI-P',
    fullName: 'Practitioner',
    color: 'var(--color-terra)',
    colorBg: 'var(--color-terra-pale)',
    product: 'Practitioner',
    totalUnits: 9,
    unitName: 'modules',
  },
  {
    code: 'aibi-s',
    label: 'AiBI-S',
    fullName: 'Specialist',
    color: 'var(--color-cobalt)',
    colorBg: 'var(--color-cobalt-pale)',
    product: 'Specialist',
    totalUnits: 6,
    unitName: 'weeks',
  },
  {
    code: 'aibi-l',
    label: 'AiBI-L',
    fullName: 'Leader',
    color: 'var(--color-sage)',
    colorBg: 'var(--color-sage-pale)',
    product: 'Leader',
    totalUnits: 4,
    unitName: 'sessions',
  },
] as const;

interface MockEnrollment {
  readonly product: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly completed_modules: readonly number[];
  readonly enrolled_at: string;
  readonly completed_at?: string;
  readonly role_track?: string;
  readonly certificate_id?: string;
}

// Dev bypass — AiBI-P completed, AiBI-S in progress, AiBI-L not started
const DEV_ENROLLMENTS: readonly MockEnrollment[] = [
  {
    product: 'aibi-p',
    completed_modules: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    enrolled_at: '2026-02-10T09:00:00.000Z',
    completed_at: '2026-03-18T14:22:00.000Z',
    certificate_id: 'AIBI-P-2026-0042',
  },
  {
    product: 'aibi-s',
    completed_modules: [1, 2, 3],
    enrolled_at: '2026-03-25T10:00:00.000Z',
    role_track: 'operations',
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function roleTrackLabel(track: string): string {
  const labels: Record<string, string> = {
    operations: 'Ops',
    lending: 'Lending',
    compliance: 'Compliance',
    finance: 'Finance',
    retail: 'Retail',
  };
  return labels[track] ?? track.charAt(0).toUpperCase() + track.slice(1);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TimelineNode({
  level,
  status,
  enrollment,
}: {
  level: CertLevel;
  status: 'completed' | 'active' | 'locked';
  enrollment: MockEnrollment | undefined;
}) {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const progressPct = isActive && enrollment
    ? Math.round((enrollment.completed_modules.length / level.totalUnits) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center">
      {/* Circle */}
      <div
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2"
        style={{
          borderColor: isCompleted || isActive ? level.color : 'var(--color-ink)',
          backgroundColor: isCompleted ? level.colorBg : 'transparent',
          opacity: !isCompleted && !isActive ? 0.2 : 1,
        }}
      >
        {isCompleted ? (
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-label="Completed">
            <path
              d="M4 10l4 4 8-8"
              stroke={level.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : isActive ? (
          /* Progress ring for active enrollment */
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="29" fill="none" stroke={level.color} strokeWidth="2" opacity="0.15" />
            <circle
              cx="32" cy="32" r="29"
              fill="none"
              stroke={level.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${progressPct * 1.82} 182`}
            />
          </svg>
        ) : null}

        {!isCompleted && (
          <span
            className="font-mono text-xs font-semibold tabular-nums"
            style={{ color: isActive ? level.color : 'var(--color-ink)' }}
          >
            {isActive ? `${enrollment?.completed_modules.length}/${level.totalUnits}` : level.label.split('-')[1]}
          </span>
        )}
      </div>

      {/* Label */}
      <p
        className="font-serif-sc text-[11px] uppercase tracking-[0.15em] mt-3"
        style={{
          color: isCompleted || isActive ? level.color : 'var(--color-ink)',
          opacity: isCompleted || isActive ? 1 : 0.3,
        }}
      >
        {level.fullName}
      </p>

      {/* Status detail */}
      <p className="font-mono text-[10px] tabular-nums text-center mt-1 whitespace-nowrap text-[color:var(--color-slate)]">
        {isCompleted && enrollment?.completed_at
          ? formatDate(enrollment.completed_at)
          : isActive && enrollment
            ? `${level.unitName} ${enrollment.completed_modules.length} of ${level.totalUnits}`
            : 'Not started'}
      </p>

      {/* Track designation for S */}
      {enrollment?.role_track && isActive && (
        <p
          className="font-serif-sc text-[10px] uppercase tracking-wider mt-0.5"
          style={{ color: level.color }}
        >
          /{roleTrackLabel(enrollment.role_track)}
        </p>
      )}
    </div>
  );
}

function CredentialCard({
  level,
  enrollment,
}: {
  level: CertLevel;
  enrollment: MockEnrollment;
}) {
  const isComplete = !!enrollment.completed_at;
  const progressPct = isComplete
    ? 100
    : Math.round((enrollment.completed_modules.length / level.totalUnits) * 100);
  const designationLabel = enrollment.role_track
    ? `${level.label}-${roleTrackLabel(enrollment.role_track)}`
    : level.label;

  return (
    <div
      className="bg-[color:var(--color-linen)] border rounded-[3px] p-6 flex flex-col"
      style={{ borderColor: level.color + '25' }}
    >
      {/* Top row: designation + status badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p
            className="font-serif-sc text-[10px] uppercase tracking-[0.2em] mb-2"
            style={{ color: level.color }}
          >
            {level.product}
          </p>
          <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight">
            {designationLabel}
          </h3>
        </div>
        {isComplete ? (
          <div
            className="shrink-0 px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest"
            style={{
              color: level.color,
              backgroundColor: level.colorBg,
            }}
          >
            Earned
          </div>
        ) : (
          <div
            className="shrink-0 px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest"
            style={{
              color: level.color,
              backgroundColor: level.colorBg,
            }}
          >
            {progressPct}%
          </div>
        )}
      </div>

      {/* Progress bar (always shown) */}
      <div className="mb-4">
        <div className="h-1 bg-[color:var(--color-ink)]/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              backgroundColor: level.color,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
            {enrollment.completed_modules.length} of {level.totalUnits} {level.unitName}
          </span>
          {isComplete && enrollment.completed_at && (
            <span className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
              {formatDate(enrollment.completed_at)}
            </span>
          )}
        </div>
      </div>

      {/* Certificate ID if earned */}
      {isComplete && enrollment.certificate_id && (
        <div
          className="mb-4 px-4 py-3 rounded-[2px] border"
          style={{ borderColor: level.color + '15', backgroundColor: level.colorBg + '40' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-1">
            Certificate ID
          </p>
          <p className="font-mono text-sm tabular-nums" style={{ color: level.color }}>
            {enrollment.certificate_id}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-auto pt-3 border-t border-[color:var(--color-ink)]/8">
        <Link
          href={`/courses/${level.code}`}
          className="font-serif-sc text-[11px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity"
          style={{ color: level.color }}
        >
          {isComplete ? 'Review course' : 'Continue learning'}
        </Link>
        {isComplete && enrollment.certificate_id && (
          <Link
            href={`/verify/${enrollment.certificate_id}`}
            className="font-serif-sc text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] hover:opacity-70 transition-opacity"
          >
            Verify
          </Link>
        )}
      </div>
    </div>
  );
}

function NextStepBanner({ enrollments }: { enrollments: readonly MockEnrollment[] }) {
  const hasP = enrollments.some((e) => e.product === 'aibi-p' && e.completed_at);
  const hasS = enrollments.some((e) => e.product === 'aibi-s' && e.completed_at);
  const hasL = enrollments.some((e) => e.product === 'aibi-l' && e.completed_at);
  const sEnrollment = enrollments.find((e) => e.product === 'aibi-s');

  let accent = 'var(--color-terra)';
  let heading = 'Start with the Practitioner certification';
  let body = 'Build your AI foundation. The AiBI-P certification is where every transformation begins.';
  let href = '/courses/aibi-p';
  let cta = 'View AiBI-P';

  if (hasP && hasS && hasL) {
    accent = 'var(--color-sage)';
    heading = 'Full certification ladder complete';
    body = 'AiBI-P, AiBI-S, and AiBI-L earned. You are equipped to lead AI transformation across your institution.';
    href = '/certifications';
    cta = 'View certifications';
  } else if (hasP && hasS) {
    accent = 'var(--color-sage)';
    heading = 'Ready to lead the transformation';
    body = 'Personal and departmental AI capability demonstrated. The Leader workshop gives you strategic tools for institution-wide change.';
    href = '/courses/aibi-l';
    cta = 'Explore AiBI-L';
  } else if (hasP && sEnrollment && !sEnrollment.completed_at) {
    const roleLabel = sEnrollment.role_track
      ? roleTrackLabel(sEnrollment.role_track)
      : 'your department';
    accent = 'var(--color-cobalt)';
    heading = `Continue your ${roleLabel} track`;
    body = `You are ${sEnrollment.completed_modules.length} of 6 weeks into AiBI-S. Keep the momentum going.`;
    href = '/courses/aibi-s';
    cta = 'Continue AiBI-S';
  } else if (hasP) {
    accent = 'var(--color-cobalt)';
    heading = 'Scale your skills across the department';
    body = 'Personal AI proficiency demonstrated. The Specialist certification expands that capability across your entire department.';
    href = '/courses/aibi-s';
    cta = 'Explore AiBI-S';
  }

  return (
    <div
      className="rounded-[3px] border p-6 sm:p-8"
      style={{ borderColor: accent + '30', backgroundColor: accent + '06' }}
    >
      <p
        className="font-serif-sc text-[10px] uppercase tracking-[0.2em] mb-3"
        style={{ color: accent }}
      >
        Recommended next step
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-[color:var(--color-ink)] leading-snug mb-2">
            {heading}
          </h3>
          <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed max-w-lg">
            {body}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 inline-block px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] text-[color:var(--color-linen)] hover:opacity-90 active:scale-[0.98] transition-all text-center"
          style={{ backgroundColor: accent }}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressionPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDataWithSupabaseFallback()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const isDev = process.env.NODE_ENV === 'development';
  const enrollments: readonly MockEnrollment[] = isDev ? DEV_ENROLLMENTS : [];

  const getStatus = (code: 'aibi-p' | 'aibi-s' | 'aibi-l'): 'completed' | 'active' | 'locked' => {
    const e = enrollments.find((en) => en.product === code);
    if (!e) return 'locked';
    if (e.completed_at) return 'completed';
    return 'active';
  };

  const assessmentScore = user?.readiness?.score ?? null;
  const assessmentDate = user?.readiness?.completedAt ?? null;
  const assessmentMax = user?.readiness?.maxScore ?? 48;

  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="mb-14">
          <nav className="mb-4" aria-label="Breadcrumb">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
              <Link href="/dashboard" className="text-[color:var(--color-terra)] hover:opacity-70 transition-opacity">
                Dashboard
              </Link>
              <span className="text-[color:var(--color-ink)]/30" aria-hidden="true">/</span>
              <span className="text-[color:var(--color-slate)]">Certification Journey</span>
            </div>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight mb-3">
            Your certification journey.
          </h1>
          <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed max-w-2xl">
            Track your progress from Practitioner through Specialist to Leader across
            The AI Banking Institute&apos;s full certification ladder.
          </p>
        </header>

        {/* Certification Timeline */}
        <section className="mb-14" aria-labelledby="timeline-heading">
          <h2
            id="timeline-heading"
            className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50 mb-5"
          >
            Certification timeline
          </h2>
          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/8 rounded-[3px] px-6 sm:px-10 py-8">
            <div className="flex items-start justify-between">
              {CERT_LEVELS.map((level, idx) => {
                const status = getStatus(level.code);
                const enrollment = enrollments.find((e) => e.product === level.code);
                const nextStatus = idx < CERT_LEVELS.length - 1 ? getStatus(CERT_LEVELS[idx + 1].code) : null;
                const nextActive = nextStatus !== 'locked';

                return (
                  <div key={level.code} className="flex items-start flex-1">
                    <TimelineNode level={level} status={status} enrollment={enrollment} />
                    {idx < CERT_LEVELS.length - 1 && (
                      <div className="flex-1 flex items-center px-2 sm:px-4" style={{ marginTop: '26px' }}>
                        <div
                          className="h-px w-full"
                          style={{
                            backgroundColor: nextActive ? 'var(--color-terra)' : 'var(--color-ink)',
                            opacity: nextActive ? 0.3 : 0.1,
                          }}
                        />
                        {/* Arrow toward next */}
                        <div
                          className="w-0 h-0 shrink-0 ml-[-1px]"
                          style={{
                            borderTop: '3px solid transparent',
                            borderBottom: '3px solid transparent',
                            borderLeft: `5px solid ${nextActive ? 'var(--color-terra)' : 'var(--color-ink)'}`,
                            opacity: nextActive ? 0.3 : 0.1,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Credentials */}
        {enrollments.length > 0 && (
          <section className="mb-14" aria-labelledby="credentials-heading">
            <h2
              id="credentials-heading"
              className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50 mb-5"
            >
              Your credentials
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => {
                const level = CERT_LEVELS.find((l) => l.code === enrollment.product);
                if (!level) return null;
                return (
                  <CredentialCard
                    key={enrollment.product}
                    level={level}
                    enrollment={enrollment}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Recommended Next Step */}
        <section className="mb-14">
          <NextStepBanner enrollments={enrollments} />
        </section>

        {/* Readiness Score — only if assessment taken */}
        {assessmentScore !== null && assessmentDate && (
          <section className="mb-14" aria-labelledby="readiness-heading">
            <h2
              id="readiness-heading"
              className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50 mb-5"
            >
              Readiness score
            </h2>
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/8 rounded-[3px] p-6 sm:p-8">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="font-serif text-lg text-[color:var(--color-ink)] mb-1">
                    Current score
                  </p>
                  <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
                    Assessed {formatDate(assessmentDate)}
                  </p>
                </div>
                <p className="font-mono text-3xl tabular-nums" style={{ color: 'var(--color-terra)' }}>
                  {assessmentScore}
                  <span className="text-base text-[color:var(--color-slate)] ml-1">/{assessmentMax}</span>
                </p>
              </div>

              {/* Score bar */}
              <div className="h-2 bg-[color:var(--color-ink)]/8 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((assessmentScore / assessmentMax) * 100))}%`,
                    backgroundColor: 'var(--color-terra)',
                  }}
                />
              </div>

              <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-4">
                Retake the assessment after completing each certification level to track your readiness growth.
              </p>

              <Link
                href="/assessment"
                className="font-serif-sc text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-terra)] hover:opacity-70 transition-opacity"
              >
                Retake assessment
              </Link>
            </div>
          </section>
        )}

        {/* No assessment prompt */}
        {assessmentScore === null && !isDev && (
          <section className="mb-14">
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/8 rounded-[3px] p-8 text-center">
              <p
                className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3"
              >
                Readiness score
              </p>
              <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-5 max-w-md mx-auto">
                Complete the free AI readiness assessment to establish your baseline and track
                how your score improves as you earn each certification.
              </p>
              <Link
                href="/assessment"
                className="inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Take the free assessment
              </Link>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
