import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="min-h-[60vh] flex items-center justify-center px-6 py-24"
      style={{
        background: 'var(--cream)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="max-w-xl text-center space-y-6">
        <p
          className="text-xs uppercase"
          style={{
            color: 'var(--gold-deep)',
            fontWeight: 600,
            letterSpacing: '0.2em',
          }}
        >
          404 &middot; Page not found
        </p>
        <h1
          className="text-5xl leading-tight"
          style={{
            color: 'var(--ink)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          That page is not in our archive.
        </h1>
        <p
          className="text-lg"
          style={{ color: 'var(--slate-600)' }}
        >
          The page you are looking for may have moved, or it may not exist yet.
          While you are here, the free AI readiness assessment takes under three
          minutes.
        </p>
        <div className="pt-4">
          <Link
            href="/assessment/take"
            className="inline-block px-8 py-4 text-[11px] uppercase transition-all active:scale-[0.98]"
            style={{
              background: 'var(--ink)',
              color: 'var(--cream)',
              fontWeight: 600,
              letterSpacing: '1.2px',
              borderRadius: '12px',
            }}
          >
            TAKE THE FREE ASSESSMENT
          </Link>
        </div>
        <p className="pt-4">
          <Link
            href="/"
            className="text-xs uppercase transition-colors"
            style={{
              color: 'var(--slate-500)',
              fontWeight: 600,
              letterSpacing: '0.18em',
            }}
          >
            &larr; BACK TO HOME
          </Link>
        </p>
      </div>
    </main>
  );
}
