'use client';

// ResultsViewV3 — free-flow post-email-capture result surface.
//
// Voice / framing per operator feedback 2026-05-29:
//   - The free result is a snapshot, not a diagnostic. It surfaces 12
//     readiness signals (not the paid 8-dimension scorecard).
//   - Free tells you where to start. Paid tells you how to build the plan.
//   - Free output expanded with takeaways (prompt, helper tool, artifact)
//     rather than dimension scores.
//   - 8-dimension diagnostic + role-specific roadmap + reviewer-ready PDF
//     are explicitly locked behind a "Unlock In-Depth · $99" preview.
//
// Source layout: /Users/jgmbp/Downloads/preview.html (mockup).

import type { Tier, DimensionScore } from '@content/assessments/v3/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v3/types';
import type { Dimension } from '@content/assessments/v3/types';
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

export function ResultsViewV3({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  email,
  firstName,
  profileId,
}: ResultsViewV3Props) {
  // 12 signals, ordered by score ascending so the weakest are easy to find.
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

  const greeting = firstName?.trim() ? `${firstName.trim()}, here's your snapshot.` : 'Your AI readiness snapshot.';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-14 md:space-y-20">
      {/* HERO */}
      <section
        className="rounded-[28px] bg-[color:var(--ink)] text-white p-6 md:p-9 grid grid-cols-1 md:grid-cols-[200px_1fr_300px] gap-7 md:gap-7 items-center"
        style={{ boxShadow: 'var(--shadow-hero)' }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
            Your score
          </p>
          <p className="mt-3 text-[80px] md:text-[92px] font-bold leading-[0.88] tracking-[-0.04em] text-[color:var(--gold-soft)] tabular-nums">
            {score}
            <span className="text-[16px] md:text-[18px] text-white/55 font-normal tracking-normal ml-1">
              / {V3_MAX_SCORE}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
            AI Readiness Snapshot
          </p>
          <h1 className="mt-2 text-[28px] md:text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
            {greeting.replace('snapshot.', '')}{tier.label}.
          </h1>
          {gap && (
            <p className="mt-4 text-[15px] md:text-[16px] leading-[1.6] text-white/70">
              {gap.oneLine}
            </p>
          )}
        </div>
        <div className="bg-white/8 border border-white/12 rounded-[20px] p-5 space-y-3 md:space-y-4">
          {focusGap && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Top gap
              </p>
              <p className="mt-1 text-[16px] font-semibold text-white">{focusGap.label}</p>
            </div>
          )}
          {recommendation && (
            <div className="border-t border-white/12 pt-3">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Quick win
              </p>
              <p className="mt-1 text-[16px] font-semibold text-white leading-snug">
                {recommendation.title}
              </p>
            </div>
          )}
          {artifact && (
            <div className="border-t border-white/12 pt-3">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
                Starter artifact
              </p>
              <p className="mt-1 text-[15px] text-white/90 leading-snug">{artifact.title}</p>
            </div>
          )}
        </div>
      </section>

      {/* READINESS SIGNALS — 12 signals from the free assessment.
          Renamed from "Dimension Breakdown" per operator 2026-05-29 —
          the 8-dimension diagnostic is paid; this is the 12-signal
          screening view. */}
      <section className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            12-question snapshot summary
          </p>
          <h2 className="mt-2 text-[28px] md:text-[40px] font-semibold leading-[1] tracking-[-0.03em] text-[color:var(--ink)]">
            Your readiness signals.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-[color:var(--slate-600)] max-w-prose">
            The free snapshot screens twelve plain-language signals — what you
            do today, what you avoid, how you review. It is intentionally
            shallow; the eight-dimension diagnostic is locked behind the
            In-Depth report.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {signals.map((s) => {
            const band = bandForSignal(s);
            return (
              <div
                key={s.id}
                className={`rounded-[16px] border p-3.5 min-h-[108px] flex flex-col justify-between ${bandClasses(band)}`}
              >
                <p className="text-[13px] font-semibold leading-tight text-[color:var(--ink)]">
                  {s.label}
                </p>
                <p className="text-[20px] font-bold tabular-nums tracking-[-0.03em] text-[color:var(--ink)] mt-2">
                  {s.score}/{s.maxScore}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SIGNAL DETAIL — collapsed by default. Shows the lowest signals
          with the GAP_CONTENT one-liner so the user understands the band. */}
      {lowest.length > 0 && (
        <details className="bg-white border border-[color:var(--ink-a10)] rounded-[22px] p-5">
          <summary className="font-semibold text-[15px] cursor-pointer text-[color:var(--ink)]">
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
                  <p className="text-[14px] font-semibold text-[color:var(--ink)]">{s.label}</p>
                  <p className="text-[13px] text-[color:var(--slate-600)] leading-[1.5]">{c.oneLine}</p>
                  <span
                    className={`inline-block self-start rounded-full px-2.5 py-1 text-[11px] font-semibold ${pillClasses(band)}`}
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
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              Top gap explained
            </p>
            <h2 className="mt-2 text-[28px] md:text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
              What is {focusGap.label}?
            </h2>
            <p className="mt-4 text-[15px] md:text-[16px] leading-[1.6] text-white/70 max-w-prose">
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
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Three things you can use this week
          </p>
          <h2 className="mt-2 text-[28px] md:text-[40px] font-semibold leading-[1] tracking-[-0.03em] text-[color:var(--ink)]">
            Not theory. Actual next actions.
          </h2>
          <div className="mt-7 grid md:grid-cols-3 gap-5">
            {/* 1. Prompt to try */}
            {starterPrompt && (
              <article
                className="bg-white border border-[color:var(--ink-a10)] border-t-[6px] border-t-[color:var(--gold)] rounded-[22px] p-6"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <TakeawayNum n={1} />
                <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.02em] text-[color:var(--ink)]">
                  Prompt to try
                </h3>
                <p className="mt-2 text-[14px] text-[color:var(--slate-600)] leading-[1.55]">
                  {starterPrompt.label}
                </p>
                <pre className="mt-3 bg-[color:var(--ink)] text-[color:var(--gold-soft)] rounded-[14px] p-4 text-[12px] leading-[1.5] font-mono max-h-[170px] overflow-hidden whitespace-pre-wrap relative">
                  {starterPrompt.prompt}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[color:var(--ink)] to-transparent"
                  />
                </pre>
              </article>
            )}

            {/* 2. Helper tool */}
            <article
              className="bg-white border border-[color:var(--ink-a10)] border-t-[6px] border-t-[#0E7A55] rounded-[22px] p-6"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <TakeawayNum n={2} />
              <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.02em] text-[color:var(--ink)]">
                Helper tool
              </h3>
              <p className="mt-2 text-[14px] text-[color:var(--slate-600)] leading-[1.55]">
                A quick task-fit check before testing any AI workflow.
              </p>
              <ul className="mt-3 pl-5 list-disc text-[14px] text-[color:var(--slate-600)] leading-[1.7] space-y-1">
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
                className="bg-white border border-[color:var(--ink-a10)] border-t-[6px] border-t-[#B7791F] rounded-[22px] p-6 flex flex-col"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <TakeawayNum n={3} />
                <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.02em] text-[color:var(--ink)]">
                  Working artifact
                </h3>
                <p className="mt-2 text-[14px] text-[color:var(--slate-600)] leading-[1.55]">
                  {artifact.subtitle}
                </p>
                {profileId && (
                  <div className="mt-auto pt-4">
                    <PdfDownloadButton profileId={profileId} email={email} />
                  </div>
                )}
              </article>
            )}
          </div>
        </section>
      )}

      {/* 7-DAY PLAN — fully visible. */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          Your 7-day starter plan
        </p>
        <h2 className="mt-2 text-[28px] md:text-[36px] font-semibold leading-[1] tracking-[-0.03em] text-[color:var(--ink)]">
          One small step per day.
        </h2>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SEVEN_DAY_PLAN.map((d) => (
            <li
              key={d.day}
              className="bg-white border border-[color:var(--ink-a10)] rounded-[16px] p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                Day {d.day}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-[color:var(--ink)]">{d.action}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 30/60/90 PLAN — phase 1 fully visible; phases 2 + 3 partially
          locked with explicit "Unlocks in In-Depth" framing. */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          30 / 60 / 90 plan
        </p>
        <h2 className="mt-2 text-[28px] md:text-[40px] font-semibold leading-[1] tracking-[-0.03em] text-[color:var(--ink)]">
          Free shows the path. Paid unlocks the deployment detail.
        </h2>
        <div className="mt-7 grid md:grid-cols-3 gap-4">
          {/* Days 1–30 — fully visible */}
          <div
            className="bg-white border border-[color:var(--ink-a10)] rounded-[22px] p-6"
            style={{ boxShadow: 'var(--shadow-soft)' }}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
              Days 1–30
            </p>
            <h3 className="mt-2 text-[19px] font-semibold tracking-[-0.02em] text-[color:var(--ink)]">
              Map, educate, select
            </h3>
            <ul className="mt-3 pl-5 list-disc text-[14px] text-[color:var(--slate-600)] leading-[1.6] space-y-1">
              <li>Choose one safe internal workflow.</li>
              <li>Build your reusable AI working brief.</li>
              <li>Apply Green / Yellow / Red data safety.</li>
              <li>Name the human reviewer.</li>
              <li>Run one low-risk test and measure draft time.</li>
            </ul>
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
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              Full diagnostic locked
            </p>
            <h2 className="mt-2 text-[28px] md:text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
              Unlock the full 8-dimension diagnostic.
            </h2>
            <p className="mt-4 text-[15px] md:text-[16px] leading-[1.6] text-white/70 max-w-prose">
              Your free snapshot identified the first move. The In-Depth
              Diagnostic unlocks the full eight-dimension scorecard, a
              role-specific action plan, a 30/60/90 roadmap, sample prompts,
              an evidence checklist your reviewer can read, and a reviewer-
              ready report you can forward.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/assessment/in-depth"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-[color:var(--gold-2)] transition-colors"
              >
                Unlock In-Depth · $99
              </a>
              <a
                href={cta.tertiary.href}
                data-plausible-event-source={cta.tertiary.source}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-white/30 text-white text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-white/5"
              >
                Or talk to us
              </a>
            </div>
          </div>
          <div className="bg-white/8 border border-white/12 rounded-[22px] p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-soft)]">
              8-dimension diagnostic
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                'AI Access Architecture',
                'Model Oversight',
                'Compliance Clarity',
                'Data Safety',
                'Workflow Fit',
                'Human Control',
                'Vendor Control',
                'People & Governance',
              ].map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-3 text-[14px] text-white/85"
                >
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold-soft)] shrink-0"
                  />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[12px] text-white/55 italic leading-[1.55]">
              Plus role-specific roadmap, sample prompts, evidence checklist,
              and a reviewer-ready PDF.
            </p>
          </div>
        </div>
      </section>

      {/* ROLE PLAYBOOKS — subtle, helpful, not pushy. */}
      <section className="grid md:grid-cols-[0.42fr_0.58fr] gap-6 items-start">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Role playbooks
          </p>
          <h2 className="mt-2 text-[28px] md:text-[36px] font-semibold leading-[1] tracking-[-0.03em] text-[color:var(--ink)]">
            Useful next reads.
          </h2>
          <p className="mt-3 text-[14px] text-[color:var(--slate-600)] leading-[1.6]">
            Free reading by the seat you sit in — no email gate.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PlaybookCard
            tag="Best match"
            title="Retail / Branch"
            body="First-draft replies, job aids, and coaching scenarios."
            href="/playbooks/retail-branch"
            highlight
          />
          <PlaybookCard
            tag="Risk lens"
            title="Compliance"
            body="Use-case review, evidence packets, and review checklists."
            href="/playbooks/compliance"
          />
          <PlaybookCard
            tag="Workflow"
            title="Operations"
            body="Procedure translation and repeatable SOPs."
            href="/playbooks/operations"
          />
          <PlaybookCard
            tag="Tool safety"
            title="InfoSec"
            body="Data handling, approved tools, and guardrails."
            href="/playbooks/infosec"
          />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------- */

function MiniCard({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
  return (
    <div className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[18px] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
        {label}
      </p>
      <ul className="mt-3 space-y-2 text-[14px] leading-[1.55] text-[color:var(--slate-700)]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TakeawayNum({ n }: { readonly n: number }) {
  return (
    <span className="inline-grid place-items-center w-9 h-9 rounded-[12px] bg-[color:var(--cream)] text-[color:var(--gold-deep)] font-bold text-[14px]">
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
      className="bg-white border border-[color:var(--ink-a10)] rounded-[22px] p-6 relative overflow-hidden"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
        {label}
      </p>
      <h3 className="mt-2 text-[19px] font-semibold tracking-[-0.02em] text-[color:var(--ink)]">
        {title}
      </h3>
      <div className="mt-4 bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[14px] p-3.5">
        <p className="text-[14px] font-semibold text-[color:var(--ink)] leading-[1.4]">
          Visible: {visibleItem}
        </p>
      </div>
      <ul
        aria-hidden="true"
        className="mt-3 pl-5 list-disc text-[14px] text-[color:var(--slate-600)] leading-[1.6] space-y-1 select-none"
        style={{ filter: 'blur(2.5px)', opacity: 0.5 }}
      >
        {lockedItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="mt-4 bg-[color:var(--ink)] text-white rounded-[14px] p-4 text-center">
        <p className="text-[13px] font-semibold">Locked in In-Depth</p>
        <p className="mt-1 text-[12px] text-white/65">Unlock the full phase plan.</p>
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
      className={`block bg-white rounded-[18px] p-5 transition-colors hover:bg-[color:var(--cream)] ${
        highlight
          ? 'border-2 border-[color:var(--gold)] shadow-[0_0_0_4px_rgba(200,162,74,0.12)]'
          : 'border border-[color:var(--ink-a10)]'
      }`}
    >
      <span className="inline-flex rounded-full bg-[color:var(--cream)] px-2.5 py-1 text-[11px] font-bold text-[color:var(--gold-deep)] uppercase tracking-[0.1em]">
        {tag}
      </span>
      <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[color:var(--ink)]">{title}</h3>
      <p className="mt-1.5 text-[13px] text-[color:var(--slate-600)] leading-[1.55]">{body}</p>
    </a>
  );
}
