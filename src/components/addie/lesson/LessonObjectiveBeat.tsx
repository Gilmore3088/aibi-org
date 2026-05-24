// Audit A8 (2026-05-24): the alignment-triangle apex. Renders the
// lesson's ## Objective immediately under the LessonShellHeader so a
// learner reads the verb-first observable behavior before the lesson
// body. Returns null if the column has not been backfilled — keeps
// historical lessons from rendering an empty card.

interface LessonObjectiveBeatProps {
  readonly objective: string | null | undefined;
}

export function LessonObjectiveBeat({ objective }: LessonObjectiveBeatProps) {
  const text = objective?.trim();
  if (!text) return null;
  return (
    <section
      aria-labelledby="lesson-objective-label"
      style={{
        margin: '12px 0 28px',
        padding: '14px 18px 16px',
        background: 'var(--ledger-paper)',
        border: '1px solid var(--ledger-rule)',
        borderLeft: '3px solid var(--ledger-accent)',
        borderRadius: 3,
      }}
    >
      <div
        id="lesson-objective-label"
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--ledger-accent)',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        Objective · what you should be able to do after this
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--ledger-serif)',
          fontSize: 16,
          lineHeight: 1.55,
          color: 'var(--ledger-ink)',
        }}
      >
        {text}
      </p>
    </section>
  );
}
