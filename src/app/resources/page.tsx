import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resources — Analysis for community bank leaders',
  description:
    'In-depth analysis and benchmarks for community banks and credit unions navigating AI adoption. The AI Banking Brief launches soon.',
};

const FEATURED = [
  {
    slug: 'the-widening-ai-gap',
    eyebrow: 'Industry Analysis',
    title: 'The widening AI gap — and what it means for community banks.',
    dek:
      'The October 2025 Evident AI Index shows the top-10 global banks accelerating AI maturity 2.3× faster than the rest of the industry. Here is what that means for community banks and credit unions.',
    readTime: '8 min read',
  },
] as const;

export default function ResourcesPage() {
  return (
    <main className="px-6 pt-20 pb-24 md:pt-28">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Resources
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Analysis for community bank leaders.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 leading-relaxed max-w-2xl mx-auto mt-6">
            Short, sourced, and specific to community banks and credit unions.
            No hype, no broad industry generalities &mdash; just the data that
            matters for institutions with $10B or less in assets.
          </p>
        </header>

        <section className="space-y-8 mb-16">
          {FEATURED.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="block bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 md:p-10 hover:border-[color:var(--color-terra)] transition-colors group"
            >
              <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                {article.eyebrow} &middot; {article.readTime}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight group-hover:text-[color:var(--color-terra)] transition-colors mb-4">
                {article.title}
              </h2>
              <p className="text-[color:var(--color-ink)]/75 leading-relaxed">
                {article.dek}
              </p>
              <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mt-6">
                Read the analysis &rarr;
              </p>
            </Link>
          ))}
        </section>

        <section className="border-t border-[color:var(--color-ink)]/10 pt-16 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
            Coming soon
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            The AI Banking Brief.
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed mb-8">
            A weekly short for community bank and credit union leaders on
            where AI is actually working in regulated institutions, what is
            still experimental, and how to tell the difference. Take the free
            assessment to reserve a spot on the list &mdash; you will be able to
            opt in from your results page the moment the Brief goes live.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </section>
      </div>
    </main>
  );
}
