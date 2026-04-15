import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center space-y-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)]">
          404 &middot; Page not found
        </p>
        <h1 className="font-serif text-5xl text-[color:var(--color-ink)] leading-tight">
          That page is not in our archive.
        </h1>
        <p className="text-lg text-[color:var(--color-ink)]/70">
          The page you are looking for may have moved, or it may not exist yet.
          While you are here, the free AI readiness assessment takes under three
          minutes.
        </p>
        <div className="pt-4">
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </div>
        <p className="pt-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-terra)]"
          >
            &larr; Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
