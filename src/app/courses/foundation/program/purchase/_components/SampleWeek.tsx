// SampleWeek — three-column preview of a typical module.
//
// LEARN IT / TRY IT / USE IT. Pulls real Module 1 content (Regulatory
// Cheatsheet, ECOA practice rule, Rewritten Email key output) so the
// buyer sees concrete artifacts, not marketing copy.

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

const COLUMNS = [
  {
    kicker: 'Learn it',
    title: 'Five regulatory frameworks, one page',
    body: 'SR 11-7, TPRM, ECOA/Reg B, BSA/AML, and the AIEOG AI Lexicon — each mapped to a staff-level impact. You leave Module 1 with a one-page Regulatory Cheatsheet personalized to your role.',
    tag: 'Module 1 · AI for Your Workday',
  },
  {
    kicker: 'Try it',
    title: 'Rewrite a customer email with AI',
    body: 'Run a real prompt against a sample customer email. See what the model gets right, where it overreaches, and how to constrain it so the output is something you would actually send.',
    tag: 'Scenario · sandbox practice',
  },
  {
    kicker: 'Use it',
    title: 'Save your Acceptable Use card',
    body: 'Draft and keep a one-card statement of where AI fits in your daily work and where it does not. Reviewed against the three non-negotiable rules. Kept at your desk.',
    tag: 'Artifact · Acceptable Use card',
  },
] as const;

export function SampleWeek() {
  return (
    <section
      style={{
        marginBottom: 56,
        background: 'var(--cream-2)',
        border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
        borderRadius: 28,
        padding: '40px 36px',
      }}
    >
      <div style={{ marginBottom: 28, maxWidth: 720 }}>
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
          A sample module
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
          What a typical module looks like.
        </h2>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            color: 'var(--slate-600)',
            lineHeight: 1.55,
            margin: '10px 0 0',
            maxWidth: '60ch',
          }}
        >
          Every module runs the same loop: a clear takeaway, a guided
          attempt in the sandbox, and a saved artifact you keep. Below is
          Module 1.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
        }}
      >
        {COLUMNS.map((col) => (
          <article
            key={col.kicker}
            style={{
              background: '#fff',
              border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
              borderRadius: 20,
              padding: '22px 24px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 240,
            }}
          >
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                marginBottom: 10,
              }}
            >
              {col.kicker}
            </span>
            <h3
              style={{
                fontFamily: INTER_STACK,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
                margin: '0 0 10px',
                color: 'var(--ink)',
              }}
            >
              {col.title}
            </h3>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 14,
                color: 'var(--slate-600)',
                lineHeight: 1.55,
                margin: '0 0 16px',
                flex: 1,
              }}
            >
              {col.body}
            </p>
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: 11.5,
                color: 'var(--slate-500)',
                letterSpacing: '0.03em',
                paddingTop: 12,
                borderTop: '1px dashed var(--ink-a10, rgba(7,26,47,0.1))',
              }}
            >
              {col.tag}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
