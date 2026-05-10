'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserDataWithSupabaseFallback, type UserData } from '@/lib/user-data';

// ── Types ────────────────────────────────────────────────────────────────────

interface CertLevel {
  readonly code: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly label: string;
  readonly color: string;
  readonly colorBg: string;
  readonly product: string;
}

const CERT_LEVELS: readonly CertLevel[] = [
  {
    code: 'aibi-p',
    label: 'AiBI-Foundation',
    color: 'var(--color-terra)',
    colorBg: 'var(--color-terra-pale)',
    product: 'Practitioner',
  },
  {
    code: 'aibi-s',
    label: 'AiBI-S',
    color: 'var(--color-cobalt)',
    colorBg: 'var(--color-cobalt-pale)',
    product: 'Specialist',
  },
  {
    code: 'aibi-l',
    label: 'AiBI-L',
    color: 'var(--color-sage)',
    colorBg: 'var(--color-sage-pale)',
    product: 'Leader',
  },
] as const;

interface MockEnrollment {
  readonly product: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly completed_modules: readonly number[];
  readonly total_modules: number;
  readonly enrolled_at: string;
  readonly completed_at?: string;
  readonly role_track?: string;
  readonly certificate_id?: string;
}

// Dev bypass — V4 is locked to AiBI-Foundation only.
const DEV_ENROLLMENTS: readonly MockEnrollment[] = [
  {
    product: 'aibi-p',
    completed_modules: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    total_modules: 9,
    enrolled_at: '2026-02-10T09:00:00.000Z',
    completed_at: '2026-03-18T14:22:00.000Z',
    certificate_id: 'AIBI-P-2026-0042',
  },
];

interface CumulativeMetrics {
  readonly skillsBuilt: number;
  readonly hoursSavedPerYear: number;
  readonly workflowsAutomated: number;
  readonly quickWinsLogged: number;
}

// Derive aggregate impact from enrollment progress
function deriveMetrics(enrollments: readonly MockEnrollment[]): CumulativeMetrics {
  const pEnroll = enrollments.find((e) => e.product === 'aibi-p');
  const sEnroll = enrollments.find((e) => e.product === 'aibi-s');

  const pModules = pEnroll?.completed_modules.length ?? 0;
  const sModules = sEnroll?.completed_modules.length ?? 0;

  // AiBI-Foundation: ~2 skills per module, AiBI-S: ~4 departmental skills per module
  const skillsBuilt = pModules * 2 + sModules * 4;

  // AiBI-Foundation: ~15 hrs/yr saved per module, AiBI-S: ~40 hrs/yr per module (departmental scope)
  const hoursSavedPerYear = pModules * 15 + sModules * 40;

  // AiBI-Foundation: 1 workflow per 3 modules (rounded), AiBI-S: 1 per 2
  const workflowsAutomated = Math.floor(pModules / 3) + Math.floor(sModules / 2);

  // Quick wins: 1 per AiBI-Foundation module completed past module 4
  const quickWinsLogged = Math.max(0, pModules - 4);

  return { skillsBuilt, hoursSavedPerYear, workflowsAutomated, quickWinsLogged };
}

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
    marketing: 'Marketing',
    retail: 'Retail',
    it: 'IT',
    executive: 'Executive',
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

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Circle */}
      <div
        className={[
          'w-16 h-16 rounded-full flex items-center justify-center',
          'border-2 transition-all duration-300',
          isCompleted ? 'border-[color:var(--timeline-color)]' : '',
          isActive ? 'border-[color:var(--timeline-color)] animate-pulse' : '',
          !isCompleted && !isActive ? 'border-[color:var(--color-ink)]/20' : '',
        ].join(' ')}
        style={
          {
            '--timeline-color': level.color,
            backgroundColor: isCompleted
              ? level.colorBg
              : isActive
                ? level.colorBg + '80'
                : 'transparent',
          } as React.CSSProperties
        }
      >
        {isCompleted ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-label="Completed"
          >
            <path
              d="M4 10l4 4 8-8"
              stroke={level.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span
            className="font-serif-sc text-[10px] font-semibold tracking-widest"
            style={{ color: isActive ? level.color : 'var(--color-ink)', opacity: isActive ? 1 : 0.3 }}
          >
            {level.label.split('-')[1]}
          </span>
        )}
      </div>

      {/* Label */}
      <p
        className="font-serif-sc text-[11px] uppercase tracking-[0.18em] mt-3 mb-1"
        style={{ color: isCompleted || isActive ? level.color : 'var(--color-ink)', opacity: isCompleted || isActive ? 1 : 0.35 }}
      >
        {level.label}
      </p>

      {/* Date / status line */}
      <p className="font-mono text-[11px] tabular-nums text-center leading-snug" style={{ color: 'var(--color-slate)' }}>
        {isCompleted && enrollment?.completed_at
          ? formatDate(enrollment.completed_at)
          : isActive && enrollment
            ? `${enrollment.completed_modules.length}/${enrollment.total_modules} modules`
            : 'Not started'}
      </p>

      {/* Track designation for S */}
      {enrollment?.role_track && (
        <p
          className="font-serif-sc text-[10px] uppercase tracking-wider mt-1"
          style={{ color: level.color }}
        >
          /{roleTrackLabel(enrollment.role_track)}
        </p>
      )}
    </div>
  );
}

function MetricTile({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <div className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-5 text-center">
      <p
        className="font-mono text-3xl tabular-nums leading-none mb-2"
        style={{ color: accent }}
      >
        {value.toLocaleString()}
      </p>
      <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-slate)] leading-snug">
        {label}
      </p>
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
  const designationLabel =
    enrollment.role_track
      ? `${level.label}/${roleTrackLabel(enrollment.role_track)}`
      : level.label;

  return (
    <div
      className="bg-[color:var(--color-parch)] border rounded-[3px] p-6"
      style={{ borderColor: level.color + '30' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="font-serif-sc text-xs uppercase tracking-[0.2em] mb-1"
            style={{ color: level.color }}
          >
            {level.product}
          </p>
          <h3 className="font-serif text-2xl text-[color:var(--color-ink)]">
            {designationLabel}
          </h3>
        </div>
        <div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{
            borderColor: level.color,
            backgroundColor: level.colorBg,
          }}
        >
          {isComplete ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10l4 4 8-8"
                stroke={level.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span
              className="font-mono text-[9px] tabular-nums"
              style={{ color: level.color }}
            >
              {enrollment.completed_modules.length}/{enrollment.total_modules}
            </span>
          )}
        </div>
      </div>

      {isComplete && enrollment.completed_at && (
        <p className="font-mono text-xs tabular-nums text-[color:var(--color-slate)] mb-3">
          Earned {formatDate(enrollment.completed_at)}
          {enrollment.certificate_id && (
            <span className="ml-2 text-[color:var(--color-ink)]/40">
              · {enrollment.certificate_id}
            </span>
          )}
        </p>
      )}

      {!isComplete && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans text-[11px] text-[color:var(--color-slate)]">Progress</span>
            <span className="font-mono text-[11px] tabular-nums" style={{ color: level.color }}>
              {Math.round((enrollment.completed_modules.length / enrollment.total_modules) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-[color:var(--color-ink)]/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(enrollment.completed_modules.length / enrollment.total_modules) * 100}%`,
                backgroundColor: level.color,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-[color:var(--color-ink)]/8">
        <Link
          href={
            level.code === 'aibi-p'
              ? '/courses/foundation/program'
              : level.code === 'aibi-s'
                ? '/coming-soon?interest=specialist'
                : '/coming-soon?interest=leader'
          }
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 hover:opacity-70 transition-opacity"
          style={{ color: level.color, borderColor: level.color }}
        >
          {isComplete ? 'View course' : 'Continue'}
        </Link>
        {isComplete && enrollment.certificate_id && (
          <Link
            href={`/verify/${enrollment.certificate_id}`}
            className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-slate)] border-b border-[color:var(--color-slate)]/40 pb-0.5 hover:opacity-70 transition-opacity"
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
  let heading = 'Start with AiBI-Foundation';
  let body = 'Build your AI foundation. The Practitioner certification is where every transformation begins.';
  let href = '/courses/foundation/program/purchase';
  let cta = 'View AiBI-Foundation';

  if (hasP && hasS && hasL) {
    accent = 'var(--color-sage)';
    heading = "You've completed the full certification ladder";
    body = 'AiBI-Foundation · AiBI-S · AiBI-L earned. You are now equipped to lead AI transformation across your institution.';
    href = '/education';
    cta = 'View education';
  } else if (hasP && hasS) {
    accent = 'var(--color-sage)';
    heading = 'Lead the transformation — AiBI-L workshop';
    body = 'You have built personal and departmental AI capability. The Leader workshop gives you the strategic tools to drive institution-wide change.';
    href = '/coming-soon?interest=leader';
    cta = 'Join AiBI-L Waitlist';
  } else if (hasP) {
    const roleLabel = sEnrollment?.role_track
      ? roleTrackLabel(sEnrollment.role_track)
      : 'your role';
    accent = 'var(--color-cobalt)';
    heading = `Ready for AiBI-S? Your ${roleLabel} track is waiting.`;
    body = 'You have demonstrated personal AI proficiency. The Specialist level expands that capability across your entire department.';
    href = '/coming-soon?interest=specialist';
    cta = 'Join AiBI-S Waitlist';
  }

  return (
    <div
      className="rounded-[3px] border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{ borderColor: accent + '40', backgroundColor: accent + '08' }}
    >
      <div>
        <p
          className="font-serif-sc text-[11px] uppercase tracking-[0.2em] mb-2"
          style={{ color: accent }}
        >
          Recommended next step
        </p>
        <h3 className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-snug mb-2">
          {heading}
        </h3>
        <p className="text-sm text-[color:var(--color-slate)] leading-relaxed max-w-xl">
          {body}
        </p>
      </div>
      <Link
        href={href}
        className="shrink-0 inline-block px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] text-[color:var(--color-linen)] hover:opacity-90 active:scale-[0.98] transition-all"
        style={{ backgroundColor: accent }}
      >
        {cta}
      </Link>
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

  // In development, always show the mock progression even without a user session
  const isDev = process.env.NODE_ENV === 'development';
  const enrollments: readonly MockEnrollment[] = isDev ? DEV_ENROLLMENTS : [];

  const metrics = deriveMetrics(enrollments);

  const getStatus = (code: 'aibi-p' | 'aibi-s' | 'aibi-l'): 'completed' | 'active' | 'locked' => {
    const e = enrollments.find((en) => en.product === code);
    if (!e) return 'locked';
    if (e.completed_at) return 'completed';
    return 'active';
  };

  // Readiness score history for growth chart (using assessment data if present)
  const assessmentScore = user?.readiness?.score ?? null;
  const assessmentDate = user?.readiness?.completedAt ?? null;
  const assessmentMax = user?.readiness?.maxScore ?? 32;

  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            <Link href="/dashboard" className="hover:opacity-70 transition-opacity">Dashboard</Link>
            <span className="mx-2 text-[color:var(--color-ink)]/30">/</span>
            Certification Journey
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            Your certification journey.
          </h1>
          <p className="text-[color:var(--color-slate)] mt-2 text-base leading-relaxed max-w-2xl">
            Track your progress from Practitioner through Specialist to Leader across The AI Banking Institute&apos;s full certification ladder.
          </p>
        </header>

        {/* Timeline */}
        <section className="mb-10">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6">
            Certification timeline
          </p>
          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8">
            <div className="flex items-start gap-0">
              {CERT_LEVELS.map((level, idx) => (
                <div key={level.code} className="flex items-start flex-1 min-w-0">
                  <TimelineNode
                    level={level}
                    status={getStatus(level.code)}
                    enrollment={enrollments.find((e) => e.product === level.code)}
                  />
                  {idx < CERT_LEVELS.length - 1 && (
                    <div
                      className="h-px w-full mt-8 shrink"
                      style={{
                        backgroundColor:
                          getStatus(CERT_LEVELS[idx + 1].code) !== 'locked'
                            ? 'var(--color-terra)'
                            : 'var(--color-ink)',
                        opacity: getStatus(CERT_LEVELS[idx + 1].code) !== 'locked' ? 0.4 : 0.1,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cumulative Impact */}
        <section className="mb-10">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6">
            Cumulative impact
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricTile
              value={metrics.skillsBuilt}
              label="Skills built"
              accent="var(--color-terra)"
            />
            <MetricTile
              value={metrics.hoursSavedPerYear}
              label="Hours saved / yr"
              accent="var(--color-cobalt)"
            />
            <MetricTile
              value={metrics.workflowsAutomated}
              label="Workflows automated"
              accent="var(--color-sage)"
            />
            <MetricTile
              value={metrics.quickWinsLogged}
              label="Quick wins logged"
              accent="var(--color-terra)"
            />
          </div>
        </section>

        {/* Credentials Earned */}
        {enrollments.length > 0 && (
          <section className="mb-10">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6">
              Credentials earned
            </p>
            <div className="grid md:grid-cols-2 gap-6">
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
        <section className="mb-10">
          <NextStepBanner enrollments={enrollments} />
        </section>

        {/* Growth Chart */}
        {assessmentScore !== null && assessmentDate && (
          <section className="mb-10">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6">
              Readiness score over time
            </p>
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8">
              <div className="flex items-end gap-6 h-28">
                {/* Baseline placeholder at ~40% */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-t-[2px] bg-[color:var(--color-ink)]/10"
                    style={{ height: `${Math.round((assessmentMax * 0.4) / assessmentMax * 100)}%` }}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
                    Pre
                  </span>
                </div>

                {/* Current assessment score */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-t-[2px]"
                    style={{
                      height: `${Math.round((assessmentScore / assessmentMax) * 100)}%`,
                      backgroundColor: 'var(--color-terra)',
                    }}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-[color:var(--color-slate)]">
                    {formatDate(assessmentDate).replace(/,.*/, '')}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[color:var(--color-ink)]/8 flex items-baseline justify-between">
                <p className="font-serif text-lg text-[color:var(--color-ink)]">
                  Current readiness score
                </p>
                <p className="font-mono text-2xl tabular-nums text-[color:var(--color-terra)]">
                  {assessmentScore}
                  <span className="text-sm text-[color:var(--color-slate)] ml-1">/ {assessmentMax}</span>
                </p>
              </div>

              <p className="text-sm text-[color:var(--color-slate)] mt-2 leading-relaxed">
                Retake the assessment after completing each certification level to track your readiness growth.
              </p>

              <div className="mt-4">
                <Link
                  href="/assessment/start"
                  className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-0.5 hover:opacity-70 transition-opacity"
                >
                  Retake assessment
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* No assessment prompt */}
        {assessmentScore === null && !isDev && (
          <section className="mb-10">
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 text-center">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                Readiness score
              </p>
              <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mb-4 max-w-md mx-auto">
                Complete the free AI readiness assessment to establish your baseline and track how your score improves as you progress through each certification level.
              </p>
              <Link
                href="/assessment/start"
                className="inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
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
