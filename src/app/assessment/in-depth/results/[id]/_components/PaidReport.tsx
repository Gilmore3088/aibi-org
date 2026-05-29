'use client';

// PaidReport — v4 In-Depth Diagnostic 14-section report.
//
// Source: docs/Plans/_assets/aibi-assessment-architecture-2026-05-28.md
// Section 7 ("Paid Diagnostic Report Structure").
//
// The 14 sections, in order:
//   1.  Executive summary
//   2.  Overall score /100
//   3.  Maturity band
//   4.  Eight-dimension scorecard
//   5.  Strongest dimension
//   6.  Weakest dimension
//   7.  Top three risks
//   8.  Top three opportunities
//   9.  Role-specific action plan
//   10. Recommended starter artifacts
//   11. 30 / 60 / 90 day roadmap
//   12. Sample prompts (role-keyed)
//   13. Evidence checklist (per-dimension)
//   14. Recommended next step
//
// Voice: editorial, second-person, individual. The report reads like a
// thoughtful briefing the banker can act on Monday morning — not a
// dashboard, not a sales letter.

import {
  DIMENSION_LABELS,
  DIMENSION_TECHNICAL_NAMES,
  MATURITY_BANDS,
  type Dimension,
  type MaturityBand,
} from '@content/assessments/v4/types';
import { getDimensionArtifacts } from '@content/assessments/v4/starter-artifacts';
import { getRoleOutput } from '@content/assessments/v4/role-output';
import { ROLE_V4_META, type RoleV4 } from '@content/assessments/v4/roles';
import type { DimensionScoreSerializedV4 } from '@/lib/assessment/load-response';

export interface PaidReportProps {
  readonly profileId: string;
  readonly email: string;
  readonly score: number; // normalized 0-100
  readonly band: MaturityBand;
  readonly role: RoleV4 | null;
  readonly dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
  readonly readinessAt: string;
}

// Per-dimension "common weak state" and "strong state" text from spec
// Section 4. Used in the Top Risks (weak states of low dimensions) and
// Top Opportunities (next stretches of high dimensions) sections.
const WEAK_STATE: Record<Dimension, string> = {
  'ai-access-architecture':
    'You use whatever public AI tool you find, and the institution has no reliable inventory of where AI is in use.',
  'model-risk-validation':
    'AI tools get evaluated once and then used without ongoing review — drift goes unnoticed until something forces a retroactive look.',
  'compliance-explainability':
    'AI drafts language that gets used without verifying source support or regulatory implications.',
  'data-security-guardrails':
    'You paste real customer or internal information into public tools because you want a fast answer.',
  'workflow-orchestration':
    'AI use is ad hoc and entirely dependent on you — no documented workflow a colleague could follow.',
  'bounded-autonomy-human-review':
    'AI output is treated as final because it sounds confident.',
  'vendor-risk-interoperability':
    'AI features appear inside vendor products without any distinct review.',
  'governance-roles-human-capital':
    'AI training is generic, voluntary, and disconnected from real work.',
};

const STRONG_STATE: Record<Dimension, string> = {
  'ai-access-architecture':
    'Your AI use flows through approved tools, access controls, logging, and data-class rules — and you can defend it.',
  'model-risk-validation':
    'You use a risk-based monitoring and review cadence with named ownership and retained evidence for the AI work that matters.',
  'compliance-explainability':
    'AI outputs are labeled, reviewed, source-linked, and retained according to the workflow risk.',
  'data-security-guardrails':
    'You apply data classes, approved tools, runtime guardrails, and personal habits that make safety automatic.',
  'workflow-orchestration':
    'Your AI work is documented, reusable, role-specific, and reproducible by a colleague.',
  'bounded-autonomy-human-review':
    'AI-assisted work pauses at visible review gates before any consequential use.',
  'vendor-risk-interoperability':
    'Vendor AI is inventoried, reviewed, contractually governed, and monitored.',
  'governance-roles-human-capital':
    'You have role-based training, accountable owners, and reusable artifacts the institution can scale.',
};

// Per-dimension evidence checklist (Section 12). Three concrete items
// per dimension that a reviewer or examiner could ask for. Derived
// directly from each dimension's "starter artifacts" list in Section 4.
const EVIDENCE_CHECKLIST: Record<Dimension, readonly string[]> = {
  'ai-access-architecture': [
    'A current Approved AI Tools List with named data classes per tool',
    'An AI Use-Case Inventory showing where AI runs and what data it touches',
    'A Data Handling Reference Card staff can name without looking it up',
  ],
  'model-risk-validation': [
    'A Model / AI Workflow Review Checklist applied on a recurring cadence',
    'An AI Evidence Packet (prompt + output + edits + reviewer) for at least one decision-influencing workflow',
    'A Quarterly AI Governance Update note that mentions actual model behavior, not just policy',
  ],
  'compliance-explainability': [
    'An AI Output Review Checklist with named reviewers per stake tier',
    'A Principal Reason Traceability Table for any AI-assisted credit work',
    'A Compliance AI Playbook mapping AI use cases to applicable rules (ECOA, UDAAP, BSA, fair lending)',
  ],
  'data-security-guardrails': [
    'A Safe AI Use Checklist staff actually reference (taped to monitor or in the SOP)',
    'A Red / Yellow / Green data-use card with named tools per class',
    'An approved internal AI environment for the work that needs real data',
  ],
  'workflow-orchestration': [
    'An AI Workflow SOP for at least one recurring task — clear enough a colleague could run it',
    'A Saved Skill / Prompt library organized by task',
    'A Workflow Mapping Worksheet for any new candidate workflow',
  ],
  'bounded-autonomy-human-review': [
    'A Human Review Checklist with Low / Medium / High tiers and named reviewers for High',
    'An Agent Review Checklist for any multi-step AI workflow',
    'A written rule for which decisions AI may not make',
  ],
  'vendor-risk-interoperability': [
    'A current AI Vendor Review Addendum applied to the top 3-5 vendors with AI features',
    'A vendor inventory showing AI features in use and the data each touches',
    'A Vendor AI Verdict Memo on any new AI tool before live use',
  ],
  'governance-roles-human-capital': [
    'A written AI Acceptable Use Standard staff can find without help',
    'A Training Rollout Plan with role-specific examples and weekly time budgets',
    'A Department Readiness Map showing where each team sits across the 8 dimensions',
  ],
};

function ScoreDot({
  score,
  size = 'md',
}: {
  readonly score: number;
  readonly size?: 'sm' | 'md' | 'lg';
}) {
  const px = size === 'sm' ? 36 : size === 'lg' ? 96 : 56;
  const band = MATURITY_BANDS.find((b) => score >= b.min && score <= b.max) ?? MATURITY_BANDS[0];
  // Color the dot by band — gold for top half, ink for bottom.
  const isHigh = score >= 60;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold tabular-nums ${
        isHigh ? 'bg-[color:var(--gold)] text-[color:var(--ink)]' : 'bg-[color:var(--ink)] text-white'
      }`}
      style={{ width: px, height: px, fontSize: px * 0.32 }}
      aria-label={`${score} out of 100, ${band.label}`}
    >
      {score}
    </div>
  );
}

function SectionHeading({
  num,
  title,
  kicker,
}: {
  readonly num: string;
  readonly title: string;
  readonly kicker?: string;
}) {
  return (
    <header className="mb-6">
      <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[color:var(--gold-deep)] mb-2">
        Section {num}{kicker ? ` · ${kicker}` : ''}
      </p>
      <h2 className="text-[28px] md:text-[32px] font-semibold leading-tight text-[color:var(--ink)]">
        {title}
      </h2>
    </header>
  );
}

export function PaidReport({
  profileId,
  email,
  score,
  band,
  role,
  dimensionBreakdown,
  readinessAt,
}: PaidReportProps) {
  // Compute the sorted list of dimensions once so every downstream
  // section reads from the same ranking.
  const ranked = (Object.entries(dimensionBreakdown) as readonly [Dimension, DimensionScoreSerializedV4][])
    .map(([dim, s]) => ({
      dim,
      score: s.score,
      label: s.label || DIMENSION_LABELS[dim],
    }))
    .sort((a, b) => a.score - b.score);
  const weakest = ranked[0];
  const strongest = ranked[ranked.length - 1];
  const topThreeWeakest = ranked.slice(0, 3);
  const topThreeStrongest = ranked.slice(-3).reverse();

  const weakArtifacts = getDimensionArtifacts(weakest.dim);
  const roleOutput = getRoleOutput(role);
  const roleLabel = role ? ROLE_V4_META[role].label : null;

  const readinessDate = new Date(readinessAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="bg-[color:var(--cream)] min-h-screen pb-32">
      {/* Cover band */}
      <header className="border-b border-[color:var(--ink)]/10 bg-[color:#FFFFFF]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[color:var(--gold-deep)] mb-3">
            In-Depth AI Readiness Diagnostic
          </p>
          <h1 className="text-[36px] md:text-[52px] font-semibold leading-[1.05] text-[color:var(--ink)]">
            Your diagnostic briefing.
          </h1>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-[14px] text-[color:var(--slate-600)]">
            <span>
              <span className="font-semibold text-[color:var(--ink)]">{email}</span>
            </span>
            <span>{readinessDate}</span>
            {roleLabel && <span>Read as: {roleLabel}</span>}
            <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
              Report ID · {profileId.slice(0, 8)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-10 space-y-20 md:space-y-24 py-16">

        {/* Section 1 — Executive summary */}
        <section>
          <SectionHeading num="1" kicker="At a glance" title="Executive summary" />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-8 md:p-10 space-y-4">
            <p className="text-[18px] leading-[1.6] text-[color:var(--ink)]">
              You scored <strong>{score} / 100</strong> — placing you in the{' '}
              <strong>{band.label}</strong> band of the AiBI maturity model.{' '}
              Your strongest dimension is{' '}
              <strong>{strongest.label}</strong> ({strongest.score}/100);{' '}
              your weakest is <strong>{weakest.label}</strong> ({weakest.score}/100).
            </p>
            <p className="text-[15px] leading-[1.7] text-[color:var(--slate-600)]">
              {band.meaning}
            </p>
            {roleLabel && (
              <p className="text-[15px] leading-[1.7] text-[color:var(--slate-600)]">
                Because you read this as <strong>{roleLabel}</strong>, the
                action plan in Section 9 and the sample prompts in Section 12
                are tuned to your seat.
              </p>
            )}
          </div>
        </section>

        {/* Section 2 + 3 — score + band, paired */}
        <section className="grid md:grid-cols-[auto_1fr] gap-10 items-center">
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[color:var(--gold-deep)]">
              Section 2 · Overall score
            </p>
            <ScoreDot score={score} size="lg" />
            <p className="text-[13px] text-[color:var(--slate-500)] tabular-nums">{score} / 100</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[color:var(--gold-deep)] mb-2">
              Section 3 · Maturity band
            </p>
            <h2 className="text-[32px] font-semibold text-[color:var(--ink)] mb-3">
              {band.label}
            </h2>
            <p className="text-[15px] leading-[1.7] text-[color:var(--slate-600)] max-w-prose">
              {band.meaning}
            </p>
            <ol className="mt-6 flex flex-wrap gap-2 text-[12px]">
              {MATURITY_BANDS.map((b) => {
                const active = b.id === band.id;
                return (
                  <li
                    key={b.id}
                    className={`px-3 py-1.5 rounded-full border ${
                      active
                        ? 'bg-[color:var(--ink)] text-white border-[color:var(--ink)] font-semibold'
                        : 'border-[color:var(--ink)]/15 text-[color:var(--slate-600)]'
                    }`}
                  >
                    {b.label} · {b.min}–{b.max}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Section 4 — 8-dimension scorecard */}
        <section>
          <SectionHeading num="4" title="Eight-dimension scorecard" />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl divide-y divide-[color:var(--ink)]/10">
            {ranked
              .slice()
              .reverse()
              .map((d) => {
                const dimBand = MATURITY_BANDS.find(
                  (b) => d.score >= b.min && d.score <= b.max,
                ) ?? MATURITY_BANDS[0];
                return (
                  <div key={d.dim} className="p-5 md:p-6 flex items-center gap-5">
                    <ScoreDot score={d.score} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-semibold text-[color:var(--ink)] leading-tight">
                        {d.label}
                      </p>
                      <p className="text-[12px] text-[color:var(--slate-500)] mt-1">
                        {DIMENSION_TECHNICAL_NAMES[d.dim]}
                      </p>
                    </div>
                    <p className="text-[12px] text-[color:var(--slate-600)] tabular-nums shrink-0">
                      {dimBand.label}
                    </p>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Section 5 — Strongest */}
        <section>
          <SectionHeading num="5" kicker="Where you lead" title={`Strongest: ${strongest.label}`} />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--gold)]/40 rounded-2xl p-8 space-y-4">
            <div className="flex items-baseline gap-3">
              <ScoreDot score={strongest.score} size="md" />
              <p className="text-[13px] text-[color:var(--slate-600)]">
                {DIMENSION_TECHNICAL_NAMES[strongest.dim]}
              </p>
            </div>
            <p className="text-[15px] leading-[1.7] text-[color:var(--slate-700)]">
              {STRONG_STATE[strongest.dim]}
            </p>
            <p className="text-[14px] text-[color:var(--slate-600)] italic">
              The stretch goal here is replication — turning your strong practice into
              something a colleague can adopt without you in the room.
            </p>
          </div>
        </section>

        {/* Section 6 — Weakest */}
        <section>
          <SectionHeading num="6" kicker="Where to focus" title={`Weakest: ${weakest.label}`} />
          <div className="bg-[color:var(--ink)] text-white rounded-2xl p-8 space-y-4">
            <div className="flex items-baseline gap-3">
              <ScoreDot score={weakest.score} size="md" />
              <p className="text-[13px] text-white/70">
                {DIMENSION_TECHNICAL_NAMES[weakest.dim]}
              </p>
            </div>
            <p className="text-[16px] leading-[1.7] text-white">
              {WEAK_STATE[weakest.dim]}
            </p>
            <p className="text-[14px] text-white/75 italic">
              This is the dimension to anchor your first 30 days. Section 10 prescribes
              the starter artifact; Section 11 sequences the work across 90 days.
            </p>
          </div>
        </section>

        {/* Section 7 — Top 3 risks */}
        <section>
          <SectionHeading num="7" kicker="What to watch" title="Top three risks" />
          <div className="grid gap-4 md:grid-cols-3">
            {topThreeWeakest.map((d) => (
              <article
                key={d.dim}
                className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-6"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold-deep)] font-semibold mb-2">
                  Risk · {d.score}/100
                </p>
                <h3 className="text-[18px] font-semibold text-[color:var(--ink)] mb-2 leading-tight">
                  {d.label}
                </h3>
                <p className="text-[14px] text-[color:var(--slate-600)] leading-[1.6]">
                  {WEAK_STATE[d.dim]}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Section 8 — Top 3 opportunities */}
        <section>
          <SectionHeading num="8" kicker="Where to compound" title="Top three opportunities" />
          <div className="grid gap-4 md:grid-cols-3">
            {topThreeStrongest.map((d) => (
              <article
                key={d.dim}
                className="bg-[color:#FFFFFF] border border-[color:var(--gold)]/40 rounded-2xl p-6"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold-deep)] font-semibold mb-2">
                  Opportunity · {d.score}/100
                </p>
                <h3 className="text-[18px] font-semibold text-[color:var(--ink)] mb-2 leading-tight">
                  {d.label}
                </h3>
                <p className="text-[14px] text-[color:var(--slate-600)] leading-[1.6]">
                  {STRONG_STATE[d.dim]}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Section 9 — Role-specific action plan */}
        <section>
          <SectionHeading
            num="9"
            kicker={roleLabel ?? 'General'}
            title="Role-specific action plan"
          />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-8 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-2">
                Your recommended artifact
              </p>
              <p className="text-[18px] font-semibold text-[color:var(--ink)]">
                {roleOutput.artifact}
              </p>
            </div>
            <div className="border-t border-[color:var(--ink)]/10 pt-6">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-2">
                Your 30-day win
              </p>
              <p className="text-[16px] leading-[1.6] text-[color:var(--ink)]">
                {roleOutput.thirtyDayWin}
              </p>
            </div>
          </div>
        </section>

        {/* Section 10 — Recommended starter artifacts */}
        <section>
          <SectionHeading
            num="10"
            kicker={`Driven by ${weakest.label}`}
            title="Recommended starter artifacts"
          />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-8 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-2">
                Primary — start here
              </p>
              <h3 className="text-[20px] font-semibold text-[color:var(--ink)] mb-2 leading-tight">
                {weakArtifacts.primary.title}
              </h3>
              <p className="text-[15px] text-[color:var(--slate-600)] leading-[1.7]">
                {weakArtifacts.primary.description}
              </p>
            </div>
            {weakArtifacts.supporting.length > 0 && (
              <div className="border-t border-[color:var(--ink)]/10 pt-6 space-y-4">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
                  Supporting — adopt next
                </p>
                {weakArtifacts.supporting.map((a) => (
                  <div key={a.title}>
                    <p className="text-[16px] font-semibold text-[color:var(--ink)]">
                      {a.title}
                    </p>
                    <p className="text-[14px] text-[color:var(--slate-600)] leading-[1.6] mt-1">
                      {a.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 11 — 30/60/90 roadmap */}
        <section>
          <SectionHeading num="11" kicker="Sequenced action" title="30 / 60 / 90 day roadmap" />
          <div className="grid gap-4 md:grid-cols-3">
            <article className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-3">
                Days 1–30
              </p>
              <h3 className="text-[17px] font-semibold text-[color:var(--ink)] mb-3 leading-tight">
                Anchor the weakest signal.
              </h3>
              <ul className="text-[14px] text-[color:var(--slate-600)] leading-[1.7] space-y-2 list-disc pl-5">
                <li>Adopt the primary artifact above for <strong>{weakest.label}</strong>.</li>
                <li>Complete the 30-day win for your role.</li>
                <li>Document one workflow where AI is already helping.</li>
              </ul>
            </article>
            <article className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-3">
                Days 31–60
              </p>
              <h3 className="text-[17px] font-semibold text-[color:var(--ink)] mb-3 leading-tight">
                Add the supporting artifacts.
              </h3>
              <ul className="text-[14px] text-[color:var(--slate-600)] leading-[1.7] space-y-2 list-disc pl-5">
                <li>Adopt the two supporting artifacts under <strong>{weakest.label}</strong>.</li>
                <li>Pick a second dimension from your top-3 risks and repeat the primary-artifact step.</li>
                <li>Share one workflow with a colleague — confirm they can run it without you.</li>
              </ul>
            </article>
            <article className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-3">
                Days 61–90
              </p>
              <h3 className="text-[17px] font-semibold text-[color:var(--ink)] mb-3 leading-tight">
                Compound on your strongest.
              </h3>
              <ul className="text-[14px] text-[color:var(--slate-600)] leading-[1.7] space-y-2 list-disc pl-5">
                <li>Document one practice from <strong>{strongest.label}</strong> as a reusable template.</li>
                <li>Retake the diagnostic — confirm two dimensions moved up at least one band.</li>
                <li>Pick the next dimension to anchor for the following quarter.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Section 12 — Sample prompts */}
        <section>
          <SectionHeading
            num="12"
            kicker={roleLabel ?? 'General'}
            title="Sample prompts for your role"
          />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)] mb-3">
              Starter prompt
            </p>
            <blockquote className="text-[15px] leading-[1.75] text-[color:var(--ink)] border-l-4 border-[color:var(--gold)] pl-5 whitespace-pre-wrap">
              {roleOutput.samplePrompt}
            </blockquote>
            <p className="text-[12px] text-[color:var(--slate-500)] mt-4 italic">
              Paste into any approved AI tool. Replace bracketed sections with your specifics.
            </p>
          </div>
        </section>

        {/* Section 13 — Evidence checklist */}
        <section>
          <SectionHeading
            num="13"
            kicker="What a reviewer would ask for"
            title="Evidence checklist"
          />
          <div className="bg-[color:#FFFFFF] border border-[color:var(--ink)]/10 rounded-2xl divide-y divide-[color:var(--ink)]/10">
            {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((dim) => (
              <div key={dim} className="p-6">
                <p className="text-[15px] font-semibold text-[color:var(--ink)] mb-3">
                  {DIMENSION_LABELS[dim]}
                </p>
                <ul className="space-y-2 text-[14px] text-[color:var(--slate-600)] leading-[1.6]">
                  {EVIDENCE_CHECKLIST[dim].map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[color:var(--gold)] shrink-0 mt-0.5">▢</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 14 — Next step */}
        <section>
          <SectionHeading num="14" kicker="Where to go from here" title="Recommended next step" />
          <div className="bg-[color:var(--ink)] text-white rounded-2xl p-8 md:p-10 space-y-6">
            <p className="text-[18px] leading-[1.6]">
              {band.id === 'unstructured' || band.id === 'emerging' ? (
                <>
                  Your next step is the <strong>AiBI-Foundation</strong> course. Twelve
                  self-paced modules built for community bank staff — exactly the
                  reps you need to move from <em>{band.label}</em> into{' '}
                  <em>Building Momentum</em>.
                </>
              ) : band.id === 'building-momentum' ? (
                <>
                  Your next step is to standardize what you already do — and bring
                  one colleague along. The <strong>AiBI-Foundation</strong> course
                  is the cheapest way to give a teammate the same baseline you have.
                </>
              ) : (
                <>
                  You have the practice. Your next step is{' '}
                  <strong>Leadership Advisory</strong> — fractional Chief AI
                  Officer work to set institution-wide priorities and codify what
                  you have built into something the rest of your team can adopt.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {band.id === 'unstructured' || band.id === 'emerging' || band.id === 'building-momentum' ? (
                <>
                  <a
                    href="/courses/foundation/program"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-[color:var(--gold-2)] transition-colors"
                  >
                    Enroll in AiBI-Foundation · $295
                  </a>
                  <a
                    href="/for-institutions"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-white/30 text-white text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-white/5"
                  >
                    Or request a briefing
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/for-institutions"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-[color:var(--gold-2)] transition-colors"
                  >
                    Request a Leadership Advisory conversation
                  </a>
                  <a
                    href="/courses/foundation/program"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-white/30 text-white text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-white/5"
                  >
                    Onboard new hires with AiBI-Foundation
                  </a>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Print + footer */}
        <footer className="text-center pt-8 text-[12px] text-[color:var(--slate-500)]">
          <p>
            Generated {readinessDate} by The AI Banking Institute · Report ID {profileId}
          </p>
          <p className="mt-2">
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="underline underline-offset-2 hover:text-[color:var(--ink)]"
            >
              Print this report
            </button>
          </p>
        </footer>
      </div>
    </main>
  );
}
