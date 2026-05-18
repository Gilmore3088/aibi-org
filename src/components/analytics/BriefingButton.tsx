'use client';

// BriefingButton — wraps the Calendly Executive Briefing CTA with the
// `briefing_booked` analytics event so we can attribute briefings to
// the surface that originated them.
//
// Why a wrapper component vs onClick at each call site:
//   - Calendly URLs render inside Server Components (advisory page,
//     for-institutions/samples/*); onClick handlers force conversion to
//     Client Components. This isolates the boundary to one small file.
//   - One source of truth for the analytics fire — if we ever switch
//     analytics providers, only this file changes.
//
// Accessibility: this renders a plain <a> with target=_blank and
// rel=noopener noreferrer for the external Calendly link. The visual
// styling is whatever the parent supplies via className.

import { trackBriefingBooked } from '@/lib/analytics/events';

export type BriefingSource = 'home' | 'cta' | 'assessment' | 'results' | 'services';

interface BriefingButtonProps {
  readonly href: string;
  readonly source: BriefingSource;
  readonly className?: string;
  readonly children: React.ReactNode;
  readonly ariaLabel?: string;
}

export function BriefingButton({
  href,
  source,
  className,
  children,
  ariaLabel,
}: BriefingButtonProps): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => trackBriefingBooked({ source })}
    >
      {children}
    </a>
  );
}
