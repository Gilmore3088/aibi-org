'use client';

// CompletionCTA — shown after a learner marks a module complete.
// M1-4: brief encouragement message only.
// M5 (last module in Phase 5 scope): prominent Executive Briefing CTA via Calendly.
// FUNL-01/02: funnel touchpoint for learners who have completed the Understanding pillar.
// A11Y-01: keyboard accessible link with visible focus ring.

interface CompletionCTAProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
}

export function CompletionCTA({ moduleNumber, isLastModule }: CompletionCTAProps) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/aibankinginstitute/executive-briefing';

  // M5 (Phase 5 scope) — Understanding pillar complete
  if (moduleNumber === 5 || isLastModule) {
    return (
      <div
        className="mt-8 p-6 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm"
        style={{ borderLeftColor: 'var(--color-terra)' }}
        aria-label="Module complete — next steps"
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
          Understanding pillar complete
        </p>
        <p className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
          You have the foundation. Now see the full picture.
        </p>
        <p className="font-sans text-sm text-[color:var(--color-dust)] leading-relaxed mb-5">
          You now know how to classify data, recognise hallucination patterns, and build
          your own Acceptable Use Card. An Executive Briefing maps that knowledge to your
          institution&rsquo;s specific workflows, vendors, and risk profile.
        </p>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
        >
          Book an Executive Briefing
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
        <p className="mt-3 font-mono text-[10px] text-[color:var(--color-dust)]">
          No obligation. 30 minutes. Specific to your institution.
        </p>
      </div>
    );
  }

  // M1-4 — brief encouragement
  const encouragementByModule: Record<number, string> = {
    1: 'Module 1 complete. You understand the regulatory landscape — the foundation everything else builds on.',
    2: 'Module 2 complete. Your AI subscription inventory is the first step toward a governance-ready toolkit.',
    3: 'Module 3 complete. Knowing hallucination patterns protects you and your institution from costly errors.',
    4: 'Module 4 complete. You can now evaluate AI outputs with the same rigour you apply to any vendor claim.',
  };

  const message = encouragementByModule[moduleNumber] ?? `Module ${moduleNumber} complete. Keep going.`;

  return (
    <div
      className="mt-8 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm"
      aria-label="Module complete"
    >
      <p className="font-sans text-sm text-[color:var(--color-dust)] leading-relaxed">
        {message}
      </p>
    </div>
  );
}
