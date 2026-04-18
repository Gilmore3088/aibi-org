import type { Metadata } from 'next';
import { AibiSeal } from '@/components/AibiSeal';

export const metadata: Metadata = {
  // absolute: bypass the root layout's `%s — The AI Banking Institute` template
  title: { absolute: 'The AI Banking Institute — Arriving Soon' },
  description: 'A new home for community bank and credit union AI proficiency. Arriving soon.',
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main
      role="main"
      className="min-h-screen bg-[color:var(--color-linen)] flex items-center justify-center px-6 py-24"
    >
      <div className="max-w-xl mx-auto text-center">
        <div className="flex justify-center mb-10 text-[color:var(--color-ink)]">
          <AibiSeal size={80} />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[color:var(--color-ink)] mb-5">
          The AI Banking Institute
        </h1>
        <p className="font-serif-sc text-xs md:text-sm tracking-[0.22em] text-[color:var(--color-terra)] uppercase mb-14">
          Turning Bankers into Builders
        </p>
        <div
          aria-hidden
          className="w-16 h-px bg-[color:var(--color-ink)]/20 mx-auto mb-10"
        />
        <p className="font-sans text-base md:text-lg leading-relaxed text-[color:var(--color-ink)]/75">
          A new home for community bank and credit union AI proficiency.
        </p>
        <p className="font-sans text-base md:text-lg leading-relaxed text-[color:var(--color-ink)]/75 mt-2">
          Arriving soon.
        </p>
      </div>
    </main>
  );
}
