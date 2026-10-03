/* Shared shell for static-content gap pages.
 *
 * Wraps a hero + one or more body sections + an optional CTA band in
 * the mockup design system chrome. Use for marketing surfaces where
 * the structure is "hero + N content sections" without interactive
 * pieces. Interactive pages compose the primitives directly.
 */

import type { ReactNode } from 'react';
import { SiteHeader } from './index';
import { Button, ArrowGlyph } from './Button';
import type { CtaAction } from './CtaBand';


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

/** "Security & Governance" → "security-governance": the hero's command line. */
function toCmd(eyebrow: string): string {
  return eyebrow
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
    <div className="mockup-scope ax-page">
      <SiteHeader activePath={activePath} cta={cta} />

      <section className="ax-hero">
        <div className={`mk-container${heroAside ? ' ax-hero-split' : ''}`}>
          <div>
            <p className="ax-cmd">{toCmd(eyebrow)}</p>
            <h1 className="ax-display">{title}</h1>
            {/* div, not p — lede is a ReactNode slot that may contain
                block-level children (<ul>, <ol>, <details>). A <p> wrapper
                caused a hydration error on /about ("<ul> cannot be a
                descendant of <p>"). */}
            <div className="ax-lede">{lede}</div>
            {heroActions && heroActions.length > 0 && (
              <div className="ax-actions">
                {heroActions.map((a) => (
                  <Button key={a.href + a.label} variant={a.variant ?? 'gold'} size="lg" href={a.href}>
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

      <main>
        {sections.map((s, i) => (
          <section key={i} className={`ax-section ax-light ax-shell-block${s.surface === 'white' ? ' is-paper' : ''}`}>
            <div className="mk-container">
              <div className="ax-section-head">
                {s.kicker && <p className="ax-k">{s.kicker}</p>}
                <h2 className="ax-display">{s.heading}</h2>
                {s.lede && <div className="ax-shell-lede">{s.lede}</div>}
              </div>
              {s.body}
            </div>
          </section>
        ))}
      </main>

      {ctaBand && (
        <section className="ax-section ax-close">
          <div className="mk-container">
            {ctaBand.kicker && <p className="ax-k">{ctaBand.kicker}</p>}
            <h2 className="ax-display">{ctaBand.heading}</h2>
            {ctaBand.body && <p className="ax-muted">{ctaBand.body}</p>}
            <div className="ax-actions">
              {ctaBand.actions.map((a, i) => (
                <Button key={a.href + a.label} variant={a.variant ?? (i === 0 ? 'gold' : 'ghost-dark')} size="lg" href={a.href}>
                  {a.label}
                  {(a.variant ?? (i === 0 ? 'gold' : 'ghost-dark')) === 'gold' && <ArrowGlyph />}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
