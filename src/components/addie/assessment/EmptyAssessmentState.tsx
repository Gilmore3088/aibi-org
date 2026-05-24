// EmptyAssessmentState — shown on /foundation/assessment when the learner
// has no saved Readiness Briefing yet. Points at the runner on main.

import Link from 'next/link';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export function EmptyAssessmentState() {
  return (
    <LedgerCard variant="feature" className="p-6 sm:p-8">
      <div className="space-y-4">
        <KickerLabel tone="accent">In-Depth Readiness Assessment</KickerLabel>
        <h2 className="font-serif text-2xl text-[var(--ledger-ink)] sm:text-3xl">
          Find out where you stand
        </h2>
        <p className="text-[var(--ledger-ink-2)]">
          The In-Depth Readiness Assessment is a 48-question diagnostic across
          eight readiness dimensions. You finish with a dated Readiness Briefing:
          a dimensional scorecard, a personalized plan, curated ideas and
          prompts, and a short list of next steps for your institution.
        </p>
        <ul className="space-y-2 text-sm text-[var(--ledger-ink-2)]">
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 inline-block h-px w-4 bg-[var(--ledger-rule-strong)]"
            />
            <span>48 questions across eight readiness dimensions.</span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 inline-block h-px w-4 bg-[var(--ledger-rule-strong)]"
            />
            <span>A dated briefing you can print and bring to leadership.</span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 inline-block h-px w-4 bg-[var(--ledger-rule-strong)]"
            />
            <span>Saved here for the next time you sign in.</span>
          </li>
        </ul>
        <div>
          <Link href="/assessment/in-depth">
            <LedgerButton variant="primary">Take the assessment</LedgerButton>
          </Link>
        </div>
      </div>
    </LedgerCard>
  );
}
