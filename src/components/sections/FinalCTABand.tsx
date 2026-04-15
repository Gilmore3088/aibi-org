import Link from 'next/link';

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

export function FinalCTABand() {
  return (
    <section className="px-6 py-20 md:py-28 bg-[color:var(--color-terra)] text-[color:var(--color-linen)]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-6xl leading-tight">
          Start with accessible. End with capable.
        </h2>
        <p className="text-lg md:text-xl text-[color:var(--color-linen)]/85 mt-6 leading-relaxed max-w-2xl mx-auto">
          Every AiBI engagement begins with a free conversation. Forty-five minutes, your numbers, your questions.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-[color:var(--color-linen)] text-[color:var(--color-terra)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-parch)] transition-colors"
          >
            Request Executive Briefing
          </a>
          <Link
            href="#roi-calculator"
            className="inline-block px-8 py-4 border border-[color:var(--color-linen)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-linen)] hover:text-[color:var(--color-terra)] transition-colors"
          >
            Model Your ROI First
          </Link>
        </div>
      </div>
    </section>
  );
}
