// SampleWeek — four-step preview of a typical module.
//
// Understand / Try / Build / Save. Describes Module 1's loop and links to
// the public /courses/foundation/preview route where buyers can read the
// module's actual Understand content before paying.

import Link from 'next/link';

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

const COLUMNS = [
  {
    kicker: 'Understand',
    title: 'One work product up front',
    body: 'Module 1 starts with the finished artifact: a before-and-after internal email plus a short judgment note explaining what changed.',
    tag: 'Module 1 · AI for Your Workday',
  },
  {
    kicker: 'Try',
    title: 'Practice with sample bank data',
    body: 'Use a contained lab to rewrite messy, non-sensitive notes. The model is guided by the module objective and checked against a clear quality bar.',
    tag: 'Dataset · guided practice',
  },
  {
    kicker: 'Build',
    title: 'Review the quality bar',
    body: 'Check the lab output against the module rubric before treating it as reusable work product.',
    tag: 'Human review · quality check',
  },
  {
    kicker: 'Save',
    title: 'Save to your Foundation Packet',
    body: 'Turn the lab output into a manager-ready artifact with the safety boundary, human edit, and next-use note visible.',
    tag: 'Artifact · Foundation Packet',
  },
] as const;

export function SampleWeek() {
  return (
    <section
      className="aibi-pad-section"
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
            fontSize: '0.75rem',
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
            fontSize: 'clamp(1.625rem, 2.8vw, 2.125rem)',
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
            fontSize: '1rem',
            color: 'var(--slate-600)',
            lineHeight: 1.55,
            margin: '10px 0 0',
            maxWidth: '60ch',
          }}
        >
          Every module runs the same loop: understand the artifact, try a
          contained lab, build the reviewed asset, and save the proof. Below is Module 1.
        </p>
        <p style={{ margin: '14px 0 0' }}>
          <Link
            href="/courses/foundation/preview"
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--ink)',
              textDecorationColor: 'var(--gold)',
              textUnderlineOffset: 4,
            }}
          >
            Read Module 1&rsquo;s full Understand section free &rarr;
          </Link>
        </p>
      </div>

      <div className="aibi-grid aibi-grid--4" style={{ gap: 18 }}>
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
                fontSize: '0.6875rem',
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
                fontSize: '1.125rem',
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
                fontSize: '0.875rem',
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
                fontSize: '0.7188rem',
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
