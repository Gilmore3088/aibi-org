/**
 * <ResultsPage> — assessment results archetype.
 *
 * Composes:
 *   - dark header strip with run-date and owner-bound URL
 *   - 3-column hero: ScoreRing | tier headline | tier-card with actions
 *   - DimensionGrid (8-cell breakdown)
 *   - Starter artifact section (dark band) with preview + actions
 *   - Three-step "where to go next" closing
 */

import type { ReactNode } from "react";
import { Section } from "../Section";
import { SectionHeader } from "../SectionHeader";
import { ScoreRing } from "../ScoreRing";
import { DimensionGrid, type DimensionScore } from "../DimensionGrid";
import { Cta } from "../Cta";
import { tierColor, tierForScore } from "@/lib/design-system/tokens";

const TIER_LABEL = {
  "starting-point": "Starting Point",
  "early-stage": "Early Stage",
  "building-momentum": "Building Momentum",
  "ready-to-scale": "Ready to Scale",
} as const;

export interface ResultsHeroAction {
  readonly label: string;
  readonly href: string;
  readonly tone?: "primary" | "secondary";
}

export interface NextStep {
  readonly stepLabel: string;
  readonly title: string;
  readonly body: ReactNode;
  readonly cta: { readonly href: string; readonly label: string };
}

export interface ResultsArtifact {
  readonly title: string;
  readonly meta: string; // "For: community bank · Building Momentum tier · v1.2"
  readonly leadParagraph: ReactNode;
  readonly purposeList: readonly string[];
  readonly fields?: ReactNode;
  readonly downloads: readonly { readonly type: string; readonly label: string; readonly href: string }[];
  readonly briefing?: {
    readonly heading: string;
    readonly body: string;
    readonly cta: { readonly href: string; readonly label: string };
  };
}

export interface ResultsPageProps {
  readonly resultId: string;
  readonly score: number;
  readonly maxScore?: number;
  readonly runDate: string; // ISO
  readonly headline: ReactNode;
  readonly diagnostic: ReactNode;
  readonly heroActions: readonly ResultsHeroAction[];
  readonly dimensions: readonly DimensionScore[];
  readonly artifact: ResultsArtifact;
  readonly nextSteps: readonly NextStep[];
}

const FORMAT_DATE = (iso: string) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3) return iso;
  return `${months[(parts[1] ?? 1) - 1]} ${parts[2]}, ${parts[0]}`;
};

export function ResultsPage({
  resultId,
  score,
  maxScore = 48,
  runDate,
  headline,
  diagnostic,
  heroActions,
  dimensions,
  artifact,
  nextSteps,
}: ResultsPageProps) {
  const tier = tierForScore(score);
  const tierName = TIER_LABEL[tier];
  const tierBarColor = tierColor(score);

  return (
    <main>
      <div className="bg-ink text-cream px-s7 py-s4 border-b border-strong">
        <div className="max-w-wide mx-auto flex flex-wrap items-center justify-between gap-s3 font-mono text-mono-sm tabular-nums">
          <span className="text-cream/85">
            Readiness Diagnostic · Run on {FORMAT_DATE(runDate)}
          </span>
          <span className="text-cream/65 font-mono text-label-md">
            /results/{resultId} · private · owner-bound
          </span>
        </div>
      </div>

      <Section variant="linen" divider="strong" padding="default">
        <div className="grid gap-s10 md:grid-cols-[auto_1fr_auto] md:items-center">
          <ScoreRing score={score} maxScore={maxScore} />
          <div>
            <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s3">
              Your readiness profile
            </p>
            <h1 className="font-serif text-display-lg text-ink leading-tight tracking-tightish">
              {headline}
            </h1>
            <p className="text-body-lg text-ink/80 leading-relaxed mt-s4 max-w-narrow">
              {diagnostic}
            </p>
          </div>
          <aside className="border border-hairline bg-linen p-s5 min-w-[200px]">
            <p className="font-mono text-label-sm uppercase tracking-widest text-slate mb-s2">
              Tier
            </p>
            <p className="font-serif text-display-xs text-ink leading-snug mb-s3">{tierName}</p>
            <span
              aria-hidden="true"
              className="block h-[4px] mb-s4 w-full"
              style={{ background: tierBarColor }}
            />
            <ul className="space-y-s2 text-body-sm">
              {heroActions.map((act, idx) => (
                <li key={idx}>
                  <Cta
                    href={act.href}
                    variant={act.tone === "primary" ? "primary" : "secondary"}
                    className="block w-full text-center"
                  >
                    {act.label}
                  </Cta>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section variant="linen" padding="default">
        <SectionHeader
          number="01"
          label="Eight dimensions, scored"
          title="Where you're strong, where to act first."
          subtitle="Each dimension contributes 4 points. Your weakest dimensions become the focus of the starter artifact below."
        />
        <DimensionGrid dimensions={dimensions} className="mt-s6" />
      </Section>

      <Section variant="dark" padding="default">
        <SectionHeader
          number="02"
          label="Your tailored starter artifact"
          title={artifact.title}
          subtitle={artifact.meta}
          tone="dark"
        />
        <div className="grid gap-s8 lg:grid-cols-[1.4fr_1fr] mt-s6">
          <div className="bg-linen text-ink p-s7 border border-cream/20">
            <p className="text-body-md leading-relaxed mb-s4">{artifact.leadParagraph}</p>
            <p className="font-medium text-body-md mb-s2">What this artifact is for:</p>
            <ol className="list-decimal pl-s6 space-y-s2 text-body-sm leading-relaxed">
              {artifact.purposeList.map((purpose) => (
                <li key={purpose}>{purpose}</li>
              ))}
            </ol>
            {artifact.fields && (
              <p className="mt-s4 text-body-sm leading-relaxed">{artifact.fields}</p>
            )}
            <div
              aria-hidden="true"
              className="-mx-s7 -mb-s7 mt-s8 h-s8 bg-gradient-to-b from-transparent to-linen"
            />
          </div>
          <div>
            <h3 className="font-serif text-body-lg text-bone mb-s4">Take it with you</h3>
            <ul className="space-y-s2 mb-s6">
              {artifact.downloads.map((d) => (
                <li
                  key={d.href}
                  className="border-b border-cream/20 last:border-b-0 pb-s2"
                >
                  <a
                    href={d.href}
                    className="grid grid-cols-[44px_1fr] gap-s3 text-body-sm text-amber-light hover:text-bone"
                  >
                    <span className="font-mono text-label-md uppercase tracking-wide text-cream/70">
                      {d.type}
                    </span>
                    <span>{d.label} →</span>
                  </a>
                </li>
              ))}
            </ul>
            {artifact.briefing && (
              <div className="border border-cream/20 p-s4">
                <h4 className="font-serif text-body-md text-bone mb-s2">
                  {artifact.briefing.heading}
                </h4>
                <p className="text-body-sm text-cream leading-relaxed mb-s3">
                  {artifact.briefing.body}
                </p>
                <Cta href={artifact.briefing.cta.href} tone="dark">
                  {artifact.briefing.cta.label}
                </Cta>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section variant="linen" padding="default">
        <SectionHeader number="03" label="Where to go next" title="Three paths from here." />
        <div className="grid sm:grid-cols-3 gap-px bg-hairline border-y border-strong mt-s6">
          {nextSteps.map((step) => (
            <article key={step.title} className="bg-linen p-s6">
              <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s2">
                {step.stepLabel}
              </p>
              <h3 className="font-serif text-display-xs leading-snug mb-s3">{step.title}</h3>
              <p className="text-body-sm leading-relaxed text-ink/80 mb-s4">{step.body}</p>
              <Cta variant="secondary" href={step.cta.href}>
                {step.cta.label}
              </Cta>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
