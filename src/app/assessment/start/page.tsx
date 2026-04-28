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
      </section>
    </main>
  );
}
