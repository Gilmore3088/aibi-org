'use client';

// ResultsViewV3 — free-flow post-email-capture result surface.
//
// Voice / framing per operator feedback 2026-05-29:
//   - The free result is a snapshot, not a diagnostic. It surfaces 12
//     answers grouped by topic, not the paid 8-dimension scorecard.
//   - Free tells you where to start. Paid tells you how to build the plan.
//   - Free output expanded with takeaways (prompt, helper tool, artifact)
//     rather than dimension scores.
//   - 8-dimension diagnostic + role-specific roadmap + reviewer-ready PDF
//     are explicitly locked behind a "Unlock In-Depth · $99" preview.
//
// Source layout: /Users/jgmbp/Downloads/preview.html (mockup).

import type { Tier, DimensionScore } from '@content/assessments/v3/scoring';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { DIMENSION_LABELS } from '@content/assessments/v3/types';
import type { Dimension } from '@content/assessments/v3/types';
import type { FreeRole } from '@content/assessments/v3/roles';
import { DIMENSION_LABELS as V4_DIMENSION_LABELS } from '@content/assessments/v4/types';
import { PLAYBOOK_INDEX, FREE_ROLE_TO_PLAYBOOK, type RoleSlug } from '@/app/playbooks/data';
import { SiteHeader } from '@/components/mockup';
import { PdfDownloadButton } from './PdfDownloadButton';
import { getStarterArtifact } from '@content/assessments/v3/starter-artifacts';
import {
  formatRoiCurrency,
  formatRoiNumber,
  type RoiAssessmentContext,
} from '@/lib/roi/assessment-context';
import {
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  STAFFING_REALITY,
  TIER_CLOSING_CTA,
} from '@content/assessments/v3/personalization';
import type { FreeAssetBand } from '@content/assessments/v3/asset-bands';

const V3_MAX_SCORE = 48;

interface ResultsViewV3Props {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly email?: string | null;
  readonly firstName?: string | null;
  readonly institutionName?: string | null;
  readonly profileId: string | null;
  /** Free-funnel role the respondent selected at email capture. Drives which
   *  role playbook is flagged as "Best match". Null when the role was skipped. */
  readonly role?: FreeRole | null;
  /** Optional asset band shared at the email gate. Renders the staffing-
   *  reality stripe; context only — never affects the score. */
  readonly assetBand?: FreeAssetBand | null;
  /** Show the "you used a personal email" note above the report. Set on the
   *  immediate post-capture hand-off when a free-mail domain was used. */
  readonly showPersonalEmailNote?: boolean;
  /** Optional calculator context passed from the ROI block into the assessment. */
  readonly roiContext?: RoiAssessmentContext | null;
}

interface RankedSignal {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
}

type SignalBand = 'low' | 'mid' | 'high';

function bandForSignal(s: RankedSignal): SignalBand {
  // 1 / 4 → low, 2-3 / 4 → mid, 4 / 4 → high.
  // The v3 free assessment uses 1-question-per-signal so the band is the
  // raw answer: 1 = "needs structure", 2-3 = "developing", 4 = "strong".
  if (s.score >= 4) return 'high';
  if (s.score <= 1) return 'low';
  // Treat 3 as 'high' so the grid shows clear contrast — the user
  // distinguishing between 2 and 3 deserves the visual recognition.
  return s.score >= 3 ? 'high' : 'mid';
}

function pillFor(band: SignalBand): string {
  if (band === 'high') return 'Strong';
  if (band === 'low') return 'Needs structure';
  return 'Developing';
}

function bandClasses(band: SignalBand): string {
  if (band === 'high') return 'bg-[#F0FDF8] border-[#0E7A5540]';
  if (band === 'low') return 'bg-[#FFF4F3] border-[#B4231840]';
  return 'bg-[#FEF7DA] border-[#B7791F40]';
}

function pillClasses(band: SignalBand): string {
  if (band === 'high') return 'bg-[#D1FADF] text-[#05603A]';
  if (band === 'low') return 'bg-[#FEE4E2] text-[#912018]';
  return 'bg-[#FEF0C7] text-[#93370D]';
}

function barClasses(band: SignalBand): string {
  if (band === 'high') return 'bg-[#0E7A55]';
  if (band === 'low') return 'bg-[#B42318]';
  return 'bg-[#B7791F]';
}

const MISSION_INSTITUTION_PATTERN =
  /\b(mdi|minority depository|cdfi|community development|mission|underserved|low-income|lmi)\b/i;

function missionInstitutionName(institutionName: string | null | undefined): string | null {
  const trimmed = institutionName?.trim();
  if (!trimmed || !MISSION_INSTITUTION_PATTERN.test(trimmed)) return null;
  return trimmed;
}

// Role playbooks are sourced from the single index in app/playbooks/data.ts
// (no more hard-coded card list here). Every free role now resolves to a
// dedicated playbook via FREE_ROLE_TO_PLAYBOOK; 'retail' is the fallback when
// no role was captured. The presentation-only eyebrow tag lives here.
const PLAYBOOK_TAG: Record<RoleSlug, string> = {
  compliance: 'Risk lens',
  retail: 'Frontline',
  marketing: 'Brand safety',
  lending: 'Credit',
  'bsa-aml': 'Surveillance',
  infosec: 'Tool safety',
  executive: 'Direction',
  operations: 'Workflow',
  'training-hr': 'Enablement',
};

// How many playbook cards to surface (best match + the next most useful).
const PLAYBOOK_CARD_LIMIT = 6;

function bestMatchPlaybook(role: FreeRole | null | undefined): RoleSlug {
  return role ? FREE_ROLE_TO_PLAYBOOK[role] : 'retail';
}

export function ResultsViewV3({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  firstName,
  institutionName,
  profileId,
  role,
  assetBand,
  showPersonalEmailNote,
  roiContext,
}: ResultsViewV3Props) {
  // 12 free-question topics, ordered by score ascending so the weakest are easy to find.
  const signals: RankedSignal[] = (
    Object.entries(dimensionBreakdown) as readonly [Dimension, DimensionScore][]
  )
    .map(([id, data]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: data.score,
      maxScore: data.maxScore,
    }))
    .sort((a, b) => a.score - b.score);

  const lowest = signals.filter((s) => s.score <= 2).slice(0, 4);
  const focusGap = signals[0] ?? null;

  const gap = focusGap ? GAP_CONTENT[focusGap.id] : null;
  const recommendation = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const artifact = focusGap ? getStarterArtifact(focusGap.id) : null;
  const cta = TIER_CLOSING_CTA[tierId];

  const matchedPlaybook = bestMatchPlaybook(role);
  const missionName = missionInstitutionName(institutionName);
  const staffingReality = assetBand ? STAFFING_REALITY[assetBand] : null;

  const resultHeadline = firstName?.trim()
    ? `${firstName.trim()}, your result is ${tier.label}.`
    : `Your result: ${tier.label}.`;
  const matchedPlaybookPath = `/playbooks/${matchedPlaybook}`;

  return (
    <>
      <ResultPrintStyles />
      <div className="mockup-scope" data-print-hide="true">
        <SiteHeader
          activePath="/assessment"
          cta={{ label: 'Download report', href: '#download-report' }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto mt-8 space-y-12 px-4 pb-12 md:mt-10 md:space-y-16 md:pb-16 text-[1.0625rem] md:text-[1.125rem]">

      {showPersonalEmailNote && (
        <aside
          aria-label="Personal email notice"
          className="rounded-[20px] border border-[color:var(--gold)] bg-[color:var(--cream)] p-5 md:p-6"
        >
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Note
          </p>
          <p className="mt-2 text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[color:var(--slate-700)]">
            You submitted a personal email. The report below is tailored using the
            institution you provided. If you&rsquo;d prefer follow-up emails to land at
            your work address, just retake the assessment with your work email and
            we&rsquo;ll merge the records.
          </p>
        </aside>
      )}

      {/* HERO */}
      <section
        className="rounded-[30px] bg-[color:var(--ink)] text-white p-7 md:p-10 grid grid-cols-1 xl:grid-cols-[260px_1fr_360px] gap-7 md:gap-9 items-center"
        style={{ boxShadow: 'var(--shadow-hero)' }}
      >
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
            Your score
          </p>
          <p className="mt-4 text-[5.5rem] md:text-[6.75rem] font-bold leading-[0.88] text-[color:var(--gold-soft)] tabular-nums">
            {score}
            <span className="text-[1rem] md:text-[1.125rem] text-white/55 font-normal tracking-normal ml-1">
              / {V3_MAX_SCORE}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
            AI Readiness Snapshot
          </p>
          <h1 className="mt-3 text-[2.25rem] md:text-[3.5rem] font-semibold leading-[1.04] text-white">
            {resultHeadline}
          </h1>
          {gap && (
            <p className="mt-5 text-[1.125rem] md:text-[1.25rem] leading-[1.6] text-white/78 max-w-3xl">
              {gap.oneLine}
            </p>
          )}
        </div>
        <div className="bg-white/8 border border-white/12 rounded-[22px] p-5 md:p-6 space-y-4">
          {focusGap && (
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Top gap
              </p>
              <p className="mt-1.5 text-[1.1875rem] font-semibold text-white">{focusGap.label}</p>
            </div>
          )}
          {recommendation && (
            <div className="border-t border-white/12 pt-3">
              <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Quick win
              </p>
              <p className="mt-1.5 text-[1.1875rem] font-semibold text-white leading-snug">
                {recommendation.title}
              </p>
            </div>
          )}
          {artifact && (
            <div className="border-t border-white/12 pt-3">
              <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Starter template
              </p>
              <p className="mt-1.5 text-[1.125rem] text-white/90 leading-snug">{artifact.title}</p>
            </div>
          )}
        </div>
      </section>

      {roiContext && (
        <RoiContextPanel roiContext={roiContext} />
      )}

      <QuickActionStrip
        matchedPlaybookPath={matchedPlaybookPath}
        profileId={profileId}
      />

      {missionName && (
        <section
          className="rounded-[24px] border border-[color:var(--gold)]/45 bg-[color:var(--cream)] p-6 md:p-7"
          aria-label="Mission lens"
        >
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Mission lens
          </p>
          <h2 className="mt-3 text-[1.75rem] md:text-[2.25rem] font-semibold leading-[1.06] text-[color:var(--ink)]">
            Read this result through {missionName}&rsquo;s capacity and trust goals.
          </h2>
          <p className="mt-4 max-w-4xl text-[1rem] md:text-[1.125rem] leading-[1.65] text-[color:var(--slate-700)]">
            For MDI, CDFI, and community-development institutions, the first AI win should
            not be novelty. Start with an internal workflow that protects member or borrower
            trust, documents human review, and gives staff more time for mission work.
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              'Pick a low-risk internal workflow before any customer-facing use.',
              'Name the human reviewer and keep the reviewed artifact.',
              'Measure recaptured staff time alongside service quality and fairness checks.',
            ].map((item) => (
              <li
                key={item}
                className="rounded-[16px] border border-[color:var(--ink-a10)] bg-white p-4 text-[0.9375rem] leading-[1.55] text-[color:var(--ink)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {staffingReality && (
        <section
          className="rounded-[24px] border border-[color:var(--ink-a10)] bg-[color:var(--cream)] p-6 md:p-7"
          aria-label="Staffing reality"
          data-testid="staffing-reality"
        >
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Staffing reality
          </p>
          <h2 className="mt-3 text-[1.5rem] md:text-[1.875rem] font-semibold leading-[1.1] text-[color:var(--ink)]">
            {staffingReality.headline}
          </h2>
          <p className="mt-4 max-w-4xl text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[color:var(--slate-700)]">
            {staffingReality.body}
          </p>
        </section>
      )}

      {/* FREE SNAPSHOT TOPICS — not the paid 8-dimension diagnostic. */}
      <section className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            12-question snapshot summary
          </p>
          <h2 className="mt-3 text-[2.125rem] md:text-[2.875rem] font-semibold leading-[1.03] text-[color:var(--ink)]">
            Your 12 answers, grouped by topic.
          </h2>
          <p className="mt-5 text-[1.0625rem] md:text-[1.125rem] leading-[1.65] text-[color:var(--slate-600)] max-w-prose">
            The free snapshot uses twelve plain-language questions to estimate
            where to start. The In-Depth Assessment is a separate
            eight-dimension diagnostic for a fuller action plan.
          </p>
          {signals.filter((s) => bandForSignal(s) === bandForSignal(signals[0])).length >= 8 && (
            <p
              data-testid="uniform-band-note"
              className="mt-4 text-[0.9375rem] leading-[1.6] text-[color:var(--slate-600)] max-w-prose"
            >
              Most of your topics landed at the same stage — that&rsquo;s normal
              for a first pass, not a data problem. The one to act on is the top
              gap above; the rest will move together as the basics go in.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {signals.map((s) => {
            const band = bandForSignal(s);
            const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0;
            return (
              <div
                key={s.id}
                className={`rounded-[18px] border p-4 min-h-[132px] flex flex-col justify-between gap-3 ${bandClasses(band)}`}
              >
                <div>
                  <p className="text-[1rem] font-semibold leading-snug text-[color:var(--ink)]">
                    {s.label}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.03em] ${pillClasses(band)}`}
                  >
                    {pillFor(band)}
                  </span>
                </div>
                <div>
                  <p className="text-[1.5rem] font-bold tabular-nums text-[color:var(--ink)]">
                    {s.score}
                    <span className="text-[0.875rem] font-semibold text-[color:var(--slate-500)]">
                      /{s.maxScore}
                    </span>
                  </p>
                  <div
                    className="mt-2 h-2 rounded-full bg-[color:var(--ink-a10)] overflow-hidden"
                    role="progressbar"
                    aria-valuenow={s.score}
                    aria-valuemin={0}
                    aria-valuemax={s.maxScore}
                    aria-label={`${s.label}: ${s.score} of ${s.maxScore}`}
                  >
                    <div
                      className={`h-full rounded-full ${barClasses(band)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SIGNAL DETAIL — collapsed by default. Shows the lowest signals
          with the GAP_CONTENT one-liner so the user understands the band. */}
      {lowest.length > 0 && (
        <details className="bg-white border border-[color:var(--ink-a10)] rounded-[24px] p-5 md:p-6">
          <summary className="font-semibold text-[1.0625rem] cursor-pointer text-[color:var(--ink)]">
            View signal detail
          </summary>
          <div className="mt-4 grid gap-3">
            {lowest.map((s) => {
              const band = bandForSignal(s);
              const c = GAP_CONTENT[s.id];
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3 md:items-center border-t border-[color:var(--ink-a10)] pt-3"
                >
                  <p className="text-[1rem] font-semibold text-[color:var(--ink)]">{s.label}</p>
                  <p className="text-[0.9375rem] md:text-[1rem] text-[color:var(--slate-600)] leading-[1.55]">{c.oneLine}</p>
                  <span
                    className={`inline-block self-start rounded-full px-3 py-1.5 text-[0.75rem] font-semibold ${pillClasses(band)}`}
                  >
                    {pillFor(band)}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* TOP GAP EXPLAINED */}
      {focusGap && gap && (
        <section
          className="rounded-[28px] overflow-hidden bg-white border border-[color:var(--ink-a10)]"
          style={{ boxShadow: 'var(--shadow-soft)' }}
        >
          <div className="bg-[color:var(--ink)] text-white p-6 md:p-8">
            <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              Top gap explained
            </p>
            <h2 className="mt-3 text-[2.125rem] md:text-[2.875rem] font-semibold leading-[1.05] text-white">
              What is {focusGap.label}?
            </h2>
            <p className="mt-5 text-[1.125rem] md:text-[1.25rem] leading-[1.65] text-white/75 max-w-3xl">
              {gap.explanation}
            </p>
          </div>
          <div className="p-6 md:p-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniCard label="What this leads to" items={gap.impacts} />
            <MiniCard label="What good looks like" items={gap.whatGoodLooksLike} />
            <MiniCard
              label="Your first move"
              items={recommendation ? [recommendation.inPractice] : ['Take the first move from your recommended starter artifact.']}
            />
          </div>
        </section>
      )}

      {/* THREE TAKEAWAYS — prompt / helper tool / artifact.
          Per operator: "more takeaways, fewer diagnostic scores." */}
      {focusGap && (
        <section>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Three things you can use this week
          </p>
          <h2 className="mt-3 text-[2.125rem] md:text-[2.875rem] font-semibold leading-[1.03] text-[color:var(--ink)]">
            Not theory. Actual next actions.
          </h2>
          <div className="mt-7 grid md:grid-cols-3 gap-5">
            {/* 1. Prompt to try */}
            {starterPrompt && (
              <article
                className="bg-white border border-[color:var(--ink-a10)] border-t-[6px] border-t-[color:var(--gold)] rounded-[24px] p-6 md:p-7"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <TakeawayNum n={1} />
                <h3 className="mt-4 text-[1.375rem] font-semibold text-[color:var(--ink)]">
                  Prompt to try
                </h3>
                <p className="mt-2 text-[1rem] md:text-[1.0625rem] text-[color:var(--slate-600)] leading-[1.6]">
                  {starterPrompt.label}
                </p>
                <pre className="mt-4 bg-[color:var(--ink)] text-[color:var(--gold-soft)] rounded-[16px] p-4 text-[0.875rem] leading-[1.6] font-mono whitespace-pre-wrap break-words">
                  {starterPrompt.prompt}
                </pre>
              </article>
            )}

            {/* 2. Helper tool */}
            <article
              className="bg-white border border-[color:var(--ink-a10)] border-t-[6px] border-t-[#0E7A55] rounded-[24px] p-6 md:p-7"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <TakeawayNum n={2} />
              <h3 className="mt-4 text-[1.375rem] font-semibold text-[color:var(--ink)]">
                Helper tool
              </h3>
              <p className="mt-2 text-[1rem] md:text-[1.0625rem] text-[color:var(--slate-600)] leading-[1.6]">
                A quick task-fit check before testing any AI workflow.
              </p>
              <ul className="mt-4 pl-5 list-disc text-[1rem] md:text-[1.0625rem] text-[color:var(--slate-600)] leading-[1.7] space-y-1">
                <li>Is the task internal?</li>
                <li>Is the source approved?</li>
                <li>Can a human review it?</li>
                <li>Does it avoid real customer data?</li>
                <li>Can success be measured?</li>
              </ul>
            </article>

            {/* 3. Working artifact */}
            {artifact && (
              <article
                className="bg-white border border-[color:var(--ink-a10)] border-t-[6px] border-t-[#B7791F] rounded-[24px] p-6 md:p-7 flex flex-col"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <TakeawayNum n={3} />
                <h3 className="mt-4 text-[1.375rem] font-semibold text-[color:var(--ink)]">
                  Working artifact
                </h3>
                <p className="mt-2 text-[1rem] md:text-[1.0625rem] text-[color:var(--slate-600)] leading-[1.6]">
                  {artifact.subtitle}
                </p>
                {profileId ? (
                  <div className="mt-auto pt-4">
                    <PdfDownloadButton profileId={profileId} />
                  </div>
                ) : (
                  <div className="mt-auto pt-4" data-print-hide="true">
                    <PrintReportButton label="Print report" />
                  </div>
                )}
              </article>
            )}
          </div>
        </section>
      )}

      {/* 7-DAY PLAN — fully visible. */}
      <section>
        <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          Your 7-day starter plan
        </p>
        <h2 className="mt-3 text-[2.125rem] md:text-[2.625rem] font-semibold leading-[1.03] text-[color:var(--ink)]">
          One small step per day.
        </h2>
        <ol className="mt-7 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {SEVEN_DAY_PLAN.map((d) => (
            <li
              key={d.day}
              className="bg-white border border-[color:var(--ink-a10)] rounded-[18px] p-5"
            >
              <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                Day {d.day}
              </p>
              <p className="mt-2 text-[1rem] leading-[1.6] text-[color:var(--ink)]">{d.action}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 30/60/90 PLAN — phase 1 fully visible; phases 2 + 3 partially
          locked with explicit "Unlocks in In-Depth" framing. */}
      <section>
        <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          30 / 60 / 90 plan
        </p>
        <h2 className="mt-3 max-w-5xl text-[2rem] md:text-[2.625rem] font-semibold leading-[1.04] text-[color:var(--ink)]">
          Start with the first 30 days. Unlock the deployment plan when you need the detail.
        </h2>
        <div className="mt-7 grid items-stretch gap-4 md:grid-cols-3">
          {/* Days 1–30 — fully visible */}
          <div
            className="flex h-full flex-col bg-white border border-[color:var(--gold)]/55 rounded-[24px] p-6 md:p-7"
            style={{ boxShadow: 'var(--shadow-soft)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                  Days 1–30
                </p>
                <h3 className="mt-3 text-[1.4375rem] font-semibold text-[color:var(--ink)]">
                  Map, educate, select
                </h3>
              </div>
              <span className="shrink-0 rounded-full bg-[color:var(--cream)] px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[color:var(--gold-deep)]">
                Included
              </span>
            </div>
            <ul className="mt-5 space-y-3 text-[1rem] md:text-[1.0625rem] leading-[1.55] text-[color:var(--slate-700)]">
              {[
                'Choose one safe internal workflow.',
                'Build a reusable AI working brief.',
                'Apply Green / Yellow / Red data safety and name the reviewer.',
                'Run one low-risk test and measure draft time.',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[color:var(--gold)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-[color:var(--ink-a10)] pt-5" data-print-hide="true">
              <p className="text-[1rem] font-semibold text-[color:var(--ink)]">
                Keep the first 30 days moving.
              </p>
              <div className="mt-3 grid gap-2">
                <ResultActionLink href={matchedPlaybookPath} variant="ink" fullWidth>
                  Open your role playbook
                </ResultActionLink>
                <ResultActionLink href="/assessment/in-depth" variant="gold" fullWidth>
                  Get the 90-day playbook
                </ResultActionLink>
              </div>
            </div>
          </div>

          {/* Days 31–60 — partial visibility, rest locked */}
          <PartialLockedPhase
            label="Days 31–60"
            title="Prototype and secure"
            visibleItem="Turn the tested prompt into a reusable skill."
            lockedItems={[
              'Define allowed and blocked inputs.',
              'Create the workflow SOP.',
              'Track correction rate and reuse count.',
            ]}
          />

          {/* Days 61–90 — partial visibility, rest locked */}
          <PartialLockedPhase
            label="Days 61–90"
            title="Deploy and validate"
            visibleItem="Train one role group on the reviewed workflow."
            lockedItems={[
              'Publish the reviewed artifact.',
              'Report usage and savings.',
              'Decide whether to scale.',
            ]}
          />
        </div>
      </section>

      {/* LOCKED PAID DIAGNOSTIC PREVIEW — explicit upsell.
          The 8 paid dimensions named here so the buyer knows exactly
          what they unlock. */}
      <section
        className="rounded-[28px] bg-[color:var(--ink)] text-white p-7 md:p-10"
        style={{ boxShadow: 'var(--shadow-hero)' }}
      >
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              A separate diagnostic
            </p>
            <h2 className="mt-3 text-[2.125rem] md:text-[2.875rem] font-semibold leading-[1.05] text-white">
              The 8-dimension In-Depth Diagnostic.
            </h2>
            <p className="mt-5 text-[1.125rem] md:text-[1.25rem] leading-[1.65] text-white/75 max-w-3xl">
              The free snapshot you just took is twelve plain-language signals.
              The In-Depth is a separate diagnostic — forty-eight questions
              across eight readiness dimensions, per-dimension root causes, a
              role-specific 30/60/90 playbook, sample prompts, an evidence
              checklist your reviewer can read, and a reviewer-ready report
              you can forward.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/assessment/in-depth"
                className="inline-flex min-h-12 items-center justify-center px-7 py-3.5 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] text-[0.875rem] font-bold uppercase tracking-[0.1em] hover:bg-[color:var(--gold-2)] transition-colors"
              >
                Take the In-Depth · $99
              </a>
              <a
                href={cta.tertiary.href}
                data-plausible-event-source={cta.tertiary.source}
                className="inline-flex min-h-12 items-center justify-center px-7 py-3.5 rounded-full border border-white/30 text-white text-[0.875rem] font-bold uppercase tracking-[0.1em] hover:bg-white/5"
              >
                Or talk to us
              </a>
            </div>
          </div>
          <div className="bg-white/8 border border-white/12 rounded-[24px] p-6 md:p-7">
            <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              8-dimension diagnostic
            </p>
            <ul className="mt-4 space-y-2.5">
              {Object.values(V4_DIMENSION_LABELS).map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-3 text-[1.0625rem] text-white/85"
                >
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold-soft)] shrink-0"
                  />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.9375rem] text-white/65 italic leading-[1.6]">
              Plus role-specific roadmap, sample prompts, evidence checklist,
              and a reviewer-ready PDF.
            </p>
          </div>
        </div>
      </section>

      {/* ROLE PLAYBOOKS — subtle, helpful, not pushy. */}
      <section className="grid md:grid-cols-[0.42fr_0.58fr] gap-6 items-start">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Role playbooks
          </p>
          <h2 className="mt-3 text-[2.125rem] md:text-[2.625rem] font-semibold leading-[1.03] text-[color:var(--ink)]">
            Useful next reads.
          </h2>
          <p className="mt-4 text-[1.0625rem] text-[color:var(--slate-600)] leading-[1.6]">
            Free reading by the seat you sit in — no email gate.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...PLAYBOOK_INDEX]
            // Surface the best-match playbook first, then the rest in index
            // order, capped so the section stays a teaser, not a directory.
            .sort((a, b) => {
              if (a.slug === matchedPlaybook) return -1;
              if (b.slug === matchedPlaybook) return 1;
              return 0;
            })
            .slice(0, PLAYBOOK_CARD_LIMIT)
            .map((p) => {
              const isMatch = p.slug === matchedPlaybook;
              return (
                <PlaybookCard
                  key={p.slug}
                  tag={isMatch ? 'Best match' : PLAYBOOK_TAG[p.slug]}
                  title={p.title}
                  body={p.desc}
                  href={`/playbooks/${p.slug}`}
                  highlight={isMatch}
                />
              );
            })}
        </div>
      </section>
      </div>
    </>
  );
}

function RoiContextPanel({
  roiContext,
}: {
  readonly roiContext: RoiAssessmentContext;
}) {
  return (
    <section className="rounded-[24px] border border-[color:var(--gold)]/35 bg-white p-5 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Your ROI scenario
          </p>
          <h2 className="mt-2 text-[1.5rem] md:text-[2rem] font-semibold leading-tight text-[color:var(--ink)]">
            Keep the value model attached to the readiness work.
          </h2>
          <p className="mt-3 text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[color:var(--slate-600)] max-w-3xl">
            You modeled {formatRoiNumber(roiContext.fte)} employees at{' '}
            {formatRoiCurrency(roiContext.costPerFTE)} loaded cost and{' '}
            {roiContext.loHours}-{roiContext.hiHours} hours per week. The
            assessment below points to the first workflow discipline to improve
            before treating the estimate as achievable.
          </p>
        </div>
        <div className="rounded-[18px] bg-[color:var(--cream)] border border-[color:var(--ink-a10)] p-4 min-w-[240px]">
          <p className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Estimated annual capacity
          </p>
          <p className="mt-2 text-[2rem] font-bold tabular-nums text-[color:var(--ink)]">
            {formatRoiCurrency(roiContext.mid)}
          </p>
          <p className="mt-2 text-[0.8125rem] leading-[1.55] text-[color:var(--slate-600)]">
            Range {formatRoiCurrency(roiContext.low)}-{formatRoiCurrency(roiContext.high)} ·{' '}
            {formatRoiNumber(roiContext.hoursPerYear)} hours/year · ~
            {roiContext.payrollRecaptured}% of payroll.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */

function ResultPrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        @page {
          size: letter;
          margin: 0.55in;
        }

        body {
          background: #ffffff !important;
        }

        main {
          background: #ffffff !important;
          padding: 0 !important;
        }

        [data-print-hide='true'] {
          display: none !important;
        }
      }
    `}</style>
  );
}

function QuickActionStrip({
  matchedPlaybookPath,
  profileId,
}: {
  readonly matchedPlaybookPath: string;
  readonly profileId: string | null;
}) {
  return (
    <section
      id="download-report"
      className="grid gap-4 rounded-[26px] border border-[color:var(--ink-a10)] bg-white p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6"
      style={{ boxShadow: 'var(--shadow-soft)' }}
      data-print-hide="true"
      aria-label="Recommended next actions"
    >
      <div>
        <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          Start here
        </p>
        <h2 className="mt-2 text-[1.5rem] md:text-[1.875rem] font-semibold leading-tight text-[color:var(--ink)]">
          Turn the snapshot into one visible next move.
        </h2>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <ResultActionLink href={matchedPlaybookPath} variant="ink">
          Open role playbook
        </ResultActionLink>
        {profileId ? (
          <PdfDownloadButton
            profileId={profileId}
            compact
            label="Download report"
          />
        ) : (
          <PrintReportButton compact label="Print report" />
        )}
        <ResultActionLink href="/assessment/in-depth" variant="gold">
          Get 90-day playbook
        </ResultActionLink>
      </div>
    </section>
  );
}

function PrintReportButton({
  compact = false,
  label,
}: {
  readonly compact?: boolean;
  readonly label: string;
}) {
  const classes = compact
    ? 'inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--ink-a15)] bg-white px-5 py-2.5 text-[0.875rem] font-bold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]'
    : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[color:var(--ink-a15)] bg-white px-6 py-3 font-sans text-[0.875rem] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]';

  return (
    <button
      type="button"
      data-print-hide="true"
      className={classes}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}

function ResultActionLink({
  href,
  variant,
  fullWidth = false,
  children,
}: {
  readonly href: string;
  readonly variant: 'ink' | 'gold';
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
}) {
  const classes =
    variant === 'ink'
      ? 'bg-[color:var(--ink)] !text-white hover:bg-[color:var(--ink)]/90'
      : 'bg-[color:var(--gold)] !text-[color:var(--ink)] hover:bg-[color:var(--gold-2)]';

  return (
    <Link
      href={href}
      className={`${fullWidth ? 'flex w-full' : 'inline-flex'} min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center text-[0.875rem] font-bold no-underline transition-colors ${classes}`}
    >
      {children}
    </Link>
  );
}

function MiniCard({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
  return (
    <div className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[20px] p-5 md:p-6">
      <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
        {label}
      </p>
      <ul className="mt-4 space-y-2 text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[color:var(--slate-700)]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TakeawayNum({ n }: { readonly n: number }) {
  return (
    <span className="inline-grid place-items-center w-10 h-10 rounded-[12px] bg-[color:var(--cream)] text-[color:var(--gold-deep)] font-bold text-[0.9375rem]">
      {n}
    </span>
  );
}

function PartialLockedPhase({
  label,
  title,
  visibleItem,
  lockedItems,
}: {
  readonly label: string;
  readonly title: string;
  readonly visibleItem: string;
  readonly lockedItems: readonly string[];
}) {
  return (
    <div
      className="flex h-full flex-col bg-white border border-[color:var(--ink-a10)] rounded-[24px] p-6 md:p-7"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            {label}
          </p>
          <h3 className="mt-3 text-[1.4375rem] font-semibold text-[color:var(--ink)]">
            {title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-[color:var(--ink-a10)] px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[color:var(--slate-500)]">
          Paid
        </span>
      </div>
      <div className="mt-5 bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[16px] p-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--gold-deep)]">
          Preview
        </p>
        <p className="text-[1rem] md:text-[1.0625rem] font-semibold text-[color:var(--ink)] leading-[1.5]">
          {visibleItem}
        </p>
      </div>
      <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-[1.55] text-[color:var(--slate-600)]">
        {lockedItems.map((item, i) => (
          <li key={i} className="flex items-center gap-3 rounded-[14px] border border-[color:var(--ink-a10)] bg-white px-3.5 py-3">
            <span className="rounded-full bg-[color:var(--cream)] px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[color:var(--gold-deep)]">
              Locked
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto bg-[color:var(--ink)] !text-white rounded-[16px] p-4 text-center">
        <p className="text-[1rem] font-semibold !text-white">Detailed in the In-Depth</p>
        <p className="mt-1.5 text-[0.875rem] !text-white/75">The 8-dimension diagnostic carries this through with deployment specifics.</p>
      </div>
    </div>
  );
}

function PlaybookCard({
  tag,
  title,
  body,
  href,
  highlight,
}: {
  readonly tag: string;
  readonly title: string;
  readonly body: string;
  readonly href: string;
  readonly highlight?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block bg-white rounded-[20px] p-5 md:p-6 transition-colors hover:bg-[color:var(--cream)] ${
        highlight
          ? 'border-2 border-[color:var(--gold)] shadow-[0_0_0_4px_rgba(200,162,74,0.12)]'
          : 'border border-[color:var(--ink-a10)]'
      }`}
    >
      <span className="inline-flex rounded-full bg-[color:var(--cream)] px-3 py-1.5 text-[0.75rem] font-bold text-[color:var(--gold-deep)] uppercase tracking-[0.1em]">
        {tag}
      </span>
      <h3 className="mt-4 text-[1.3125rem] font-semibold text-[color:var(--ink)]">{title}</h3>
      <p className="mt-2 text-[1rem] text-[color:var(--slate-600)] leading-[1.6]">{body}</p>
    </a>
  );
}
