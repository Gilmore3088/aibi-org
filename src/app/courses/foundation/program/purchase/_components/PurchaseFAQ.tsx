// PurchaseFAQ — accordion of the seven most-asked questions on the
// foundation purchase landing.  Uses native <details>/<summary> so it
// works without JS and stays accessible by default.

interface FAQ {
  readonly q: string;
  readonly a: string;
  readonly defaultOpen?: boolean;
}

const QUESTIONS: readonly FAQ[] = [
  {
    q: 'How long will this take me?',
    a: 'About six to seven hours of reading and exercises across twelve modules. Most learners finish in three to six weeks at one or two modules a week. Access is lifetime — no expiry.',
    defaultOpen: true,
  },
  {
    q: 'What if my bank\'s policy says no AI tools?',
    a: 'Module 03 — the privacy line — is built specifically to help you stay inside any reasonable policy. The exercises do not require uploading sensitive data. If your institution wants a custom acceptable-use card, the course teaches you to draft one.',
  },
  {
    q: 'Is this technical? I\'m not a programmer.',
    a: 'No code, no math. If you can write a memo, you can do this course. The audience is community-bank and credit-union staff in retail, lending, ops, compliance, and BSA roles.',
  },
  {
    q: 'What\'s the credential worth?',
    a: 'A verifiable AiBI-Foundation digital badge issued on completion. The credential is recognised by The AI Banking Institute as proof of reviewed work — not a multiple-choice quiz. Continuing-ed recognition with state banking associations is in progress.',
  },
  {
    q: 'My institution wants to send a team.',
    a: 'Self-serve team pricing is $199 per seat at ten or more seats. For larger cohorts or a sponsor dashboard, email hello@aibankinginstitute.com.',
  },
  {
    q: 'What about updates?',
    a: 'Future updates to modules, artifacts, and the prompt library are included for the life of the program at no additional cost. Lifetime access means lifetime updates.',
  },
  {
    q: 'Is there a refund?',
    a: 'Yes. Finish Module 01 and its first exercise. Within fourteen days of enrollment, ask for a full refund. No exit interview.',
  },
] as const;

export function PurchaseFAQ() {
  return (
    <section style={{ margin: '56px 0' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: 18,
          marginBottom: 24,
          borderBottom: '1px solid var(--ink-a10)',
        }}
      >
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: 600,
          }}
        >
          Common questions
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
            fontWeight: 500,
            fontSize: 'clamp(34px, 4vw, 48px)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Asked and answered.
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid var(--ink-a10)',
        }}
      >
        {QUESTIONS.map((item, i) => (
          <details
            key={item.q}
            open={item.defaultOpen}
            style={{
              borderBottom: '1px solid var(--ink-a10)',
            }}
          >
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                padding: '20px 0',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 24,
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: 'var(--slate-500)',
                  fontWeight: 600,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
                  fontWeight: 500,
                  fontSize: 19,
                  lineHeight: 1.3,
                  letterSpacing: '-0.015em',
                  color: 'var(--ink)',
                }}
              >
                {item.q}
              </span>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
                  fontSize: 22,
                  color: 'var(--slate-500)',
                  lineHeight: 1,
                }}
              >
                +
              </span>
            </summary>
            <div style={{ padding: '0 0 22px 60px', maxWidth: '80ch' }}>
              <p
                style={{
                  fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--ink-2)',
                  margin: 0,
                }}
              >
                {item.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
