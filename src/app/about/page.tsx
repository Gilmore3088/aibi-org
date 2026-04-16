import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — The AI Banking Institute',
  description:
    'The AI Banking Institute exists for the community banks and credit unions that anchor towns and neighborhoods — not for the twenty largest banks. Here is why.',
};

export default function AboutPage() {
  return (
    <main className="px-6 py-20 md:py-28">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            About the Institute
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05]">
            There is a banker somewhere right now who has been doing the same
            thing every Tuesday morning for six years.
          </h1>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <p>
            It takes two and a half hours. She knows it is inefficient. She
            has mentioned it in three different meetings. Nothing has changed.
          </p>
          <p>
            That banker could fix it herself in an afternoon. She just does not
            know that yet.
          </p>
          <p className="font-serif italic text-2xl md:text-3xl text-[color:var(--color-terra)] pt-4">
            The AI Banking Institute exists for her.
          </p>
          <p className="pt-4">
            Not for the twenty largest banks in the country, who have the
            budgets and the teams and the consultants. For the community banks
            and credit unions that anchor towns and neighborhoods and small
            businesses &mdash; the ones that remember your name, that lend to
            people an algorithm would have rejected, that show up when it
            matters.
          </p>
          <p>
            Those institutions have something the large banks do not: people
            who are deeply, personally invested in the community they serve.
            They have passion. They have institutional knowledge. They have
            relationships no technology can replicate.
          </p>
          <p>
            What they have not had, until now, is a framework that puts AI in
            their hands &mdash; not the hands of a vendor, not the hands of a
            hired expert, but their own hands.
          </p>

          <p className="font-serif-sc text-2xl md:text-3xl text-[color:var(--color-terra)] pt-6 tracking-wide">
            We turn bankers into builders.
          </p>

          <p className="pt-2">
            That is the mission. Not efficiency ratios, though we improve
            those. Not compliance readiness, though we build that too. Those
            are the outcomes. The mission is something more human: giving
            people who care deeply about their work a new set of tools and
            watching what they build with them.
          </p>
          <p>
            Take the free assessment. Find out where your institution is. We
            will take it from there.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 md:p-10 text-center">
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </aside>
      </article>
    </main>
  );
}
