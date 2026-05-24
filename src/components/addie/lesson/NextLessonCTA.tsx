// NextLessonCTA — mono caps "NEXT LESSON →" button. Renders nothing when
// there is no next lesson (end of module/course).

import Link from 'next/link';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface NextLessonCTAProps {
  readonly nextHref?: string | null;
  readonly nextLabel?: string;
  readonly endOfCourse?: boolean;
  /** When true, override the normal next/end-of-course path with the gate fork. */
  readonly gateNext?: boolean;
}

export function NextLessonCTA({
  nextHref,
  nextLabel,
  endOfCourse,
  gateNext,
}: NextLessonCTAProps) {
  if (gateNext) {
    return (
      <div className="mt-10 border-t border-[var(--ledger-rule)] pt-6 flex items-center justify-between gap-4">
        <p className="font-serif text-lg text-[var(--ledger-ink)]">
          You&apos;ve finished the free side. Pick how you want to continue.
        </p>
        <Link href="/foundation/gate" className="shrink-0">
          <LedgerButton variant="primary">Continue →</LedgerButton>
        </Link>
      </div>
    );
  }
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
