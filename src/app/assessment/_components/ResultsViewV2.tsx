'use client';

import { useState } from 'react';
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
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
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

const TOTAL_SCREENS = 6;

const SCREEN_LABELS: ReadonlyArray<string> = [
  'Diagnosis',
  'Gaps',
  'First move',
  'Template',
  '7-day plan',
  'Next step',
];

function rankDimensions(
  dimensionBreakdown: Record<Dimension, DimensionScore>,
): readonly RankedDimension[] {
  return (Object.entries(dimensionBreakdown) as [Dimension, DimensionScore][])
    .filter(([, data]) => data.maxScore > 0)
    .map(([id, data]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: data.score,
      maxScore: data.maxScore,
      pct: data.score / data.maxScore,
    }))
    .sort((a, b) => a.pct - b.pct);
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
  const [step, setStep] = useState(1);
  const ranked = rankDimensions(dimensionBreakdown);
  const persona = PERSONAS[tierId];
  const subjectName = institutionName?.trim() || 'Your institution';
  const topGaps = ranked.slice(0, 2);
  const focusGap = ranked[0] ?? null;
  const fastestRoi = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const starterArtifact = focusGap ? getStarterArtifact(focusGap.id) : null;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_SCREENS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ProgressBar step={step} />

      <div className="min-h-[60vh] mt-10">
        {step === 1 && (
          <ScreenDiagnosis
            persona={persona}
            subjectName={subjectName}
            firstName={firstName ?? null}
            score={score}
            tier={tier}
            insight={BIG_INSIGHT[tierId]}
          />
        )}
        {step === 2 && <ScreenGaps gaps={topGaps} />}
        {step === 3 && fastestRoi && focusGap && (
          <ScreenFirstMove recommendation={fastestRoi} focusGapLabel={focusGap.label} />
        )}
        {step === 4 && starterPrompt && (
          <ScreenArtifact prompt={starterPrompt} artifact={starterArtifact} tierLabel={tier.label} topGapLabel={focusGap?.label ?? ''} />
        )}
        {step === 5 && <ScreenSevenDay />}
        {step === 6 && (
          <ScreenConversion
            mistakeIntro={RECOMMENDED_PATH_INTRO[tierId]}
            email={email}
            score={score}
            tierLabel={tier.label}
            ranked={ranked}
          />
        )}
      </div>

      <ScreenNav step={step} onNext={next} onBack={back} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS BAR
// ---------------------------------------------------------------------------

function ProgressBar({ step }: { readonly step: number }) {
  return (
    <nav aria-label="Results progress" className="flex items-center gap-2">
      {SCREEN_LABELS.map((label, i) => {
        const screenNum = i + 1;
        const isActive = step === screenNum;
        const isComplete = step > screenNum;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex-1">
              <div
                className={`h-1 rounded-sm transition-colors ${
                  isActive || isComplete
                    ? 'bg-[color:var(--color-terra)]'
                    : 'bg-[color:var(--color-ink)]/15'
                }`}
              />
              <p
                className={`hidden md:block mt-2 font-mono text-[9px] uppercase tracking-[0.2em] ${
                  isActive
                    ? 'text-[color:var(--color-terra)]'
                    : isComplete
                      ? 'text-[color:var(--color-ink)]/55'
                      : 'text-[color:var(--color-ink)]/35'
                }`}
              >
                {String(screenNum).padStart(2, '0')} · {label}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// SCREEN NAV — Continue + Back
// ---------------------------------------------------------------------------

const CONTINUE_LABEL: Record<number, string> = {
  1: 'Continue',
  2: 'Show me where to start',
  3: 'Give me the template',
  4: 'What comes next',
  5: 'How to move forward',
};

function ScreenNav({
  step,
  onNext,
  onBack,
}: {
  readonly step: number;
  readonly onNext: () => void;
  readonly onBack: () => void;
}) {
  if (step === TOTAL_SCREENS) {
    return (
      <div className="mt-12 flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-terra)]"
        >
          ← Back
        </button>
      </div>
    );
  }
  return (
    <div className="mt-12 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
      {step > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-terra)] self-start sm:self-auto"
        >
          ← Back
        </button>
      ) : (
        <span aria-hidden />
      )}
      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center justify-between gap-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-7 py-4 font-sans text-[12px] font-semibold uppercase tracking-[1.4px] hover:bg-[color:var(--color-terra-light)] transition-colors group"
      >
        <span>{CONTINUE_LABEL[step] ?? 'Continue'}</span>
        <span aria-hidden className="font-mono transition-transform duration-200 group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCREEN 1 — Diagnosis
// ---------------------------------------------------------------------------

function ScreenDiagnosis({
  persona,
  subjectName,
  firstName,
  score,
  tier,
  insight,
}: {
  readonly persona: { readonly label: string; readonly oneLine: string };
  readonly subjectName: string;
  readonly firstName: string | null;
  readonly score: number;
  readonly tier: Tier;
  readonly insight: string;
}) {
  return (
    <section aria-labelledby="screen-1-heading" className="space-y-8">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        {firstName ? `${firstName.trim()}, your diagnosis` : 'Your diagnosis'}
      </p>

      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2
            id="screen-1-heading"
            className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--color-ink)]"
          >
            {subjectName} is in the{' '}
            <span className="text-[color:var(--color-terra)]">{persona.label}</span>{' '}
            phase.
          </h2>
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
          <ScoreRing
            score={score}
            minScore={12}
            maxScore={48}
            colorVar={tier.colorVar}
            label={tier.label}
          />
        </div>
      </div>

      <div className="bg-[color:var(--color-ink)] text-[color:var(--color-linen)] rounded-[3px] p-7 md:p-8">
        <p className="font-serif text-xl md:text-2xl leading-snug">{insight}</p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SCREEN 2 — What's holding you back (top 2 gaps, terse one-liners)
// ---------------------------------------------------------------------------

function ScreenGaps({ gaps }: { readonly gaps: readonly RankedDimension[] }) {
  return (
    <section aria-labelledby="screen-2-heading" className="space-y-8">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        What is holding you back
      </p>
      <h2 id="screen-2-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
        Two gaps to focus on first.
      </h2>
      <ol className="space-y-6">
        {gaps.map((gap, i) => {
          const content = GAP_CONTENT[gap.id];
          return (
            <li
              key={gap.id}
              className="border-l-4 border-[color:var(--color-error)] pl-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-error)] mb-2">
                Gap {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight">
                {gap.label}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-[color:var(--color-ink)]/80">
                {content.oneLine}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SCREEN 3 — Your first move
// ---------------------------------------------------------------------------

function ScreenFirstMove({
  recommendation,
  focusGapLabel,
}: {
  readonly recommendation: typeof RECOMMENDATIONS[Dimension];
  readonly focusGapLabel: string;
}) {
  return (
    <section aria-labelledby="screen-3-heading" className="space-y-8">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Your first AI move
      </p>
      <h2 id="screen-3-heading" className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--color-ink)]">
        {recommendation.title}.
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
            Why
          </p>
          <ul className="mt-3 space-y-2">
            {recommendation.whyRightNow.map((reason) => (
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
        <div>
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
            What this looks like
          </p>
          <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
            {recommendation.inPractice}
          </p>
          <ul className="mt-3 space-y-1">
            {recommendation.worksBestFor.map((useCase) => (
              <li
                key={useCase}
                className="text-[14px] leading-[1.5] text-[color:var(--color-ink)]/65 flex gap-2"
              >
                <span aria-hidden className="font-mono text-[color:var(--color-terra)]">·</span>
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
        Surfaced by your weakest dimension: {focusGapLabel}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SCREEN 4 — Artifact (collapsible)
// ---------------------------------------------------------------------------

function ScreenArtifact({
  prompt,
  artifact,
  tierLabel,
  topGapLabel,
}: {
  readonly prompt: typeof STARTER_PROMPTS[Dimension];
  readonly artifact: ReturnType<typeof getStarterArtifact> | null;
  readonly tierLabel: string;
  readonly topGapLabel: string;
}) {
  return (
    <section aria-labelledby="screen-4-heading" className="space-y-6">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        The template
      </p>
      <h2 id="screen-4-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
        {prompt.label}.
      </h2>
      <p className="text-[16px] leading-[1.6] text-[color:var(--color-ink)]/80">
        Copy it, paste it into the AI tool you already trust, and run it on a real workflow this week.
      </p>

      <details
        className="group border border-[color:var(--color-ink)]/15 rounded-[3px] bg-[color:var(--color-linen)] overflow-hidden"
        data-print-hide="true"
      >
        <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/70 hover:bg-[color:var(--color-parch)] transition-colors">
          <span>Show starter prompt</span>
          <span aria-hidden className="font-mono text-[12px] transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="p-1">
          <StarterPrompt prompt={prompt} />
        </div>
      </details>

      {artifact && (
        <details className="group border border-[color:var(--color-ink)]/15 rounded-[3px] bg-[color:var(--color-linen)] overflow-hidden" data-print-hide="true">
          <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/70 hover:bg-[color:var(--color-parch)] transition-colors">
            <span>Show printable starter artifact</span>
            <span aria-hidden className="font-mono text-[12px] transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="p-5">
            <StarterArtifactCard artifact={artifact} tierLabel={tierLabel} topGapLabel={topGapLabel} />
          </div>
        </details>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// SCREEN 5 — 7-Day plan
// ---------------------------------------------------------------------------

function ScreenSevenDay() {
  return (
    <section aria-labelledby="screen-5-heading" className="space-y-6">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Your 7-day plan
      </p>
      <h2 id="screen-5-heading" className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
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
  );
}

// ---------------------------------------------------------------------------
// SCREEN 6 — Conversion + appendix
// ---------------------------------------------------------------------------

function ScreenConversion({
  mistakeIntro,
  email,
  score,
  tierLabel,
  ranked,
}: {
  readonly mistakeIntro: string;
  readonly email: string;
  readonly score: number;
  readonly tierLabel: string;
  readonly ranked: readonly RankedDimension[];
}) {
  return (
    <section aria-labelledby="screen-6-heading" className="space-y-10">
      <div>
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          How to move forward
        </p>
        <h2 id="screen-6-heading" className="mt-3 font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]">
          {mistakeIntro}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div className="border-2 border-[color:var(--color-terra)] rounded-[3px] p-6 bg-[color:var(--color-linen)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
            Primary path
          </p>
          <h3 className="mt-2 font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-tight">
            AiBI-P: Banking AI Practitioner
          </h3>
          <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--color-ink)]/80">
            Train your team to use AI safely in under 2 weeks.
          </p>
          <ul className="mt-4 space-y-1.5">
            {['Real workflows', 'Prompt systems', 'SAFE framework'].map((item) => (
              <li
                key={item}
                className="text-[14px] text-[color:var(--color-ink)]/85 flex gap-3"
              >
                <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="/courses/aibi-p"
            className="mt-6 inline-block w-full text-center px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Start Practitioner Training
          </a>
        </div>

        <div className="border border-[color:var(--color-ink)]/20 rounded-[3px] p-6 bg-[color:var(--color-linen)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
            Prefer a guided approach?
          </p>
          <h3 className="mt-2 font-serif text-xl text-[color:var(--color-ink)] leading-tight">
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

      {/* Appendix — full report behind a single expander, terse by default */}
      <details className="group border-t border-[color:var(--color-ink)]/15 pt-6">
        <summary className="cursor-pointer list-none flex items-center justify-between font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/65 hover:text-[color:var(--color-terra)]">
          <span>Full diagnostic · all 8 dimensions</span>
          <span aria-hidden className="font-mono text-[12px] transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-6 space-y-4">
          {ranked.map((dim) => {
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

      <div data-print-hide="true">
        <NewsletterCTA email={email} />
      </div>

      <div className="text-center" data-print-hide="true">
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
          Tier: {tierLabel}
        </p>
        <p>
          aibankinginstitute.com &middot; Request an Executive Briefing to
          discuss your results.
        </p>
      </div>
    </section>
  );
}
