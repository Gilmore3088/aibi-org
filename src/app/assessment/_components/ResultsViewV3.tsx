'use client';

import type { Tier, DimensionScore } from '@content/assessments/v3/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v3/types';
import type { Dimension } from '@content/assessments/v3/types';
import { NewsletterCTA } from './NewsletterCTA';
import { PdfDownloadButton } from './PdfDownloadButton';
import { StarterArtifactCard } from './StarterArtifactCard';
import { StarterPrompt } from './StarterPrompt';
import { PracticePicture } from './PracticePicture';
import { MaturityLadder } from './MaturityLadder';
import { SignatureInsight } from './SignatureInsight';
import { getStarterArtifact } from '@content/assessments/v3/starter-artifacts';
import {
  BIG_INSIGHT,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FINANCIAL_IMPLICATIONS,
  TIER_CLOSING_CTA,
} from '@content/assessments/v3/personalization';
import type { StarterPrompt as StarterPromptType } from '@content/assessments/v3/personalization';

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

interface RankedDimension {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

type Band = 'critical' | 'developing' | 'strong';
type Recommendation = (typeof RECOMMENDATIONS)[Dimension];
type StarterArtifact = ReturnType<typeof getStarterArtifact>;
type ClosingCta = (typeof TIER_CLOSING_CTA)[Tier['id']];

function bandFor(pct: number): Band {
  if (pct >= 0.75) return 'strong';
  if (pct >= 0.5) return 'developing';
  return 'critical';
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

export function ResultsViewV3({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  email,
  firstName,
  institutionName,
  profileId,
}: ResultsViewV3Props) {
  const subjectName = institutionName?.trim() || 'your institution';
  const grouped = groupDimensions(dimensionBreakdown);
  const focusGap =
    grouped.critical[0] ?? grouped.developing[0] ?? grouped.all[0] ?? null;
  const fastestRoi = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const starterArtifact = focusGap ? getStarterArtifact(focusGap.id) : null;
  const cta = TIER_CLOSING_CTA[tierId];
  const implications = FINANCIAL_IMPLICATIONS[tierId];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-16 md:space-y-20">
      <HeroSplitCard
        score={score}
        tier={tier}
        firstName={firstName}
        subjectName={subjectName}
        focusGap={focusGap}
        fastestRoi={fastestRoi}
        starterArtifact={starterArtifact}
      />

      <DimensionGrid rows={grouped.all} />

      {grouped.critical.length > 0 && (
        <CriticalGapsSection gaps={grouped.critical} />
      )}

      <PracticeAndSignature tierId={tierId} />

      <BigInsightCard insight={BIG_INSIGHT[tierId]} />

      <ImplicationsGrid implications={implications} />

      <MaturityLadder tierId={tierId} />

      {fastestRoi && focusGap && (
        <FirstMoveCard fastestRoi={fastestRoi} focusGap={focusGap} />
      )}

      {starterPrompt && (
        <StarterPromptSection
          starterPrompt={starterPrompt}
          starterArtifact={starterArtifact}
          focusGap={focusGap}
          tier={tier}
        />
      )}

      <SevenDayPlanGrid />

      <ClosingCtaBand cta={cta} />

      <div className="border-t border-[color:var(--ink)]/10 pt-12" data-print-hide="true">
        <NewsletterCTA email={email} />
      </div>

      {profileId ? <PdfDownloadButton profileId={profileId} email={email} /> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* HERO — split-card pattern from public/sketches/results.html          */
/* -------------------------------------------------------------------- */

function HeroSplitCard({
  score,
  tier,
  firstName,
  subjectName,
  focusGap,
  fastestRoi,
  starterArtifact,
}: {
  readonly score: number;
  readonly tier: Tier;
  readonly firstName?: string | null;
  readonly subjectName: string;
  readonly focusGap: RankedDimension | null;
  readonly fastestRoi: Recommendation | null;
  readonly starterArtifact: StarterArtifact | null;
}) {
  const greeting = firstName?.trim()
    ? `${firstName.trim()}, here is your AI readiness snapshot.`
    : 'Your AI readiness snapshot.';
  return (
    <header className="space-y-10">
      <div className="space-y-5 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--gold-a10)] border border-[color:var(--gold-a20)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
          <span aria-hidden>●</span>
          AI Readiness Result
        </div>
        <h1 className="text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.01em] font-semibold text-[color:var(--ink)]">
          {greeting}
        </h1>
        <p className="text-[16px] md:text-[17px] leading-[1.6] text-[color:var(--slate-600)] max-w-2xl">
          A snapshot of where {subjectName} stands across twelve dimensions of AI readiness — and what to build next.
        </p>
      </div>

      <article
        className="rounded-[28px] overflow-hidden bg-white border border-[color:var(--ink-a10)]"
        style={{ boxShadow: 'var(--shadow-hero)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[0.42fr_0.58fr]">
          <div className="bg-[color:var(--ink)] text-white p-7 md:p-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-soft)]">
              Readiness Score
            </p>
            <p className="mt-3 text-[72px] md:text-[80px] leading-[0.95] font-bold tabular-nums text-[color:var(--gold-soft)]">
              {score}
            </p>
            <p className="mt-1 text-[14px] text-[color:var(--on-dark-50)]">/ {V3_MAX_SCORE}</p>
            <div className="mt-6 px-4 py-3.5 rounded-[14px] bg-[color:var(--on-dark-10)]">
              <p className="text-[13px] text-[color:var(--on-dark-65)]">Maturity level</p>
              <p className="mt-1 text-[20px] md:text-[22px] font-bold leading-tight">
                {tier.label}
              </p>
            </div>
          </div>
          <div className="p-6 md:p-7 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
              Recommended Path
            </p>
            <h2 className="text-[22px] md:text-[24px] font-semibold leading-[1.2] text-[color:var(--ink)]">
              {fastestRoi ? `Start with ${fastestRoi.title.toLowerCase()}.` : tier.label}
            </h2>
            <div className="space-y-2 pt-2">
              <PathRow label="Top gap" value={focusGap?.label ?? '—'} />
              {fastestRoi && <PathRow label="Best for" value={fastestRoi.worksBestFor[0]} />}
              {starterArtifact && (
                <PathRow label="Artifact" value={starterArtifact.title} />
              )}
            </div>
            {fastestRoi && (
              <div className="mt-4 px-4 py-3.5 rounded-[14px] bg-[color:var(--cream)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--slate-600)]">
                  Path
                </p>
                <p className="mt-1.5 text-[14px] font-semibold leading-[1.5] text-[color:var(--ink)]">
                  {fastestRoi.title} → {fastestRoi.riskLevel} → {fastestRoi.owner}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </header>
  );
}

function PathRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] bg-[color:var(--cream)]">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full bg-[color:var(--gold)] shrink-0"
      />
      <div className="min-w-0">
        <p className="text-[11px] text-[color:var(--slate-600)]">{label}</p>
        <p className="mt-0.5 text-[14px] font-bold text-[color:var(--ink)] truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* DIMENSION BREAKDOWN — 4-col card grid with strong/dev/critical badges */
/* -------------------------------------------------------------------- */

function DimensionGrid({ rows }: { readonly rows: ReadonlyArray<RankedDimension> }) {
  return (
    <section className="space-y-8">
      <SectionKicker>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Dimension Breakdown
          </p>
          <h2 className="text-[28px] md:text-[36px] leading-tight tracking-[-0.01em] font-semibold text-[color:var(--ink)]">
            Where you&apos;re ready. Where structure is needed.
          </h2>
        </div>
        <p className="text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--slate-600)] max-w-md">
          Twelve dimensions, scored on the answers you gave. Strong areas are leverage. Critical areas are the order of work.
        </p>
      </SectionKicker>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rows.map((row) => (
          <DimCard key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
}

const BAND_BADGE: Record<Band, { label: string; bg: string; color: string }> = {
  strong: { label: 'Strong', bg: 'rgba(4,120,87,0.12)', color: 'var(--emerald-700)' },
  developing: { label: 'Developing', bg: 'var(--gold-a20)', color: 'var(--gold-deep)' },
  critical: { label: 'Needs structure', bg: 'rgba(155,34,38,0.10)', color: '#9b2226' },
};

const BAND_FILL: Record<Band, string> = {
  strong: 'var(--emerald-700)',
  developing: 'var(--gold)',
  critical: '#9b2226',
};

function DimCard({ row }: { readonly row: RankedDimension }) {
  const band = bandFor(row.pct);
  const pct = Math.round(row.pct * 100);
  return (
    <article className="bg-white border border-[color:var(--ink-a10)] rounded-[20px] p-5 transition-shadow hover:shadow-[var(--shadow-hover)]">
      <div className="flex justify-between items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: BAND_FILL[band] }}
        />
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ background: BAND_BADGE[band].bg, color: BAND_BADGE[band].color }}
        >
          {BAND_BADGE[band].label}
        </span>
      </div>
      <h3 className="mt-3.5 text-[17px] font-semibold leading-[1.2] text-[color:var(--ink)]">
        {row.label}
      </h3>
      <div className="mt-3 h-1 rounded-full bg-[color:var(--slate-100)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(row.pct * 100, 2)}%`,
            background: BAND_FILL[band],
            transition: 'width .8s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </div>
      <p
        className="mt-2.5 text-[13px] font-bold tabular-nums"
        style={{ color: BAND_FILL[band] }}
      >
        {row.score}/{row.maxScore} · {pct}%
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------- */
/* CRITICAL GAPS — cream cards stacked                                  */
/* -------------------------------------------------------------------- */

function CriticalGapsSection({ gaps }: { readonly gaps: ReadonlyArray<RankedDimension> }) {
  return (
    <section className="space-y-8">
      <SectionKicker>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Closest look
          </p>
          <h2 className="text-[28px] md:text-[36px] leading-tight tracking-[-0.01em] font-semibold text-[color:var(--ink)]">
            Where you&apos;re most exposed.
          </h2>
        </div>
        <p className="text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--slate-600)] max-w-md">
          The dimensions below scored under 50%. Each describes what the gap looks like in practice — and what good looks like instead.
        </p>
      </SectionKicker>
      <div className="grid gap-5">
        {gaps.map((gap) => (
          <GapCard key={gap.id} gap={gap} />
        ))}
      </div>
    </section>
  );
}

function GapCard({ gap }: { readonly gap: RankedDimension }) {
  const content = GAP_CONTENT[gap.id];
  if (!content) return null;
  return (
    <article className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[24px] p-6 md:p-8">
      <header className="flex items-baseline justify-between gap-4">
        <h3 className="min-w-0 text-[22px] md:text-[24px] font-semibold leading-tight text-[color:var(--ink)] break-words">
          {gap.label}
        </h3>
        <span className="text-[13px] text-[color:var(--slate-600)] tabular-nums shrink-0">
          {gap.score}/{gap.maxScore}
        </span>
      </header>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--ink)]/85">
        {content.explanation}
      </p>
      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <BulletBlock
          kicker="What this leads to"
          items={content.impacts}
          markerColor="var(--ink-a15)"
        />
        <BulletBlock
          kicker="What good looks like"
          items={content.whatGoodLooksLike}
          markerColor="var(--gold)"
        />
      </div>
    </article>
  );
}

function BulletBlock({
  kicker,
  items,
  markerColor,
}: {
  readonly kicker: string;
  readonly items: ReadonlyArray<string>;
  readonly markerColor: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--slate-600)]">
        {kicker}
      </p>
      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-[14px] leading-[1.55] text-[color:var(--ink)]/85 flex gap-3"
          >
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: markerColor }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* PRACTICE PICTURE + SIGNATURE INSIGHT                                 */
/* -------------------------------------------------------------------- */

function PracticeAndSignature({ tierId }: { readonly tierId: Tier['id'] }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <PracticePicture tierId={tierId} />
      <SignatureInsight />
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* BIG INSIGHT — ink-filled card                                        */
/* -------------------------------------------------------------------- */

function BigInsightCard({ insight }: { readonly insight: string }) {
  return (
    <section className="space-y-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
        The big insight
      </p>
      <article
        className="rounded-[24px] p-8 md:p-12 bg-[color:var(--ink)] text-white"
        style={{ boxShadow: 'var(--shadow-ink)' }}
      >
        <p className="text-[22px] md:text-[28px] leading-[1.3] font-medium">
          {insight}
        </p>
      </article>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* IMPLICATIONS — 3-col card grid                                       */
/* -------------------------------------------------------------------- */

function ImplicationsGrid({
  implications,
}: {
  readonly implications: {
    readonly operational: string;
    readonly risk: string;
    readonly cost: string;
  };
}) {
  const rows: ReadonlyArray<{ readonly label: string; readonly body: string }> = [
    { label: 'Operational efficiency', body: implications.operational },
    { label: 'Risk management', body: implications.risk },
    { label: 'Cost & dependency', body: implications.cost },
  ];
  return (
    <section className="space-y-8">
      <SectionKicker>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Implications
          </p>
          <h2 className="text-[28px] md:text-[36px] leading-tight tracking-[-0.01em] font-semibold text-[color:var(--ink)]">
            In operating terms.
          </h2>
        </div>
        <p className="text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--slate-600)] max-w-md">
          What your score means for the parts of the bank a regulator and a CFO actually care about.
        </p>
      </SectionKicker>
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map((row) => (
          <article
            key={row.label}
            className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[20px] p-6"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
              {row.label}
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--ink)]/85">
              {row.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* FIRST MOVE — ink-headed feature card                                 */
/* -------------------------------------------------------------------- */

function FirstMoveCard({
  fastestRoi,
  focusGap,
}: {
  readonly fastestRoi: NonNullable<Recommendation>;
  readonly focusGap: RankedDimension;
}) {
  return (
    <section className="space-y-6">
      <article
        className="overflow-hidden rounded-[28px] bg-white border border-[color:var(--ink-a10)]"
        style={{ boxShadow: 'var(--shadow-feature)' }}
      >
        <header className="bg-[color:var(--ink)] text-white px-7 py-6 md:px-9 md:py-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-soft)]">
            Your first AI move
          </p>
          <h2 className="mt-2 text-[26px] md:text-[32px] leading-tight font-semibold">
            Start with {fastestRoi.title.toLowerCase()}.
          </h2>
        </header>
        <div className="p-7 md:p-9 space-y-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--slate-600)]">
              Why this is the right starting point
            </p>
            <ul className="mt-3 space-y-2">
              {fastestRoi.whyRightNow.map((reason) => (
                <li
                  key={reason}
                  className="text-[15px] leading-[1.55] text-[color:var(--ink)]/85 flex gap-3"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--gold)] shrink-0"
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-4 rounded-[16px] bg-[color:var(--cream)] border-l-4 border-[color:var(--gold)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--slate-600)]">
              What this looks like in practice
            </p>
            <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--ink)]/85">
              {fastestRoi.inPractice}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--slate-600)]">
              Where this works best
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {fastestRoi.worksBestFor.map((useCase) => (
                <li
                  key={useCase}
                  className="px-3.5 py-2.5 rounded-[12px] bg-[color:var(--cream)] text-[13px] font-semibold text-[color:var(--ink)]"
                >
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[color:var(--ink-a10)]">
            <MetaCell label="Risk" value={fastestRoi.riskLevel} />
            <MetaCell label="Time saved" value={fastestRoi.timeSaved} />
            <MetaCell label="Owner" value={fastestRoi.owner} />
          </dl>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-600)]">
            Surfaced by your weakest dimension: {focusGap.label}
          </p>
        </div>
      </article>
    </section>
  );
}

function MetaCell({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--slate-600)]">
        {label}
      </dt>
      <dd className="mt-1.5 text-[15px] font-semibold text-[color:var(--ink)]">
        {value}
      </dd>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* STARTER PROMPT                                                       */
/* -------------------------------------------------------------------- */

function StarterPromptSection({
  starterPrompt,
  starterArtifact,
  focusGap,
  tier,
}: {
  readonly starterPrompt: StarterPromptType;
  readonly starterArtifact: StarterArtifact | null;
  readonly focusGap: RankedDimension | null;
  readonly tier: Tier;
}) {
  return (
    <section className="space-y-6">
      <SectionKicker>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Starter prompt
          </p>
          <h2 className="text-[28px] md:text-[36px] leading-tight tracking-[-0.01em] font-semibold text-[color:var(--ink)]">
            Copy it. Run it. Refine it.
          </h2>
        </div>
        <p className="text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--slate-600)] max-w-md">
          Take this prompt to the AI tool your institution already trusts. Run it on a real workflow this week. Bring back what worked and what did not.
        </p>
      </SectionKicker>
      <StarterPrompt prompt={starterPrompt} />
      {starterArtifact && focusGap && (
        <details
          className="group bg-white border border-[color:var(--ink-a10)] rounded-[20px] overflow-hidden"
          data-print-hide="true"
        >
          <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--ink)] hover:bg-[color:var(--cream)] transition-colors">
            <span>Show printable starter artifact</span>
            <span
              aria-hidden
              className="text-[12px] transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <div className="p-5 border-t border-[color:var(--ink-a10)]">
            <StarterArtifactCard
              artifact={starterArtifact}
              tierLabel={tier.label}
              topGapLabel={focusGap.label}
            />
          </div>
        </details>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* 7-DAY PLAN — numbered card grid                                      */
/* -------------------------------------------------------------------- */

function SevenDayPlanGrid() {
  return (
    <section className="space-y-8">
      <SectionKicker>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Your 7-day AI activation plan
          </p>
          <h2 className="text-[28px] md:text-[36px] leading-tight tracking-[-0.01em] font-semibold text-[color:var(--ink)]">
            What to do this week.
          </h2>
        </div>
        <p className="text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--slate-600)] max-w-md">
          One concrete action per day. Designed for a banker with a regular schedule and no AI sandbox of their own.
        </p>
      </SectionKicker>
      <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {SEVEN_DAY_PLAN.map(({ day, action }) => (
          <li
            key={day}
            className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[20px] p-5"
          >
            <span
              aria-hidden
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[color:var(--ink)] text-white text-[12px] tabular-nums font-bold"
            >
              {day}
            </span>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--slate-600)]">
              Day {day}
            </p>
            <p className="mt-2 text-[15px] leading-[1.55] text-[color:var(--ink)]/85">
              {action}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* CLOSING CTA — mockup band pattern                                    */
/* -------------------------------------------------------------------- */

function ClosingCtaBand({ cta }: { readonly cta: ClosingCta }) {
  return (
    <section data-print-hide="true">
      <article
        className="rounded-[32px] p-8 md:p-12 bg-[color:var(--ink)] text-white"
        style={{ boxShadow: 'var(--shadow-hero)' }}
      >
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-soft)]">
              {cta.eyebrow}
            </p>
            <h2 className="text-[28px] md:text-[36px] leading-tight tracking-[-0.01em] font-semibold">
              {cta.headline}
            </h2>
            <p className="text-[15px] md:text-[16px] leading-[1.6] text-[color:var(--on-dark-80)] max-w-xl">
              {cta.body}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a
              href={cta.primary.href}
              data-plausible-event-source={cta.primary.source}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-[12px] bg-[color:var(--gold)] text-[color:var(--ink)] text-[14px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-[color:var(--gold-2)]"
            >
              {cta.primary.label}
            </a>
            <div className="flex flex-col items-stretch md:items-end gap-1.5 pt-2">
              {[cta.secondary, cta.tertiary].map((offer) => (
                <a
                  key={offer.source}
                  href={offer.href}
                  data-plausible-event-source={offer.source}
                  className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--on-dark-65)] hover:text-[color:var(--gold-soft)] underline underline-offset-4 decoration-[color:var(--on-dark-20)] hover:decoration-[color:var(--gold-soft)] transition-colors"
                >
                  {offer.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Shared helpers                                                       */
/* -------------------------------------------------------------------- */

function SectionKicker({ children }: { readonly children: React.ReactNode }) {
  return (
    <header className="grid gap-6 md:grid-cols-[0.55fr_0.45fr] md:items-end">
      {children}
    </header>
  );
}
