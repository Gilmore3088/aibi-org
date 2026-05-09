import Link from 'next/link';

const OUTCOMES = [
  ['Your AI readiness score', 'A simple score that shows where your team stands today.'],
  ['Your top 3 gaps', 'The clearest places to improve confidence, safety, and usefulness.'],
  ['A recommended learning path', 'A practical next step based on your readiness level.'],
  ['Your first practical AI exercise', 'A short rep that turns the result into action.'],
] as const;

const TRUST_POINTS = [
  'No customer data.',
  'No technical knowledge required.',
  'Built for regulated financial institutions.',
] as const;

export const metadata = {
  title: 'Start the AI Readiness Assessment | The AI Banking Institute',
  description:
    'A short AI readiness assessment for community banks and credit unions.',
};

export default function AssessmentStartPage() {
  return (
    <main className="px-6 py-14 md:py-20">
      <section className="max-w-5xl mx-auto">
        <div className="max-w-3xl">
          <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-4">
            AI Readiness Assessment
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            See how ready your team is to use AI safely.
          </h1>
          <p className="text-lg text-[color:var(--color-ink)]/75 leading-relaxed mt-5 max-w-2xl">
            A short readiness assessment for community banks and credit unions.
            No customer data required.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-10">
          {OUTCOMES.map(([title, body]) => (
            <article
              key={title}
              className="border border-[color:var(--color-ink)]/10 rounded-[3px] bg-[color:var(--color-parch)] p-5"
            >
              <h2 className="font-serif text-xl text-[color:var(--color-ink)] leading-snug">
                {title}
              </h2>
              <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mt-3">
                {body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_auto] gap-6 items-center border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {TRUST_POINTS.map((point) => (
              <p
                key={point}
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-slate)]"
              >
                {point}
              </p>
            ))}
          </div>
          <Link
            href="/assessment"
            className="inline-block text-center px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Start Assessment
          </Link>
        </div>

        {/* In-Depth upgrade — for institutions that want the consulting-grade
            version. Placement here (not homepage) is intentional: the visitor
            on this page has already self-identified as wanting an assessment,
            so the comparison adds signal instead of distracting from the free
            CTA the homepage funnels into. */}
        <aside
          aria-labelledby="in-depth-upgrade-heading"
          className="mt-16 border border-[color:var(--color-terra)]/25 bg-[color:var(--color-parch)] rounded-[3px] p-6 md:p-10"
        >
          <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-12 items-start">
            <div>
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3">
                In-Depth Assessment · $99
              </p>
              <h2
                id="in-depth-upgrade-heading"
                className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-4"
              >
                Need the consulting-grade version?
              </h2>
              <p className="text-base text-[color:var(--color-ink)]/75 leading-relaxed mb-5 max-w-xl">
                The free 12-question assessment shows your tier and the one
                dimension dragging you down. The In-Depth Assessment runs all
                48 questions across the eight readiness dimensions and returns
                a 20-page personalized report with a peer-band comparison and
                a 30-day action plan — the same instrument we use to scope a
                team cohort.
              </p>
              <Link
                href="/assessment/in-depth"
                className="inline-block px-7 py-3 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] transition-colors"
              >
                See the In-Depth Assessment
              </Link>
            </div>
            <div className="border-l border-[color:var(--color-ink)]/10 pl-8 md:pl-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 mb-3">
                What you get
              </p>
              <ul className="space-y-2 text-sm text-[color:var(--color-ink)]/85 leading-snug">
                <li className="flex gap-2">
                  <span className="font-mono text-[color:var(--color-terra)] tabular-nums shrink-0">48</span>
                  <span>questions across all readiness dimensions</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-[color:var(--color-terra)] tabular-nums shrink-0">20</span>
                  <span>page personalized report with peer comparison</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-[color:var(--color-terra)] tabular-nums shrink-0">30</span>
                  <span>day action plan keyed to your weakest dimension</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-[color:var(--color-terra)] tabular-nums shrink-0">1</span>
                  <span>free retake within 12 months</span>
                </li>
              </ul>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/45">
                Bulk pricing 10+ seats · email hello@aibankinginstitute.com
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
