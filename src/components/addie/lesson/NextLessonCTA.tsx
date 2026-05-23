// NextLessonCTA — mono caps "NEXT LESSON →" button. Renders nothing when
// there is no next lesson (end of module/course).

import Link from 'next/link';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface NextLessonCTAProps {
  readonly nextHref?: string | null;
  readonly nextLabel?: string;
  readonly endOfCourse?: boolean;
}

export function NextLessonCTA({ nextHref, nextLabel, endOfCourse }: NextLessonCTAProps) {
  if (!nextHref) {
    if (endOfCourse) {
      return (
        <div className="mt-10 border-t border-[var(--ledger-rule)] pt-6">
          <p className="font-serif text-xl text-[var(--ledger-ink)]">
            That&apos;s the end of this module.
          </p>
          <Link href="/foundation/dashboard" className="mt-2 inline-block">
            <LedgerButton variant="primary">Back to dashboard</LedgerButton>
          </Link>
        </div>
      );
    }
    return null;
  }
  return (
    <div className="mt-10 border-t border-[var(--ledger-rule)] pt-6 flex items-center justify-end">
      <Link href={nextHref}>
        <LedgerButton variant="primary">Next lesson →</LedgerButton>
      </Link>
      {nextLabel ? (
        <span className="ml-3 text-sm text-[var(--ledger-muted)]">{nextLabel}</span>
      ) : null}
    </div>
  );
}
