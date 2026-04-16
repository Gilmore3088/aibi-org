interface Week {
  readonly week: string;
  readonly title: string;
  readonly summary: string;
  readonly deliverables: readonly string[];
}

const WEEKS: readonly Week[] = [
  {
    week: 'Week 1',
    title: 'Executive Alignment',
    summary:
      'KPI review, roadmap adjustment, and priority decisions with leadership.',
    deliverables: [
      'Review transformation KPIs',
      'Adjust 90-day rolling roadmap',
      'Set monthly priorities',
    ],
  },
  {
    week: 'Week 2',
    title: 'Department Activation',
    summary:
      'Deep work in 1\u20132 departments \u2014 identifying and improving workflows.',
    deliverables: [
      'Department-specific deep dive',
      'Workflow identification',
      'Staff capability assessment',
    ],
  },
  {
    week: 'Week 3',
    title: 'Implementation Sprint',
    summary:
      '1\u20132 high-impact builds, automations, or workflow transformations.',
    deliverables: [
      'High-impact AI builds',
      'Workflow automation',
      'Tool integration',
    ],
  },
  {
    week: 'Week 4',
    title: 'Training and Reporting',
    summary:
      'Team training session, impact report delivered, next month pre-loaded.',
    deliverables: [
      'Team training session',
      'Impact report delivery',
      'Next month pre-loaded',
    ],
  },
];

export function MonthlyCadence() {
  return (
    <section className="px-6 py-14 md:py-20 bg-[color:var(--color-parch)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            The monthly operating system
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            This runs every month.
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/75 mt-5 max-w-2xl mx-auto leading-relaxed">
            No ambiguity. No &ldquo;what should we do?&rdquo; No drift.
            Every client on the AI Transformation engagement gets a
            structured 4-week cadence that produces results automatically.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WEEKS.map((week) => (
            <article
              key={week.week}
              className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 flex flex-col hover:border-[color:var(--color-terra)]/20 transition-colors duration-200"
            >
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-slate)] mb-3">
                {week.week}
              </p>
              <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-3">
                {week.title}
              </h3>
              <p className="text-sm text-[color:var(--color-ink)]/70 leading-relaxed mb-5 flex-1">
                {week.summary}
              </p>
              <ul className="space-y-2">
                {week.deliverables.map((d) => (
                  <li
                    key={d}
                    className="text-xs text-[color:var(--color-ink)]/75 leading-snug pl-4 relative"
                  >
                    <span className="absolute left-0 top-[7px] w-2 h-[1px] bg-[color:var(--color-terra)]" />
                    {d}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="font-mono text-[10px] text-center text-[color:var(--color-slate)] mt-8">
          Updated monthly with impact report delivery &middot; 90-day rolling
          roadmap &middot; Capability transfer built in
        </p>
      </div>
    </section>
  );
}
