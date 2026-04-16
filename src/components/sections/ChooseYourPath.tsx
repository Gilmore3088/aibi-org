import Link from 'next/link';

export function ChooseYourPath() {
  return (
    <section className="px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
            Choose your path
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            Start free or get certified.
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/75 mt-5 max-w-2xl mx-auto leading-relaxed">
            Begin with the free AI readiness assessment to see where your
            institution stands, or jump straight to a professional
            certification for your team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free path */}
          <Link
            href="/assessment"
            className="group block border-2 border-[color:var(--color-sage)]/40 bg-[color:var(--color-linen)] p-8 md:p-10 hover:border-[color:var(--color-sage)] transition-colors"
          >
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-sage)] mb-6">
              Free
            </p>
            <h3 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight mb-4 group-hover:text-[color:var(--color-sage)] transition-colors">
              AI Readiness Assessment
            </h3>
            <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-6">
              See where your institution stands on AI readiness across eight
              dimensions. Under three minutes. No cost, no obligation.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                '8-question institutional assessment',
                'Instant tier placement and score',
                'Personalized dimension breakdown',
                'Recommended next steps based on your tier',
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-5 relative"
                >
                  <span className="absolute left-0 top-2 w-3 h-[1px] bg-[color:var(--color-sage)]" />
                  {item}
                </li>
              ))}
            </ul>
            <span className="block text-center py-3 border border-[color:var(--color-sage)] text-[color:var(--color-sage)] font-sans text-sm font-medium tracking-wide group-hover:bg-[color:var(--color-sage)] group-hover:text-[color:var(--color-linen)] transition-colors">
              Start Free Assessment
            </span>
          </Link>

          {/* Certification path */}
          <a
            href="#certification-tracks"
            className="group block border-2 border-[color:var(--color-terra)]/40 bg-[color:var(--color-linen)] p-8 md:p-10 hover:border-[color:var(--color-terra)] transition-colors"
          >
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-6">
              Professional
            </p>
            <h3 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight mb-4 group-hover:text-[color:var(--color-terra)] transition-colors">
              Professional Certification
            </h3>
            <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-6">
              Credential that validates your ability to deploy AI responsibly
              inside a regulated institution. Assessed by real work output,
              not a multiple-choice test.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Three tracks: Practitioner, Specialist, Leader',
                'Assessed by submitted work product, not exams',
                'Credential display: AiBI-P \u00b7 The AI Banking Institute',
                'From $295 (Practitioner) to $2,800+ (Leader)',
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-5 relative"
                >
                  <span className="absolute left-0 top-2 w-3 h-[1px] bg-[color:var(--color-terra)]" />
                  {item}
                </li>
              ))}
            </ul>
            <span className="block text-center py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-sm font-medium tracking-wide group-hover:bg-[color:var(--color-terra-light)] transition-colors">
              View Certification Tracks
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
