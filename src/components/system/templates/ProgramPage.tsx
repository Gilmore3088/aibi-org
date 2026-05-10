/**
 * <ProgramPage> — program detail / catalog page archetype.
 *
 * Used for /education/practitioner, /education/specialist, /education/leader,
 * and any future program. The same template renders any program; the program-
 * specific content comes from `content/courses/<slug>/`.
 *
 * Layout:
 *   1. Pillar-stripe hero with program code + designation + lede + price card
 *   2. KPI ribbon of program facts (format / effort / outcome / aligned-with)
 *   3. §01 What you'll be able to do (outcomes list)
 *   4. §02 Curriculum table (modules, hours, descriptions)
 *   5. §03 Capstone artifacts on dark band
 *   6. Closing CTA → enroll
 */

import type { ReactNode } from "react";
import { Section } from "../Section";
import { SectionHeader } from "../SectionHeader";
import { KPIRibbon, type KPIItem } from "../KPIRibbon";
import { DefinitionList, type DefinitionListItem } from "../DefinitionList";
import { Cta } from "../Cta";
import type { Pillar } from "@/lib/design-system/tokens";
import { PILLAR_COLORS } from "@/lib/design-system/tokens";

export interface ProgramModule {
  readonly number: number;
  readonly title: string;
  readonly summary?: string;
  readonly minutes: number;
}

export interface ProgramArtifact {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

export interface ProgramPageProps {
  readonly code: string; // "AiBI Foundations"
  readonly designation: string; // "Banking AI Foundations · The AI Banking Institute"
  readonly level: string; // "01 · Foundational"
  readonly pillar: Pillar;
  readonly tagline?: string;
  readonly lede: ReactNode;
  readonly facts: readonly KPIItem[];
  readonly outcomes: readonly string[];
  readonly modules: readonly ProgramModule[];
  readonly artifacts: readonly ProgramArtifact[];
  readonly priceCard: {
    readonly heading: string;
    readonly amount: string;
    readonly per?: string;
    readonly facts: readonly DefinitionListItem[];
  };
  readonly primaryCta: { readonly href: string; readonly label: string };
  readonly secondaryCta?: { readonly href: string; readonly label: string };
  readonly closingCta?: { readonly href: string; readonly label: string };
}

export function ProgramPage({
  code,
  designation,
  level,
  pillar,
  tagline,
  lede,
  facts,
  outcomes,
  modules,
  artifacts,
  priceCard,
  primaryCta,
  secondaryCta,
  closingCta,
}: ProgramPageProps) {
  const stripeColor = PILLAR_COLORS[pillar];

  return (
    <main>
      <section className="border-b border-strong">
        <span aria-hidden="true" className="block h-[4px]" style={{ background: stripeColor }} />
        <div className="bg-linen px-s7 py-s12 md:py-s16">
          <div className="max-w-wide mx-auto grid gap-s10 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s4">
                {level}
              </p>
              <h1 className="font-serif text-display-lg md:text-display-xl text-ink leading-tight tracking-tightish">
                {code}
              </h1>
              <p className="font-serif italic text-body-lg text-slate mt-s2">{designation}</p>
              {tagline && (
                <p className="font-serif italic text-body-lg text-terra mt-s4">{tagline}</p>
              )}
              <p className="text-body-lg text-ink/80 leading-relaxed mt-s5 max-w-narrow">{lede}</p>
              <div className="mt-s8 flex flex-wrap items-center gap-s6">
                <Cta href={primaryCta.href}>{primaryCta.label}</Cta>
                {secondaryCta && (
                  <Cta variant="secondary" href={secondaryCta.href}>
                    {secondaryCta.label}
                  </Cta>
                )}
              </div>
            </div>
            <aside className="border border-hairline bg-linen p-s6">
              <p className="font-mono text-label-md uppercase tracking-widest text-slate mb-s2">
                {priceCard.heading}
              </p>
              <p className="font-mono text-display-md tabular-nums text-ink leading-none">
                {priceCard.amount}
              </p>
              {priceCard.per && (
                <p className="text-body-sm text-slate mt-s1 mb-s4">{priceCard.per}</p>
              )}
              <DefinitionList items={priceCard.facts} className="mt-s4" />
            </aside>
          </div>
        </div>
      </section>

      {/* KPI ribbon — program facts */}
      <KPIRibbon items={facts} />

      {/* §01 — What you'll be able to do */}
      <Section variant="linen" padding="default">
        <SectionHeader number="01" label="Outcomes" title="What you'll be able to do" />
        <ul className="grid sm:grid-cols-2 gap-x-s8 gap-y-s2 mt-s6">
          {outcomes.map((outcome) => (
            <li
              key={outcome}
              className="flex gap-s3 text-body-md leading-relaxed text-ink/80 border-b border-hairline pb-s3"
            >
              <span aria-hidden="true" className="font-mono text-terra mt-[6px]">
                —
              </span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* §02 — Curriculum */}
      <Section variant="parch" padding="default">
        <SectionHeader
          number="02"
          label="Curriculum"
          title={`${modules.length} modules. One arc.`}
          subtitle="Built around the work bankers actually do. Each module ends in a deliverable."
        />
        <div className="border-y border-strong">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-strong">
                <th className="text-left p-s3 font-mono text-label-sm uppercase tracking-widest text-slate w-[60px]">
                  #
                </th>
                <th className="text-left p-s3 font-mono text-label-sm uppercase tracking-widest text-slate">
                  Module
                </th>
                <th className="text-right p-s3 font-mono text-label-sm uppercase tracking-widest text-slate w-[100px]">
                  Min
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod.number} className="border-b border-hairline align-top">
                  <td className="p-s4 font-mono text-mono-sm tabular-nums text-terra">
                    {String(mod.number).padStart(2, "0")}
                  </td>
                  <td className="p-s4">
                    <p className="font-serif text-body-md md:text-body-lg leading-snug text-ink">
                      {mod.title}
                    </p>
                    {mod.summary && (
                      <p className="text-body-sm text-slate mt-s1 leading-relaxed">{mod.summary}</p>
                    )}
                  </td>
                  <td className="p-s4 text-right font-mono text-mono-sm tabular-nums text-slate">
                    {mod.minutes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* §03 — Capstone artifacts (dark band) */}
      <Section variant="dark" divider="strong" padding="default">
        <SectionHeader
          number="03"
          label="Capstone"
          title={`${artifacts.length} deliverables, not ${artifacts.length} certificates.`}
          subtitle="A practitioner leaves with reviewed work. Not a quiz score."
          tone="dark"
        />
        <div className="grid md:grid-cols-3 gap-s6 mt-s6">
          {artifacts.map((art, idx) => (
            <article key={art.slug} className="border border-cream/20 p-s5">
              <p className="font-mono text-mono-sm uppercase tracking-wider text-cream mb-s3">
                0{idx + 1} / {art.slug}
              </p>
              <h3 className="font-serif text-display-xs text-bone leading-snug mb-s2">
                {art.title}
              </h3>
              <p className="text-body-sm leading-relaxed text-cream">{art.description}</p>
            </article>
          ))}
        </div>
        {closingCta && (
          <div className="mt-s10 text-center">
            <Cta href={closingCta.href} tone="dark">
              {closingCta.label}
            </Cta>
          </div>
        )}
      </Section>
    </main>
  );
}
