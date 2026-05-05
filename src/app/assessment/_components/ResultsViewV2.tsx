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
import { SevenDayPlan } from './SevenDayPlan';
import { FutureVision } from './FutureVision';
import { FooterClose } from './FooterClose';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import {
  PERSONAS,
  BIG_INSIGHT,
  TIER_INSIGHTS,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  RECOMMENDED_PATH_INTRO,
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

// Group every dimension by performance — Critical (<50%), Developing (50–74%),
// Strong (≥75%). Sorted within each bucket low→high so the most actionable
// items lead. Matches the spec's Section 3 grouping.
function groupDimensions(
  dimensionBreakdown: Record<Dimension, DimensionScore>,
): {
  readonly critical: readonly RankedDimension[];
  readonly developing: readonly RankedDimension[];
  readonly strong: readonly RankedDimension[];
} {
  const ranked: RankedDimension[] = (Object.entries(dimensionBreakdown) as [Dimension, DimensionScore][])
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
    critical: ranked.filter((d) => d.pct < 0.5),
    developing: ranked.filter((d) => d.pct >= 0.5 && d.pct < 0.75),
    strong: ranked.filter((d) => d.pct >= 0.75),
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
  const dimensions = Object.entries(dimensionBreakdown) as [Dimension, DimensionScore][];
  const persona = PERSONAS[tierId];
  const subjectName = institutionName?.trim() || 'Your institution';
  const grouped = groupDimensions(dimensionBreakdown);
  // Top critical gap drives the recommendation, the starter prompt, and the
  // starter artifact. Fall back to the lowest dimension if no critical gaps.
  const focusGap =
    grouped.critical[0] ??
    grouped.developing[0] ??
    grouped.strong[grouped.strong.length - 1] ??
    null;
  const fastestRoi = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const starterArtifact = focusGap ? getStarterArtifact(focusGap.id) : null;
  const insightBullets = TIER_INSIGHTS[tierId];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-16">
      {/* Confirmation header */}
      <div className="text-center" data-print-hide="true">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
          {firstName ? `${firstName.trim()}, your AI Readiness Results` : 'Your AI Readiness Results'}
        </p>
        <p className="text-sm text-[color:var(--color-ink)]/70">
          Results delivered to {email}
        </p>
      </div>

      {/* SECTION 1 — Hero Diagnosis */}
      <section className="grid gap-8 md:gap-12 md:grid-cols-[1fr_auto] md:items-center print-avoid-break">
        <div>
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Diagnosis
          </p>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)] mt-3">
            {subjectName} is in the{' '}
            <span className="text-[color:var(--color-terra)]">{persona.label}</span>{' '}
            phase.
          </h2>
          <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed mt-4 max-w-xl">
            {persona.oneLine}
          </p>
          <div className="mt-5 inline-flex items-baseline gap-3 border border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)] px-4 py-3 rounded-[2px]">
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
        <div className="md:order-last md:flex-shrink-0">
          <ScoreRing
            score={score}
            minScore={12}
            maxScore={48}
            colorVar={tier.colorVar}
            label={tier.label}
          />
        </div>
      </section>

      {/* SECTION 2 — Big Insight (the hook) */}
      <section className="bg-[color:var(--color-ink)] text-[color:var(--color-linen)] rounded-[3px] p-8 md:p-10 print-avoid-break">
        <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra-pale)] mb-4">
          The big insight
        </p>
        <p className="font-serif text-2xl md:text-3xl leading-snug">
          {BIG_INSIGHT[tierId]}
        </p>
      </section>

      {/* SECTION 3 — What This Means */}
      <section className="border-l-2 border-[color:var(--color-terra)] pl-5 print-avoid-break">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
          What this means
        </p>
        <p className="text-[color:var(--color-ink)]/80 mb-4">
          In practice, this typically shows up as:
        </p>
        <ul className="space-y-3">
          {insightBullets.map((bullet) => (
            <li
              key={bullet}
              className="text-base text-[color:var(--color-ink)]/85 leading-relaxed flex gap-3"
            >
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 4 — Where You're Strong vs Exposed */}
      <section className="space-y-10 print-avoid-break">
        <h2 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight">
          Where you&apos;re strong vs exposed.
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
                  className="flex items-baseline justify-between border border-[color:var(--color-ink)]/10 rounded-[3px] px-4 py-3 bg-[color:var(--color-linen)]"
                >
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">
                    {dim.label}
                  </span>
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
                    <span className="font-serif text-lg text-[color:var(--color-ink)]">
                      {strength.label}
                    </span>
                    <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                      {strength.score}/{strength.maxScore}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--color-ink)]/70 leading-relaxed">
                    You already have a foundation here. This will accelerate your ability to adopt AI once the rest of the structure is in place.
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* SECTION 5 — Fastest ROI Opportunity */}
      {fastestRoi && focusGap && (
        <section
          className="bg-[color:var(--color-parch)] border-2 border-[color:var(--color-terra)]/40 rounded-[3px] p-8 md:p-10 print-avoid-break"
          aria-label="Your fastest ROI opportunity"
        >
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Your fastest ROI opportunity
          </p>
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-2">
            Your first AI move
          </p>
          <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight">
            Start with {fastestRoi.title}.
          </h3>

          <p className="mt-5 font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
            Why this is the right starting point
          </p>
          <ul className="mt-2 space-y-1.5">
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

          <div className="mt-6 border-l-2 border-[color:var(--color-ink)]/20 pl-5">
            <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
              What this looks like in practice
            </p>
            <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
              {fastestRoi.inPractice}
            </p>
          </div>

          <p className="mt-5 font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
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

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-[color:var(--color-ink)]/10 text-sm">
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
        </section>
      )}

      {/* SECTION 6 — Interactive Starter Prompt */}
      {starterPrompt && <StarterPrompt prompt={starterPrompt} />}

      {/* Tailored starter artifact — banker-facing markdown they can take to a colleague this week. */}
      {starterArtifact && focusGap && (
        <StarterArtifactCard
          artifact={starterArtifact}
          tierLabel={tier.label}
          topGapLabel={focusGap.label}
        />
      )}

      {/* SECTION 7 — 7-Day Activation Plan */}
      <SevenDayPlan />

      {/* SECTION 8 — What Good Looks Like */}
      <FutureVision />

      {/* SECTION 9 — Recommended Path (Conversion) */}
      <section
        className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/15 rounded-[3px] p-8 md:p-10"
        data-print-hide="true"
        aria-labelledby="recommended-path-heading"
      >
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
          How to move forward from here
        </p>
        <h3
          id="recommended-path-heading"
          className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight"
        >
          {RECOMMENDED_PATH_INTRO[tierId]}
        </h3>

        <div className="mt-8 grid gap-6 md:grid-cols-[3fr_2fr]">
          {/* Primary CTA — Education */}
          <div className="border-2 border-[color:var(--color-terra)] rounded-[3px] p-6 bg-[color:var(--color-linen)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-2">
              Primary path
            </p>
            <h4 className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight">
              AiBI-P: Banking AI Practitioner
            </h4>
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

          {/* Secondary CTA — Advisory */}
          <div className="border border-[color:var(--color-ink)]/20 rounded-[3px] p-6 bg-[color:var(--color-linen)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-2">
              Prefer a guided approach?
            </p>
            <h4 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight">
              Executive Briefing
            </h4>
            <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
              We can walk through your results with your leadership team and define a structured AI rollout plan.
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

      {/* Dimension breakdown — full transparency */}
      <section className="print-avoid-break">
        <h3 className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
          Your full dimension breakdown
        </h3>
        <div className="space-y-4">
          {dimensions.map(([dim, data]) => {
            const pct = data.maxScore > 0 ? data.score / data.maxScore : 0;
            const filledBars = data.maxScore > 0 ? Math.round(pct * 4) : 0;
            return (
              <div key={dim} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">
                    {DIMENSION_LABELS[dim]}
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
      </section>

      {/* SECTION 10 — Footer Close */}
      <FooterClose />

      {/* Newsletter */}
      <div data-print-hide="true">
        <NewsletterCTA email={email} />
      </div>

      {/* Download */}
      <div className="text-center" data-print-hide="true">
        <PrintButton />
        <p className="font-mono text-[10px] text-[color:var(--color-slate)] mt-3">
          Use your browser&rsquo;s &ldquo;Save as PDF&rdquo; option from the
          print dialog to save a copy for your team.
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

interface GapCardProps {
  readonly gap: RankedDimension;
}

function GapCard({ gap }: GapCardProps) {
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
