import Link from 'next/link';
import { Wordmark } from '@/components/brand';

interface FooterGroup {
  readonly label: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    label: 'Start here',
    links: [
      { href: '/assessment/start', label: 'Free Assessment' },
      { href: '/education', label: 'Education' },
      { href: '/for-institutions', label: 'For Institutions' },
    ],
  },
  {
    label: 'Programs',
    links: [
      { href: '/courses/foundation/program', label: 'AiBI-Foundation' },
    ],
  },
  {
    label: 'Institute',
    links: [
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
    <footer className="border-t border-[color:var(--ink)]/10 bg-[color:#FFFFFF] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="max-w-md">
            {/* Brand v1 (2026-05-28) — bracketed [Ai] mark replaces the
                Newsreader serif wordmark. */}
            <Wordmark variant="full" tone="dark" size={22} />
            <p className="font-serif-sc text-base text-[color:var(--gold)] tracking-wide mt-2 mb-4">
              Turning Bankers into Builders
            </p>
            <p className="text-sm text-[color:var(--ink)]/70 leading-relaxed">
              AI proficiency built exclusively for community banks and credit
              unions. Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B,
              and the AIEOG AI Lexicon. Serving FDIC-Insured Institutions and
              NCUA-Chartered Credit Unions.
            </p>
          </div>

          <nav className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--slate-600)] mb-3">
                  {group.label}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[color:var(--ink)]/75 hover:text-[color:var(--gold)] transition-colors"
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

        <div className="border-t border-[color:var(--ink)]/10 mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[color:var(--slate-600)] font-mono">
          <p>&copy; {new Date().getFullYear()} The AI Banking Institute. All rights reserved.</p>
          <p>AIBankingInstitute.com &middot; AIBankingInstitute.org</p>
        </div>
      </div>
    </footer>
  );
}
