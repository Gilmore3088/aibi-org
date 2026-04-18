import Link from 'next/link';
import type { Metadata } from 'next';
import { ServiceTierCards } from '@/components/sections/ServiceTierCards';

export const metadata: Metadata = {
  title: 'Services — Three ways we work with community banks',
  description:
    'Consulting engagements from The AI Banking Institute: Operational Quick Win Sprint, Efficiency & Process Audit, and AI Transformation with the AiBI fCAIO program. Built for community banks and credit unions.',
};

export default function ServicesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Consulting engagements
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            We install and run your<br />
            <span className="text-[color:var(--color-terra)]">
              AI transformation system.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Your institution either builds internal AI capability or gets left
            behind. Every engagement starts with a free 45-minute Executive
            Briefing. No pitch, no obligation.
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <ServiceTierCards />


      {/* Closing CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
            Not sure which tier fits?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Start with the free assessment.
          </h2>
          <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Eight questions, under three minutes. Your score and tier tell us
            where to start &mdash; and tell you whether AI transformation is
            ready for a conversation or still needs foundation work.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Take the Free Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
