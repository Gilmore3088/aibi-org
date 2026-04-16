import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — The AI Banking Institute',
  description:
    'The AI Banking Institute was founded on the belief that community banks and credit unions do not need more technology — they need more capability. Here is why, and who is building it.',
};

export default function AboutPage() {
  return (
    <main className="px-6 py-20 md:py-28">
      <article className="max-w-3xl mx-auto">
        <header className="mb-16">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            About the Institute
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05] mb-6">
            Built for the banks most people overlook.
          </h1>
          <p className="text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
            The AI Banking Institute exists because the AI revolution in banking
            is being written by, and for, the twenty largest institutions in the
            world. The ~9,000 community banks and credit unions that anchor the
            US financial system deserve better than a retrofit.
          </p>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Our conviction.
          </h2>
          <p>
            Community banks do not lose to JPMorganChase on technology budgets.
            They lose on speed, focus, and accountability. Community banks win
            on relationships, local knowledge, and the ability to say yes to a
            member whose file an algorithm would have rejected.
          </p>
          <p>
            AI does not change that equation. It amplifies it. The bank that
            teaches its five-person operations team to automate a Tuesday
            morning workflow will outperform the bank that hires one expensive
            AI director. The Evident AI Index published in October 2025
            demonstrates that talent volume, not budget alone, drives AI
            outcomes. Community banks already have the talent. They need the
            framework.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            How AiBI is built.
          </h2>
          <p>
            Every AiBI engagement is structured around three commitments.
            First, every recommendation assumes a regulated institution &mdash;
            aligned with SR 11-7 for model risk, Interagency TPRM Guidance for
            vendors, ECOA and Reg B for fair lending, and the AIEOG AI Lexicon
            (US Treasury, FBIIC, and FSSCC, February 2026) for shared
            vocabulary. Second, every deliverable carries a measured outcome.
            The Operational Quick Win Sprint carries a 90-day ROI guarantee.
            Third, every engagement transfers capability. When an AiBI
            engagement ends, your team runs AI transformation independently.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Who we are.
          </h2>
          <p>
            AiBI is led by a founder with a background in community banking
            operations and a track record of building training and
            transformation programs inside regulated institutions.
            <em>
              {' '}
              [Founder bio to replace: one paragraph covering background,
              institutions served, and the personal story behind the
              founding.]
            </em>
          </p>
          <p>
            The team is small by design. Every Executive Briefing is led by a
            senior practitioner. Every Quick Win Sprint is staffed by people
            who have implemented automations inside a community bank before.
            This is not a platform play. It is a capability transfer play.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            What we publish.
          </h2>
          <p>
            AiBI operates from public evidence. Every statistic on this site
            traces to a named source and a publication date &mdash; the FDIC
            Quarterly Banking Profile, the Bank Director Technology Survey,
            Gartner peer community data, the Evident AI Index, and the AIEOG
            AI Lexicon. When we cannot cite a source, we say so.
          </p>
          <p>
            The AI Banking Brief, our weekly analysis for community bank
            leaders, launches shortly. Take the free assessment to reserve a
            seat on the list.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 md:p-10 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Start here
          </p>
          <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            The fastest way to see if we are the right fit.
          </h3>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Take the free AI readiness assessment. Your tier placement and
            dimension breakdown will tell us both whether AiBI is the right
            next step for your institution.
          </p>
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
