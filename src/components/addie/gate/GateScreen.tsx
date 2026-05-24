// GateScreen — the three-way fork after Module 3.
// Spec §6.4 + Design System §5.6. Three equal-weight doors. Modern
// course aesthetic per DECISIONS 2026-05-23: dimensional cards with
// hairline-rule accents, ink-filled milestone celebration banner above
// the choice, dedicated team-buy section on a parchment field.

import Link from 'next/link';
import { PayOptionCard } from './PayOptionCard';
import { EmailOptionForm } from './EmailOptionForm';
import { DeclineOption } from './DeclineOption';

export function GateScreen() {
  return (
    <main>
      {/* Celebration banner — ink hero with confetti dots */}
      <section className="addie-hero-ink">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.5" aria-hidden>
                <path d="M10 1L12.6 7.5L19.5 8L14.3 12.8L15.8 19.5L10 16L4.2 19.5L5.7 12.8L0.5 8L7.4 7.5L10 1Z" />
              </svg>
              <span className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)]">
                Milestone · Module 3 complete
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--ledger-accent)" strokeWidth="1.5" aria-hidden>
                <path d="M10 1L12.6 7.5L19.5 8L14.3 12.8L15.8 19.5L10 16L4.2 19.5L5.7 12.8L0.5 8L7.4 7.5L10 1Z" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              You crossed the free line.
              <br />
              <span className="text-[var(--ledger-accent)]">Three doors. Pick one.</span>
            </h1>
            <p className="mt-5 text-lg text-[var(--ledger-paper)] opacity-80 max-w-2xl mx-auto leading-relaxed">
              The free side ends here. Continue to Modules 4 + 5 and keep
              everything you built, keep the artifacts for later, or take
              the $99 Readiness Assessment. No countdowns, no scarcity.
            </p>
          </div>
        </div>
      </section>

      {/* Three doors */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-8 pb-12 relative">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="addie-module-card" data-tier="paid">
            <PayOptionCard kind="individual" />
          </div>
          <div className="addie-module-card">
            <EmailOptionForm />
          </div>
          <div className="addie-module-card">
            <DeclineOption />
          </div>
        </div>
      </section>

      {/* Team-buy band */}
      <section
        id="team"
        className="border-y border-[var(--ledger-rule)] bg-[var(--ledger-paper)]"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-[2fr_3fr] items-center">
          <div>
            <span className="addie-chip" data-tone="accent">For institutions</span>
            <h2 className="mt-3 font-serif text-3xl text-[var(--ledger-ink)] leading-tight">
              Bring the whole team in.
            </h2>
            <p className="mt-3 text-[var(--ledger-ink-2)] leading-relaxed">
              Same course, billed by seat. Admin invites learners by email.
              You see per-seat progress, sandbox activity, and aggregate
              artifact creation — privacy-respecting, no learner content
              exposed.
            </p>
            <div className="mt-5 inline-flex items-baseline gap-2">
              <span className="font-serif text-4xl text-[var(--ledger-ink)] tabular-nums">$199</span>
              <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">/ seat · min 10</span>
            </div>
          </div>
          <div className="addie-module-card" data-tier="paid">
            <PayOptionCard kind="team" />
          </div>
        </div>
      </section>

      {/* Footer reassurance strip */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid gap-6 sm:grid-cols-3 text-center sm:text-left">
        {[
          { k: 'No countdowns', v: 'Your progress and artifacts are kept. Come back when you have ten minutes.' },
          { k: 'No scarcity', v: 'There is no cohort opening soon. There is no early-bird. Choose what fits.' },
          { k: 'Built for bankers', v: 'Every example is a bank example. The sandbox blocks PII patterns. The rules align with SR 11-7.' },
        ].map((c) => (
          <div key={c.k}>
            <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-1.5">
              {c.k}
            </div>
            <p className="text-sm text-[var(--ledger-ink-2)] leading-relaxed">{c.v}</p>
          </div>
        ))}
      </section>

      {/* Back link */}
      <div className="text-center pb-10">
        <Link
          href="/foundation"
          className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
        >
          ← Back to course home
        </Link>
      </div>
    </main>
  );
}
