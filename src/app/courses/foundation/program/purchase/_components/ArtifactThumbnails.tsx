// ArtifactThumbnails — the four required outputs rendered as visible
// artifact cards (not bullet points). Each card shows a recognizable
// preview of the artifact a learner walks away with.

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
        <div style={{ fontSize: 11, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
          My AI Line
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
          OK: draft customer emails, summarize public memos, rewrite my own notes.
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
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
              fontSize: 13,
              color: 'var(--ink)',
              padding: '6px 10px',
              borderRadius: 8,
              background: 'var(--cream)',
              border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
            }}
          >
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)' }} />
            <span style={{ flex: 1 }}>{row}</span>
            <span style={{ fontSize: 10, color: 'var(--slate-500)', letterSpacing: '0.05em' }}>SAVED</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: 'Submission · Module 7',
    title: 'Reviewed work product',
    description: 'A real artifact — email, summary, or script — submitted, reviewed, and marked up against the rubric.',
    preview: (
      <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
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
            fontSize: 11,
            color: 'var(--gold-deep)',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          REVIEWER: tighten the second clause. Source on DSCR?
        </div>
      </div>
    ),
  },
  {
    kicker: 'Assessment · Module 12',
    title: 'Final practical assessment',
    description: 'A reviewed work-product package graded against the rubric. The credential is awarded on a passing score.',
    preview: (
      <div style={{ display: 'grid', gap: 6, fontSize: 12.5 }}>
        {[
          ['Acceptable Use', 'Pass'],
          ['Saved prompts (3)', 'Pass'],
          ['Reviewed work product', 'Pass'],
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
            fontSize: 12,
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
            fontSize: 'clamp(26px, 2.8vw, 34px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Four artifacts you keep.
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
                  fontSize: 18,
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
                  fontSize: 11,
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
                fontSize: 13.5,
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
