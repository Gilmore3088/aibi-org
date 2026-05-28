import type { ReactNode } from 'react';
import { Button } from './Button';

export interface CtaAction {
  label: string;
  href: string;
  variant?: 'gold' | 'ghost-dark';
}

export interface CtaBandProps {
  /** Small caps label above the heading. Defaults to "The AI Banking Institute". */
  kicker?: string;
  /** The headline. */
  heading: ReactNode;
  /** Optional supporting copy. */
  body?: ReactNode;
  /** 1–2 CTAs stacked on the right side of the band. */
  actions: CtaAction[];
  /** Render the surrounding dark .mk-cta wrapper. Defaults to true. */
  wrap?: boolean;
  /** Hide on mobile (<768px). Use when StickyMobileCta already covers the same action. */
  hiddenOnMobile?: boolean;
}

export function CtaBand({
  kicker = 'The AI Banking Institute',
  heading,
  body,
  actions,
  wrap = true,
  hiddenOnMobile = false,
}: CtaBandProps) {
  const band = (
    <div className="mk-cta-band">
      <div>
        <div className="mk-k">{kicker}</div>
        <h2>{heading}</h2>
        {body && <p>{body}</p>}
      </div>
      <div className="mk-cta-actions">
        {actions.map((a) => (
          <Button key={a.href + a.label} variant={a.variant ?? 'gold'} size="lg" href={a.href}>
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );

  if (!wrap) return band;

  return (
    <section className={`mk-cta${hiddenOnMobile ? ' mk-cta-band-desktop' : ''}`}>
      <div className="mk-container">{band}</div>
    </section>
  );
}
