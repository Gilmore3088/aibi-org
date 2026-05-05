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
  FINANCIAL_IMPLICATIONS,
} from '@content/assessments/v2/personalization';

const BRIEFING_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

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
      {/* Executive briefing header */}
      <header
        className="mb-14 border-b border-[color:var(--color-ink)]/15 pb-8"
        style={{ animation: 'fadeInUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
          <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
            AI Readiness Briefing
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 shrink-0">
            {BRIEFING_DATE_FORMATTER.format(new Date())}
          </p>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight">
          {firstName
            ? `${firstName.trim()}, here is your assessment in brief.`
            : 'Your assessment, in brief.'}
        </h1>
        <p
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55"
          data-print-hide="true"
        >
          A 5-minute read · Save or print at the bottom
        </p>
      </header>

      {/* SECTION 1 — Diagnosis */}
      <SectionAnchor id="section-1" />
      <section
        aria-labelledby="section-1-heading"
        className="space-y-8"
        style={{ animation: 'fadeInUp 700ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both' }}
      >
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
          </div>
          <div className="md:flex-shrink-0">
            <ScoreRing score={score} minScore={12} maxScore={48} colorVar={tier.colorVar} label={tier.label} />
          </div>
        </div>
        <ContinueLink to="section-2" label="The big insight" />
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
        <ContinueLink to="section-2b" label="Implications for your institution" />
      </section>

      {/* SECTION 2b — Implications for Financial Professionals */}
      <SectionAnchor id="section-2b" />
      <section className="space-y-6" aria-labelledby="section-2b-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          Implications for financial professionals
        </p>
        <h2
          id="section-2b-heading"
          className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
        >
          In operating terms.
        </h2>
        <dl className="border-t border-[color:var(--color-ink)]/15">
          <ImplicationRow
            label="Operational efficiency"
            body={FINANCIAL_IMPLICATIONS[tierId].operational}
          />
          <ImplicationRow
            label="Risk management"
            body={FINANCIAL_IMPLICATIONS[tierId].risk}
          />
          <ImplicationRow
            label="Cost & dependency"
            body={FINANCIAL_IMPLICATIONS[tierId].cost}
          />
        </dl>
        <ContinueLink to="section-3" label="What this means in practice" />
      </section>

      {/* SECTION 3 — What this means */}
      <SectionAnchor id="section-3" />
      <section className="space-y-8 mb-20" aria-labelledby="section-3-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          What this means
        </p>
        <h2 id="section-3-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
          In practice:
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
      </section>

      {/* SECTION 4 — Strengths vs Gaps */}
      <SectionAnchor id="section-4" />
      <section className="space-y-10" aria-labelledby="section-4-heading">
        <h2
          id="section-4-heading"
          className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]"
        >
          Strengths and gaps
        </h2>

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
                  className="flex items-baseline justify-between gap-4 border border-[color:var(--color-ink)]/10 rounded-[3px] px-4 py-3 bg-[color:var(--color-linen)]"
                >
                  <span className="min-w-0 font-serif text-lg text-[color:var(--color-ink)] break-words">{dim.label}</span>
                  <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums shrink-0">
                    {dim.score}/{dim.maxScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.strong.length > 0 && (
          <div>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/65 mb-5 flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-ink)]/40" />
              Where you&apos;re strong
            </p>
            <ul className="grid gap-3">
              {grouped.strong.map((strength) => (
                <li
                  key={strength.id}
                  className="flex items-baseline justify-between gap-4 border border-[color:var(--color-ink)]/15 rounded-[3px] px-4 py-3 bg-[color:var(--color-parch)]"
                >
                  <span className="min-w-0 font-serif text-lg text-[color:var(--color-ink)] break-words">{strength.label}</span>
                  <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums shrink-0">
                    {strength.score}/{strength.maxScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ContinueLink to="section-5" label="Your first move" />
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

            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/15 rounded-[3px] p-7 md:p-9 space-y-7">
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
            <ContinueLink to="section-6" label="Starter prompt" />
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
            <ContinueLink to="section-7" label="Your 7-day plan" />
          </section>
        </>
      )}

      {/* SECTION 7 — 7-Day Plan */}
      <SectionAnchor id="section-7" />
      <section className="space-y-6 mb-20" aria-labelledby="section-7-heading">
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
      </section>

      {/* SECTION 8 — Future Vision */}
      <SectionAnchor id="section-8" />
      <section className="space-y-6 mb-20" aria-labelledby="section-8-heading">
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
      </section>

      {/* SECTION 9 — Next Steps (Training · Strategic Planning · Governance) */}
      <SectionAnchor id="section-9" />
      <section className="space-y-8" aria-labelledby="section-9-heading">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          Next steps
        </p>
        <h2
          id="section-9-heading"
          className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
        >
          {RECOMMENDED_PATH_INTRO[tierId]}
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Training — primary CTA */}
          <article className="border-2 border-[color:var(--color-terra)] rounded-[3px] p-6 bg-[color:var(--color-linen)] flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
              01 · Training
            </p>
            <h3 className="mt-2 font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight">
              AiBI-P Practitioner
            </h3>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
              Enroll relevant staff to build foundational skills inside a safe, repeatable framework.
            </p>
            <ul className="mt-4 space-y-1.5">
              {[
                '12 short modules focused on real work',
                'Reusable prompt systems',
                'SAFE framework',
              ].map((item) => (
                <li key={item} className="text-[14px] text-[color:var(--color-ink)]/85 flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-[1.55] text-[color:var(--color-ink)]/75 italic">
              Outcome: your team can safely use AI in daily work within 2 weeks.
            </p>
            <a
              href="/courses/aibi-p"
              data-print-hide="true"
              className="mt-auto pt-6 block text-center px-5 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Start Practitioner Training
            </a>
          </article>

          {/* Strategic Planning — secondary CTA */}
          <article className="border border-[color:var(--color-ink)]/20 rounded-[3px] p-6 bg-[color:var(--color-linen)] flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
              02 · Strategic planning
            </p>
            <h3 className="mt-2 font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight">
              Executive Briefing
            </h3>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
              Align leadership on priorities and define a roadmap for scaling AI responsibly across the institution.
            </p>
            <ul className="mt-4 space-y-1.5">
              {[
                'Walk through your results with leadership',
                'Define a phased adoption roadmap',
                'Identify the right first cohort',
              ].map((item) => (
                <li key={item} className="text-[14px] text-[color:var(--color-ink)]/85 flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-ink)]/40 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/for-institutions/advisory"
              data-print-hide="true"
              className="mt-auto pt-6 block text-center px-5 py-3 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Request Briefing
            </a>
          </article>

          {/* Governance — describes the work, no CTA */}
          <article className="border border-[color:var(--color-ink)]/20 rounded-[3px] p-6 bg-[color:var(--color-linen)] flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
              03 · Governance
            </p>
            <h3 className="mt-2 font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight">
              AI Use Policy
            </h3>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
              Document tool usage, data handling, and accountability so your audit team can defend the program.
            </p>
            <ul className="mt-4 space-y-1.5">
              {[
                'Approved tools and data classes',
                'Mandatory human review steps',
                'Retention and incident procedures',
              ].map((item) => (
                <li key={item} className="text-[14px] text-[color:var(--color-ink)]/85 flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-ink)]/40 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-6 text-[12px] text-[color:var(--color-ink)]/55 italic">
              Aligned with SR 11-7 model risk guidance and the AIEOG AI Lexicon.
            </p>
          </article>
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
                <div className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0 font-serif text-lg text-[color:var(--color-ink)] break-words">
                    {dim.label}
                  </span>
                  <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums shrink-0">
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
// tabIndex={-1} makes the element programmatically focusable so hash-nav from
// ContinueLink moves screen-reader focus into the new section — without it,
// keyboard / SR users hear nothing when Continue is clicked.
function SectionAnchor({ id }: { readonly id: string }) {
  return <span id={id} tabIndex={-1} className="block scroll-mt-16 outline-none" />;
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

function ImplicationRow({ label, body }: { readonly label: string; readonly body: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-[200px_1fr] md:gap-8 py-5 border-b border-[color:var(--color-ink)]/15">
      <dt className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] md:pt-1">
        {label}
      </dt>
      <dd className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
        {body}
      </dd>
    </div>
  );
}

function GapCard({ gap }: { readonly gap: RankedDimension }) {
  const content = GAP_CONTENT[gap.id];
  return (
    <article className="border-l-2 border-[color:var(--color-error)] bg-[color:var(--color-linen)] rounded-[3px] p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h3 className="min-w-0 font-serif text-xl md:text-2xl text-[color:var(--color-ink)] break-words">
          {gap.label}
        </h3>
        <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums shrink-0">
          {gap.score}/{gap.maxScore}
        </span>
      </header>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/80">
        {content.explanation}
      </p>
      <div className="mt-5">
        <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
          What this leads to
        </p>
        <ul className="mt-2 space-y-1.5">
          {content.impacts.map((impact) => (
            <li
              key={impact}
              className="text-[14px] leading-[1.55] text-[color:var(--color-ink)]/85 flex gap-3"
            >
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-ink)]/30 shrink-0" />
              <span>{impact}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
          What good looks like
        </p>
        <ul className="mt-2 space-y-1.5">
          {content.whatGoodLooksLike.map((vision) => (
            <li
              key={vision}
              className="text-[14px] leading-[1.55] text-[color:var(--color-ink)]/85 flex gap-3"
            >
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
              <span>{vision}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
