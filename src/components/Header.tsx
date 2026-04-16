import Link from 'next/link';
import { AibiSeal } from './AibiSeal';

const NAV_LINKS = [
  { href: '/assessment', label: 'Assessment' },
  { href: '/services', label: 'Services' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/resources', label: 'Resources' },
] as const;

export function Header() {
  return (
    <header className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          aria-label="The AI Banking Institute — Home"
          className="flex items-center gap-3 text-[color:var(--color-ink)] group"
        >
          <span className="text-[color:var(--color-ink)] group-hover:text-[color:var(--color-terra)] transition-colors">
            <AibiSeal size={40} />
          </span>
          <span className="font-serif-sc text-lg text-[color:var(--color-ink)] hidden sm:inline">
            The AI Banking Institute
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif-sc text-xs uppercase text-[color:var(--color-ink)]/75 hover:text-[color:var(--color-terra)] transition-colors hidden md:inline"
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
