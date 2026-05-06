'use client';

import Link from 'next/link';
import type { Tier } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import { ScoreRing } from './ScoreRing';
import { NewsletterCTA } from './NewsletterCTA';
import { PdfDownloadButton } from './PdfDownloadButton';
import { StarterArtifactCard } from './StarterArtifactCard';
import { StarterPrompt } from './StarterPrompt';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import {
  PERSONAS,
  BIG_INSIGHT,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FINANCIAL_IMPLICATIONS,
  TIER_CLOSING_CTA,
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
  readonly profileId: string | null;
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
  profileId,
}: ResultsViewV2Props) {
  const persona = PERSONAS[tierId];
  const subjectName = institutionName?.trim() || 'Your institution';
  const grouped = groupDimensions(dimensionBreakdown);
  const focusGap =
    grouped.critical[0] ?? grouped.developing[0] ?? grouped.all[0] ?? null;
  const fastestRoi = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const starterArtifact = focusGap ? getStarterArtifact(focusGap.id) : null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Quick Read — score + tier + ONE sentence + ONE CTA above the fold.
          Replaces the previous multi-section "executive briefing" preamble.
          The full briefing remains below for visitors who want depth. */}
      <section
        aria-labelledby="quick-read-heading"
        className="mb-14 pb-10 border-b border-[color:var(--color-ink)]/15"
        style={{ animation: 'fadeInUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3">
          AI Readiness · {BRIEFING_DATE_FORMATTER.format(new Date())}
        </p>

        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center mb-8">
          <div>
            <h1
              id="quick-read-heading"
              className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--color-ink)]"
            >
              {firstName ? `${firstName.trim()}, ` : ''}
              {subjectName.toLowerCase() === 'your institution' ? 'your institution' : subjectName}{' '}
              is in the{' '}
              <span className="text-[color:var(--color-terra)]">{persona.label}</span>{' '}
              phase.
            </h1>
            <p className="mt-5 text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed max-w-xl">
              {persona.oneLine}
            </p>
          </div>
          <div className="md:flex-shrink-0 md:order-last">
            <ScoreRing
              score={score}
              minScore={12}
              maxScore={48}
              colorVar={tier.colorVar}
              label={tier.label}
            />
          </div>
        </div>

        {/* Single primary CTA — the tier-keyed closing action.
            Section 9 below repeats it in context for visitors who scroll
            through the full briefing. */}
        <a
          href={TIER_CLOSING_CTA[tierId].ctaHref}
          data-print-hide="true"
          onClick={() => {
            if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
              window.plausible('quick_read_cta_click', {
                props: {
                  tier: tierId,
                  destination: TIER_CLOSING_CTA[tierId].ctaHref,
                },
              });
            }
          }}
          className="inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
        >
          {TIER_CLOSING_CTA[tierId].ctaLabel}
        </a>

        <p
          className="mt-6 font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55"
          data-print-hide="true"
        >
          <a
            href="#section-2"
            className="hover:text-[color:var(--color-terra)] transition-colors"
          >
            See the full briefing ↓ <span className="font-mono">5 min</span>
          </a>
        </p>
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
        <ContinueLink to="section-4" label="Where you're strong vs exposed" />
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

      {/* In-Depth Assessment soft CTA */}
      <aside
        aria-labelledby="indepth-cta-heading"
        className="mt-12 border border-[color:var(--color-terra)]/30 bg-[color:var(--color-parch)] p-8 rounded-[3px]"
      >
        <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
          Want the full picture?
        </p>
        <h3
          id="indepth-cta-heading"
          className="font-serif text-xl text-[color:var(--color-ink)] leading-tight"
        >
          The In-Depth Assessment is 48 questions across all 8 dimensions
        </h3>
        <p className="mt-3 font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
          The same diagnostic, full depth — every dimension scored independently,
          with peer comparison and a 30-day action plan keyed to your lowest-scoring
          dimensions. $99 individual, $79 per seat for institutions of 10+.
        </p>
        <Link
          href="/assessment/in-depth"
          className="mt-5 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
        >
          See the In-Depth Assessment →
        </Link>
      </aside>

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

      {/* SECTION 9 — Closing CTA (tier-keyed, single card) */}
      <SectionAnchor id="section-9" />
      <section aria-labelledby="section-9-heading" className="space-y-6">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          {TIER_CLOSING_CTA[tierId].eyebrow}
        </p>
        <h2
          id="section-9-heading"
          className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
        >
          {TIER_CLOSING_CTA[tierId].headline}
        </h2>
        <article className="border-2 border-[color:var(--color-terra)] rounded-[3px] p-6 md:p-8 bg-[color:var(--color-linen)]">
          <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
            {TIER_CLOSING_CTA[tierId].body}
          </p>
          <a
            href={TIER_CLOSING_CTA[tierId].ctaHref}
            data-print-hide="true"
            onClick={() => {
              if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
                window.plausible('closing_cta_click', {
                  props: {
                    tier: tierId,
                    destination: TIER_CLOSING_CTA[tierId].ctaHref,
                  },
                });
              }
            }}
            className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            {TIER_CLOSING_CTA[tierId].ctaLabel}
          </a>
        </article>
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

      {profileId ? <PdfDownloadButton profileId={profileId} email={email} /> : null}
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
