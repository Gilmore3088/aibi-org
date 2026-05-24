// Audit A8 (2026-05-24): Gagné's ninth event of instruction —
// enhancing retention and transfer. The transfer line tells the
// learner exactly what to do on Monday morning to convert the lesson
// outcome into their actual job. Renders at lesson close, just before
// the Next-Lesson CTA, so it is the last instructional beat the
// learner reads. Returns null if the column has not been backfilled.

interface LessonTransferBeatProps {
  readonly transfer: string | null | undefined;
}

export function LessonTransferBeat({ transfer }: LessonTransferBeatProps) {
  const text = transfer?.trim();
  if (!text) return null;
  return (
    <section
      aria-labelledby="lesson-transfer-label"
      style={{
        margin: '40px 0 16px',
        padding: '18px 20px 20px',
        background: 'var(--ledger-tape)',
        border: '1px solid var(--ledger-accent-soft, var(--ledger-rule))',
        borderRadius: 3,
      }}
    >
      <div
        id="lesson-transfer-label"
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
        On Monday — take this back to your work
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--ledger-serif)',
          fontSize: 16.5,
          lineHeight: 1.55,
          color: 'var(--ledger-ink)',
        }}
      >
        {text}
      </p>
    </section>
  );
}
