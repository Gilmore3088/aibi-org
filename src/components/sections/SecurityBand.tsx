const SECURITY_POINTS = [
  {
    title: 'Member data protection',
    description:
      'PII never touches a public LLM. Private cloud inference for anything regulated. Zero Trust plus role-based access control.',
  },
  {
    title: 'Regulatory alignment',
    description:
      'Every automation maps to SR 11-7 for model risk, Interagency TPRM Guidance for vendor oversight, and ECOA/Reg B for fair lending.',
  },
  {
    title: 'Vendor evaluation',
    description:
      'A five-question scoring framework for evaluating AI vendors against your risk posture and concentration thresholds.',
  },
  {
    title: 'Shadow AI surfaced',
    description:
      'Your staff are already using AI tools you do not know about. We inventory the shadow AI surface area and bring it inside a governance perimeter.',
  },
] as const;

export function SecurityBand() {
  return (
    <section className="px-6 py-14 md:py-20 bg-[color:var(--color-cobalt)] text-[color:var(--color-linen)]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 md:gap-16">
        <div className="md:col-span-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-linen)]/60 mb-4">
            Boundary-Safe
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Regulated institutions need specific guarantees. Not general reassurances.
          </h2>
          <p className="text-lg text-[color:var(--color-linen)]/80 mt-6 leading-relaxed">
            Every recommendation is grounded in the shared vocabulary of the
            AIEOG AI Lexicon, published by the US Treasury, FBIIC, and FSSCC in
            February 2026 — the first official cross-agency vocabulary for
            financial AI governance.
          </p>
          <p className="text-lg text-[color:var(--color-linen)]/80 mt-4 leading-relaxed">
            When your examiners arrive, you want a framework on the table, not
            a slideshow of capabilities.
          </p>
        </div>

        <dl className="md:col-span-3 space-y-8">
          {SECURITY_POINTS.map((point) => (
            <div key={point.title} className="border-t border-[color:var(--color-linen)]/20 pt-6">
              <dt className="font-serif text-xl md:text-2xl text-[color:var(--color-linen)] mb-2">
                {point.title}
              </dt>
              <dd className="text-[color:var(--color-linen)]/75 leading-relaxed">
                {point.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
