// The learning method as four icon-led steps — Understand, Try, Review, Build.
// Ported from the modular-home mockup (section 04); one SVG icon per step, real
// text labels beside them (icons support meaning, they don't replace it).

const sw = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

const STEPS = [
  {
    n: '01 · Understand',
    title: 'Learn the boundaries',
    body: 'Know what AI can — and cannot — do in banking work.',
    icon: (
      <svg {...sw}>
        <path d="M4 5.5A2.5 2.5 0 016.5 3H11v16H6.5A2.5 2.5 0 004 21.5zM20 5.5A2.5 2.5 0 0017.5 3H13v16h4.5a2.5 2.5 0 012.5 2.5z" />
      </svg>
    ),
  },
  {
    n: '02 · Try',
    title: 'Practice safely',
    body: 'Try realistic scenarios using synthetic information and clear controls.',
    icon: (
      <svg {...sw}>
        <path d="M10 2v7.3a6.5 6.5 0 104 0V2M8.5 2h7M7 15h10" />
      </svg>
    ),
  },
  {
    n: '03 · Review',
    title: 'Review with confidence',
    body: 'Use simple checklists to spot unsupported claims and risky inputs.',
    icon: (
      <svg {...sw}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    n: '04 · Build',
    title: 'Reuse what works',
    body: 'Save reviewed prompts, templates, and workflows for the next task.',
    icon: (
      <svg {...sw}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="8.5" y="14" width="7" height="7" rx="1" />
        <path d="M6.5 10v2h11v2" />
      </svg>
    ),
  },
];

export function EducationEmpowerment(): JSX.Element {
  return (
    <section className="mk-edu" aria-labelledby="edu-title">
      <div className="mk-container">
        <header className="mk-edu-head">
          <div>
            <p className="mk-edu-kicker">For everyday bankers</p>
            <h2 id="edu-title">Practical AI education that builds confidence.</h2>
          </div>
          <p className="mk-edu-intro">
            Understand the boundaries, practice safely, review the work, and reuse
            what succeeds.
          </p>
        </header>

        <div className="mk-edu-path">
          {STEPS.map((s) => (
            <article key={s.n} className="mk-edu-step">
              <div>
                <span className="mk-edu-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              <span className="mk-edu-number">{s.n}</span>
            </article>
          ))}
        </div>

        <div className="mk-edu-rail">
          <strong>Empowering everyday bankers.</strong>
          <span>Real skills, real tools, and work people can use again.</span>
        </div>
      </div>
    </section>
  );
}
