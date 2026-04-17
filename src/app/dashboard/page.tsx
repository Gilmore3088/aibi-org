'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserDataWithSupabaseFallback, type UserData } from '@/lib/user-data';
import { getTier } from '@content/assessments/v1/scoring';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { questions } from '@content/assessments/v1/questions';
import { RadarChart } from './_components/RadarChart';

// Derive the tier + display max for a ReadinessResult, handling both V1 (max 32)
// and V2 (max 48) persisted shapes. Without this branching a V2 score of 36 was
// rendered against V1's hardcoded /32 denominator (impossible "36/32").
function getReadinessDisplay(readiness: NonNullable<UserData['readiness']>) {
  // Detect V2 via explicit marker, then by maxScore, then by answers length
  // (12 questions = V2, 8 = V1). The answers-length heuristic is the fallback
  // for users whose localStorage was written before the version marker existed.
  const isV2 =
    readiness.version === 'v2' ||
    readiness.maxScore === 48 ||
    readiness.answers.length === 12;
  const maxScore = readiness.maxScore ?? (isV2 ? 48 : 32);
  try {
    const tier = isV2 ? getTierV2(readiness.score) : getTier(readiness.score);
    return { tier, maxScore, isV2 };
  } catch {
    // Score outside the known range (e.g., V1 getTier called with a V2 score
    // that lacked a version marker). Fall back to the persisted tier label.
    return {
      tier: {
        id: readiness.tierId,
        label: readiness.tierLabel,
        colorVar: 'var(--color-terra)',
        headline: '',
      } as const,
      maxScore,
      isV2,
    };
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage immediately for a fast first render,
    // then upgrade with Supabase data (cross-device persistence).
    getUserDataWithSupabaseFallback()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <main className="px-6 py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Dashboard
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Your AI readiness dashboard.
          </h1>
          <p className="text-lg text-[color:var(--color-ink)]/75 leading-relaxed">
            Complete the free AI readiness assessment to unlock your
            personalized dashboard — your score, dimension breakdown,
            proficiency tracking, and tier-specific recommendations all
            in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/assessment"
              className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
            >
              Take the Free Assessment
            </Link>
          </div>
          <div className="border-t border-[color:var(--color-ink)]/10 pt-6 mt-4">
            <p className="text-sm text-[color:var(--color-slate)]">
              Already completed the assessment on another device?
              Enter the same email you used and your results will load
              automatically. Results are also saved in this browser as a
              local backup.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const display = user.readiness ? getReadinessDisplay(user.readiness) : null;
  const tier = display?.tier ?? null;
  const maxScore = display?.maxScore ?? 32;

  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Dashboard
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            Welcome back.
          </h1>
          <p className="text-[color:var(--color-slate)] mt-2">
            {user.email}
          </p>
        </header>

        {/* Three pathway cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Readiness card */}
          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              AI Readiness
            </p>
            {user.readiness && tier ? (
              <>
                <p
                  className="font-serif text-3xl leading-none mb-1"
                  style={{ color: tier.colorVar }}
                >
                  {tier.label}
                </p>
                <p className="font-mono text-lg tabular-nums text-[color:var(--color-ink)]">
                  {user.readiness.score}/{maxScore}
                </p>
                <p className="text-sm text-[color:var(--color-slate)] mt-3 leading-relaxed">
                  {tier.headline}
                </p>
                <Link
                  href="/assessment"
                  className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-0.5 hover:text-[color:var(--color-terra-light)] hover:border-[color:var(--color-terra-light)] transition-colors"
                >
                  Retake assessment
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
                  Complete the readiness assessment to see your tier and score.
                </p>
                <Link
                  href="/assessment"
                  className="inline-block mt-4 px-4 py-2 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Start
                </Link>
              </>
            )}
          </div>

          {/* Courses card */}
          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-sage)] mb-4">
              Courses
            </p>
            <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight mb-3">
              AI Foundations
            </h3>
            <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
              {tier?.id === 'starting-point'
                ? 'Recommended for your tier. Build baseline AI literacy before pursuing certification.'
                : 'Self-paced starter course. Five modules, five universal templates, and safe-use guidelines.'}
            </p>
            <Link
              href="/foundations"
              className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-sage)] border-b border-[color:var(--color-sage)] pb-0.5 hover:opacity-80 transition-colors"
            >
              Explore course
            </Link>
          </div>

          {/* Certifications card */}
          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)] mb-4">
              Certifications
            </p>
            <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight mb-3">
              Practitioner Assessment
            </h3>
            <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
              {user.proficiency
                ? `Last result: ${user.proficiency.levelLabel} (${user.proficiency.pctCorrect}/100)`
                : 'Take the proficiency assessment to see if you are ready for the Practitioner credential.'}
            </p>
            <Link
              href="/certifications/exam/aibi-p"
              className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)] border-b border-[color:var(--color-cobalt)] pb-0.5 hover:opacity-80 transition-colors"
            >
              {user.proficiency ? 'Retake assessment' : 'Begin assessment'}
            </Link>
          </div>
        </div>

        {/* Readiness dimension breakdown */}
        {user.readiness && tier && (
          <section className="mb-12">
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
                Your 8-dimension readiness breakdown
              </p>
              <div className="space-y-4">
                {user.readiness.dimensionBreakdown
                  ? Object.entries(user.readiness.dimensionBreakdown).map(([dim, data]) => {
                      const pct = data.maxScore > 0 ? data.score / data.maxScore : 0;
                      const filledBars = Math.round(pct * 4);
                      return (
                        <div key={dim} className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="font-serif text-base text-[color:var(--color-ink)]">
                              {data.label}
                            </span>
                            <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                              {data.score} / {data.maxScore}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={
                                  'h-2 flex-1 rounded-[1px] ' +
                                  (bar <= filledBars
                                    ? 'bg-[color:var(--color-terra)]'
                                    : 'bg-[color:var(--color-ink)]/10')
                                }
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  : questions.map((q, idx) => {
                      const points = user.readiness!.answers[idx] ?? 0;
                      return (
                        <div key={q.id} className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="font-serif text-base text-[color:var(--color-ink)]">
                              {q.dimension}
                            </span>
                            <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                              {points} / 4
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={
                                  'h-2 flex-1 rounded-[1px] ' +
                                  (bar <= points
                                    ? 'bg-[color:var(--color-terra)]'
                                    : 'bg-[color:var(--color-ink)]/10')
                                }
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </section>
        )}

        {/* Proficiency skill breakdown with radar chart */}
        {user.proficiency && (
          <section className="mb-12">
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
                Your proficiency skill breakdown
              </p>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <RadarChart scores={user.proficiency.topicScores} />

                <div className="space-y-5">
                  {user.proficiency.topicScores.map((ts) => (
                    <div key={ts.topic}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-serif text-base text-[color:var(--color-ink)]">
                          {ts.label}
                        </span>
                        <span className="font-mono text-sm text-[color:var(--color-terra)] tabular-nums">
                          {ts.pct}%
                        </span>
                      </div>
                      <p className="text-xs text-[color:var(--color-slate)]">
                        {ts.correct} of {ts.total} correct
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tier-specific recommendations */}
        {tier && (
          <section className="mb-12">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
              Recommended for your tier
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {getRecommendations(tier.id).map((rec) => (
                <Link
                  key={rec.href}
                  href={rec.href}
                  className="group bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 hover:border-[color:var(--color-terra)]/30 transition-all duration-200"
                >
                  <p
                    className="font-serif-sc text-[11px] uppercase tracking-[0.2em] mb-3"
                    style={{ color: rec.accent }}
                  >
                    {rec.label}
                  </p>
                  <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-2 group-hover:text-[color:var(--color-terra)] transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
                    {rec.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Certification Journey */}
        <section className="mb-12">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
            Your certification journey
          </p>
          <Link
            href="/dashboard/progression"
            className="group flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 hover:border-[color:var(--color-terra)]/30 transition-all duration-200"
          >
            <div className="flex-1">
              <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight mb-2 group-hover:text-[color:var(--color-terra)] transition-colors">
                Track your full certification ladder
              </h3>
              <p className="text-sm text-[color:var(--color-slate)] leading-relaxed max-w-lg">
                See your complete journey across AiBI-P, AiBI-S, and AiBI-L — credentials earned, impact metrics, and recommended next steps.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {(['var(--color-terra)', 'var(--color-cobalt)', 'var(--color-sage)'] as const).map((color, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ borderColor: color, backgroundColor: color + '18' }}
                />
              ))}
              <span
                className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-0.5 ml-2"
              >
                View journey
              </span>
            </div>
          </Link>
        </section>

        {/* Resources */}
        <section>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
            Recommended reading
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/resources/the-widening-ai-gap"
              className="group border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 hover:border-[color:var(--color-terra)]/30 transition-all duration-200"
            >
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
                Industry Analysis
              </p>
              <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-tight group-hover:text-[color:var(--color-terra)] transition-colors">
                The widening AI gap
              </h3>
            </Link>
            <Link
              href="/resources/members-will-switch"
              className="group border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 hover:border-[color:var(--color-terra)]/30 transition-all duration-200"
            >
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
                Retention
              </p>
              <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-tight group-hover:text-[color:var(--color-terra)] transition-colors">
                Members will switch
              </h3>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

interface Recommendation {
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly accent: string;
}

function getRecommendations(tierId: string): Recommendation[] {
  switch (tierId) {
    case 'starting-point':
      return [
        {
          label: 'Recommended',
          title: 'Start with AI Foundations',
          description: 'Build baseline AI literacy across your team with the $97 self-paced course.',
          href: '/foundations',
          accent: 'var(--color-terra)',
        },
        {
          label: 'Learn more',
          title: 'Download the Safe AI Use Guide',
          description: 'Six chapters on governance, safe use, and examiner readiness. Free.',
          href: '/security',
          accent: 'var(--color-cobalt)',
        },
      ];
    case 'early-stage':
      return [
        {
          label: 'Recommended',
          title: 'Request an Executive Briefing',
          description: 'A free 45-minute conversation about converting scattered experiments into a coordinated program.',
          href: '/services',
          accent: 'var(--color-terra)',
        },
        {
          label: 'Build capability',
          title: 'Explore the Practitioner credential',
          description: 'Give your early adopters the tools to lead AI adoption with confidence.',
          href: '/certifications',
          accent: 'var(--color-cobalt)',
        },
      ];
    case 'building-momentum':
      return [
        {
          label: 'Recommended',
          title: 'Explore the Quick Win Sprint',
          description: 'Three automations in 4\u20136 weeks with a 90-day ROI guarantee. $5,000\u2013$15,000.',
          href: '/services',
          accent: 'var(--color-terra)',
        },
        {
          label: 'Prove readiness',
          title: 'Take the Practitioner assessment',
          description: 'See if your team is ready for the Banking AI Practitioner credential.',
          href: '/certifications/exam/aibi-p',
          accent: 'var(--color-sage)',
        },
      ];
    case 'ready-to-scale':
      return [
        {
          label: 'Recommended',
          title: 'The AI Transformation program',
          description: 'A monthly operating system with capability transfer. Your team runs it independently when we leave.',
          href: '/services',
          accent: 'var(--color-terra)',
        },
        {
          label: 'Credential your leaders',
          title: 'The Banking AI Leader workshop',
          description: '1-day in-person. Efficiency ratio modeling, AI roadmap, examiner readiness.',
          href: '/certifications',
          accent: 'var(--color-sage)',
        },
      ];
    default:
      return [];
  }
}
