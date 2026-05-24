// NextLessonCTA — mono caps "NEXT LESSON →" button. Renders nothing when
// there is no next lesson (end of module/course).

import Link from 'next/link';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

interface NextLessonCTAProps {
  readonly nextHref?: string | null;
  readonly nextLabel?: string;
  readonly nextCrossesModule?: boolean;
  readonly endOfCourse?: boolean;
  /** When true, override the normal next/end-of-course path with the gate fork. */
  readonly gateNext?: boolean;
}

export function NextLessonCTA({
  nextHref,
  nextLabel,
  nextCrossesModule,
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
    <Link
      href={nextHref}
      className="group mt-10 block rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] transition-all duration-[160ms] p-5 sm:p-6 flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <span className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
          {nextCrossesModule ? 'Next module' : 'Next lesson'}
        </span>
        <h3 className="mt-1.5 font-serif text-xl sm:text-2xl text-[var(--ledger-ink)] leading-tight">
          {nextLabel ?? 'Continue'}
        </h3>
      </div>
      <span
        aria-hidden
        className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--ledger-ink)] text-[var(--ledger-paper)] text-lg transition-transform duration-[200ms] group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
