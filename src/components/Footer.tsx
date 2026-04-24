import Link from 'next/link';

interface FooterGroup {
  readonly label: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    label: 'Start here',
    links: [
      { href: '/assessment', label: 'Free Assessment' },
      { href: '/education', label: 'Education' },
      { href: '/services', label: 'Services' },
    ],
  },
  {
    label: 'Programs',
    links: [
      { href: '/courses/aibi-p', label: 'AiBI-P · Practitioner' },
      { href: '/courses/aibi-s', label: 'AiBI-S · Specialist' },
      { href: '/courses/aibi-l', label: 'AiBI-L · Leader' },
    ],
  },
  {
    label: 'Institute',
    links: [
      { href: '/about', label: 'About' },
      { href: '/security', label: 'Security & Governance' },
      { href: '/resources', label: 'Resources' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/ai-use-disclaimer', label: 'AI Use Disclaimer' },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-md">
            <p className="font-serif text-xl text-[color:var(--color-ink)]">
              The AI Banking Institute
            </p>
            <p className="font-serif-sc text-base text-[color:var(--color-terra)] tracking-wide mt-1 mb-4">
              Turning Bankers into Builders
            </p>
            <p className="text-sm text-[color:var(--color-ink)]/70 leading-relaxed">
              AI proficiency built exclusively for community banks and credit
              unions. Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B,
              and the AIEOG AI Lexicon. Serving FDIC-Insured Institutions and
              NCUA-Chartered Credit Unions.
            </p>
          </div>

          <nav className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-slate)] mb-3">
                  {group.label}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[color:var(--color-ink)]/75 hover:text-[color:var(--color-terra)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-[color:var(--color-ink)]/10 mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[color:var(--color-slate)] font-mono">
          <p>&copy; {new Date().getFullYear()} The AI Banking Institute. All rights reserved.</p>
          <p>AIBankingInstitute.com &middot; AIBankingInstitute.org</p>
        </div>
      </div>
    </footer>
  );
}
