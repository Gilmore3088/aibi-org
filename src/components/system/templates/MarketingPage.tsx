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
  /**
   * Optional pre-rendered headline (e.g. inline SVG). When set, the H1
   * is rendered FROM THIS NODE and `title` is ignored visually but kept
   * as the source of truth for metadata. The node should provide its
   * own semantic <h1> (typically visually-hidden alongside an SVG) so
   * screen readers + crawlers still see a heading.
   *
   * Used on the homepage so the LCP element ships as inline-SVG vector
   * paths, eliminating the Newsreader font-load dependency.
   */
  readonly titleNode?: ReactNode;
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
            {hero.titleNode ? (
              <>
                {/* Mobile: HTML <h1> using `title`. Desktop (md:+):
                    LCP-optimized SVG via `titleNode`. The SVG is a
                    desktop-wide editorial banner (5.77:1 aspect ratio);
                    shrinking it to 375px yields readable-but-tiny letters
                    that don't read like a proper hero. The HTML H1 sizes
                    responsively (clamp-style display tokens) and stacks
                    naturally on narrow viewports. See #194.

                    `HeroHeadlineSvg` already includes its own sr-only
                    <h1> for screen readers, so wrapping it in a div with
                    `hidden md:block` hides BOTH the visible SVG and that
                    sr-only H1 on mobile — leaving exactly one announced
                    H1 per breakpoint. */}
                <div className="hidden md:block">{hero.titleNode}</div>
                <h1 className="md:hidden font-serif text-display-lg text-ink leading-tight tracking-tightish">
                  {hero.title}
                </h1>
              </>
            ) : (
              <h1 className="font-serif text-display-lg md:text-display-xl text-ink leading-tight tracking-tightish">
                {hero.title}
              </h1>
            )}
            {hero.tagline && (
              <p className="font-serif italic text-body-lg text-terra mt-s4">{hero.tagline}</p>
            )}
            {hero.lede && (
              <p className="text-body-lg text-ink/80 leading-relaxed mt-s3 max-w-narrow">
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
