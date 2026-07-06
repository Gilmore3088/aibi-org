// ArtifactThumbnails — representative previews from the 18-piece Foundation
// Packet. Each card shows a recognizable work product a learner walks away
// with, without making the section read like another long curriculum list.

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

interface Artifact {
  kicker: string;
  title: string;
  preview: React.ReactNode;
  description: string;
}

const ARTIFACTS: readonly Artifact[] = [
  {
    kicker: 'Card · Module 1',
    title: 'Acceptable Use card',
    description: 'A one-card statement of where AI fits in your daily work and where it does not. Kept at your desk.',
    preview: (
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
          My AI Line
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--ink)', lineHeight: 1.5 }}>
          OK: draft customer emails, summarize public memos, rewrite my own notes.
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--ink)', lineHeight: 1.5 }}>
          Not OK: PII, account numbers, internal credit files, board materials.
        </div>
      </div>
    ),
  },
  {
    kicker: 'Library · Modules 3, 6, 11',
    title: 'Three saved prompts',
    description: 'Patterns you reuse weekly without re-typing the context. Each one reviewed against the rubric.',
    preview: (
      <div style={{ display: 'grid', gap: 8 }}>
        {[
          'Credit memo · internal summary',
          'Customer email · plain-language rewrite',
          'Policy doc · change-log extract',
        ].map((row) => (
          <div
            key={row}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.8125rem',
              color: 'var(--ink)',
              padding: '6px 10px',
              borderRadius: 8,
              background: 'var(--cream)',
              border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
            }}
          >
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)' }} />
            <span style={{ flex: 1 }}>{row}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--slate-500)', letterSpacing: '0.05em' }}>SAVED</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Submission · Module 7',
    title: 'Review-ready work product',
    description: 'A real artifact - email, summary, or script - shaped with source notes, edits, and reviewer questions.',
    preview: (
      <div style={{ fontSize: '0.8125rem', color: 'var(--ink)', lineHeight: 1.55 }}>
        <span style={{ background: 'var(--gold-a20)', padding: '0 2px' }}>
          The proposed line was approved
        </span>{' '}
        last Tuesday subject to a covenant on{' '}
        <span style={{ background: 'var(--gold-a20)', padding: '0 2px' }}>
          monthly DSCR reporting
        </span>
        .
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px dashed var(--ink-a10, rgba(7,26,47,0.1))',
            fontSize: '0.6875rem',
            color: 'var(--gold-deep)',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          REVIEW STEP: tighten the second clause. Source on DSCR?
        </div>
      </div>
    ),
  },
  {
    kicker: 'Assessment · Module 18',
    title: 'Final practical assessment',
    description: 'A final work-product package checked against the completion rubric. The credential is awarded when the packet is submitted after all modules.',
    preview: (
      <div style={{ display: 'grid', gap: 6, fontSize: '0.7813rem' }}>
        {[
          ['Acceptable Use', 'Pass'],
          ['Saved prompts (3)', 'Pass'],
          ['Review-ready work product', 'Pass'],
          ['Practical scenario', 'Pass'],
        ].map(([row, status]) => (
          <div
            key={row}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
              borderBottom: '1px solid var(--ink-a10, rgba(7,26,47,0.08))',
              color: 'var(--ink)',
            }}
          >
            <span>{row}</span>
            <span style={{ color: 'var(--emerald-700)', fontWeight: 700, letterSpacing: '0.05em' }}>
              {status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ArtifactThumbnails() {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 24, maxWidth: 720 }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: INTER_STACK,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          What you leave with
        </span>
        <h2
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: 'clamp(1.625rem, 2.8vw, 2.125rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Four previews from the 18-piece Foundation Packet.
        </h2>
      </div>

      <div className="aibi-grid aibi-grid--2" style={{ gap: 18 }}>
        {ARTIFACTS.map((a) => (
          <article
            key={a.title}
            style={{
              background: '#fff',
              border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
              borderRadius: 24,
              padding: '22px 24px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <h3
                style={{
                  fontFamily: INTER_STACK,
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25,
                  margin: 0,
                  color: 'var(--ink)',
                }}
              >
                {a.title}
              </h3>
              <span
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-deep)',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.kicker}
              </span>
            </div>

            <div
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
                borderRadius: 14,
                padding: '14px 16px',
                fontFamily: INTER_STACK,
              }}
            >
              {a.preview}
            </div>

            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.8438rem',
                color: 'var(--slate-600)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {a.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
