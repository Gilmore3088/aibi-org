// NextUpCard — "Continue where you left off" tile.

import Link from 'next/link';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface NextUpCardProps {
  readonly moduleId: string;
  readonly lessonId: string;
  readonly title: string;
  readonly durationMin: number;
}

export function NextUpCard({ moduleId, lessonId, title, durationMin }: NextUpCardProps) {
  return (
    <LedgerCard variant="feature" className="p-6">
      <KickerLabel tone="muted">Continue</KickerLabel>
      <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">{title}</h2>
      <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
        {durationMin} min · {moduleId}.{lessonId}
      </p>
      <div className="mt-4">
        <Link href={`/foundation/${moduleId}/${lessonId}`}>
          <LedgerButton variant="primary">Open lesson</LedgerButton>
        </Link>
      </div>
    </LedgerCard>
  );
}
