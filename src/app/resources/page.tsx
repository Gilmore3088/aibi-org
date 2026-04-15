import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <main className="px-6 pt-20 pb-24 md:pt-28">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)]">
          Resources
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
          The AI Banking Brief is almost ready.
        </h1>
        <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
          A weekly short — written for community bank and credit union leaders
          — on where AI is actually working in regulated institutions, what is
          still experimental, and how to tell the difference. The first issue
          goes out shortly.
        </p>
        <p className="text-[color:var(--color-ink)]/60 leading-relaxed">
          In the meantime, the free assessment is the best way to see where
          your institution stands. Your results unlock a dimension breakdown
          and a one-click opt-in to the Brief when it launches.
        </p>
        <div className="pt-4">
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </div>
      </div>
    </main>
  );
}
