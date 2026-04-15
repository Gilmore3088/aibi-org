import Link from 'next/link';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/services', label: 'Services' },
  { href: '/certifications', label: 'Certifications' },
] as const;

export function Header() {
  return (
    <header className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span
            className="w-9 h-9 rounded-full border border-[color:var(--color-ink)]/30 flex items-center justify-center font-serif text-sm text-[color:var(--color-ink)] group-hover:border-[color:var(--color-terra)] group-hover:text-[color:var(--color-terra)] transition-colors"
            aria-hidden
          >
            AiBI
          </span>
          <span className="font-serif text-lg text-[color:var(--color-ink)] hidden sm:inline">
            The AI Banking Institute
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)] transition-colors hidden md:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/assessment"
            className="font-sans text-sm font-medium tracking-wide bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-4 py-2 hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Free Assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}
