/**
 * <MarketingPage> — public marketing archetype.
 *
 * Used by /, /about, /for-institutions, /security, /education. Composes:
 *   - editorial hero (left-aligned; eyebrow → serif H1 with optional terra
 *     emphasis → lede → primary CTA + secondary CTA)
 *   - optional aside slot in the hero (for marginalia or featured quote)
 *   - optional KPI ribbon directly under the hero
 *   - body sections passed in as React children
 *   - optional closing CTA section on a dark band
 *
 * The hero is the only piece the template fully owns; everything else passes
 * through. This lets each marketing page choose its own composition while
 * inheriting the editorial hero shape.
 */

import type { ReactNode } from "react";
import { Section } from "../Section";
import { KPIRibbon, type KPIItem } from "../KPIRibbon";
import { Cta } from "../Cta";
import { cn } from "@/lib/utils/cn";

export interface MarketingHero {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  /** Optional sub-title in italic serif under the H1. */
  readonly tagline?: string;
  readonly lede?: ReactNode;
  readonly primaryCta?: { readonly href: string; readonly label: string };
  readonly secondaryCta?: { readonly href: string; readonly label: string };
  /** Optional aside content (marginalia, quote, founder card). */
  readonly aside?: ReactNode;
  /**
   * Optional content rendered INSIDE the hero Section, full-width,
   * below the title/lede/CTAs row. Use when the hero's payload is
   * tiles, a chart, or any block that should read as part of the
   * hero band (no divider, no second Section).
   */
  readonly payload?: ReactNode;
  /** Override the hero Section's bottom divider. Defaults to "strong". */
  readonly divider?: "strong" | "hairline" | "none";
}

export interface MarketingClose {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly body?: ReactNode;
  readonly cta: { readonly href: string; readonly label: string };
}

export interface MarketingPageProps {
  readonly hero: MarketingHero;
  readonly kpis?: readonly KPIItem[];
  /** Optional closing dark-band CTA. Omit to skip. */
  readonly closing?: MarketingClose;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function MarketingPage({ hero, kpis, closing, children, className }: MarketingPageProps) {
  const hasAside = Boolean(hero.aside);
  return (
    <main className={className}>
      <Section variant="linen" divider={hero.divider ?? "strong"} padding="hero">
        <div className={cn("grid gap-s10", hasAside && "lg:grid-cols-[1.5fr_1fr] lg:items-end")}>
          <div>
            {hero.eyebrow && (
              <p className="font-serif-sc text-label-md uppercase tracking-widest text-terra mb-s4">
                {hero.eyebrow}
              </p>
            )}
            <h1 className="font-serif text-display-lg md:text-display-xl text-ink leading-tight tracking-tightish">
              {hero.title}
            </h1>
            {hero.tagline && (
              <p className="font-serif italic text-body-lg text-terra mt-s4">{hero.tagline}</p>
            )}
            {hero.lede && (
              <p className="text-body-lg text-ink/80 leading-relaxed mt-s5 max-w-narrow">
                {hero.lede}
              </p>
            )}
            {(hero.primaryCta || hero.secondaryCta) && (
              <div className="mt-s8 flex flex-wrap items-center gap-s6">
                {hero.primaryCta && <Cta href={hero.primaryCta.href}>{hero.primaryCta.label}</Cta>}
                {hero.secondaryCta && (
                  <Cta variant="secondary" href={hero.secondaryCta.href}>
                    {hero.secondaryCta.label}
                  </Cta>
                )}
              </div>
            )}
          </div>
          {hero.aside && <div>{hero.aside}</div>}
        </div>
        {hero.payload && <div className="mt-s10">{hero.payload}</div>}
      </Section>

      {kpis && kpis.length > 0 && (
        <div className="mx-auto max-w-wide">
          <KPIRibbon items={kpis} />
        </div>
      )}

      {children}

      {closing && (
        <Section variant="dark" divider="none" padding="hero">
          <div className="max-w-narrow text-center mx-auto">
            {closing.eyebrow && (
              <p className="font-serif-sc text-label-md uppercase tracking-widest text-cream mb-s3">
                {closing.eyebrow}
              </p>
            )}
            <h2 className="font-serif text-display-lg text-bone leading-tight">
              {closing.title}
            </h2>
            {closing.body && (
              <p className="text-body-lg text-cream leading-relaxed mt-s5">{closing.body}</p>
            )}
            <div className="mt-s8">
              <Cta href={closing.cta.href} tone="dark">
                {closing.cta.label}
              </Cta>
            </div>
          </div>
        </Section>
      )}
    </main>
  );
}
