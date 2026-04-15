import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/services', label: 'Services' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/resources', label: 'Resources' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-md">
            <p className="font-serif text-xl text-[color:var(--color-ink)] mb-2">
              The AI Banking Institute
            </p>
            <p className="text-sm text-[color:var(--color-ink)]/70 leading-relaxed">
              AI proficiency built exclusively for community banks and credit
              unions. Aligned with SR 11-7, Interagency TPRM Guidance, and the
              AIEOG AI Lexicon.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-terra)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-[color:var(--color-ink)]/10 mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[color:var(--color-ink)]/50 font-mono">
          <p>&copy; {new Date().getFullYear()} The AI Banking Institute. All rights reserved.</p>
          <p>AIBankingInstitute.com &middot; AIBankingInstitute.org</p>
        </div>
      </div>
    </footer>
  );
}
