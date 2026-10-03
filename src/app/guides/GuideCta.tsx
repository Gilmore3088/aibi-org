'use client';

// The single conversion action on a guide: start the free assessment.
// A client component only so the click can be attributed to the guide that
// produced it (guide_cta_click in Vercel Analytics).

import Link from 'next/link';
import { trackGuideCtaClick } from '@/lib/analytics/events';

export interface GuideCtaProps {
  readonly slug: string;
  readonly placement: 'close' | 'inline';
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function GuideCta({ slug, placement, className, children }: GuideCtaProps) {
  return (
    <Link
      href="/assessment/take"
      className={className}
      data-guide-cta={placement}
      onClick={() => trackGuideCtaClick({ slug, placement })}
    >
      {children}
    </Link>
  );
}
