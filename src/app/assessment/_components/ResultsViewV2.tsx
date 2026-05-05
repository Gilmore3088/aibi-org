'use client';

import type { Tier } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import { ScoreRing } from './ScoreRing';
import { NewsletterCTA } from './NewsletterCTA';
import { PrintButton } from './PrintButton';
import { StarterArtifactCard } from './StarterArtifactCard';
import { StarterPrompt } from './StarterPrompt';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import {
  PERSONAS,
  BIG_INSIGHT,
  TIER_INSIGHTS,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FUTURE_VISION,
  RECOMMENDED_PATH_INTRO,
  FOOTER_CLOSE,
} from '@content/assessments/v2/personalization';

interface ResultsViewV2Props {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly email: string;
  readonly firstName?: string | null;
  readonly institutionName?: string | null;
}

interface RankedDimension {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function groupDimensions(
  dimensionBreakdown: Record<Dimension, DimensionScore>,
): {
  readonly all: readonly RankedDimension[];
  readonly critical: readonly RankedDimension[];
  readonly developing: readonly RankedDimension[];
  readonly strong: readonly RankedDimension[];
} {
  const all: RankedDimension[] = (Object.entries(dimensionBreakdown) as [Dimension, DimensionScore][])
    .filter(([, data]) => data.maxScore > 0)
    .map(([id, data]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: data.score,
      maxScore: data.maxScore,
      pct: data.score / data.maxScore,
    }))
    .sort((a, b) => a.pct - b.pct);

  return {
    all,
    critical: all.filter((d) => d.pct < 0.5),
    developing: all.filter((d) => d.pct >= 0.5 && d.pct < 0.75),
    strong: all.filter((d) => d.pct >= 0.75),
  };
}

export function ResultsViewV2({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  email,
  firstName,
  institutionName,
}: ResultsViewV2Props) {
  const persona = PERSONAS[tierId];
  const subjectName = institutionName?.trim() || 'Your institution';
  const grouped = groupDimensions(dimensionBreakdown);
  const focusGap =
    grouped.critical[0] ?? grouped.developing[0] ?? grouped.all[0] ?? null;
  const fastestRoi = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const starterArtifact = focusGap ? getStarterArtifact(focusGap.id) : null;
  const insightBullets = TIER_INSIGHTS[tierId];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Confirmation header */}
      <div className="text-center mb-12" data-print-hide="true">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
          {firstName ? `${firstName.trim()}, your AI Readiness Results` : 'Your AI Readiness Results'}
        </p>
        <p className="text-sm text-[color:var(--color-ink)]/70">
          Results delivered to {email}
        </p>
      </div>

      {/* SECTION 1 — Diagnosis */}
      <SectionAnchor id="section-1" />
      <section aria-labelledby="section-1-heading" className="space-y-8">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          Diagnosis
        </p>
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2
              id="section-1-heading"
              className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--color-ink)]"
            >
              {subjectName} is in the{' '}
              <span className="text-[color:var(--color-terra)]">{persona.label}</span>{' '}
              phase.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed max-w-xl">
              {persona.oneLine}
            </p>
            <div className="mt-6 inline-flex items-baseline gap-3 border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] px-4 py-3 rounded-[2px]">
              <span className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
                AI Readiness Score
              </span>
              <span className="font-mono text-lg tabular-nums text-[color:var(--color-ink)]">
                {score} / 48
              </span>
              <span
                className="font-serif-sc text-[10px] uppercase tracking-[0.22em]"
                style={{ color: tier.colorVar }}
              >
                {tier.label}
              </span>
            </div>
          </div>
          <div className="md:flex-shrink-0">
            <ScoreRing score={score} minScore={12} maxScore={48} colorVar={tier.colorVar} label={tier.label} />
          </div>
        </div>
        <ContinueLink to="section-2" label="Continue" />
      </section>

      {/* SECTION 2 — Big Insight */}
      <SectionAnchor id="section-2" />
      <section className="space-y-8" aria-labelledby="section-2-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          The big insight
        </p>
        <h2 id="section-2-heading" className="sr-only">The big insight</h2>
        <div className="bg-[color:var(--color-ink)] text-[color:var(--color-linen)] rounded-[3px] p-8 md:p-10">
          <p className="font-serif text-2xl md:text-3xl leading-snug">
            {BIG_INSIGHT[tierId]}
          </p>
        </div>
        <ContinueLink to="section-3" label="What this means" />
      </section>

      {/* SECTION 3 — What this means */}
      <SectionAnchor id="section-3" />
      <section className="space-y-8" aria-labelledby="section-3-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          What this means
        </p>
        <h2 id="section-3-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
          In practice, this typically shows up as:
        </h2>
        <ul className="space-y-4 border-l-2 border-[color:var(--color-terra)] pl-6">
          {insightBullets.map((bullet) => (
            <li
              key={bullet}
              className="text-base md:text-lg text-[color:var(--color-ink)]/85 leading-relaxed flex gap-3"
            >
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <ContinueLink to="section-4" label="Show me where I am exposed" />
      </section>

      {/* SECTION 4 — Strengths vs Gaps */}
      <SectionAnchor id="section-4" />
      <section className="space-y-10" aria-labelledby="section-4-heading">
        <div>
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Strengths and gaps
          </p>
          <h2 id="section-4-heading" className="mt-3 font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
            Where you&apos;re strong vs exposed.
          </h2>
        </div>

        {grouped.critical.length > 0 && (
          <div>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-error)] mb-5 flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-error)]" />
              Your biggest gaps · focus here
            </p>
            <div className="grid gap-5">
              {grouped.critical.map((gap) => (
                <GapCard key={gap.id} gap={gap} />
              ))}
            </div>
          </div>
        )}

        {grouped.developing.length > 0 && (
          <div>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-5 flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-terra)]" />
              Developing
            </p>
            <ul className="grid gap-3">
              {grouped.developing.map((dim) => (
                <li
                  key={dim.id}
                  className="flex items-baseline justify-between border border-[color:var(--color-ink)]/10 rounded-[3px] px-4 py-3 bg-[color:var(--color-linen)]"
                >
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">{dim.label}</span>
                  <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                    {dim.score}/{dim.maxScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.strong.length > 0 && (
          <div>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-sage)] mb-5 flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-sage)]" />
              Where you&apos;re strong
            </p>
            <ul className="grid gap-3">
              {grouped.strong.map((strength) => (
                <li
                  key={strength.id}
                  className="border border-[color:var(--color-sage)]/25 rounded-[3px] px-4 py-3 bg-[color:var(--color-sage)]/5"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-serif text-lg text-[color:var(--color-ink)]">{strength.label}</span>
                    <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                      {strength.score}/{strength.maxScore}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--color-ink)]/70 leading-relaxed">
                    You already have a foundation here. This will accelerate adoption once the rest is in place.
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ContinueLink to="section-5" label="Give me my first move" />
      </section>

      {/* SECTION 5 — Fastest ROI */}
      {fastestRoi && focusGap && (
        <>
          <SectionAnchor id="section-5" />
          <section
            className="space-y-6"
            aria-labelledby="section-5-heading"
          >
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Your first AI move
            </p>
            <h2
              id="section-5-heading"
              className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--color-ink)]"
            >
              Start with {fastestRoi.title.toLowerCase()}.
            </h2>

            <div className="bg-[color:var(--color-parch)] border-2 border-[color:var(--color-terra)]/40 rounded-[3px] p-7 md:p-9 space-y-7">
              <div>
                <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
                  Why this is the right starting point
                </p>
                <ul className="mt-3 space-y-2">
                  {fastestRoi.whyRightNow.map((reason) => (
                    <li
                      key={reason}
                      className="text-[15px] leading-[1.55] text-[color:var(--color-ink)]/85 flex gap-3"
                    >
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-l-2 border-[color:var(--color-ink)]/20 pl-5">
                <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
                  What this looks like in practice
                </p>
                <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
                  {fastestRoi.inPractice}
                </p>
              </div>

              <div>
                <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
                  Where this works best
                </p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-3">
                  {fastestRoi.worksBestFor.map((useCase) => (
                    <li
                      key={useCase}
                      className="text-[14px] text-[color:var(--color-ink)]/75 flex gap-2"
                    >
                      <span aria-hidden className="font-mono text-[color:var(--color-terra)]">·</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-[color:var(--color-ink)]/10 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55">
                    Risk
                  </dt>
                  <dd className="mt-1 text-[color:var(--color-ink)]">{fastestRoi.riskLevel}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55">
                    Time saved
                  </dt>
                  <dd className="mt-1 text-[color:var(--color-ink)]">{fastestRoi.timeSaved}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55">
                    Owner
                  </dt>
                  <dd className="mt-1 text-[color:var(--color-ink)]">{fastestRoi.owner}</dd>
                </div>
              </dl>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
              Surfaced by your weakest dimension: {focusGap.label}
            </p>
            <ContinueLink to="section-6" label="Give me the template" />
          </section>
        </>
      )}

      {/* SECTION 6 — Starter Prompt */}
      {starterPrompt && (
        <>
          <SectionAnchor id="section-6" />
          <section className="space-y-5" aria-labelledby="section-6-heading">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Starter prompt
            </p>
            <h2
              id="section-6-heading"
              className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
            >
              Copy it. Run it. Refine it.
            </h2>
            <p className="text-[16px] leading-[1.6] text-[color:var(--color-ink)]/80 max-w-2xl">
              Take this prompt to the AI tool your institution already trusts. Run it on a real workflow this week. Bring back what worked and what did not.
            </p>
            <StarterPrompt prompt={starterPrompt} />
            {starterArtifact && focusGap && (
              <details className="group border border-[color:var(--color-ink)]/15 rounded-[3px] bg-[color:var(--color-linen)] overflow-hidden" data-print-hide="true">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/70 hover:bg-[color:var(--color-parch)] transition-colors">
                  <span>Show printable starter artifact</span>
                  <span aria-hidden className="font-mono text-[12px] transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="p-5">
                  <StarterArtifactCard artifact={starterArtifact} tierLabel={tier.label} topGapLabel={focusGap.label} />
                </div>
              </details>
            )}
            <ContinueLink to="section-7" label="What to do this week" />
          </section>
        </>
      )}

      {/* SECTION 7 — 7-Day Plan */}
      <SectionAnchor id="section-7" />
      <section className="space-y-6" aria-labelledby="section-7-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          Your 7-day AI activation plan
        </p>
        <h2 id="section-7-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
          What to do this week.
        </h2>
        <ol className="border-l-2 border-[color:var(--color-terra)]/40 space-y-5 pl-6">
          {SEVEN_DAY_PLAN.map(({ day, action }) => (
            <li key={day} className="relative">
              <span
                aria-hidden
                className="absolute -left-[34px] top-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-mono text-[11px] tabular-nums font-semibold"
              >
                {day}
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-1">
                Day {day}
              </p>
              <p className="text-[15px] leading-[1.55] text-[color:var(--color-ink)]/85">
                {action}
              </p>
            </li>
          ))}
        </ol>
        <ContinueLink to="section-8" label="What good looks like" />
      </section>

      {/* SECTION 8 — Future Vision */}
      <SectionAnchor id="section-8" />
      <section className="space-y-6" aria-labelledby="section-8-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          What good looks like
        </p>
        <h2 id="section-8-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
          A Practitioner-Ready institution.
        </h2>
        <ul className="grid gap-3 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-7 md:p-9">
          {FUTURE_VISION.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[15px] leading-[1.55] text-[color:var(--color-ink)]/85"
            >
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <ContinueLink to="section-9" label="How to move forward" />
      </section>

      {/* SECTION 9 — Recommended Path */}
      <SectionAnchor id="section-9" />
      <section
        className="space-y-8"
        data-print-hide="true"
        aria-labelledby="section-9-heading"
      >
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          How to move forward from here
        </p>
        <h2
          id="section-9-heading"
          className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
        >
          {RECOMMENDED_PATH_INTRO[tierId]}
        </h2>

        <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
          <div className="border-2 border-[color:var(--color-terra)] rounded-[3px] p-6 bg-[color:var(--color-linen)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-2">
              Primary path
            </p>
            <h3 className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight">
              AiBI-P: Banking AI Practitioner
            </h3>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
              A practical training program designed for institutions at your stage.
            </p>
            <p className="mt-5 font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
              What you get
            </p>
            <ul className="mt-2 space-y-1.5">
              {[
                '12 short modules focused on real work',
                'Reusable prompt systems',
                'Safe AI usage framework (SAFE)',
                'Hands-on workflows your team can use immediately',
              ].map((item) => (
                <li
                  key={item}
                  className="text-[14px] text-[color:var(--color-ink)]/85 flex gap-3"
                >
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/85 italic">
              Outcome: your team can safely use AI in daily work within 2 weeks.
            </p>
            <a
              href="/courses/aibi-p"
              className="mt-6 inline-block w-full text-center px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Start Practitioner Training
            </a>
          </div>

          <div className="border border-[color:var(--color-ink)]/20 rounded-[3px] p-6 bg-[color:var(--color-linen)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-2">
              Prefer a guided approach?
            </p>
            <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight">
              Executive Briefing
            </h3>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
              We walk through your results with your leadership team and define a structured AI rollout plan.
            </p>
            <a
              href="/for-institutions/advisory"
              className="mt-6 inline-block w-full text-center px-6 py-3 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Request Executive Briefing
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 10 — Footer Close */}
      <SectionAnchor id="section-10" />
      <section className="border-t border-[color:var(--color-ink)]/15 pt-12 text-center print-avoid-break">
        <p className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight">
          {FOOTER_CLOSE.headline}
        </p>
        <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--color-ink)]/75 max-w-2xl mx-auto">
          {FOOTER_CLOSE.body}
        </p>
      </section>

      {/* APPENDIX — full diagnostic + newsletter + PDF */}
      <details className="mt-16 border-t border-[color:var(--color-ink)]/15 pt-6 group">
        <summary className="cursor-pointer list-none flex items-center justify-between font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/65 hover:text-[color:var(--color-terra)]">
          <span>Full diagnostic · all 8 dimensions</span>
          <span aria-hidden className="font-mono text-[12px] transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-6 space-y-4">
          {grouped.all.map((dim) => {
            const filledBars = Math.round(dim.pct * 4);
            return (
              <div key={dim.id} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">
                    {dim.label}
                  </span>
                  <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                    {dim.score} / {dim.maxScore}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={
                        'h-2 flex-1 ' +
                        (bar <= filledBars
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
      </details>

      <div className="mt-12" data-print-hide="true">
        <NewsletterCTA email={email} />
      </div>

      <div className="mt-12 text-center" data-print-hide="true">
        <PrintButton />
        <p className="font-mono text-[10px] text-[color:var(--color-slate)] mt-3">
          Save your results as a PDF using your browser&rsquo;s print dialog.
        </p>
      </div>

      {/* Print-only footer */}
      <div className="print-footer">
        <p>
          <strong>The AI Banking Institute</strong> &middot; Turning Bankers
          into Builders
        </p>
        <p>
          Results generated for {email} &middot; Score: {score}/48 &middot;
          Tier: {tier.label}
        </p>
        <p>
          aibankinginstitute.com &middot; Request an Executive Briefing to
          discuss your results.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Anchor target with breathing room above so smooth-scroll lands cleanly.
function SectionAnchor({ id }: { readonly id: string }) {
  return <span id={id} aria-hidden className="block scroll-mt-12 -mt-12 pt-12 first:mt-0 first:pt-0" />;
}

// One-section spacer + Continue button. Anchor link drives the smooth scroll
// (CSS html { scroll-behavior: smooth } + the SectionAnchor's scroll-mt do
// the work — no JS needed).
function ContinueLink({ to, label }: { readonly to: string; readonly label: string }) {
  return (
    <div className="pt-6 mb-16" data-print-hide="true">
      <a
        href={`#${to}`}
        className="inline-flex items-center justify-between gap-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[1.4px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors group"
      >
        <span>{label}</span>
        <span aria-hidden className="font-mono transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gap card (rich)
// ---------------------------------------------------------------------------

function GapCard({ gap }: { readonly gap: RankedDimension }) {
  const content = GAP_CONTENT[gap.id];
  return (
    <article className="border-l-4 border-[color:var(--color-error)] bg-[color:var(--color-linen)] rounded-[3px] p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)]">
          {gap.label}
        </h3>
        <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
          {gap.score}/{gap.maxScore}
        </span>
      </header>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/80">
        {content.explanation}
      </p>
      <div className="mt-5">
        <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-error)]">
          What this leads to
        </p>
        <ul className="mt-2 space-y-1.5">
          {content.impacts.map((impact) => (
            <li
              key={impact}
              className="text-[14px] leading-[1.55] text-[color:var(--color-ink)]/85 flex gap-3"
            >
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-error)] shrink-0" />
              <span>{impact}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-sage)]">
          What good looks like
        </p>
        <ul className="mt-2 space-y-1.5">
          {content.whatGoodLooksLike.map((vision) => (
            <li
              key={vision}
              className="text-[14px] leading-[1.55] text-[color:var(--color-ink)]/85 flex gap-3"
            >
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-sage)] shrink-0" />
              <span>{vision}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
