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
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  TIER_CLOSING_CTA,
} from '@content/assessments/v3/personalization';

const V3_MAX_SCORE = 48;

interface ResultsViewV3Props {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly email: string;
  readonly firstName?: string | null;
  readonly institutionName?: string | null;
  readonly profileId: string | null;
  /** Free-funnel role the respondent selected at email capture. Drives which
   *  role playbook is flagged as "Best match". Null when the role was skipped. */
  readonly role?: FreeRole | null;
  /** Show the "you used a personal email" note above the report. Set on the
   *  immediate post-capture hand-off when a free-mail domain was used. */
  readonly showPersonalEmailNote?: boolean;
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
  profileId,
  role,
  showPersonalEmailNote,
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

      <div className="w-full max-w-7xl mx-auto mt-8 space-y-12 px-4 pb-12 md:mt-10 md:space-y-16 md:pb-16 text-[17px] md:text-[18px]">

      {showPersonalEmailNote && (
        <aside
          aria-label="Personal email notice"
          className="rounded-[20px] border border-[color:var(--gold)] bg-[color:var(--cream)] p-5 md:p-6"
        >
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Note
          </p>
          <p className="mt-2 text-[16px] md:text-[17px] leading-[1.65] text-[color:var(--slate-700)]">
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
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
            Your score
          </p>
          <p className="mt-4 text-[88px] md:text-[108px] font-bold leading-[0.88] text-[color:var(--gold-soft)] tabular-nums">
            {score}
            <span className="text-[16px] md:text-[18px] text-white/55 font-normal tracking-normal ml-1">
              / {V3_MAX_SCORE}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
            AI Readiness Snapshot
          </p>
          <h1 className="mt-3 text-[36px] md:text-[56px] font-semibold leading-[1.04] text-white">
            {resultHeadline}
          </h1>
          {gap && (
            <p className="mt-5 text-[18px] md:text-[20px] leading-[1.6] text-white/78 max-w-3xl">
              {gap.oneLine}
            </p>
          )}
        </div>
        <div className="bg-white/8 border border-white/12 rounded-[22px] p-5 md:p-6 space-y-4">
          {focusGap && (
            <div>
              <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Top gap
              </p>
              <p className="mt-1.5 text-[19px] font-semibold text-white">{focusGap.label}</p>
            </div>
          )}
          {recommendation && (
            <div className="border-t border-white/12 pt-3">
              <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Quick win
              </p>
              <p className="mt-1.5 text-[19px] font-semibold text-white leading-snug">
                {recommendation.title}
              </p>
            </div>
          )}
          {artifact && (
            <div className="border-t border-white/12 pt-3">
              <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Starter artifact
              </p>
              <p className="mt-1.5 text-[18px] text-white/90 leading-snug">{artifact.title}</p>
            </div>
          )}
        </div>
      </section>

      <QuickActionStrip
        matchedPlaybookPath={matchedPlaybookPath}
        profileId={profileId}
      />

      {/* FREE SNAPSHOT TOPICS — not the paid 8-dimension diagnostic. */}
      <section className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            12-question snapshot summary
          </p>
          <h2 className="mt-3 text-[34px] md:text-[46px] font-semibold leading-[1.03] text-[color:var(--ink)]">
            Your 12 answers, grouped by topic.
          </h2>
          <p className="mt-5 text-[17px] md:text-[18px] leading-[1.65] text-[color:var(--slate-600)] max-w-prose">
            The free snapshot uses twelve plain-language questions to estimate
            where to start. The In-Depth Assessment is a separate
            eight-dimension diagnostic for a fuller action plan.
          </p>
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
                  <p className="text-[16px] font-semibold leading-snug text-[color:var(--ink)]">
                    {s.label}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] ${pillClasses(band)}`}
                  >
                    {pillFor(band)}
                  </span>
                </div>
                <div>
                  <p className="text-[24px] font-bold tabular-nums text-[color:var(--ink)]">
                    {s.score}
                    <span className="text-[14px] font-semibold text-[color:var(--slate-500)]">
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
          <summary className="font-semibold text-[17px] cursor-pointer text-[color:var(--ink)]">
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
                  <p className="text-[16px] font-semibold text-[color:var(--ink)]">{s.label}</p>
                  <p className="text-[15px] md:text-[16px] text-[color:var(--slate-600)] leading-[1.55]">{c.oneLine}</p>
                  <span
                    className={`inline-block self-start rounded-full px-3 py-1.5 text-[12px] font-semibold ${pillClasses(band)}`}
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
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              Top gap explained
            </p>
            <h2 className="mt-3 text-[34px] md:text-[46px] font-semibold leading-[1.05] text-white">
              What is {focusGap.label}?
            </h2>
            <p className="mt-5 text-[18px] md:text-[20px] leading-[1.65] text-white/75 max-w-3xl">
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
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Three things you can use this week
          </p>
          <h2 className="mt-3 text-[34px] md:text-[46px] font-semibold leading-[1.03] text-[color:var(--ink)]">
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
                <h3 className="mt-4 text-[22px] font-semibold text-[color:var(--ink)]">
                  Prompt to try
                </h3>
                <p className="mt-2 text-[16px] md:text-[17px] text-[color:var(--slate-600)] leading-[1.6]">
                  {starterPrompt.label}
                </p>
                <pre className="mt-4 bg-[color:var(--ink)] text-[color:var(--gold-soft)] rounded-[16px] p-4 text-[14px] leading-[1.6] font-mono whitespace-pre-wrap break-words">
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
              <h3 className="mt-4 text-[22px] font-semibold text-[color:var(--ink)]">
                Helper tool
              </h3>
              <p className="mt-2 text-[16px] md:text-[17px] text-[color:var(--slate-600)] leading-[1.6]">
                A quick task-fit check before testing any AI workflow.
              </p>
              <ul className="mt-4 pl-5 list-disc text-[16px] md:text-[17px] text-[color:var(--slate-600)] leading-[1.7] space-y-1">
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
                <h3 className="mt-4 text-[22px] font-semibold text-[color:var(--ink)]">
                  Working artifact
                </h3>
                <p className="mt-2 text-[16px] md:text-[17px] text-[color:var(--slate-600)] leading-[1.6]">
                  {artifact.subtitle}
                </p>
                {profileId && (
                  <div className="mt-auto pt-4">
                    <PdfDownloadButton profileId={profileId} />
                  </div>
                )}
              </article>
            )}
          </div>
        </section>
      )}

      {/* 7-DAY PLAN — fully visible. */}
      <section>
        <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          Your 7-day starter plan
        </p>
        <h2 className="mt-3 text-[34px] md:text-[42px] font-semibold leading-[1.03] text-[color:var(--ink)]">
          One small step per day.
        </h2>
        <ol className="mt-7 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {SEVEN_DAY_PLAN.map((d) => (
            <li
              key={d.day}
              className="bg-white border border-[color:var(--ink-a10)] rounded-[18px] p-5"
            >
              <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                Day {d.day}
              </p>
              <p className="mt-2 text-[16px] leading-[1.6] text-[color:var(--ink)]">{d.action}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 30/60/90 PLAN — phase 1 fully visible; phases 2 + 3 partially
          locked with explicit "Unlocks in In-Depth" framing. */}
      <section>
        <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          30 / 60 / 90 plan
        </p>
        <h2 className="mt-3 text-[34px] md:text-[46px] font-semibold leading-[1.03] text-[color:var(--ink)]">
          Free shows the path. Paid unlocks the deployment detail.
        </h2>
        <div className="mt-7 grid md:grid-cols-3 gap-4">
          {/* Days 1–30 — fully visible */}
          <div
            className="bg-white border border-[color:var(--ink-a10)] rounded-[24px] p-6 md:p-7"
            style={{ boxShadow: 'var(--shadow-soft)' }}
          >
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
              Days 1–30
            </p>
            <h3 className="mt-3 text-[23px] font-semibold text-[color:var(--ink)]">
              Map, educate, select
            </h3>
            <ul className="mt-4 pl-5 list-disc text-[16px] md:text-[17px] text-[color:var(--slate-600)] leading-[1.7] space-y-1">
              <li>Choose one safe internal workflow.</li>
              <li>Build your reusable AI working brief.</li>
              <li>Apply Green / Yellow / Red data safety.</li>
              <li>Name the human reviewer.</li>
              <li>Run one low-risk test and measure draft time.</li>
            </ul>
            <div className="mt-6 border-t border-[color:var(--ink-a10)] pt-5" data-print-hide="true">
              <p className="text-[16px] font-semibold text-[color:var(--ink)]">
                Keep the first 30 days moving.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ResultActionLink href={matchedPlaybookPath} variant="ink">
                  Open your role playbook
                </ResultActionLink>
                <ResultActionLink href="/assessment/in-depth" variant="gold">
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
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              A separate diagnostic
            </p>
            <h2 className="mt-3 text-[34px] md:text-[46px] font-semibold leading-[1.05] text-white">
              The 8-dimension In-Depth Diagnostic.
            </h2>
            <p className="mt-5 text-[18px] md:text-[20px] leading-[1.65] text-white/75 max-w-3xl">
              The free snapshot you just took is twelve plain-language signals.
              The In-Depth is a separate diagnostic — forty-eight questions
              across eight readiness dimensions, peer-band comparison, a
              role-specific 30/60/90 playbook, sample prompts, an evidence
              checklist your reviewer can read, and a reviewer-ready report
              you can forward.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/assessment/in-depth"
                className="inline-flex min-h-12 items-center justify-center px-7 py-3.5 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] text-[14px] font-bold uppercase tracking-[0.1em] hover:bg-[color:var(--gold-2)] transition-colors"
              >
                Take the In-Depth · $99
              </a>
              <a
                href={cta.tertiary.href}
                data-plausible-event-source={cta.tertiary.source}
                className="inline-flex min-h-12 items-center justify-center px-7 py-3.5 rounded-full border border-white/30 text-white text-[14px] font-bold uppercase tracking-[0.1em] hover:bg-white/5"
              >
                Or talk to us
              </a>
            </div>
          </div>
          <div className="bg-white/8 border border-white/12 rounded-[24px] p-6 md:p-7">
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              8-dimension diagnostic
            </p>
            <ul className="mt-4 space-y-2.5">
              {Object.values(V4_DIMENSION_LABELS).map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-3 text-[17px] text-white/85"
                >
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold-soft)] shrink-0"
                  />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px] text-white/65 italic leading-[1.6]">
              Plus role-specific roadmap, sample prompts, evidence checklist,
              and a reviewer-ready PDF.
            </p>
          </div>
        </div>
      </section>

      {/* ROLE PLAYBOOKS — subtle, helpful, not pushy. */}
      <section className="grid md:grid-cols-[0.42fr_0.58fr] gap-6 items-start">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Role playbooks
          </p>
          <h2 className="mt-3 text-[34px] md:text-[42px] font-semibold leading-[1.03] text-[color:var(--ink)]">
            Useful next reads.
          </h2>
          <p className="mt-4 text-[17px] text-[color:var(--slate-600)] leading-[1.6]">
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
        <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          Start here
        </p>
        <h2 className="mt-2 text-[24px] md:text-[30px] font-semibold leading-tight text-[color:var(--ink)]">
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
        ) : null}
        <ResultActionLink href="/assessment/in-depth" variant="gold">
          Get 90-day playbook
        </ResultActionLink>
      </div>
    </section>
  );
}

function ResultActionLink({
  href,
  variant,
  children,
}: {
  readonly href: string;
  readonly variant: 'ink' | 'gold';
  readonly children: ReactNode;
}) {
  const classes =
    variant === 'ink'
      ? 'bg-[color:var(--ink)] text-white hover:bg-[color:var(--ink)]/90'
      : 'bg-[color:var(--gold)] text-[color:var(--ink)] hover:bg-[color:var(--gold-2)]';

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-[14px] font-bold no-underline transition-colors ${classes}`}
    >
      {children}
    </Link>
  );
}

function MiniCard({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
  return (
    <div className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[20px] p-5 md:p-6">
      <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
        {label}
      </p>
      <ul className="mt-4 space-y-2 text-[16px] md:text-[17px] leading-[1.65] text-[color:var(--slate-700)]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TakeawayNum({ n }: { readonly n: number }) {
  return (
    <span className="inline-grid place-items-center w-10 h-10 rounded-[12px] bg-[color:var(--cream)] text-[color:var(--gold-deep)] font-bold text-[15px]">
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
      className="bg-white border border-[color:var(--ink-a10)] rounded-[24px] p-6 md:p-7 relative overflow-hidden"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
        {label}
      </p>
      <h3 className="mt-3 text-[23px] font-semibold text-[color:var(--ink)]">
        {title}
      </h3>
      <div className="mt-5 bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[16px] p-4">
        <p className="text-[16px] md:text-[17px] font-semibold text-[color:var(--ink)] leading-[1.5]">
          {visibleItem}
        </p>
      </div>
      <ul
        aria-hidden="true"
        className="mt-4 pl-5 list-disc text-[16px] text-[color:var(--slate-600)] leading-[1.7] space-y-1 select-none"
        style={{ filter: 'blur(2.5px)', opacity: 0.5 }}
      >
        {lockedItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="mt-4 bg-[color:var(--ink)] text-white rounded-[14px] p-4 text-center">
        <p className="text-[16px] font-semibold">Detailed in the In-Depth</p>
        <p className="mt-1.5 text-[14px] text-white/70">The 8-dimension diagnostic carries this through with deployment specifics.</p>
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
      <span className="inline-flex rounded-full bg-[color:var(--cream)] px-3 py-1.5 text-[12px] font-bold text-[color:var(--gold-deep)] uppercase tracking-[0.1em]">
        {tag}
      </span>
      <h3 className="mt-4 text-[21px] font-semibold text-[color:var(--ink)]">{title}</h3>
      <p className="mt-2 text-[16px] text-[color:var(--slate-600)] leading-[1.6]">{body}</p>
    </a>
  );
}
