// GateScreen — the three-way fork after Module 3. Design System §5.6.
// Three doors, equal visual weight. Pay → Email → Decline left-to-right.

import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { PayOptionCard } from './PayOptionCard';
import { EmailOptionForm } from './EmailOptionForm';
import { DeclineOption } from './DeclineOption';

export function GateScreen() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="text-center mb-10">
        <KickerLabel tone="muted">You finished M3</KickerLabel>
        <h1 className="mt-2 font-serif text-4xl text-[var(--ledger-ink)]">
          Three doors. Pick one.
        </h1>
        <p className="mt-3 text-base text-[var(--ledger-ink-2)] max-w-xl mx-auto">
          The free side ends here. Continue to M4 + M5, keep what you built, or take a different
          path. No countdowns, no scarcity — choose what fits.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <PayOptionCard kind="individual" />
        <EmailOptionForm />
        <DeclineOption />
      </div>
      <p className="mt-8 text-center text-sm text-[var(--ledger-muted)]">
        Buying for a team?{' '}
        <a href="/foundation/gate#team" className="underline underline-offset-4">
          See the team option
        </a>{' '}
        ($199 / seat, 10-seat minimum).
      </p>
      <section id="team" className="mt-8 max-w-md mx-auto">
        <PayOptionCard kind="team" />
      </section>
    </main>
  );
}
