// /results/in-depth/[id] — In-Depth Assessment results page.
//
// Renders the dimension breakdown, tier label, and a tailored next-step
// recommendation for a completed 48Q in-depth assessment. The data shape
// is the persisted DB row (indepth_assessment_takers), not in-flight
// session state — the page is the destination for the completion email
// link.
//
// This is a server-rendered page. We deliberately keep it client-free:
// no scroll-spy, no print button — the in-depth flow ships PDF/return
// URL separately. Owner-binding is intentionally NOT enforced here yet
// (the link is shared via email); the takerId is a UUID and acts as the
// access token. Tighten with auth if/when leader dashboards expose it.
//
// Refs: Task 12 — /results/in-depth/{id} results page + completion email.

import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PER_DIMENSION = 24; // 6 questions per dimension × 4 max points
const INDEPTH_MAX_SCORE = 192; // 48 questions × 4 max points
const ALL_DIMENSIONS: readonly Dimension[] = [
  'current-ai-usage',
  'experimentation-culture',
  'ai-literacy-level',
  'quick-win-potential',
  'leadership-buy-in',
  'security-posture',
  'training-infrastructure',
  'builder-potential',
];

interface ResultsPageProps {
  readonly params: { readonly id: string };
}

interface RankedDimension {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly pct: number;
}

function calendlyHref(): string {
  return process.env.NEXT_PUBLIC_CALENDLY_URL ?? '/for-institutions';
}

export default async function InDepthResultsPage({ params }: ResultsPageProps) {
  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from('indepth_assessment_takers')
    .select('id, completed_at, score_total, score_per_dimension, invite_email')
    .eq('id', params.id)
    .maybeSingle();

  if (!row || !row.completed_at || typeof row.score_total !== 'number') {
    notFound();
  }

  // In-Depth uses all 48 questions × max 4 points = 192. getTierV2 normalizes
  // to the canonical 12-48 tier scale.
  const tier = getTierV2(row.score_total, INDEPTH_MAX_SCORE);
  const perDim = (row.score_per_dimension ?? {}) as Partial<Record<Dimension, number>>;

  const ranked: RankedDimension[] = ALL_DIMENSIONS.map((id) => {
    const score = typeof perDim[id] === 'number' ? (perDim[id] as number) : 0;
    return {
      id,
      label: DIMENSION_LABELS[id],
      score,
      pct: score / MAX_PER_DIMENSION,
    };
  }).sort((a, b) => a.pct - b.pct);

  const focusGap = ranked[0];
  const starterArtifact = focusGap ? getStarterArtifact(focusGap.id) : null;

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-[color:var(--color-ink)]/15 pb-8">
          <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3">
            In-Depth AI Readiness Briefing
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight">
            Your assessment, in full.
          </h1>
        </header>

        {/* Score + tier */}
        <section className="mb-14">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Your score
          </p>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span
              className="font-mono tabular-nums text-6xl md:text-7xl"
              style={{ color: tier.colorVar }}
            >
              {row.score_total}
            </span>
            <span className="font-mono text-sm text-[color:var(--color-ink)]/55">
              / {INDEPTH_MAX_SCORE}
            </span>
            <span className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)]">
              {tier.label}
            </span>
          </div>
          <p className="mt-5 text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed max-w-2xl">
            {tier.summary}
          </p>
        </section>

        {/* Dimension breakdown */}
        <section className="mb-14" aria-labelledby="breakdown-heading">
          <h2
            id="breakdown-heading"
            className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-6"
          >
            Where you stand · all 8 dimensions
          </h2>
          <ul className="space-y-5">
            {ranked.map((dim) => {
              const widthPct = Math.max(0, Math.min(100, dim.pct * 100));
              return (
                <li key={dim.id} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)] min-w-0 break-words">
                      {dim.label}
                    </p>
                    <span className="font-mono text-xs tabular-nums text-[color:var(--color-ink)]/65 shrink-0">
                      {dim.score} / {MAX_PER_DIMENSION}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full bg-[color:var(--color-parch)] rounded-[2px] overflow-hidden"
                    role="presentation"
                  >
                    <div
                      className="h-full bg-[color:var(--color-terra)]"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Tailored next step */}
        {starterArtifact && focusGap && (
          <section className="mb-14" aria-labelledby="next-step-heading">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Your first move
            </p>
            <h2
              id="next-step-heading"
              className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-3"
            >
              {starterArtifact.title}
            </h2>
            <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/80 mb-6 max-w-2xl">
              {starterArtifact.subtitle}
            </p>
            <article className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/15 rounded-[3px] p-6 md:p-8">
              <pre className="whitespace-pre-wrap font-sans text-[14px] leading-[1.7] text-[color:var(--color-ink)]/90">
                {starterArtifact.body}
              </pre>
            </article>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
              Surfaced by your weakest dimension: {focusGap.label} ({focusGap.score}/
              {MAX_PER_DIMENSION})
            </p>
          </section>
        )}

        {/* Footer CTA */}
        <footer className="border-t border-[color:var(--color-ink)]/15 pt-8 mt-8">
          <p className="font-serif text-xl md:text-2xl text-[color:var(--color-ink)] leading-snug mb-4">
            Want to talk through your results?
          </p>
          <a
            href={calendlyHref()}
            className="inline-flex items-center gap-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[1.4px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            <span>Book a call</span>
            <span aria-hidden className="font-mono">→</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
