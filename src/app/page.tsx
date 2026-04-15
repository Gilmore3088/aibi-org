import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-serif leading-tight">
          AI proficiency, built for community banks.
        </h1>
        <p className="text-lg md:text-xl text-[color:var(--color-ink)]/80 max-w-xl mx-auto">
          The AI Banking Institute helps community banks and credit unions build
          AI capability that is accessible, boundary-safe, and genuinely capable.
        </p>
        <div className="pt-4">
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </div>
        <p className="font-mono text-xs text-[color:var(--color-ink)]/50 pt-8">
          8 questions &middot; under 3 minutes &middot; no signup required to see your score
        </p>
      </div>
    </main>
  );
}
