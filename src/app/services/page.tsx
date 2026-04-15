import Link from 'next/link';
import { ServiceTierCards } from '@/components/sections/ServiceTierCards';

export default function ServicesPage() {
  return (
    <main>
      <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Consulting engagements
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Three ways we work with community banks.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Every engagement starts with a free 45-minute Executive Briefing.
            We walk through your institution&apos;s position and show you what the
            first 90 days would look like. No pitch, no obligation.
          </p>
        </div>
      </section>

      <ServiceTierCards />

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
            Not sure which tier fits?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Start with the free assessment.
          </h2>
          <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Eight questions, under three minutes. Your score and tier tell us
            where to start — and tell you whether AI transformation is ready
            for a conversation or still needs foundation work.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
