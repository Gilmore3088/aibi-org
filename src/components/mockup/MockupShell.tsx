/* Shared shell for static-content gap pages.
 *
 * Wraps a hero + one or more body sections + an optional CTA band in
 * the mockup design system chrome. Use for marketing surfaces where
 * the structure is "hero + N content sections" without interactive
 * pieces. Interactive pages compose the primitives directly.
 */

import type { ReactNode } from 'react';
import { SiteHeader, Section, SectionHead, EyebrowChip, CtaBand } from './index';
import { Button, ArrowGlyph } from './Button';
import type { CtaAction } from './CtaBand';

type IconProps = { className?: string; size?: number };
const ChipBookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export interface MockupShellBlock {
  /** Section kicker. */
  kicker?: string;
  /** Section heading. */
  heading: ReactNode;
  /** Optional lede paragraph below the heading. */
  lede?: ReactNode;
  /** Optional rich body — list, cards, etc. */
  body?: ReactNode;
  /** Visual surface for this section. */
  surface?: 'cream' | 'white';
}

export interface MockupShellProps {
  /** Path used to highlight the matching nav item. */
  activePath?: string;
  /** Optional override of the header CTA. */
  cta?: { label: string; href: string };
  /** Hero eyebrow chip text. */
  eyebrow: string;
  /** Hero h1. */
  title: ReactNode;
  /** Hero lede. */
  lede: ReactNode;
  /** Hero CTAs (1–2). */
  heroActions?: { label: string; href: string; variant?: 'gold' | 'ghost-dark' }[];
  /** Optional dark hero right column (info card or stat block). */
  heroAside?: ReactNode;
  /** Body sections. */
  sections?: MockupShellBlock[];
  /** Optional CTA band at the bottom. */
  ctaBand?: { kicker?: string; heading: ReactNode; body?: ReactNode; actions: CtaAction[] };
}

export function MockupShell({
  activePath,
  cta,
  eyebrow,
  title,
  lede,
  heroActions,
  heroAside,
  sections = [],
  ctaBand,
}: MockupShellProps) {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath={activePath} cta={cta} />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<ChipBookIcon />}>{eyebrow}</EyebrowChip>
            <h1>{title}</h1>
            <p className="mk-lede">{lede}</p>
            {heroActions && heroActions.length > 0 && (
              <div className="mk-ctas">
                {heroActions.map((a) => (
                  <Button
                    key={a.href + a.label}
                    variant={a.variant ?? 'gold'}
                    size="lg"
                    href={a.href}
                  >
                    {a.label}
                    {a.variant !== 'ghost-dark' && <ArrowGlyph />}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {heroAside}
        </div>
      </section>

      {sections.map((s, i) => (
        <Section key={i} variant="std" surface={s.surface ?? 'cream'}>
          <SectionHead kicker={s.kicker} heading={s.heading} lede={s.lede} />
          {s.body}
        </Section>
      ))}

      {ctaBand && (
        <CtaBand
          kicker={ctaBand.kicker}
          heading={ctaBand.heading}
          body={ctaBand.body}
          actions={ctaBand.actions}
        />
      )}
    </div>
  );
}
